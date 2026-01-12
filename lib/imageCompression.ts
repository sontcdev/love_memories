// Image compression utility

import imageCompression from 'browser-image-compression'

const MAX_SIZE_MB = 0.05 // 50KB
const MAX_WIDTH_OR_HEIGHT = 1920

export async function compressImage(file: File): Promise<File> {
    const options = {
        maxSizeMB: MAX_SIZE_MB,
        maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
        useWebWorker: true,
    }

    try {
        const compressedFile = await imageCompression(file, options)

        // Log compression results
        console.log(
            `Original: ${(file.size / 1024).toFixed(2)}KB → Compressed: ${(
                compressedFile.size / 1024
            ).toFixed(2)}KB`
        )

        return compressedFile
    } catch (error) {
        console.error('Compression error:', error)
        throw new Error('Không thể nén ảnh. Vui lòng thử lại.')
    }
}

export async function compressMultipleImages(files: File[]): Promise<File[]> {
    const compressionPromises = files.map((file) => compressImage(file))
    return Promise.all(compressionPromises)
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Định dạng không hợp lệ. Chỉ chấp nhận JPG, PNG, WebP',
        }
    }

    // Check file size (max 10MB before compression)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
        return {
            valid: false,
            error: 'Kích thước ảnh quá lớn. Tối đa 10MB',
        }
    }

    return { valid: true }
}
