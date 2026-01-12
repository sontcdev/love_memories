'use client'

import { useState, useEffect } from 'react'
import {
    Box,
    Container,
    Typography,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField,
    Checkbox,
    Button,
    Alert,
} from '@mui/material'
import { Save } from '@mui/icons-material'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import NavigationDrawer from '@/components/templates/shared/NavigationDrawer'
import { updateCountMode, updateMusicSettings, getMusicSettings } from './actions'
import type { Page, PageData, ModeCount } from '@/lib/types'
import { TEMPLATE_COLORS } from '@/lib/types'

export default function SettingsPage() {
    const params = useParams()
    const username = params.username as string

    const [page, setPage] = useState<Page | null>(null)
    const [pageData, setPageData] = useState<PageData | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')

    // Form state
    const [modeCount, setModeCount] = useState<ModeCount>('UP')
    const [targetDate, setTargetDate] = useState('')
    const [musicUrl, setMusicUrl] = useState('')
    const [autoplay, setAutoplay] = useState(false)

    useEffect(() => {
        loadData()
    }, [username])

    const loadData = async () => {
        const { data: pg } = await supabase
            .from('pages')
            .select('*')
            .eq('username', username)
            .single()

        if (pg) {
            setPage(pg)

            const { data: pd } = await supabase
                .from('page_data')
                .select('*')
                .eq('page_id', pg.id)
                .single()

            if (pd) {
                setPageData(pd)
                setModeCount(pd.mode_count)
                setTargetDate(pd.target_date || '')
            }

            // Load music settings
            const { data: music } = await getMusicSettings(pg.id)
            if (music) {
                setMusicUrl(music.track_url || '')
                setAutoplay(music.autoplay || false)
            }
        }

        setLoading(false)
    }

    const handleSave = async () => {
        if (!page) return

        setSaving(true)
        setMessage('')

        try {
            // Update count mode
            const countResult = await updateCountMode(
                page.id,
                modeCount,
                modeCount === 'NONE' ? null : targetDate
            )

            if (countResult.error) {
                setMessage(`Lỗi: ${countResult.error}`)
                setSaving(false)
                return
            }

            // Update music
            if (musicUrl) {
                const musicResult = await updateMusicSettings(page.id, musicUrl, autoplay)
                if (musicResult.error) {
                    setMessage(`Lỗi: ${musicResult.error}`)
                    setSaving(false)
                    return
                }
            }

            setMessage('Đã lưu thay đổi!')
            setTimeout(() => setMessage(''), 3000)
        } catch (error) {
            setMessage('Lỗi khi lưu')
        }

        setSaving(false)
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

            <Container maxWidth="sm">
                <Box sx={{ pt: 8, pb: 4 }}>
                    <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: colors.primary }}>
                        Cài đặt
                    </Typography>

                    {/* Count Mode */}
                    <FormControl component="fieldset" fullWidth sx={{ mb: 4, mt: 4 }}>
                        <FormLabel sx={{ fontWeight: 600, mb: 2, color: colors.primary }}>
                            Chế độ đếm ngày
                        </FormLabel>
                        <RadioGroup value={modeCount} onChange={(e) => setModeCount(e.target.value as ModeCount)}>
                            <FormControlLabel value="UP" control={<Radio />} label="Đếm lên" />
                            <FormControlLabel value="DOWN" control={<Radio />} label="Đếm xuống" />
                            <FormControlLabel value="NONE" control={<Radio />} label="Không đếm" />
                        </RadioGroup>
                    </FormControl>

                    {/* Target Date */}
                    {modeCount !== 'NONE' && (
                        <TextField
                            label={modeCount === 'UP' ? 'Ngày bắt đầu' : 'Ngày đếm ngược'}
                            type="date"
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            sx={{ mb: 4 }}
                        />
                    )}

                    {/* Music */}
                    <Typography variant="h6" gutterBottom fontWeight={600} sx={{ color: colors.primary, mt: 4 }}>
                        Nhạc nền
                    </Typography>

                    <TextField
                        label="URL nhạc"
                        value={musicUrl}
                        onChange={(e) => setMusicUrl(e.target.value)}
                        fullWidth
                        placeholder="https://example.com/music.mp3"
                        sx={{ mb: 2 }}
                    />

                    <FormControlLabel
                        control={
                            <Checkbox checked={autoplay} onChange={(e) => setAutoplay(e.target.checked)} />
                        }
                        label="Tự động phát khi vào trang"
                    />

                    {/* Message */}
                    {message && (
                        <Alert severity={message.includes('Lỗi') ? 'error' : 'success'} sx={{ mt: 3 }}>
                            {message}
                        </Alert>
                    )}

                    {/* Save Button */}
                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Save />}
                        onClick={handleSave}
                        disabled={saving}
                        sx={{
                            mt: 4,
                            py: 1.5,
                            bgcolor: colors.primary,
                            '&:hover': { bgcolor: colors.primary, opacity: 0.9 },
                        }}
                    >
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                </Box>
            </Container>
        </Box>
    )
}
