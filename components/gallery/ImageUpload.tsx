'use client'

import { useState } from 'react'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { CloudUpload } from '@mui/icons-material'
import { compressImage, validateImageFile } from '@/lib/imageCompression'
import { uploadImage } from '@/lib/storage'

interface ImageUploadProps {
    onUploadSuccess: (url: string) => void
    primaryColor: string
}

export default function ImageUpload({ onUploadSuccess, primaryColor }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setError('')
        setUploading(true)

        try {
            for (const file of Array.from(files)) {
                // Validate
                const validation = validateImageFile(file)
                if (!validation.valid) {
                    setError(validation.error || 'File không hợp lệ')
                    continue
                }

                // Compress
                const compressed = await compressImage(file)

                // Upload to Supabase Storage
                const result = await uploadImage('photos', compressed, file.name)

                if (result.error) {
                    setError(result.error)
                } else if (result.url) {
                    onUploadSuccess(result.url)
                }
            }
        } catch (error) {
            console.error('Upload error:', error)
            setError('Lỗi khi upload ảnh')
        } finally {
            setUploading(false)
            // Reset input
            e.target.value = ''
        }
    }

    return (
        <Box sx={{ textAlign: 'center', my: 4 }}>
            <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                multiple
                onChange={handleFileSelect}
                disabled={uploading}
            />
            <label htmlFor="image-upload">
                <Button
                    variant="contained"
                    component="span"
                    startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
                    disabled={uploading}
                    sx={{
                        bgcolor: primaryColor,
                        '&:hover': {
                            bgcolor: primaryColor,
                            opacity: 0.9,
                        },
                    }}
                >
                    {uploading ? 'Đang upload...' : 'Upload Ảnh'}
                </Button>
            </label>

            {error && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    {error}
                </Typography>
            )}

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Ảnh sẽ tự động nén về ~50KB
            </Typography>
        </Box>
    )
}
