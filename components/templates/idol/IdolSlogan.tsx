'use client'

import { Box, Typography } from '@mui/material'
import { Favorite } from '@mui/icons-material'

interface IdolSloganProps {
    text: string
}

export default function IdolSlogan({ text }: IdolSloganProps) {
    return (
        <Box textAlign="center" sx={{ mt: 4, px: 2 }}>
            <Typography
                variant="h5"
                sx={{
                    color: 'white',
                    fontStyle: 'italic',
                    fontWeight: 500,
                    fontSize: { xs: '1.2rem', sm: '1.5rem' },
                    mb: 2,
                }}
            >
                "{text}"
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Favorite sx={{ color: '#FFB6C1', fontSize: 32 }} />
                <Favorite sx={{ color: '#87CEEB', fontSize: 32 }} />
                <Favorite sx={{ color: '#FFB6C1', fontSize: 32 }} />
            </Box>
        </Box>
    )
}
