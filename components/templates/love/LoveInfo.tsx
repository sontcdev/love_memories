'use client'

import { Box, Avatar } from '@mui/material'
import HeartAnimation from './HeartAnimation'
import type { Participant } from '@/lib/types'

interface LoveHeaderProps {
    participants: Participant[]
    primaryColor: string
}

export default function LoveHeader({ participants, primaryColor }: LoveHeaderProps) {
    const participant1 = participants[0]
    const participant2 = participants[1] || participants[0]

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 2, sm: 4, md: 6 },
                py: 4,
                px: 2,
            }}
        >
            {/* First Avatar */}
            <Avatar
                src={participant1?.avatar_url}
                alt={participant1?.name}
                sx={{
                    width: { xs: 80, sm: 100, md: 120 },
                    height: { xs: 80, sm: 100, md: 120 },
                    border: `4px solid ${primaryColor}`,
                    boxShadow: 3,
                }}
            >
                {participant1?.name?.charAt(0)}
            </Avatar>

            {/* Heart Animation */}
            <HeartAnimation color={primaryColor} size={70} />

            {/* Second Avatar */}
            <Avatar
                src={participant2?.avatar_url}
                alt={participant2?.name}
                sx={{
                    width: { xs: 80, sm: 100, md: 120 },
                    height: { xs: 80, sm: 100, md: 120 },
                    border: `4px solid ${primaryColor}`,
                    boxShadow: 3,
                }}
            >
                {participant2?.name?.charAt(0)}
            </Avatar>
        </Box>
    )
}
