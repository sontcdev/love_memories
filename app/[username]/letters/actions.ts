'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function getLetters(pageId: string) {
    const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('page_id', pageId)
        .eq('content_type', 'LETTER')
        .order('created_at', { ascending: false })

    return { data, error }
}

export async function createLetter(
    pageId: string,
    title: string,
    content: string,
    imageUrl?: string
) {
    const { data, error } = await supabase
        .from('content_items')
        .insert({
            page_id: pageId,
            content_type: 'LETTER',
            title,
            content,
            image_url: imageUrl,
        })
        .select()
        .single()

    if (!error) {
        revalidatePath('/[username]/letters')
    }

    return { data, error: error?.message }
}

export async function addLetterReply(
    letterId: string,
    authorName: string,
    content: string
) {
    // Note: letter_replies table doesn't exist in schema yet
    // This is a placeholder - will need to add table
    const { data, error } = await supabase
        .from('letter_replies')
        .insert({
            letter_id: letterId,
            author_name: authorName,
            content,
        })
        .select()
        .single()

    if (!error) {
        revalidatePath('/[username]/letters')
    }

    return { data, error: error?.message }
}

export async function getLetterReplies(letterId: string) {
    const { data, error } = await supabase
        .from('letter_replies')
        .select('*')
        .eq('letter_id', letterId)
        .order('created_at', { ascending: true })

    return { data, error }
}
