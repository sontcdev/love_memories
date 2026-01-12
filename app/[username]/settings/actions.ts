'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import type { ModeCount } from '@/lib/types'

export async function updateCountMode(
    pageId: string,
    modeCount: ModeCount,
    targetDate: string | null
) {
    const { error } = await supabase
        .from('page_data')
        .update({
            mode_count: modeCount,
            target_date: targetDate,
        })
        .eq('page_id', pageId)

    if (!error) {
        revalidatePath('/[username]/home')
    }

    return { error: error?.message }
}

export async function updateMusicSettings(
    pageId: string,
    trackUrl: string,
    autoplay: boolean
) {
    // Upsert music settings
    const { error } = await supabase
        .from('music_settings')
        .upsert(
            {
                page_id: pageId,
                track_url: trackUrl,
                autoplay,
                updated_at: new Date().toISOString(),
            },
            {
                onConflict: 'page_id',
            }
        )

    if (!error) {
        revalidatePath('/[username]')
    }

    return { error: error?.message }
}

export async function getMusicSettings(pageId: string) {
    const { data, error } = await supabase
        .from('music_settings')
        .select('*')
        .eq('page_id', pageId)
        .single()

    return { data, error }
}
