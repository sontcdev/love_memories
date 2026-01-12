'use client'

import { useState, useEffect } from 'react'
import {
    Container,
    Typography,
    Box,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    Chip,
    IconButton,
    ToggleButtonGroup,
    ToggleButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material'
import { ArrowBack, Add, Edit, Delete } from '@mui/icons-material'
import Link from 'next/link'
import GameCardForm from '@/components/admin/GameCardForm'
import { getGameCards, deleteGameCard } from './actions'
import type { GameCard, DifficultyLevel } from '@/lib/types'
import { DIFFICULTY_LABELS } from '@/lib/types'

export default function GamesPage() {
    const [cards, setCards] = useState<GameCard[]>([])
    const [filteredCards, setFilteredCards] = useState<GameCard[]>([])
    const [loading, setLoading] = useState(true)
    const [formOpen, setFormOpen] = useState(false)
    const [editingCard, setEditingCard] = useState<GameCard | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingCard, setDeletingCard] = useState<GameCard | null>(null)
    const [levelFilter, setLevelFilter] = useState<DifficultyLevel | 'ALL'>('ALL')

    const loadCards = async () => {
        setLoading(true)
        const result = await getGameCards()
        if (result.data) {
            setCards(result.data)
            setFilteredCards(result.data)
        }
        setLoading(false)
    }

    useEffect(() => {
        loadCards()
    }, [])

    useEffect(() => {
        if (levelFilter === 'ALL') {
            setFilteredCards(cards)
        } else {
            setFilteredCards(cards.filter((card) => card.level === levelFilter))
        }
    }, [levelFilter, cards])

    const handleOpenForm = (card?: GameCard) => {
        setEditingCard(card || null)
        setFormOpen(true)
    }

    const handleCloseForm = () => {
        setFormOpen(false)
        setEditingCard(null)
    }

    const handleOpenDelete = (card: GameCard) => {
        setDeletingCard(card)
        setDeleteDialogOpen(true)
    }

    const handleDelete = async () => {
        if (!deletingCard) return

        await deleteGameCard(deletingCard.id)
        setCards((prev) => prev.filter((card) => card.id !== deletingCard.id))
        setDeleteDialogOpen(false)
        setDeletingCard(null)
    }

    const getDifficultyColor = (level: DifficultyLevel) => {
        switch (level) {
            case 'EASY':
                return 'success'
            case 'MEDIUM':
                return 'warning'
            case 'HARD':
                return 'error'
        }
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button component={Link} href="/admin" startIcon={<ArrowBack />} sx={{ mb: 3 }}>
                Quay lại Dashboard
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" gutterBottom fontWeight={700}>
                        Quản lý Game Cards
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Thêm và chỉnh sửa câu hỏi cho trò chơi couple
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenForm()}
                    size="large"
                >
                    Thêm Card mới
                </Button>
            </Box>

            <Box sx={{ mb: 4 }}>
                <ToggleButtonGroup
                    value={levelFilter}
                    exclusive
                    onChange={(_, value) => value && setLevelFilter(value)}
                    size="small"
                >
                    <ToggleButton value="ALL">
                        Tất cả ({cards.length})
                    </ToggleButton>
                    <ToggleButton value="EASY">
                        {DIFFICULTY_LABELS.EASY} ({cards.filter((c) => c.level === 'EASY').length})
                    </ToggleButton>
                    <ToggleButton value="MEDIUM">
                        {DIFFICULTY_LABELS.MEDIUM} ({cards.filter((c) => c.level === 'MEDIUM').length})
                    </ToggleButton>
                    <ToggleButton value="HARD">
                        {DIFFICULTY_LABELS.HARD} ({cards.filter((c) => c.level === 'HARD').length})
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {loading ? (
                <Typography>Đang tải...</Typography>
            ) : filteredCards.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                        {levelFilter === 'ALL'
                            ? 'Chưa có card nào. Thêm card đầu tiên!'
                            : `Chưa có card nào ở mức độ ${DIFFICULTY_LABELS[levelFilter as DifficultyLevel]}`}
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {filteredCards.map((card) => (
                        <Grid item xs={12} sm={6} md={4} key={card.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Chip
                                            label={DIFFICULTY_LABELS[card.level]}
                                            size="small"
                                            color={getDifficultyColor(card.level)}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(card.created_at).toLocaleDateString('vi-VN')}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1">{card.content}</Typography>
                                </CardContent>
                                <CardActions>
                                    <IconButton size="small" onClick={() => handleOpenForm(card)} color="primary">
                                        <Edit />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleOpenDelete(card)} color="error">
                                        <Delete />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <GameCardForm
                open={formOpen}
                onClose={handleCloseForm}
                onSuccess={loadCards}
                editingCard={editingCard}
            />

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa card này?
                    </Typography>
                    {deletingCard && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="body2" fontStyle="italic">
                                "{deletingCard.content}"
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    )
}
