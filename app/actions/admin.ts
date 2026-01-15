'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Generate a random 6-digit PIN
 */
function generatePin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash a PIN/password using bcrypt via Supabase's crypt function
 */
async function hashPassword(password: string): Promise<string> {
    const supabase = await createClient();

    // Use Supabase's crypt function to hash
    const { data, error } = await supabase.rpc('crypt_password', {
        password,
    });

    if (error) {
        console.error('Hashing error:', error);
        throw new Error('Failed to hash password');
    }

    return data;
}

/**
 * Sample questions for new links
 */
const SAMPLE_QUESTIONS = [
    { question: 'Màu yêu thích của em là gì?', answer: 'Hồng', category: 'Sở thích' },
    { question: 'Món ăn em thích nhất?', answer: 'Phở', category: 'Ẩm thực' },
    { question: 'Ngày đầu tiên chúng ta gặp nhau?', answer: '1/1/2024', category: 'Kỷ niệm' },
    { question: 'Bài hát yêu thích của em?', answer: 'Nơi này có anh', category: 'Âm nhạc' },
    { question: 'Điều em yêu ở anh nhất?', answer: 'Nụ cười của anh', category: 'Tình cảm' },
];

/**
 * Create a new link with auto-generated PIN and sample data
 */
export async function createLink(username: string) {
    try {
        const supabase = await createClient();

        // Validate username format
        if (!/^[a-z0-9_-]+$/.test(username)) {
            return {
                success: false,
                error: 'Username must contain only lowercase letters, numbers, hyphens, and underscores',
            };
        }

        // Check if username already exists
        const { data: existing } = await supabase
            .from('links')
            .select('id')
            .eq('username', username)
            .single();

        if (existing) {
            return {
                success: false,
                error: 'Username already exists',
            };
        }

        // Generate PIN
        const pin = generatePin();
        const pinHash = await hashPassword(pin);

        // Create link
        const { data: link, error: linkError } = await supabase
            .from('links')
            .insert({
                username,
                template_type: 'love',
                owner_pin_hash: pinHash,
                guest_password_hash: null, // Public by default
                settings: {
                    names: ['Tên 1', 'Tên 2'],
                    anniversary_date: new Date().toISOString().split('T')[0],
                    short_note: 'Kỷ niệm của chúng mình',
                },
            })
            .select('id')
            .single();

        if (linkError) {
            console.error('Link creation error:', linkError);
            return {
                success: false,
                error: 'Failed to create link',
            };
        }

        // Seed sample questions
        const questions = SAMPLE_QUESTIONS.map(q => ({
            link_id: link.id,
            question: q.question,
            answer: q.answer,
            category: q.category,
        }));

        const { error: questionsError } = await supabase
            .from('games')
            .insert(questions);

        if (questionsError) {
            console.error('Questions seeding error:', questionsError);
            // Continue anyway, questions can be added later
        }

        // Seed sample memory for timeline
        const { error: memoryError } = await supabase
            .from('memories')
            .insert({
                link_id: link.id,
                title: 'Ngày đầu tiên',
                event_date: new Date().toISOString().split('T')[0],
                description: 'Kỷ niệm đầu tiên của chúng ta. Đây là nơi bắt đầu của mọi câu chuyện...',
                sort_order: 0,
            });

        if (memoryError) {
            console.error('Memory seeding error:', memoryError);
            // Continue anyway
        }

        revalidatePath('/admin');

        return {
            success: true,
            data: {
                linkId: link.id,
                username,
                pin,
                url: `/${username}`,
            },
        };

    } catch (error) {
        console.error('Create link error:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
        };
    }
}

/**
 * Reset PIN for a link
 */
export async function resetPin(linkId: string) {
    try {
        const supabase = await createClient();

        // Generate new PIN
        const pin = generatePin();
        const pinHash = await hashPassword(pin);

        // Update link
        const { error } = await supabase
            .from('links')
            .update({ owner_pin_hash: pinHash })
            .eq('id', linkId);

        if (error) {
            console.error('PIN reset error:', error);
            return {
                success: false,
                error: 'Failed to reset PIN',
            };
        }

        revalidatePath('/admin');

        return {
            success: true,
            data: { pin },
        };

    } catch (error) {
        console.error('Reset PIN error:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
        };
    }
}

/**
 * Delete a link
 */
export async function deleteLink(linkId: string) {
    try {
        const supabase = await createClient();

        // Soft delete by setting is_active to false
        const { error } = await supabase
            .from('links')
            .update({ is_active: false })
            .eq('id', linkId);

        if (error) {
            console.error('Delete link error:', error);
            return {
                success: false,
                error: 'Failed to delete link',
            };
        }

        revalidatePath('/admin');

        return {
            success: true,
        };

    } catch (error) {
        console.error('Delete link error:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
        };
    }
}

/**
 * Verify admin password
 */
export async function verifyAdminPassword(password: string) {
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (password === adminPassword) {
        return { success: true };
    }

    return {
        success: false,
        error: 'Invalid password',
    };
}
