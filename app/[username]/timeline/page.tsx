'use client'

import { useState, useEffect } from 'react'
import { Box, Container, Typography } from '@mui/material'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import NavigationDrawer from '@/components/templates/shared/NavigationDrawer'
import TimelineView from '@/components/timeline/TimelineView'
import { getTimelineEntries } from './actions'
import type { Page, ContentItem } from '@/lib/types'
import { TEMPLATE_COLORS } from '@/lib/types'

export default function TimelinePage() {
    const params = useParams()
    const username = params.username as string

    const [page, setPage] = useState<Page | null>(null)
    const [entries, setEntries] = useState<ContentItem[]>([])
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

            // Fetch timeline entries
            const { data: timelineData } = await getTimelineEntries(pageData.id)
            if (timelineData) {
                setEntries(timelineData)
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
                        Dòng Thời Gian
                    </Typography>

                    <TimelineView entries={entries} primaryColor={colors.primary} />
                </Box>
            </Container>
        </Box>
    )
}
