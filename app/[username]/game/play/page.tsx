'use client'

import { useState, useEffect } from 'react'
import { Box, Container, Typography, Button, Chip } from '@mui/material'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Shuffle, ArrowBack } from '@mui/icons-material'
import { supabase } from '@/lib/supabase'
import GameCard from '@/components/game/GameCard'
import { GameCardTracker } from '@/lib/gameCardTracker'
import type { Page, GameCard as GameCardType, DifficultyLevel } from '@/lib/types'
import { TEMPLATE_COLORS, DIFFICULTY_LABELS } from '@/lib/types'

export default function GamePlayPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()

    const username = params.username as string
    const level = (searchParams.get('level') || 'EASY') as DifficultyLevel

    const [page, setPage] = useState<Page | null>(null)
    const [cards, setCards] = useState<GameCardType[]>([])
    const [currentCard, setCurrentCard] = useState<GameCardType | null>(null)
    const [isFlipped, setIsFlipped] = useState(false)
    const [tracker, setTracker] = useState<GameCardTracker | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [username, level])

    const loadData = async () => {
        // Fetch page
        const { data: pageData } = await supabase
            .from('pages')
            .select('*')
            .eq('username', username)
            .single()

        if (pageData) {
            setPage(pageData)
        }

        // Fetch game cards for this level
        const { data: cardsData } = await supabase
            .from('game_cards')
            .select('*')
            .eq('level', level)

        if (cardsData && cardsData.length > 0) {
            setCards(cardsData)

            // Initialize tracker
            const cardTracker = new GameCardTracker(level, username)
            setTracker(cardTracker)

            // Get first random card
            const firstCard = cardTracker.getRandomCard(cardsData)
            if (firstCard) {
                setCurrentCard(firstCard)
                cardTracker.markAsShown(firstCard.id)
            }
        }

        setLoading(false)
    }

    const handleFlip = () => {
        setIsFlipped(!isFlipped)
    }

    const handleDrawNew = () => {
        if (!tracker || cards.length === 0) return

        const newCard = tracker.getRandomCard(cards)
        if (newCard) {
            setCurrentCard(newCard)
            tracker.markAsShown(newCard.id)
            setIsFlipped(false)
        }
    }

    const handleChangeLevel = () => {
        router.push(`/${username}/game`)
    }

    if (loading || !page) {
        return <Box sx={{ p: 4, textAlign: 'center' }}>Đang tải...</Box>
    }

    const colors = TEMPLATE_COLORS[page.template_type]

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: colors.background,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Container maxWidth="sm">
                <Box
                    sx={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 4,
                    }}
                >
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography
                            variant="h5"
                            gutterBottom
                            fontWeight={700}
                            sx={{ color: colors.primary }}
                        >
                            Thẻ Bài Thấu Hiểu
                        </Typography>
                        <Chip
                            label={DIFFICULTY_LABELS[level]}
                            color={level === 'EASY' ? 'success' : level === 'MEDIUM' ? 'warning' : 'error'}
                            sx={{ fontWeight: 600 }}
                        />
                    </Box>

                    {/* Game Card */}
                    <GameCard
                        question={currentCard?.content || null}
                        isFlipped={isFlipped}
                        onFlip={handleFlip}
                        primaryColor={colors.primary}
                    />

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            startIcon={<Shuffle />}
                            onClick={handleDrawNew}
                            sx={{
                                bgcolor: colors.primary,
                                '&:hover': {
                                    bgcolor: colors.primary,
                                    opacity: 0.9,
                                },
                            }}
                        >
                            Rút thẻ khác
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBack />}
                            onClick={handleChangeLevel}
                            sx={{
                                borderColor: colors.primary,
                                color: colors.primary,
                            }}
                        >
                            Đổi mức độ
                        </Button>
                    </Box>

                    {/* Stats */}
                    {tracker && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 3 }}>
                            Đã xem: {tracker.getShownCount()}/{cards.length} thẻ
                        </Typography>
                    )}
                </Box>
            </Container>
        </Box>
    )
}
