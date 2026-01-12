'use client'

import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Switch,
    Tooltip,
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material'
import { QrCode, Delete, Visibility } from '@mui/icons-material'
import type { Page } from '@/lib/types'
import { TEMPLATE_COLORS } from '@/lib/types'
import { deleteLink, toggleLinkStatus } from '@/app/admin/links/actions'
import QRCodeDialog from './QRCodeDialog'

interface LinkTableProps {
    initialLinks: Page[]
    onRefresh: () => void
}

export default function LinkTable({ initialLinks, onRefresh }: LinkTableProps) {
    const [links, setLinks] = useState(initialLinks)
    const [selectedPage, setSelectedPage] = useState<Page | null>(null)
    const [qrDialogOpen, setQrDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const handleToggleStatus = async (page: Page) => {
        await toggleLinkStatus(page.id, !page.is_active)
        setLinks((prev) =>
            prev.map((link) =>
                link.id === page.id ? { ...link, is_active: !link.is_active } : link
            )
        )
        onRefresh()
    }

    const handleOpenQR = (page: Page) => {
        setSelectedPage(page)
        setQrDialogOpen(true)
    }

    const handleOpenDelete = (page: Page) => {
        setSelectedPage(page)
        setDeleteDialogOpen(true)
    }

    const handleDelete = async () => {
        if (!selectedPage) return

        setDeletingId(selectedPage.id)
        await deleteLink(selectedPage.id)
        setLinks((prev) => prev.filter((link) => link.id !== selectedPage.id))
        setDeleteDialogOpen(false)
        setSelectedPage(null)
        setDeletingId(null)
        onRefresh()
    }

    if (links.length === 0) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    Chưa có link nào. Tạo link đầu tiên để bắt đầu!
                </Typography>
            </Paper>
        )
    }

    return (
        <>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Username</strong></TableCell>
                            <TableCell><strong>Template</strong></TableCell>
                            <TableCell align="center"><strong>Trạng thái</strong></TableCell>
                            <TableCell><strong>Ngày tạo</strong></TableCell>
                            <TableCell align="center"><strong>Hành động</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {links.map((page) => {
                            const templateColors = TEMPLATE_COLORS[page.template_type]
                            return (
                                <TableRow key={page.id} hover>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>
                                                {page.username}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                                            >
                                                {baseUrl}/{page.username}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={page.template_type}
                                            size="small"
                                            sx={{
                                                bgcolor: templateColors.background,
                                                color: templateColors.primary,
                                                fontWeight: 600,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title={page.is_active ? 'Tắt trang' : 'Bật trang'}>
                                            <Switch
                                                checked={page.is_active}
                                                onChange={() => handleToggleStatus(page)}
                                                color="primary"
                                            />
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {new Date(page.created_at).toLocaleDateString('vi-VN')}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(page.created_at).toLocaleTimeString('vi-VN')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Xem trang">
                                            <IconButton
                                                size="small"
                                                href={`/${page.username}`}
                                                target="_blank"
                                                color="primary"
                                            >
                                                <Visibility />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Lấy QR Code">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenQR(page)}
                                                color="info"
                                            >
                                                <QrCode />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Xóa link">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDelete(page)}
                                                color="error"
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {selectedPage && (
                <QRCodeDialog
                    open={qrDialogOpen}
                    onClose={() => setQrDialogOpen(false)}
                    page={selectedPage}
                />
            )}

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa link <strong>{selectedPage?.username}</strong>?
                        Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={deletingId !== null}
                    >
                        {deletingId ? 'Đang xóa...' : 'Xóa'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
