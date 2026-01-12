'use client'

import { useState, useEffect } from 'react'
import { Box, Container, Typography, Avatar, Alert } from '@mui/material'
import { useRouter } from 'next/navigation'
import PinInput from './PinInput'
import Numpad from './Numpad'
import RateLimitNotice from './RateLimitNotice'
import type { Page } from '@/lib/types'
import { TEMPLATE_COLORS } from '@/lib/types'
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/auth'

interface PinScreenProps {
    page: Page
    onSuccess: () => void
}

export default function PinScreen({ page, onSuccess }: PinScreenProps) {
    const router = useRouter()
    const [pin, setPin] = useState('')
    const [shake, setShake] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [rateLimited, setRateLimited] = useState(false)
    const [remainingTime, setRemainingTime] = useState(0)

    const templateColors = TEMPLATE_COLORS[page.template_type]

    // Check rate limit on mount and every second
    useEffect(() => {
        const checkLimit = () => {
            const result = checkRateLimit(page.username)
            if (!result.allowed) {
                setRateLimited(true)
                setRemainingTime(result.remainingTime || 0)
            } else {
                setRateLimited(false)
                setRemainingTime(0)
            }
        }

        checkLimit()
        const interval = setInterval(checkLimit, 1000)
        return () => clearInterval(interval)
    }, [page.username])

    const handleNumberClick = (num: number) => {
        if (pin.length < 6) {
            const newPin = pin + num
            setPin(newPin)
            setError('')

            // Auto-verify when 6 digits entered
            if (newPin.length === 6) {
                verifyPin(newPin)
            }
        }
    }

    const handleBackspace = () => {
        setPin(pin.slice(0, -1))
        setError('')
    }

    const verifyPin = async (pinToVerify: string) => {
        setLoading(true)

        try {
            const response = await fetch('/api/verify-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: page.username,
                    pin: pinToVerify,
                }),
            })

            const result = await response.json()

            if (result.success) {
                // Success - reset rate limit and proceed
                resetRateLimit(page.username)
                onSuccess()
            } else {
                // Failed - record attempt and show error
                recordFailedAttempt(page.username)
                setError('Mã PIN không đúng')
                setShake(true)
                setPin('')
                setTimeout(() => setShake(false), 500)
            }
        } catch (error) {
            console.error('Verify error:', error)
            setError('Lỗi xác thực. Vui lòng thử lại')
            setPin('')
        }

        setLoading(false)
    }

    if (rateLimited) {
        return (
            <RateLimitNotice
                remainingTime={remainingTime}
                templateColors={templateColors}
            />
        )
    }

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: templateColors.background,
                    py: 4,
                }}
            >
                {/* Avatar or Logo */}
                <Avatar
                    sx={{
                        width: { xs: 100, sm: 120 },
                        height: { xs: 100, sm: 120 },
                        bgcolor: templateColors.primary,
                        mb: 4,
                        fontSize: 48,
                        fontWeight: 700,
                    }}
                >
                    ❤️
                </Avatar>

                <Typography
                    variant="h5"
                    gutterBottom
                    fontWeight={600}
                    textAlign="center"
                    color={templateColors.primary}
                >
                    Nhập mã PIN
                </Typography>

                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
                    Nhập mã PIN 6 số để vào trang
                </Typography>

                {/* PIN Input */}
                <PinInput value={pin} shake={shake} />

                {/* Error Message */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2, maxWidth: 300 }}>
                        {error}
                    </Alert>
                )}

                {/* Numpad */}
                <Numpad
                    onNumberClick={handleNumberClick}
                    onBackspace={handleBackspace}
                    templateColors={templateColors}
                />

                {loading && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                        Đang xác thực...
                    </Typography>
                )}
            </Box>
        </Container>
    )
}
