'use client'

import { Box, Typography, Card, CardMedia, CardContent } from '@mui/material'
import { formatDate } from '@/lib/dateUtils'
import type { ContentItem } from '@/lib/types'

interface TimelineItemProps {
    entry: ContentItem
    primaryColor: string
    isLast: boolean
}

export default function TimelineItem({ entry, primaryColor, isLast }: TimelineItemProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                gap: { xs: 2, sm: 3 },
                mb: 4,
                position: 'relative',
            }}
        >
            {/* Date */}
            <Box
                sx={{
                    minWidth: { xs: 80, sm: 100 },
                    textAlign: 'right',
                    pt: 1,
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        color: primaryColor,
                        fontWeight: 600,
                        fontSize: { xs: '0.9rem', sm: '1.1rem' },
                    }}
                >
                    {formatDate(entry.event_date || entry.created_at)}
                </Typography>
            </Box>

            {/* Connector */}
            <Box
                sx={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                {/* Dot */}
                <Box
                    sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: primaryColor,
                        border: '3px solid white',
                        boxShadow: `0 0 0 2px ${primaryColor}`,
                        zIndex: 2,
                        mt: 1,
                    }}
                />

                {/* Line */}
                {!isLast && (
                    <Box
                        sx={{
                            width: 2,
                            flex: 1,
                            bgcolor: primaryColor,
                            opacity: 0.3,
                            minHeight: 60,
                        }}
                    />
                )}
            </Box>

            {/* Content */}
            <Card
                sx={{
                    flex: 1,
                    boxShadow: 2,
                    '&:hover': {
                        boxShadow: 4,
                    },
                    transition: 'box-shadow 0.2s',
                }}
            >
                {entry.image_url && (
                    <CardMedia
                        component="img"
                        height="200"
                        image={entry.image_url}
                        alt={entry.title}
                        sx={{ objectFit: 'cover' }}
                    />
                )}
                <CardContent>
                    <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                            color: primaryColor,
                            fontWeight: 600,
                        }}
                    >
                        {entry.title}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            whiteSpace: 'pre-wrap',
                        }}
                    >
                        {entry.content}
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    )
}
