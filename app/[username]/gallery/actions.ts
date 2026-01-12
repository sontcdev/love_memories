'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function getGalleryImages(pageId: string) {
    const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('page_id', pageId)
        .eq('content_type', 'GALLERY')
        .order('order_index', { ascending: true })

    return { data, error }
}

export async function uploadGalleryImage(
    pageId: string,
    imageUrl: string,
    caption?: string
) {
    // Get current max order_index
    const { data: maxOrder } = await supabase
        .from('content_items')
        .select('order_index')
        .eq('page_id', pageId)
        .eq('content_type', 'GALLERY')
        .order('order_index', { ascending: false })
        .limit(1)
        .single()

    const nextOrder = (maxOrder?.order_index ?? -1) + 1

    const { data, error } = await supabase
        .from('content_items')
        .insert({
            page_id: pageId,
            content_type: 'GALLERY',
            content: caption || '',
            image_url: imageUrl,
            order_index: nextOrder,
        })
        .select()
        .single()

    if (!error) {
        revalidatePath('/[username]/gallery')
    }

    return { data, error: error?.message }
}

export async function reorderGalleryImages(orderedIds: string[]) {
    try {
        const updates = orderedIds.map((id, index) =>
            supabase
                .from('content_items')
                .update({ order_index: index })
                .eq('id', id)
        )

        await Promise.all(updates)
        revalidatePath('/[username]/gallery')

        return { error: null }
    } catch (error) {
        return { error: 'Không thể sắp xếp lại ảnh' }
    }
}

export async function deleteGalleryImage(id: string) {
    const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('id', id)

    if (!error) {
        revalidatePath('/[username]/gallery')
    }

    return { error: error?.message }
}
