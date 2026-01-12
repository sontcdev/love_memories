'use server'

import { supabase } from '@/lib/supabase'
import type { TemplateType } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function createLink(username: string, template: TemplateType) {
    // Validate username format
    const usernameRegex = /^[a-z0-9_-]{3,50}$/
    if (!usernameRegex.test(username)) {
        return {
            error: 'Username phải là chữ thường, số, gạch ngang hoặc gạch dưới (3-50 ký tự)',
        }
    }

    const { data, error } = await supabase
        .from('pages')
        .insert({
            username: username.toLowerCase(),
            template_type: template,
            passcode_hash: null, // User will set later
            is_active: true,
            theme_config: {},
        })
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/links')
    return { data, error: null }
}

export async function getLinks() {
    const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return { error: error.message, data: [] }
    }

    return { data, error: null }
}

export async function deleteLink(id: string) {
    const { error } = await supabase.from('pages').delete().eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/links')
    return { error: null }
}

export async function toggleLinkStatus(id: string, isActive: boolean) {
    const { error } = await supabase
        .from('pages')
        .update({ is_active: isActive })
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/links')
    return { error: null }
}
