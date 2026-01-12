'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Container, Stepper, Step, StepLabel, CircularProgress, Typography } from '@mui/material'
import Step1SetPin from '@/components/onboarding/Step1SetPin'
import Step2SelectMode from '@/components/onboarding/Step2SelectMode'
import Step3ParticipantInfo from '@/components/onboarding/Step3ParticipantInfo'
import Step4SharedPhoto from '@/components/onboarding/Step4SharedPhoto'
import { completeOnboarding } from '@/app/[username]/onboarding/actions'
import { uploadImage, base64ToBlob } from '@/lib/storage'
import type { Page, Participant, ModeCount } from '@/lib/types'
import { TEMPLATE_COLORS } from '@/lib/types'

interface OnboardingWizardProps {
    page: Page
}

export default function OnboardingWizard({ page }: OnboardingWizardProps) {
    const router = useRouter()
    const colors = TEMPLATE_COLORS[page.template_type]

    const [activeStep, setActiveStep] = useState(0)
    const [loading, setLoading] = useState(false)

    // Collected data
    const [pin, setPin] = useState('')
    const [modeData, setModeData] = useState<{
        modeCount: ModeCount
        targetDate: string
        titleText: string
    } | null>(null)
    const [participants, setParticipants] = useState<Participant[]>([])

    const steps = ['Tạo PIN', 'Chế độ đếm', 'Thông tin', 'Ảnh chung']

    // Determine participant count based on template
    const participantCount = page.template_type === 'LOVE' ? 2 : page.template_type === 'IDOL' ? 1 : 3

    const handleStep1Complete = (pinValue: string) => {
        setPin(pinValue)
        setActiveStep(1)
    }

    const handleStep2Complete = (data: {
        modeCount: ModeCount
        targetDate: string
        titleText: string
    }) => {
        setModeData(data)
        setActiveStep(2)
    }

    const handleStep3Complete = (participantData: Participant[]) => {
        setParticipants(participantData)
        setActiveStep(3)
    }

    const handleStep4Complete = async (sharedPhotoUrl: string) => {
        if (!modeData) return

        setLoading(true)

        try {
            // Upload avatars to Supabase Storage
            const uploadedParticipants = await Promise.all(
                participants.map(async (p) => {
                    if (p.avatar_url && p.avatar_url.startsWith('data:')) {
                        const blob = base64ToBlob(p.avatar_url, 'image/jpeg')
                        const result = await uploadImage('avatars', blob, `${p.name}_avatar.jpg`)
                        return { ...p, avatar_url: result.url || '' }
                    }
                    return p
                })
            )

            // Upload shared photo
            let uploadedPhotoUrl = sharedPhotoUrl
            if (sharedPhotoUrl.startsWith('data:')) {
                const blob = base64ToBlob(sharedPhotoUrl, 'image/jpeg')
                const result = await uploadImage('photos', blob, 'shared_photo.jpg')
                uploadedPhotoUrl = result.url || ''
            }

            // Save everything
            const result = await completeOnboarding({
                pageId: page.id,
                pin,
                modeCount: modeData.modeCount,
                targetDate: modeData.targetDate,
                titleText: modeData.titleText,
                participants: uploadedParticipants,
                sharedPhotoUrl: uploadedPhotoUrl,
            })

            if (result.success) {
                // Redirect to home page
                router.push(`/${page.username}/home`)
            } else {
                alert(result.error || 'Lỗi khi hoàn tất onboarding')
            }
        } catch (error) {
            console.error('Onboarding error:', error)
            alert('Lỗi khi hoàn tất onboarding')
        }

        setLoading(false)
    }

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: colors.background,
                }}
            >
                <CircularProgress sx={{ color: colors.primary, mb: 2 }} />
                <Typography variant="h6" sx={{ color: colors.primary }}>
                    Đang hoàn tất...
                </Typography>
            </Box>
        )
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: colors.background,
                py: 4,
            }}
        >
            <Container maxWidth="md">
                {/* Stepper */}
                <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {/* Step Content */}
                {activeStep === 0 && (
                    <Step1SetPin
                        onNext={handleStep1Complete}
                        primaryColor={colors.primary}
                        backgroundColor={colors.background}
                    />
                )}

                {activeStep === 1 && (
                    <Step2SelectMode
                        onNext={handleStep2Complete}
                        onBack={() => setActiveStep(0)}
                        primaryColor={colors.primary}
                    />
                )}

                {activeStep === 2 && (
                    <Step3ParticipantInfo
                        onNext={handleStep3Complete}
                        onBack={() => setActiveStep(1)}
                        primaryColor={colors.primary}
                        participantCount={participantCount}
                    />
                )}

                {activeStep === 3 && (
                    <Step4SharedPhoto
                        onNext={handleStep4Complete}
                        onBack={() => setActiveStep(2)}
                        primaryColor={colors.primary}
                    />
                )}
            </Container>
        </Box>
    )
}
