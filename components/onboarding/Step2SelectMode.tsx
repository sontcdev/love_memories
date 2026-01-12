'use client'

import { useState } from 'react'
import {
    Box,
    Typography,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField,
    Button,
} from '@mui/material'
import { ArrowForward, ArrowBack } from '@mui/icons-material'
import type { ModeCount } from '@/lib/types'

interface Step2SelectModeProps {
    onNext: (data: { modeCount: ModeCount; targetDate: string; titleText: string }) => void
    onBack: () => void
    primaryColor: string
}

export default function Step2SelectMode({ onNext, onBack, primaryColor }: Step2SelectModeProps) {
    const [modeCount, setModeCount] = useState<ModeCount>('UP')
    const [targetDate, setTargetDate] = useState('')
    const [titleText, setTitleText] = useState('Chúng mình đã bên nhau')

    const handleNext = () => {
        if (modeCount !== 'NONE' && !targetDate) {
            alert('Vui lòng chọn ngày mốc')
            return
        }

        onNext({ modeCount, targetDate, titleText })
    }

    return (
        <Box sx={{ maxWidth: 500, mx: 'auto', textAlign: 'left' }}>
            <Typography variant="h5" gutterBottom fontWeight={700} sx={{ color: primaryColor }}>
                Bước 2: Chế độ đếm ngày
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Chọn cách đếm ngày và ngày mốc quan trọng
            </Typography>

            {/* Mode Selection */}
            <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                <FormLabel sx={{ fontWeight: 600, mb: 1 }}>Chế độ đếm</FormLabel>
                <RadioGroup value={modeCount} onChange={(e) => setModeCount(e.target.value as ModeCount)}>
                    <FormControlLabel
                        value="UP"
                        control={<Radio sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }} />}
                        label={
                            <Box>
                                <Typography fontWeight={600}>Đếm lên</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Đếm từ ngày mốc đến hiện tại (VD: Đã yêu nhau 365 ngày)
                                </Typography>
                            </Box>
                        }
                    />
                    <FormControlLabel
                        value="DOWN"
                        control={<Radio sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }} />}
                        label={
                            <Box>
                                <Typography fontWeight={600}>Đếm xuống</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Đếm ngược đến ngày mốc (VD: Còn 30 ngày đến sinh nhật)
                                </Typography>
                            </Box>
                        }
                    />
                    <FormControlLabel
                        value="NONE"
                        control={<Radio sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }} />}
                        label={
                            <Box>
                                <Typography fontWeight={600}>Không đếm</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Chỉ hiển thị text, không đếm ngày
                                </Typography>
                            </Box>
                        }
                    />
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
                    sx={{ mb: 3 }}
                />
            )}

            {/* Title Text */}
            <TextField
                label="Text hiển thị"
                value={titleText}
                onChange={(e) => setTitleText(e.target.value)}
                fullWidth
                helperText={modeCount === 'NONE' ? 'Slogan hoặc text tùy chỉnh' : 'Text hiển thị trước số ngày'}
                sx={{ mb: 4 }}
            />

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" startIcon={<ArrowBack />} onClick={onBack} sx={{ borderColor: primaryColor, color: primaryColor }}>
                    Quay lại
                </Button>
                <Button
                    variant="contained"
                    endIcon={<ArrowForward />}
                    onClick={handleNext}
                    disabled={modeCount !== 'NONE' && !targetDate}
                    sx={{
                        flex: 1,
                        bgcolor: primaryColor,
                        '&:hover': { bgcolor: primaryColor, opacity: 0.9 },
                    }}
                >
                    Tiếp tục
                </Button>
            </Box>
        </Box>
    )
}
