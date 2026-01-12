'use client'

import { useState, useEffect } from 'react'
import { Box, Typography, Avatar, Paper } from '@mui/material'
import { getLetterReplies } from '@/app/[username]/letters/actions'
import { formatDate } from '@/lib/dateUtils'

interface Reply {
    id: string
    author_name: string
    content: string
    created_at: string
}

interface ReplyThreadProps {
    letterId: string
    primaryColor: string
}

export default function ReplyThread({ letterId, primaryColor }: ReplyThreadProps) {
    const [replies, setReplies] = useState<Reply[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadReplies()
    }, [letterId])

    const loadReplies = async () => {
        const { data } = await getLetterReplies(letterId)
        if (data) {
            setReplies(data as Reply[])
        }
        setLoading(false)
    }

    if (loading) {
        return <Typography variant="body2">Đang tải phản hồi...</Typography>
    }

    if (replies.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Chưa có phản hồi nào
            </Typography>
        )
    }

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Phản hồi ({replies.length})
            </Typography>

            {replies.map((reply) => (
                <Paper
                    key={reply.id}
                    sx={{
                        p: 2,
                        mb: 1.5,
                        bgcolor: 'grey.50',
                        border: `1px solid ${primaryColor}20`,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        {/* Avatar */}
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor: primaryColor,
                                fontSize: '0.875rem',
                            }}
                        >
                            {reply.author_name.charAt(0).toUpperCase()}
                        </Avatar>

                        {/* Content */}
                        <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    {reply.author_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {formatDate(reply.created_at)}
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {reply.content}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            ))}
        </Box>
    )
}
