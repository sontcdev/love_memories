'use client'

import { Box } from '@mui/material'

interface IdolCoverProps {
    imageUrl: string
    idolName: string
}

export default function IdolCover({ imageUrl, idolName }: IdolCoverProps) {
    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                height: { xs: 250, sm: 350, md: 400 },
                overflow: 'hidden',
                borderRadius: 2,
                boxShadow: 3,
            }}
        >
            <Box
                component="img"
                src={imageUrl}
                alt={idolName}
                sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
                onError={(e) => {
                    // Fallback to gradient if image fails
                    const target = e.target as HTMLElement
                    target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
            />

            {/* Gradient Overlay */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '50%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                }}
            />
        </Box>
    )
}
