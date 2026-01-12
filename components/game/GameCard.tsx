'use client'

import { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { Favorite } from '@mui/icons-material'

interface GameCardProps {
    question: string | null
    isFlipped: boolean
    onFlip: () => void
    primaryColor: string
}

export default function GameCard({ question, isFlipped, onFlip, primaryColor }: GameCardProps) {
    return (
        <Box
            className={`flip-card ${isFlipped ? 'flipped' : ''}`}
            onClick={onFlip}
            sx={{
                perspective: '1000px',
                width: { xs: 280, sm: 340, md: 380 },
                height: { xs: 380, sm: 450, md: 500 },
                cursor: 'pointer',
                mx: 'auto',
            }}
        >
            <Box className="flip-card-inner">
                {/* Card Back (Initial) */}
                <Box
                    className="flip-card-front"
                    sx={{
                        bgcolor: primaryColor,
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 3,
                    }}
                >
                    <Favorite sx={{ fontSize: { xs: 80, sm: 100 }, opacity: 0.9 }} />
                    <Typography variant="h5" fontWeight={600}>
                        Tap me!
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Chạm để lật thẻ
                    </Typography>
                </Box>

                {/* Card Front (After Flip) */}
                <Box
                    className="flip-card-back"
                    sx={{
                        bgcolor: 'white',
                        border: `4px solid ${primaryColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 4,
                    }}
                >
                    <Typography
                        variant="h5"
                        textAlign="center"
                        sx={{
                            color: primaryColor,
                            fontWeight: 600,
                            lineHeight: 1.6,
                        }}
                    >
                        {question || 'Đang tải...'}
                    </Typography>
                </Box>
            </Box>

            <style jsx global>{`
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .flip-card.flipped .flip-card-inner {
          transform: rotateY(180deg);
        }

        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 16px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>
        </Box>
    )
}
