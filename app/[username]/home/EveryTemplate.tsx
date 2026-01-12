'use client'

import { Box, Container } from '@mui/material'
import NavigationDrawer from '@/components/templates/shared/NavigationDrawer'
import DateCounter from '@/components/templates/shared/DateCounter'
import MemberGrid from '@/components/templates/every/MemberGrid'
import type { Page, PageData } from '@/lib/types'
import { TEMPLATE_COLORS } from '@/lib/types'

interface EveryTemplateProps {
    page: Page
    pageData: PageData
}

export default function EveryTemplate({ page, pageData }: EveryTemplateProps) {
    const colors = TEMPLATE_COLORS.EVERY

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
                templateType="EVERY"
                primaryColor={colors.primary}
                backgroundColor={colors.background}
            />

            <Container maxWidth="lg">
                <Box
                    sx={{
                        pt: 8,
                        pb: 4,
                    }}
                >
                    {/* Date Counter */}
                    <DateCounter
                        modeCount={pageData.mode_count}
                        targetDate={pageData.target_date}
                        titleText={pageData.title_text}
                        primaryColor={colors.primary}
                    />

                    {/* Member Grid */}
                    <MemberGrid participants={pageData.participants} primaryColor={colors.primary} />

                    {/* Placeholder for future content */}
                    <Box sx={{ mt: 6, textAlign: 'center', opacity: 0.5 }}>
                        <p style={{ color: colors.primary }}>Gallery and Timeline coming in Phase 5</p>
                    </Box>
                </Box>
            </Container>
        </Box>
    )
}
