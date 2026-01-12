'use client'

import { useState, useEffect } from 'react'
import { Box, Container, Typography } from '@mui/material'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import NavigationDrawer from '@/components/templates/shared/NavigationDrawer'
import LetterCard from '@/components/letters/LetterCard'
import { getLetters } from './actions'
import type { Page, ContentItem } from '@/lib/types'
import { TEMPLATE_COLORS } from '@/lib/types'

export default function LettersPage() {
    const params = useParams()
    const username = params.username as string

    const [page, setPage] = useState<Page | null>(null)
    const [letters, setLetters] = useState<ContentItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [username])

    const loadData = async () => {
        // Fetch page
        const { data: pageData } = await supabase
            .from('pages')
            .select('*')
            .eq('username', username)
            .single()

        if (pageData) {
            setPage(pageData)

            // Fetch letters
            const { data: lettersData } = await getLetters(pageData.id)
            if (lettersData) {
                setLetters(lettersData)
            }
        }

        setLoading(false)
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
            }}
        >
            <NavigationDrawer
                username={username}
                templateType={page.template_type}
                primaryColor={colors.primary}
                backgroundColor={colors.background}
            />

            <Container maxWidth="md">
                <Box sx={{ pt: 8, pb: 4 }}>
                    <Typography
                        variant="h4"
                        gutterBottom
                        fontWeight={700}
                        sx={{ color: colors.primary }}
                    >
                        Thư Tình / Lời Nhắn
                    </Typography>

                    {letters.length > 0 ? (
                        <Box sx={{ mt: 4 }}>
                            {letters.map((letter) => (
                                <LetterCard
                                    key={letter.id}
                                    letter={letter}
                                    primaryColor={colors.primary}
                                    onReplyAdded={loadData}
                                />
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                            Chưa có thư nào
                        </Typography>
                    )}
                </Box>
            </Container>
        </Box>
    )
}
