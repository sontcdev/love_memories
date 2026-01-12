'use client'

import { Box, Button, Container, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import type { DifficultyLevel } from '@/lib/types'
import { DIFFICULTY_LABELS } from '@/lib/types'

interface LevelSelectorProps {
    username: string
    primaryColor: string
}

export default function LevelSelector({ username, primaryColor }: LevelSelectorProps) {
    const router = useRouter()

    const levels: { level: DifficultyLevel; emoji: string; color: string }[] = [
        { level: 'EASY', emoji: '🟢', color: '#4caf50' },
        { level: 'MEDIUM', emoji: '🟡', color: '#ff9800' },
        { level: 'HARD', emoji: '🔴', color: '#f44336' },
    ]

    const handleSelectLevel = (level: DifficultyLevel) => {
        router.push(`/${username}/game/play?level=${level}`)
    }

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography
                    variant="h4"
                    gutterBottom
                    fontWeight={700}
                    textAlign="center"
                    sx={{ color: primaryColor, mb: 4 }}
                >
                    Thẻ Bài Thấu Hiểu
                </Typography>

                <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
                    Chọn Mức Độ
                </Typography>

                {levels.map(({ level, emoji, color }) => (
                    <Button
                        key={level}
                        onClick={() => handleSelectLevel(level)}
                        variant="contained"
                        size="large"
                        sx={{
                            width: '100%',
                            maxWidth: 400,
                            height: 100,
                            mb: 3,
                            bgcolor: color,
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            borderRadius: 3,
                            boxShadow: 4,
                            '&:hover': {
                                bgcolor: color,
                                opacity: 0.9,
                                transform: 'translateY(-4px)',
                                boxShadow: 6,
                            },
                            transition: 'all 0.2s',
                        }}
                    >
                        {emoji} {DIFFICULTY_LABELS[level]}
                    </Button>
                ))}
            </Box>
        </Container>
    )
}
