// Supabase Storage utilities

import { supabase } from './supabase'

export type StorageBucket = 'avatars' | 'photos'

export interface UploadResult {
    url: string | null
    error: string | null
}

export async function uploadImage(
    bucket: StorageBucket,
    file: Blob,
    filename: string
): Promise<UploadResult> {
    try {
        // Generate unique filename
        const timestamp = Date.now()
        const uniqueFilename = `${timestamp}_${filename}`

        // Upload file
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(uniqueFilename, file, {
                cacheControl: '3600',
                upsert: false,
            })

        if (error) {
            console.error('Upload error:', error)
            return { url: null, error: error.message }
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path)

        return { url: publicUrlData.publicUrl, error: null }
    } catch (error) {
        console.error('Unexpected upload error:', error)
        return { url: null, error: 'Lỗi upload ảnh' }
    }
}

// Helper to create blob from base64
export function base64ToBlob(base64: string, mimeType: string): Blob {
    const byteString = atob(base64.split(',')[1])
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
    }

    return new Blob([ab], { type: mimeType })
}

// Helper to read file as data URL
export function readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}
