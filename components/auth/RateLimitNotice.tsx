'use client'

import { Box, Container, Typography, Alert } from '@mui/material'
import { AccessTime } from '@mui/icons-material'
import { formatRemainingTime } from '@/lib/auth'

interface RateLimitNoticeProps {
    remainingTime: number
    templateColors: {
        background: string
        primary: string
    }
}

export default function RateLimitNotice({ remainingTime, templateColors }: RateLimitNoticeProps) {
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
                <AccessTime sx={{ fontSize: 80, color: templateColors.primary, mb: 3 }} />

                <Typography
                    variant="h4"
                    gutterBottom
                    fontWeight={700}
                    textAlign="center"
                    color={templateColors.primary}
                >
                    Tạm khóa
                </Typography>

                <Alert severity="warning" sx={{ mt: 3, mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                        Bạn đã nhập sai mã PIN quá nhiều lần.
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                        Vui lòng thử lại sau: {formatRemainingTime(remainingTime)}
                    </Typography>
                </Alert>

                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
                    Hệ thống sẽ tự động mở khóa sau khi hết thời gian chờ
                </Typography>
            </Box>
        </Container>
    )
}
