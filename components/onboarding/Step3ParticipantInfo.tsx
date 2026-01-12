'use client'

import { useState } from 'react'
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Avatar,
    IconButton,
} from '@mui/material'
import { ArrowForward, ArrowBack, CloudUpload, Delete } from '@mui/icons-material'
import ImageCropper from './ImageCropper'
import { readFileAsDataURL } from '@/lib/storage'
import type { Participant } from '@/lib/types'

interface Step3ParticipantInfoProps {
    onNext: (participants: Participant[]) => void
    onBack: () => void
    primaryColor: string
    participantCount: number // 2 for LOVE, variable for EVERY/IDOL
}

export default function Step3ParticipantInfo({
    onNext,
    onBack,
    primaryColor,
    participantCount,
}: Step3ParticipantInfoProps) {
    const [participants, setParticipants] = useState<Participant[]>(
        Array(participantCount).fill(null).map(() => ({
            name: '',
            dob: '',
            role: '',
            avatar_url: '',
        }))
    )

    const [cropperState, setCropperState] = useState<{
        show: boolean
        imageSrc: string
        index: number
    }>({ show: false, imageSrc: '', index: -1 })

    const handleFileSelect = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const dataUrl = await readFileAsDataURL(file)
        setCropperState({ show: true, imageSrc: dataUrl, index })
    }

    const handleCropComplete = (croppedImage: string) => {
        const newParticipants = [...participants]
        newParticipants[cropperState.index].avatar_url = croppedImage
        setParticipants(newParticipants)
        setCropperState({ show: false, imageSrc: '', index: -1 })
    }

    const handleDeleteAvatar = (index: number) => {
        const newParticipants = [...participants]
        newParticipants[index].avatar_url = ''
        setParticipants(newParticipants)
    }

    const handleChange = (index: number, field: keyof Participant, value: string) => {
        const newParticipants = [...participants]
        newParticipants[index] = { ...newParticipants[index], [field]: value }
        setParticipants(newParticipants)
    }

    const handleNext = () => {
        // Validate
        const allValid = participants.every((p) => p.name && p.dob)
        if (!allValid) {
            alert('Vui lòng nhập đầy đủ tên và ngày sinh')
            return
        }

        onNext(participants)
    }

    return (
        <Box sx={{ maxWidth: 700, mx: 'auto' }}>
            <Typography variant="h5" gutterBottom fontWeight={700} sx={{ color: primaryColor }}>
                Bước 3: Thông tin thành viên
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Nhập thông tin và upload ảnh đại diện
            </Typography>

            <Grid container spacing={3}>
                {participants.map((participant, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                        <Box sx={{ p: 2, border: '2px dashed', borderColor: 'divider', borderRadius: 2 }}>
                            {/* Avatar */}
                            <Box sx={{ textAlign: 'center', mb: 2 }}>
                                <Avatar
                                    src={participant.avatar_url}
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        mx: 'auto',
                                        mb: 1,
                                        border: `3px solid ${primaryColor}`,
                                    }}
                                >
                                    {participant.name?.charAt(0)}
                                </Avatar>

                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id={`avatar-upload-${index}`}
                                    type="file"
                                    onChange={(e) => handleFileSelect(index, e)}
                                />
                                <label htmlFor={`avatar-upload-${index}`}>
                                    <Button
                                        component="span"
                                        variant="outlined"
                                        size="small"
                                        startIcon={<CloudUpload />}
                                        sx={{ borderColor: primaryColor, color: primaryColor }}
                                    >
                                        Upload
                                    </Button>
                                </label>

                                {participant.avatar_url && (
                                    <IconButton size="small" onClick={() => handleDeleteAvatar(index)} sx={{ ml: 1 }}>
                                        <Delete fontSize="small" />
                                    </IconButton>
                                )}
                            </Box>

                            {/* Info Fields */}
                            <TextField
                                label="Tên"
                                value={participant.name}
                                onChange={(e) => handleChange(index, 'name', e.target.value)}
                                fullWidth
                                required
                                sx={{ mb: 2 }}
                            />

                            <TextField
                                label="Ngày sinh"
                                type="date"
                                value={participant.dob}
                                onChange={(e) => handleChange(index, 'dob', e.target.value)}
                                fullWidth
                                required
                                InputLabelProps={{ shrink: true }}
                                sx={{ mb: 2 }}
                            />

                            <TextField
                                label="Vai trò (tùy chọn)"
                                value={participant.role}
                                onChange={(e) => handleChange(index, 'role', e.target.value)}
                                fullWidth
                                placeholder="VD: Boyfriend, Girlfriend, Bố, Mẹ..."
                            />
                        </Box>
                    </Grid>
                ))}
            </Grid>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
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
                    sx={{
                        flex: 1,
                        bgcolor: primaryColor,
                        '&:hover': { bgcolor: primaryColor, opacity: 0.9 },
                    }}
                >
                    Tiếp tục
                </Button>
            </Box>

            {/* Cropper */}
            {cropperState.show && (
                <ImageCropper
                    imageSrc={cropperState.imageSrc}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setCropperState({ show: false, imageSrc: '', index: -1 })}
                    aspectRatio={1} // 1:1 for avatars
                    primaryColor={primaryColor}
                />
            )}
        </Box>
    )
}
