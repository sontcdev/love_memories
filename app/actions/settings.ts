'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
function extractYouTubeVideoId(url: string): string | null {
    // Remove whitespace
    url = url.trim();

    // Patterns to match various YouTube URL formats
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    // Check if it's already just a video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
        return url;
    }

    return null;
}

/**
 * Update music URL for a link
 */
export async function updateMusicUrl(linkId: string, youtubeUrl: string) {
    try {
        const supabase = await createClient();

        // Extract video ID
        const videoId = extractYouTubeVideoId(youtubeUrl);

        if (!videoId) {
            return {
                success: false,
                error: 'URL YouTube không hợp lệ. Vui lòng nhập URL đúng định dạng.',
            };
        }

        // Get current settings
        const { data: currentLink, error: fetchError } = await supabase
            .from('links')
            .select('settings')
            .eq('id', linkId)
            .single();

        if (fetchError) {
            console.error('Fetch error:', fetchError);
            return {
                success: false,
                error: 'Không thể lấy thông tin link',
            };
        }

        // Update settings with new music_video_id
        const updatedSettings = {
            ...(currentLink.settings || {}),
            music_video_id: videoId,
        };

        // Update in database
        const { error: updateError } = await supabase
            .from('links')
            .update({ settings: updatedSettings })
            .eq('id', linkId);

        if (updateError) {
            console.error('Update error:', updateError);
            return {
                success: false,
                error: 'Không thể cập nhật nhạc nền',
            };
        }

        revalidatePath('/[username]', 'page');

        return {
            success: true,
            data: { videoId },
        };

    } catch (error) {
        console.error('Update music URL error:', error);
        return {
            success: false,
            error: 'Đã có lỗi xảy ra',
        };
    }
}
