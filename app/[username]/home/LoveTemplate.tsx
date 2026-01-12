'use client'

import { Box, Container } from '@mui/material'
import NavigationDrawer from '@/components/templates/shared/NavigationDrawer'
import DateCounter from '@/components/templates/shared/DateCounter'
import LoveInfo from '@/components/templates/love/LoveInfo'
import ParticipantInfo from '@/components/templates/love/ParticipantInfo'
import type { Page, PageData } from '@/lib/types'
import { TEMPLATE_COLORS } from '@/lib/types'

interface LoveTemplateProps {
    page: Page
    pageData: PageData
}

export default function LoveTemplate({ page, pageData }: LoveTemplateProps) {
    const colors = TEMPLATE_COLORS.LOVE

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: colors.background,
                position: 'relative',
            }}
        >
            <NavigationDrawer
                username={page.username}
                templateType="LOVE"
                primaryColor={colors.primary}
                backgroundColor={colors.background}
            />

            <Container maxWidth="md">
                <Box
                    sx={{
                        pt: 8,
                        pb: 4,
                    }}
                >
                    {/* Header with Avatars and Heart */}
                    <LoveInfo participants={pageData.participants} primaryColor={colors.primary} />

                    {/* Date Counter */}
                    <DateCounter
                        modeCount={pageData.mode_count}
                        targetDate={pageData.target_date}
                        titleText={pageData.title_text}
                        primaryColor={colors.primary}
                    />

                    {/* Participant Info (Names + Ages) */}
                    <ParticipantInfo participants={pageData.participants} primaryColor={colors.primary} />

                    {/* Placeholder for future content */}
                    <Box sx={{ mt: 6, textAlign: 'center', opacity: 0.5 }}>
                        <p style={{ color: colors.primary }}>Gallery, Timeline, and Letters coming in Phase 5</p>
                    </Box>
                </Box>
            </Container>
        </Box>
    )
}
