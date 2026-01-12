'use client'

import { Box, Container, Typography, Grid, Card, CardContent, CardActions, Button } from '@mui/material'
import { Link as LinkIcon, Games, ArrowForward } from '@mui/icons-material'
import Link from 'next/link'

export default function AdminDashboard() {
    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Typography variant="h3" gutterBottom fontWeight={700}>
                Bảng điều khiển Admin
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Quản lý các trang cá nhân và game cards cho Love Page Platform
            </Typography>

            <Grid container spacing={4} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <LinkIcon sx={{ fontSize: 56, color: 'primary.main', mr: 2 }} />
                                <Typography variant="h4" fontWeight={600}>
                                    Links
                                </Typography>
                            </Box>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                Tạo và quản lý các trang cá nhân cho từng template (LOVE, EVERY, IDOL)
                            </Typography>
                            <Box component="ul" sx={{ pl: 2 }}>
                                <li><Typography variant="body2">Tạo link mới với slug tùy chỉnh</Typography></li>
                                <li><Typography variant="body2">Tạo QR code cho mỗi link</Typography></li>
                                <li><Typography variant="body2">Quản lý trạng thái active/inactive</Typography></li>
                            </Box>
                        </CardContent>
                        <CardActions sx={{ p: 2, pt: 0 }}>
                            <Button
                                component={Link}
                                href="/admin/links"
                                variant="contained"
                                size="large"
                                endIcon={<ArrowForward />}
                                fullWidth
                            >
                                Quản lý Links
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Games sx={{ fontSize: 56, color: 'secondary.main', mr: 2 }} />
                                <Typography variant="h4" fontWeight={600}>
                                    Game Cards
                                </Typography>
                            </Box>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                Quản lý câu hỏi và thử thách cho trò chơi couple
                            </Typography>
                            <Box component="ul" sx={{ pl: 2 }}>
                                <li><Typography variant="body2">Thêm câu hỏi mới tiếng Việt</Typography></li>
                                <li><Typography variant="body2">Phân loại theo độ khó</Typography></li>
                                <li><Typography variant="body2">Chỉnh sửa và xóa câu hỏi</Typography></li>
                            </Box>
                        </CardContent>
                        <CardActions sx={{ p: 2, pt: 0 }}>
                            <Button
                                component={Link}
                                href="/admin/games"
                                variant="contained"
                                color="secondary"
                                size="large"
                                endIcon={<ArrowForward />}
                                fullWidth
                            >
                                Quản lý Game Cards
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    )
}
