'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Chip,
    IconButton,
    Alert,
} from '@mui/material'
import { Close, Download, Refresh } from '@mui/icons-material'
import { QRCodeSVG } from 'qrcode.react'
import { toPng } from 'html-to-image'
import type { Page } from '@/lib/types'
import { TEMPLATE_COLORS } from '@/lib/types'

interface QRCodeDialogProps {
    open: boolean
    onClose: () => void
    page: Page
}

export default function QRCodeDialog({ open, onClose, page }: QRCodeDialogProps) {
    const [qrKey, setQrKey] = useState(0)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const pageUrl = `${baseUrl}/${page.username}`
    const templateColors = TEMPLATE_COLORS[page.template_type]

    const handleDownload = async () => {
        const element = document.getElementById('qr-code-container')
        if (!element) return

        try {
            const dataUrl = await toPng(element, {
                backgroundColor: '#ffffff',
                width: 400,
                height: 400,
            })

            const link = document.createElement('a')
            link.download = `${page.username}-qr.png`
            link.href = dataUrl
            link.click()
        } catch (error) {
            console.error('Error downloading QR code:', error)
        }
    }

    const handleRegenerate = () => {
        setQrKey((prev) => prev + 1)
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={600}>
                        QR Code - {page.username}
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ textAlign: 'center' }}>
                    <Chip
                        label={page.template_type}
                        sx={{
                            bgcolor: templateColors.background,
                            color: templateColors.primary,
                            fontWeight: 600,
                            mb: 2,
                        }}
                    />

                    <Box
                        id="qr-code-container"
                        sx={{
                            display: 'inline-block',
                            p: 3,
                            bgcolor: 'white',
                            borderRadius: 2,
                            boxShadow: 2,
                        }}
                    >
                        <QRCodeSVG
                            key={qrKey}
                            value={pageUrl}
                            size={300}
                            level="H"
                            includeMargin
                            fgColor={templateColors.primary}
                        />
                    </Box>

                    <Alert severity="info" sx={{ mt: 3, textAlign: 'left' }}>
                        <Typography variant="body2" fontWeight={600} gutterBottom>
                            URL trang:
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                fontFamily: 'monospace',
                                bgcolor: 'rgba(0,0,0,0.05)',
                                p: 1,
                                borderRadius: 1,
                                wordBreak: 'break-all',
                            }}
                        >
                            {pageUrl}
                        </Typography>
                    </Alert>

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                        QR code này trỏ đến trang của bạn. Link không thay đổi khi regenerate.
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                    onClick={handleRegenerate}
                    startIcon={<Refresh />}
                    variant="outlined"
                >
                    Regenerate
                </Button>
                <Button
                    onClick={handleDownload}
                    startIcon={<Download />}
                    variant="contained"
                >
                    Download PNG
                </Button>
            </DialogActions>
        </Dialog>
    )
}
