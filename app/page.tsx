'use client'

import { Box, Container, Typography, Button } from '@mui/material'
import { useRouter } from 'next/navigation'

export default function HomePage() {
    const router = useRouter()

    return (
        <Container maxWidth="md">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                }}
            >
                <Typography variant="h2" gutterBottom fontWeight={700}>
                    Love Page Platform
                </Typography>
                <Typography variant="h5" color="text.secondary" paragraph>
                    Nền tảng tạo trang cá nhân cho cặp đôi, gia đình và idol
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => router.push('/admin')}
                    sx={{ mt: 4, px: 4, py: 1.5 }}
                >
                    Vào trang quản trị
                </Button>
            </Box>
        </Container>
    )
}
