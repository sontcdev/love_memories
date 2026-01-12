'use client'

import { Box } from '@mui/material'
import { Favorite } from '@mui/icons-material'

interface HeartAnimationProps {
    color?: string
    size?: number
}

export default function HeartAnimation({ color = '#E30523', size = 60 }: HeartAnimationProps) {
    return (
        <Box
            className="heartbeat"
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Favorite
                sx={{
                    fontSize: { xs: size * 0.8, sm: size },
                    color: color,
                }}
            />

            <style jsx global>{`
        @keyframes heartbeat {
          0% {
            transform: scale(1);
          }
          14% {
            transform: scale(1.15);
          }
          28% {
            transform: scale(1);
          }
          42% {
            transform: scale(1.15);
          }
          70% {
            transform: scale(1);
          }
        }

        .heartbeat {
          animation: heartbeat 1.3s ease-in-out infinite;
        }
      `}</style>
        </Box>
    )
}
