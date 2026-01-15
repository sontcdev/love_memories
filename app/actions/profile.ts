'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface UpdateProfileData {
    name1: string;
    name2: string;
    anniversaryDate: string;
}

export async function updateLinkProfile(
    linkId: string,
    data: UpdateProfileData
) {
    try {
        const supabase = await createClient();

        // Validate inputs
        if (!data.name1.trim() || !data.name2.trim()) {
            return {
                success: false,
                error: 'Both names are required'
            };
        }

        if (!data.anniversaryDate) {
            return {
                success: false,
                error: 'Anniversary date is required'
            };
        }

        // Get existing settings
        const { data: link, error: fetchError } = await supabase
            .from('links')
            .select('settings, username')
            .eq('id', linkId)
            .single();

        if (fetchError) {
            return {
                success: false,
                error: 'Failed to fetch link data'
            };
        }

        // Update settings with new names and date
        const updatedSettings = {
            ...link.settings,
            names: [data.name1.trim(), data.name2.trim()],
            anniversary_date: data.anniversaryDate,
        };

        // Save to database
        const { error: updateError } = await supabase
            .from('links')
            .update({ settings: updatedSettings })
            .eq('id', linkId);

        if (updateError) {
            return {
                success: false,
                error: 'Failed to update profile'
            };
        }

        // Revalidate the page to show new data
        revalidatePath(`/${link.username}`);

        return {
            success: true,
            data: {
                names: [data.name1.trim(), data.name2.trim()],
                anniversary_date: data.anniversaryDate,
            }
        };

    } catch (error) {
        console.error('Update profile error:', error);
        return {
            success: false,
            error: 'An unexpected error occurred'
        };
    }
}
