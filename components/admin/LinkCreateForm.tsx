'use client'

import { useState } from 'react'
import {
    Box,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Alert,
    Card,
    CardContent,
    Typography,
    Chip,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import type { TemplateType } from '@/lib/types'
import { TEMPLATE_COLORS } from '@/lib/types'
import { createLink } from '@/app/admin/links/actions'

export default function LinkCreateForm({ onSuccess }: { onSuccess?: () => void }) {
    const [username, setUsername] = useState('')
    const [template, setTemplate] = useState<TemplateType>('LOVE')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess(false)

        const result = await createLink(username, template)

        if (result.error) {
            setError(result.error)
        } else {
            setSuccess(true)
            setUsername('')
            setTemplate('LOVE')
            onSuccess?.()
        }

        setLoading(false)
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                    Tạo Link Mới
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <TextField
                        label="Username (Slug)"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase())}
                        fullWidth
                        required
                        placeholder="vi-du-love-page"
                        helperText="Chỉ chữ thường, số, gạch ngang (-) hoặc gạch dưới (_)"
                        sx={{ mb: 2 }}
                    />

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Template</InputLabel>
                        <Select
                            value={template}
                            label="Template"
                            onChange={(e) => setTemplate(e.target.value as TemplateType)}
                        >
                            <MenuItem value="LOVE">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                        label="LOVE"
                                        size="small"
                                        sx={{
                                            bgcolor: TEMPLATE_COLORS.LOVE.background,
                                            color: TEMPLATE_COLORS.LOVE.primary,
                                            fontWeight: 600,
                                        }}
                                    />
                                    <Typography variant="body2">- Trang couple (hồng phấn)</Typography>
                                </Box>
                            </MenuItem>
                            <MenuItem value="EVERY">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                        label="EVERY"
                                        size="small"
                                        sx={{
                                            bgcolor: TEMPLATE_COLORS.EVERY.background,
                                            color: TEMPLATE_COLORS.EVERY.primary,
                                            fontWeight: 600,
                                        }}
                                    />
                                    <Typography variant="body2">- Gia đình/Nhóm (xanh ngọc)</Typography>
                                </Box>
                            </MenuItem>
                            <MenuItem value="IDOL">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                        label="IDOL"
                                        size="small"
                                        sx={{
                                            bgcolor: TEMPLATE_COLORS.IDOL.background,
                                            color: TEMPLATE_COLORS.IDOL.buttonText,
                                            fontWeight: 600,
                                        }}
                                    />
                                    <Typography variant="body2">- Fan page idol (xanh dương)</Typography>
                                </Box>
                            </MenuItem>
                        </Select>
                    </FormControl>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Tạo link thành công! Username: <strong>{username || 'N/A'}</strong>
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={loading || !username}
                        startIcon={<Add />}
                    >
                        {loading ? 'Đang tạo...' : 'Tạo Link'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    )
}
