'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface AddMemoryData {
    linkId: string;
    title: string;
    eventDate: string;
    description?: string;
    imageUrl?: string;
}

/**
 * Add a new memory to the timeline
 */
export async function addMemory(data: AddMemoryData) {
    try {
        const supabase = await createClient();

        // Get current max sort_order
        const { data: maxOrder } = await supabase
            .from('memories')
            .select('sort_order')
            .eq('link_id', data.linkId)
            .order('sort_order', { ascending: false })
            .limit(1)
            .single();

        const nextSortOrder = (maxOrder?.sort_order ?? -1) + 1;

        // Insert new memory
        const { error } = await supabase
            .from('memories')
            .insert({
                link_id: data.linkId,
                title: data.title,
                event_date: data.eventDate,
                description: data.description || null,
                image_url: data.imageUrl || null,
                sort_order: nextSortOrder,
            });

        if (error) {
            console.error('Insert error:', error);
            return {
                success: false,
                error: 'Không thể thêm kỷ niệm',
            };
        }

        revalidatePath('/[username]', 'page');

        return {
            success: true,
        };

    } catch (error) {
        console.error('Add memory error:', error);
        return {
            success: false,
            error: 'Đã có lỗi xảy ra',
        };
    }
}

/**
 * Delete a memory
 */
export async function deleteMemory(memoryId: string) {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('memories')
            .delete()
            .eq('id', memoryId);

        if (error) {
            console.error('Delete error:', error);
            return {
                success: false,
                error: 'Không thể xóa kỷ niệm',
            };
        }

        revalidatePath('/[username]', 'page');

        return {
            success: true,
        };

    } catch (error) {
        console.error('Delete memory error:', error);
        return {
            success: false,
            error: 'Đã có lỗi xảy ra',
        };
    }
}
