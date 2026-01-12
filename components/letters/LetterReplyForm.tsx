'use client'

import { useState } from 'react'
import { Box, TextField, Button, Typography } from '@mui/material'
import { Send } from '@mui/icons-material'
import { addLetterReply } from '@/app/[username]/letters/actions'

const REPLY_MAX_LENGTH = 150

interface LetterReplyFormProps {
    letterId: string
    onReplyAdded: () => void
    primaryColor: string
}

export default function LetterReplyForm({
    letterId,
    onReplyAdded,
    primaryColor,
}: LetterReplyFormProps) {
    const [authorName, setAuthorName] = useState('')
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!authorName.trim() || !content.trim()) {
            setError('Vui lòng nhập đầy đủ thông tin')
            return
        }

        if (content.length > REPLY_MAX_LENGTH) {
            setError(`Phản hồi tối đa ${REPLY_MAX_LENGTH} ký tự`)
            return
        }

        setLoading(true)
        setError('')

        const result = await addLetterReply(letterId, authorName.trim(), content.trim())

        if (result.error) {
            setError(result.error)
        } else {
            setAuthorName('')
            setContent('')
            onReplyAdded()
        }

        setLoading(false)
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Phản hồi
            </Typography>

            <TextField
                label="Tên của bạn"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
                disabled={loading}
            />

            <TextField
                label="Nội dung phản hồi"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                multiline
                rows={3}
                fullWidth
                helperText={`${content.length}/${REPLY_MAX_LENGTH} ký tự`}
                error={content.length > REPLY_MAX_LENGTH}
                disabled={loading}
                sx={{ mb: 2 }}
            />

            {error && (
                <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}

            <Button
                type="submit"
                variant="contained"
                endIcon={<Send />}
                disabled={loading || !authorName.trim() || !content.trim()}
                sx={{
                    bgcolor: primaryColor,
                    '&:hover': {
                        bgcolor: primaryColor,
                        opacity: 0.9,
                    },
                }}
            >
                {loading ? 'Đang gửi...' : 'Gửi phản hồi'}
            </Button>
        </Box>
    )
}
