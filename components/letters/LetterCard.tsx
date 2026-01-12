'use client'

import { useState } from 'react'
import { Card, CardContent, Typography, Box, Button, Collapse, Divider } from '@mui/material'
import { MailOutline, Reply as ReplyIcon } from '@mui/icons-material'
import ReplyThread from './ReplyThread'
import LetterReplyForm from './LetterReplyForm'
import type { ContentItem } from '@/lib/types'
import { formatDate } from '@/lib/dateUtils'

interface LetterCardProps {
    letter: ContentItem
    primaryColor: string
    onReplyAdded: () => void
}

export default function LetterCard({ letter, primaryColor, onReplyAdded }: LetterCardProps) {
    const [showReplies, setShowReplies] = useState(false)

    return (
        <Card sx={{ mb: 3, boxShadow: 3 }}>
            <CardContent>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MailOutline sx={{ color: primaryColor, mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                        {formatDate(letter.created_at)}
                    </Typography>
                </Box>

                {/* Title */}
                <Typography
                    variant="h5"
                    gutterBottom
                    fontWeight={600}
                    sx={{ color: primaryColor }}
                >
                    {letter.title}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Content */}
                <Typography
                    variant="body1"
                    sx={{
                        whiteSpace: 'pre-wrap',
                        mb: 2,
                    }}
                >
                    {letter.content}
                </Typography>

                {/* Image if exists */}
                {letter.image_url && (
                    <Box
                        component="img"
                        src={letter.image_url}
                        alt={letter.title}
                        sx={{
                            width: '100%',
                            maxHeight: 400,
                            objectFit: 'cover',
                            borderRadius: 2,
                            mb: 2,
                        }}
                    />
                )}

                {/* Reply Toggle */}
                <Button
                    startIcon={<ReplyIcon />}
                    onClick={() => setShowReplies(!showReplies)}
                    sx={{ color: primaryColor }}
                >
                    {showReplies ? 'Ẩn phản hồi' : 'Xem phản hồi'}
                </Button>

                {/* Reply Section */}
                <Collapse in={showReplies}>
                    <Box sx={{ mt: 3 }}>
                        <ReplyThread letterId={letter.id} primaryColor={primaryColor} />
                        <LetterReplyForm
                            letterId={letter.id}
                            onReplyAdded={onReplyAdded}
                            primaryColor={primaryColor}
                        />
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    )
}
