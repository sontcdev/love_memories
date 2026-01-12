'use client'

import { Box, Button, Grid } from '@mui/material'
import { Backspace } from '@mui/icons-material'

interface NumpadProps {
    onNumberClick: (num: number) => void
    onBackspace: () => void
    templateColors: {
        primary: string
        buttonText: string
    }
}

export default function Numpad({ onNumberClick, onBackspace, templateColors }: NumpadProps) {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]

    const handleClick = (num: number) => {
        onNumberClick(num)

        // Haptic feedback on mobile
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(50)
        }
    }

    const handleBackspace = () => {
        onBackspace()

        // Haptic feedback
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(30)
        }
    }

    return (
        <Box sx={{ maxWidth: 300, mx: 'auto', mt: 4 }}>
            <Grid container spacing={2}>
                {numbers.map((num) => (
                    <Grid item xs={4} key={num}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => handleClick(num)}
                            sx={{
                                height: { xs: 70, sm: 80 },
                                fontSize: { xs: 24, sm: 28 },
                                fontWeight: 600,
                                borderRadius: 3,
                                bgcolor: templateColors.primary,
                                color: templateColors.buttonText,
                                '&:hover': {
                                    bgcolor: templateColors.primary,
                                    opacity: 0.9,
                                },
                                '&:active': {
                                    transform: 'scale(0.95)',
                                },
                                transition: 'all 0.1s',
                            }}
                        >
                            {num}
                        </Button>
                    </Grid>
                ))}

                {/* Empty space */}
                <Grid item xs={4}>
                    <Box sx={{ height: { xs: 70, sm: 80 } }} />
                </Grid>

                {/* Zero */}
                <Grid item xs={4}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleClick(0)}
                        sx={{
                            height: { xs: 70, sm: 80 },
                            fontSize: { xs: 24, sm: 28 },
                            fontWeight: 600,
                            borderRadius: 3,
                            bgcolor: templateColors.primary,
                            color: templateColors.buttonText,
                            '&:hover': {
                                bgcolor: templateColors.primary,
                                opacity: 0.9,
                            },
                            '&:active': {
                                transform: 'scale(0.95)',
                            },
                            transition: 'all 0.1s',
                        }}
                    >
                        0
                    </Button>
                </Grid>

                {/* Backspace */}
                <Grid item xs={4}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleBackspace}
                        sx={{
                            height: { xs: 70, sm: 80 },
                            borderRadius: 3,
                            bgcolor: 'grey.700',
                            color: 'white',
                            '&:hover': {
                                bgcolor: 'grey.800',
                            },
                            '&:active': {
                                transform: 'scale(0.95)',
                            },
                            transition: 'all 0.1s',
                        }}
                    >
                        <Backspace sx={{ fontSize: 28 }} />
                    </Button>
                </Grid>
            </Grid>
        </Box>
    )
}
