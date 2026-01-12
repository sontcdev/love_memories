'use client'

import { Box, Typography, Grid } from '@mui/material'
import type { Participant } from '@/lib/types'
import { calculateAge } from '@/lib/dateUtils'

interface ParticipantInfoProps {
    participants: Participant[]
    primaryColor: string
}

export default function ParticipantInfo({ participants, primaryColor }: ParticipantInfoProps) {
    const participant1 = participants[0]
    const participant2 = participants[1] || participants[0]

    return (
        <Grid container spacing={3} sx={{ mt: 2, px: 2 }}>
            {/* Participant 1 */}
            <Grid item xs={6}>
                <Box textAlign="center">
                    <Typography
                        variant="h6"
                        sx={{
                            color: primaryColor,
                            fontWeight: 600,
                            fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        }}
                    >
                        {participant1?.name}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                            mt: 0.5,
                        }}
                    >
                        {participant1?.dob ? `${calculateAge(participant1.dob)} tuổi` : ''}
                    </Typography>
                </Box>
            </Grid>

            {/* Participant 2 */}
            <Grid item xs={6}>
                <Box textAlign="center">
                    <Typography
                        variant="h6"
                        sx={{
                            color: primaryColor,
                            fontWeight: 600,
                            fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        }}
                    >
                        {participant2?.name}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                            mt: 0.5,
                        }}
                    >
                        {participant2?.dob ? `${calculateAge(participant2.dob)} tuổi` : ''}
                    </Typography>
                </Box>
            </Grid>
        </Grid>
    )
}
