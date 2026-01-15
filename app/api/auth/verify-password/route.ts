import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Rate limiting constants
const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 10;

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string {
    // Check various headers for client IP
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIp) {
        return realIp;
    }

    // Fallback
    return 'unknown';
}

/**
 * Check and update rate limiting
 * Returns true if rate limit exceeded
 */
async function checkRateLimit(supabase: any, ipAddress: string): Promise<boolean> {
    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

    // Get existing attempt record
    const { data: attempt } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('ip_address', ipAddress)
        .single();

    if (!attempt) {
        // First attempt, create record
        await supabase
            .from('login_attempts')
            .insert({
                ip_address: ipAddress,
                attempt_count: 1,
                last_attempt_at: new Date().toISOString(),
            });
        return false;
    }

    const lastAttempt = new Date(attempt.last_attempt_at);

    // Check if last attempt was within the window
    if (lastAttempt >= windowStart) {
        // Within window, increment count
        const newCount = attempt.attempt_count + 1;

        await supabase
            .from('login_attempts')
            .update({
                attempt_count: newCount,
                last_attempt_at: new Date().toISOString(),
            })
            .eq('ip_address', ipAddress);

        // Return true if exceeded max attempts
        return newCount > MAX_ATTEMPTS;
    } else {
        // Outside window, reset count
        await supabase
            .from('login_attempts')
            .update({
                attempt_count: 1,
                last_attempt_at: new Date().toISOString(),
            })
            .eq('ip_address', ipAddress);
        return false;
    }
}

/**
 * Reset rate limit on successful login
 */
async function resetRateLimit(supabase: any, ipAddress: string): Promise<void> {
    await supabase
        .from('login_attempts')
        .delete()
        .eq('ip_address', ipAddress);
}

/**
 * POST /api/auth/verify-password
 * Verifies guest password for a link
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const { username, password } = body;

        // Validate input
        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Get client IP
        const clientIp = getClientIp(request);

        // Check rate limit
        const isRateLimited = await checkRateLimit(supabase, clientIp);

        if (isRateLimited) {
            return NextResponse.json(
                {
                    error: 'Too many failed attempts. Please try again in 10 minutes.',
                    rateLimitExceeded: true,
                },
                { status: 429 }
            );
        }

        // Get link by username
        const { data: link, error: linkError } = await supabase
            .from('links')
            .select('id, guest_password_hash')
            .eq('username', username)
            .eq('is_active', true)
            .single();

        if (linkError || !link) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // If no password set, allow access
        if (!link.guest_password_hash) {
            await resetRateLimit(supabase, clientIp);
            return NextResponse.json({ success: true });
        }

        // Verify password using Supabase RPC
        const { data: isValid, error: verifyError } = await supabase.rpc(
            'verify_guest_password',
            {
                p_link_id: link.id,
                p_password: password,
            }
        );

        if (verifyError) {
            console.error('Password verification error:', verifyError);
            return NextResponse.json(
                { error: 'Verification failed' },
                { status: 500 }
            );
        }

        if (isValid) {
            // Success! Reset rate limit
            await resetRateLimit(supabase, clientIp);
            return NextResponse.json({ success: true });
        } else {
            // Failed attempt (rate limit already incremented)
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error('Verify password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
