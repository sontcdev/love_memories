'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Alert,
    Typography,
    Chip,
} from '@mui/material'
import type { DifficultyLevel, GameCard } from '@/lib/types'
import { DIFFICULTY_LABELS } from '@/lib/types'
import { createGameCard, updateGameCard } from '@/app/admin/games/actions'

interface GameCardFormProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
    editingCard?: GameCard | null
}

export default function GameCardForm({ open, onClose, onSuccess, editingCard }: GameCardFormProps) {
    const [content, setContent] = useState('')
    const [level, setLevel] = useState<DifficultyLevel>('EASY')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (editingCard) {
            setContent(editingCard.content)
            setLevel(editingCard.level)
        } else {
            setContent('')
            setLevel('EASY')
        }
        setError('')
    }, [editingCard, open])

    const handleSubmit = async () => {
        setLoading(true)
        setError('')

        const result = editingCard
            ? await updateGameCard(editingCard.id, content, level)
            : await createGameCard(content, level)

        if (result.error) {
            setError(result.error)
            setLoading(false)
        } else {
            setContent('')
            setLevel('EASY')
            setLoading(false)
            onSuccess()
            onClose()
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {editingCard ? 'Chỉnh sửa Game Card' : 'Thêm Game Card mới'}
            </DialogTitle>

            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <TextField
                        label="Câu hỏi / Thử thách"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        multiline
                        rows={4}
                        fullWidth
                        required
                        placeholder="VD: Kể một kỷ niệm đáng nhớ nhất về đối phương?"
                        helperText={`${content.length}/200 ký tự (khuyến nghị)`}
                        sx={{ mb: 2 }}
                    />

                    <FormControl fullWidth>
                        <InputLabel>Độ khó</InputLabel>
                        <Select
                            value={level}
                            label="Độ khó"
                            onChange={(e) => setLevel(e.target.value as DifficultyLevel)}
                        >
                            <MenuItem value="EASY">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip label={DIFFICULTY_LABELS.EASY} size="small" color="success" />
                                    <Typography variant="body2">- Câu hỏi dễ, thân thiện</Typography>
                                </Box>
                            </MenuItem>
                            <MenuItem value="MEDIUM">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip label={DIFFICULTY_LABELS.MEDIUM} size="small" color="warning" />
                                    <Typography variant="body2">- Câu hỏi trung bình, suy nghĩ</Typography>
                                </Box>
                            </MenuItem>
                            <MenuItem value="HARD">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip label={DIFFICULTY_LABELS.HARD} size="small" color="error" />
                                    <Typography variant="body2">- Câu hỏi khó, sâu sắc</Typography>
                                </Box>
                            </MenuItem>
                        </Select>
                    </FormControl>

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={onClose} disabled={loading}>
                    Hủy
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !content.trim()}
                >
                    {loading ? 'Đang lưu...' : editingCard ? 'Cập nhật' : 'Thêm'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
