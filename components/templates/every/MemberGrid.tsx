'use client'

import { Grid, Card, CardContent, Avatar, Typography, Box } from '@mui/material'
import type { Participant } from '@/lib/types'

interface MemberGridProps {
    participants: Participant[]
    primaryColor: string
}

export default function MemberGrid({ participants, primaryColor }: MemberGridProps) {
    return (
        <Grid container spacing={3} sx={{ mt: 2, px: 2 }}>
            {participants.map((participant, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                        sx={{
                            textAlign: 'center',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 4,
                            },
                        }}
                    >
                        <CardContent>
                            <Avatar
                                src={participant.avatar_url}
                                alt={participant.name}
                                sx={{
                                    width: 80,
                                    height: 80,
                                    margin: '0 auto',
                                    mb: 2,
                                    border: `3px solid ${primaryColor}`,
                                }}
                            >
                                {participant.name?.charAt(0)}
                            </Avatar>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: primaryColor,
                                    fontWeight: 600,
                                    mb: 0.5,
                                }}
                            >
                                {participant.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {participant.role}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    )
}
