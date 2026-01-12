'use server'

import { supabase } from '@/lib/supabase'
import type { DifficultyLevel } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function createGameCard(content: string, level: DifficultyLevel) {
    if (!content || content.trim().length === 0) {
        return { error: 'Nội dung câu hỏi không được để trống' }
    }

    const { data, error } = await supabase
        .from('game_cards')
        .insert({
            content: content.trim(),
            level,
        })
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/games')
    return { data }
}

export async function getGameCards(level?: DifficultyLevel) {
    let query = supabase.from('game_cards').select('*').order('created_at', { ascending: false })

    if (level) {
        query = query.eq('level', level)
    }

    const { data, error } = await query

    if (error) {
        return { error: error.message, data: [] }
    }

    return { data, error: null }
}

export async function updateGameCard(id: string, content: string, level: DifficultyLevel) {
    if (!content || content.trim().length === 0) {
        return { error: 'Nội dung câu hỏi không được để trống' }
    }

    const { data, error } = await supabase
        .from('game_cards')
        .update({
            content: content.trim(),
            level,
        })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/games')
    return { data }
}

export async function deleteGameCard(id: string) {
    const { error } = await supabase.from('game_cards').delete().eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/games')
    return { error: null }
}
