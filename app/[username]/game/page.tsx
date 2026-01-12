'use client'

import { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import NavigationDrawer from '@/components/templates/shared/NavigationDrawer'
import LevelSelector from '@/components/game/LevelSelector'
import type { Page } from '@/lib/types'
import { TEMPLATE_COLORS } from '@/lib/types'

export default function GamePage() {
    const params = useParams()
    const username = params.username as string

    const [page, setPage] = useState<Page | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadPage()
    }, [username])

    const loadPage = async () => {
        const { data: pageData } = await supabase
            .from('pages')
            .select('*')
            .eq('username', username)
            .single()

        if (pageData) {
            setPage(pageData)
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

            <LevelSelector username={username} primaryColor={colors.primary} />
        </Box>
    )
}
