'use client'

import { useState } from 'react'
import Cropper from 'react-easy-crop'
import { Box, Button, Slider, Typography } from '@mui/material'
import { Point, Area } from 'react-easy-crop/types'

interface ImageCropperProps {
    imageSrc: string
    onCropComplete: (croppedImage: string) => void
    onCancel: () => void
    aspectRatio?: number
    primaryColor: string
}

export default function ImageCropper({
    imageSrc,
    onCropComplete,
    onCancel,
    aspectRatio = 1, // 1:1 by default
    primaryColor,
}: ImageCropperProps) {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

    const onCropChange = (location: Point) => {
        setCrop(location)
    }

    const onZoomChange = (zoom: number) => {
        setZoom(zoom)
    }

    const onCropCompleteHandler = (_: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }

    const handleSave = async () => {
        if (!croppedAreaPixels) return

        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
            onCropComplete(croppedImage)
        } catch (error) {
            console.error('Crop error:', error)
        }
    }

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0,0,0,0.9)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Crop Area */}
            <Box sx={{ position: 'relative', flex: 1 }}>
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspectRatio}
                    onCropChange={onCropChange}
                    onZoomChange={onZoomChange}
                    onCropComplete={onCropCompleteHandler}
                />
            </Box>

            {/* Controls */}
            <Box sx={{ bgcolor: 'white', p: 3 }}>
                <Typography gutterBottom>Zoom</Typography>
                <Slider
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(_, value) => setZoom(value as number)}
                    sx={{
                        color: primaryColor,
                        mb: 3,
                    }}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" onClick={onCancel} fullWidth>
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        fullWidth
                        sx={{
                            bgcolor: primaryColor,
                            '&:hover': { bgcolor: primaryColor, opacity: 0.9 },
                        }}
                    >
                        Xong
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}

// Helper function to create cropped image
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        throw new Error('No 2d context')
    }

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    )

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            if (!blob) return
            const reader = new FileReader()
            reader.readAsDataURL(blob)
            reader.onloadend = () => {
                resolve(reader.result as string)
            }
        }, 'image/jpeg')
    })
}

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.src = url
    })
}
