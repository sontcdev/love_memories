'use client'

import { useState } from 'react'
import {
    Box,
    Typography,
    Button,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Card,
} from '@mui/material'
import { ArrowForward, ArrowBack, CloudUpload } from '@mui/icons-material'
import ImageCropper from './ImageCropper'
import { readFileAsDataURL } from '@/lib/storage'

interface Step4SharedPhotoProps {
    onNext: (photoUrl: string) => void
    onBack: () => void
    primaryColor: string
}

export default function Step4SharedPhoto({ onNext, onBack, primaryColor }: Step4SharedPhotoProps) {
    const [photoUrl, setPhotoUrl] = useState('')
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:3'>('1:1')
    const [cropperState, setCropperState] = useState<{
        show: boolean
        imageSrc: string
    }>({ show: false, imageSrc: '' })

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const dataUrl = await readFileAsDataURL(file)
        setCropperState({ show: true, imageSrc: dataUrl })
    }

    const handleCropComplete = (croppedImage: string) => {
        setPhotoUrl(croppedImage)
        setCropperState({ show: false, imageSrc: '' })
    }

    const handleNext = () => {
        if (!photoUrl) {
            alert('Vui lòng upload ảnh chung')
            return
        }

        onNext(photoUrl)
    }

    const aspectRatioValue = aspectRatio === '1:1' ? 1 : 4 / 3

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h5" gutterBottom fontWeight={700} sx={{ color: primaryColor }}>
                Bước 4: Ảnh chung
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Upload ảnh kỷ niệm chung và chọn tỷ lệ khung hình
            </Typography>

            {/* Aspect Ratio Selection */}
            <FormControl component="fieldset" sx={{ mb: 3 }}>
                <FormLabel sx={{ fontWeight: 600, mb: 1 }}>Tỷ lệ khung hình</FormLabel>
                <RadioGroup
                    row
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as '1:1' | '4:3')}
                >
                    <FormControlLabel
                        value="1:1"
                        control={<Radio sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }} />}
                        label="1:1 (Vuông)"
                    />
                    <FormControlLabel
                        value="4:3"
                        control={<Radio sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }} />}
                        label="4:3 (Ngang)"
                    />
                </RadioGroup>
            </FormControl>

            {/* Photo Preview/Upload */}
            <Card sx={{ p: 3, mb: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                {photoUrl ? (
                    <Box>
                        <Box
                            component="img"
                            src={photoUrl}
                            alt="Shared photo"
                            sx={{
                                maxWidth: '100%',
                                maxHeight: 400,
                                borderRadius: 2,
                                mb: 2,
                            }}
                        />
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="photo-upload"
                            type="file"
                            onChange={handleFileSelect}
                        />
                        <label htmlFor="photo-upload">
                            <Button
                                component="span"
                                variant="outlined"
                                startIcon={<CloudUpload />}
                                sx={{ borderColor: primaryColor, color: primaryColor }}
                            >
                                Đổi ảnh
                            </Button>
                        </label>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            minHeight: 300,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <CloudUpload sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Chưa có ảnh
                        </Typography>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="photo-upload"
                            type="file"
                            onChange={handleFileSelect}
                        />
                        <label htmlFor="photo-upload">
                            <Button
                                component="span"
                                variant="contained"
                                startIcon={<CloudUpload />}
                                sx={{
                                    mt: 2,
                                    bgcolor: primaryColor,
                                    '&:hover': { bgcolor: primaryColor, opacity: 0.9 },
                                }}
                            >
                                Upload Ảnh
                            </Button>
                        </label>
                    </Box>
                )}
            </Card>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={onBack}
                    sx={{ borderColor: primaryColor, color: primaryColor }}
                >
                    Quay lại
                </Button>
                <Button
                    variant="contained"
                    endIcon={<ArrowForward />}
                    onClick={handleNext}
                    disabled={!photoUrl}
                    sx={{
                        flex: 1,
                        bgcolor: primaryColor,
                        '&:hover': { bgcolor: primaryColor, opacity: 0.9 },
                    }}
                >
                    Hoàn thành
                </Button>
            </Box>

            {/* Cropper */}
            {cropperState.show && (
                <ImageCropper
                    imageSrc={cropperState.imageSrc}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setCropperState({ show: false, imageSrc: '' })}
                    aspectRatio={aspectRatioValue}
                    primaryColor={primaryColor}
                />
            )}
        </Box>
    )
}
