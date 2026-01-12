'use client'

import { useState } from 'react'
import { Box, Typography, Button, Alert } from '@mui/material'
import PinInput from '@/components/auth/PinInput'
import Numpad from '@/components/auth/Numpad'
import { validatePin, pinsMatch } from '@/lib/validation'

interface Step1SetPinProps {
    onNext: (pin: string) => void
    primaryColor: string
    backgroundColor: string
}

export default function Step1SetPin({ onNext, primaryColor, backgroundColor }: Step1SetPinProps) {
    const [pin1, setPin1] = useState('')
    const [pin2, setPin2] = useState('')
    const [step, setStep] = useState<'first' | 'confirm'>('first')
    const [error, setError] = useState('')
    const [shake, setShake] = useState(false)

    const handleNumberClick = (num: number) => {
        if (step === 'first') {
            if (pin1.length < 6) {
                const newPin = pin1 + num
                setPin1(newPin)
                setError('')

                // Auto-advance when 6 digits
                if (newPin.length === 6) {
                    // Validate PIN strength
                    const validation = validatePin(newPin)
                    if (!validation.valid) {
                        setError(validation.error || '')
                        setShake(true)
                        setTimeout(() => {
                            setShake(false)
                            setPin1('')
                        }, 500)
                    } else {
                        // Move to confirmation
                        setTimeout(() => setStep('confirm'), 300)
                    }
                }
            }
        } else {
            if (pin2.length < 6) {
                const newPin = pin2 + num
                setPin2(newPin)
                setError('')

                // Auto-verify when 6 digits
                if (newPin.length === 6) {
                    const match = pinsMatch(pin1, newPin)
                    if (!match.valid) {
                        setError(match.error || '')
                        setShake(true)
                        setTimeout(() => {
                            setShake(false)
                            setPin2('')
                        }, 500)
                    } else {
                        // Success!
                        setTimeout(() => onNext(newPin), 300)
                    }
                }
            }
        }
    }

    const handleBackspace = () => {
        if (step === 'first') {
            setPin1(pin1.slice(0, -1))
            setError('')
        } else {
            setPin2(pin2.slice(0, -1))
            setError('')
        }
    }

    const handleBackToFirst = () => {
        setStep('first')
        setPin2('')
        setError('')
    }

    return (
        <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom fontWeight={700} sx={{ color: primaryColor }}>
                {step === 'first' ? 'Bước 1: Tạo mã PIN' : 'Xác nhận mã PIN'}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {step === 'first'
                    ? 'Nhập mã PIN 6 số để bảo vệ trang của bạn'
                    : 'Nhập lại mã PIN để xác nhận'}
            </Typography>

            {/* PIN Input */}
            <PinInput value={step === 'first' ? pin1 : pin2} shake={shake} />

            {/* Error Message */}
            {error && (
                <Alert severity="error" sx={{ mb: 2, maxWidth: 400, mx: 'auto' }}>
                    {error}
                </Alert>
            )}

            {/* Warning about weak PINs */}
            {step === 'first' && !error && (
                <Alert severity="warning" sx={{ mb: 2, maxWidth: 400, mx: 'auto' }}>
                    ⚠️ Tránh dùng: 000000, 123456, 111111, 222222...
                </Alert>
            )}

            {/* Numpad */}
            <Numpad
                onNumberClick={handleNumberClick}
                onBackspace={handleBackspace}
                templateColors={{ primary: primaryColor, buttonText: '#FFFFFF' }}
            />

            {/* Back button for confirmation step */}
            {step === 'confirm' && (
                <Button
                    onClick={handleBackToFirst}
                    sx={{ mt: 2, color: primaryColor }}
                >
                    ← Nhập lại PIN
                </Button>
            )}
        </Box>
    )
}
