'use server'

import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import type { Participant, ModeCount } from '@/lib/types'

export async function completeOnboarding(data: {
    pageId: string
    pin: string
    modeCount: ModeCount
    targetDate: string
    titleText: string
    participants: Participant[]
    sharedPhotoUrl: string
}) {
    try {
        // Hash PIN
        const hashedPin = await bcrypt.hash(data.pin, 10)

        // Update page with hashed PIN
        const { error: pageError } = await supabase
            .from('pages')
            .update({ passcode_hash: hashedPin })
            .eq('id', data.pageId)

        if (pageError) throw pageError

        // Create or update page_data
        const { error: dataError } = await supabase
            .from('page_data')
            .upsert({
                page_id: data.pageId,
                mode_count: data.modeCount,
                target_date: data.targetDate || null,
                title_text: data.titleText,
                participants: data.participants,
            })

        if (dataError) throw dataError

        // Add shared photo to gallery
        if (data.sharedPhotoUrl) {
            await supabase.from('content_items').insert({
                page_id: data.pageId,
                content_type: 'GALLERY',
                image_url: data.sharedPhotoUrl,
                content: 'Ảnh kỷ niệm',
                order_index: 0,
            })
        }

        revalidatePath('/[username]')
        return { success: true, error: null }
    } catch (error: any) {
        console.error('Onboarding error:', error)
        return { success: false, error: error.message || 'Lỗi khi hoàn tất onboarding' }
    }
}
