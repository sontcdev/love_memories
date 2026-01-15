import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const { username, pin } = await request.json();

        if (!username || !pin) {
            return NextResponse.json(
                { error: 'Username and PIN are required' },
                { status: 400 }
            );
        }

        // Validate PIN format (6 digits)
        if (!/^\d{6}$/.test(pin)) {
            return NextResponse.json(
                { error: 'PIN must be 6 digits' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Get link by username
        const { data: link, error: linkError } = await supabase
            .from('links')
            .select('id, is_active')
            .eq('username', username)
            .eq('is_active', true)
            .single();

        if (linkError || !link) {
            return NextResponse.json(
                { error: 'Link not found' },
                { status: 404 }
            );
        }

        // Verify PIN using database function
        const { data: isValid, error: verifyError } = await supabase
            .rpc('verify_owner_pin', {
                p_link_id: link.id,
                p_pin: pin,
            });

        if (verifyError) {
            console.error('PIN verification error:', verifyError);
            return NextResponse.json(
                { error: 'Verification failed' },
                { status: 500 }
            );
        }

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid PIN' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            linkId: link.id,
        });

    } catch (error) {
        console.error('Owner verification error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
