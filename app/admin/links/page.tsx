'use client'

import { useState, useEffect } from 'react'
import { Container, Typography, Box, Button, Grid } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import Link from 'next/link'
import LinkCreateForm from '@/components/admin/LinkCreateForm'
import LinkTable from '@/components/admin/LinkTable'
import { getLinks } from './actions'
import type { Page } from '@/lib/types'

export default function LinksPage() {
    const [links, setLinks] = useState<Page[]>([])
    const [loading, setLoading] = useState(true)

    const loadLinks = async () => {
        setLoading(true)
        const result = await getLinks()
        if (result.data) {
            setLinks(result.data)
        }
        setLoading(false)
    }

    useEffect(() => {
        loadLinks()
    }, [])

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                component={Link}
                href="/admin"
                startIcon={<ArrowBack />}
                sx={{ mb: 3 }}
            >
                Quay lại Dashboard
            </Button>

            <Typography variant="h4" gutterBottom fontWeight={700}>
                Quản lý Links
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Tạo và quản lý các trang cá nhân cho Love Page Platform
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={4}>
                    <LinkCreateForm onSuccess={loadLinks} />
                </Grid>

                <Grid item xs={12} md={8}>
                    <Box>
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                            Danh sách Links ({links.length})
                        </Typography>
                        {loading ? (
                            <Typography>Đang tải...</Typography>
                        ) : (
                            <LinkTable initialLinks={links} onRefresh={loadLinks} />
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Container>
    )
}
