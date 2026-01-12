'use client'

import { Box, Container } from '@mui/material'
import NavigationDrawer from '@/components/templates/shared/NavigationDrawer'
import IdolCover from '@/components/templates/idol/IdolCover'
import IdolInfo from '@/components/templates/idol/IdolInfo'
import IdolSlogan from '@/components/templates/idol/IdolSlogan'
import type { Page, PageData } from '@/lib/types'
import { TEMPLATE_COLORS } from '@/lib/types'

interface IdolTemplateProps {
    page: Page
    pageData: PageData
}

export default function IdolTemplate({ page, pageData }: IdolTemplateProps) {
    const colors = TEMPLATE_COLORS.IDOL
    const idol = pageData.participants[0] // First participant is the idol

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
                templateType="IDOL"
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
                    {/* Cover Image */}
                    <IdolCover imageUrl={idol?.avatar_url || ''} idolName={idol?.name || 'Idol'} />

                    {/* Idol Info */}
                    <IdolInfo
                        idol={idol}
                        debutDate={pageData.target_date || undefined}
                        primaryColor={colors.primary}
                    />

                    {/* Slogan */}
                    <IdolSlogan text={pageData.title_text} />

                    {/* Placeholder for future content */}
                    <Box sx={{ mt: 6, textAlign: 'center', opacity: 0.5 }}>
                        <p style={{ color: colors.primary }}>Fan gallery and milestones coming in Phase 5</p>
                    </Box>
                </Box>
            </Container>
        </Box>
    )
}
