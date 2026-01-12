'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function getTimelineEntries(pageId: string) {
    const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('page_id', pageId)
        .eq('content_type', 'TIMELINE')
        .order('event_date', { ascending: true })
        .order('created_at', { ascending: true })

    return { data, error }
}

export async function createTimelineEntry(
    pageId: string,
    eventDate: string,
    title: string,
    content: string,
    imageUrl?: string
) {
    const { data, error } = await supabase
        .from('content_items')
        .insert({
            page_id: pageId,
            content_type: 'TIMELINE',
            event_date: eventDate,
            title,
            content,
            image_url: imageUrl,
        })
        .select()
        .single()

    if (!error) {
        revalidatePath('/[username]/timeline')
    }

    return { data, error: error?.message }
}

export async function deleteTimelineEntry(id: string) {
    const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('id', id)

    if (!error) {
        revalidatePath('/[username]/timeline')
    }

    return { error: error?.message }
}
