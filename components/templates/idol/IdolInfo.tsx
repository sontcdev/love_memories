'use client'

import { Box, Typography } from '@mui/material'
import type { Participant } from '@/lib/types'
import { getYearFromDob, formatDateShort } from '@/lib/dateUtils'

interface IdolInfoProps {
    idol: Participant
    debutDate?: string
    primaryColor: string
}

export default function IdolInfo({ idol, debutDate, primaryColor }: IdolInfoProps) {
    const birthYear = idol.dob ? getYearFromDob(idol.dob) : null

    return (
        <Box textAlign="center" sx={{ mt: 4, px: 2 }}>
            <Typography
                variant="h3"
                sx={{
                    color: primaryColor,
                    fontWeight: 700,
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                    mb: 2,
                }}
            >
                {idol.name}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                {birthYear && (
                    <Typography variant="h6" sx={{ color: 'white' }}>
                        Năm sinh: {birthYear}
                    </Typography>
                )}

                {debutDate && (
                    <Typography variant="h6" sx={{ color: 'white' }}>
                        Debut: {formatDateShort(debutDate)}
                    </Typography>
                )}
            </Box>
        </Box>
    )
}
