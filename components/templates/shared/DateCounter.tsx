'use client'

import { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import type { ModeCount } from '@/lib/types'
import { calculateDaysBetween, getTimeUntilMidnight } from '@/lib/dateUtils'

interface DateCounterProps {
    modeCount: ModeCount
    targetDate: string | null
    titleText: string
    primaryColor?: string
}

export default function DateCounter({
    modeCount,
    targetDate,
    titleText,
    primaryColor = '#E30523',
}: DateCounterProps) {
    const [days, setDays] = useState(0)

    useEffect(() => {
        if (modeCount === 'NONE' || !targetDate) return

        const calculateDays = () => {
            const target = new Date(targetDate)
            const now = new Date()

            // Set to start of day
            target.setHours(0, 0, 0, 0)
            now.setHours(0, 0, 0, 0)

            const diffTime =
                modeCount === 'UP'
                    ? now.getTime() - target.getTime()
                    : target.getTime() - now.getTime()

            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            setDays(Math.max(0, diffDays))
        }

        calculateDays()

        // Update at midnight
        const timeUntilMidnight = getTimeUntilMidnight()
        const timeout = setTimeout(calculateDays, timeUntilMidnight)

        return () => clearTimeout(timeout)
    }, [modeCount, targetDate])

    if (modeCount === 'NONE') {
        return (
            <Box textAlign="center" sx={{ py: 3 }}>
                <Typography variant="h6" sx={{ color: primaryColor, fontWeight: 600 }}>
                    {titleText}
                </Typography>
            </Box>
        )
    }

    return (
        <Box textAlign="center" sx={{ py: 3 }}>
            <Typography
                variant="body1"
                sx={{
                    color: primaryColor,
                    fontWeight: 500,
                    mb: 1,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                }}
            >
                {titleText}
            </Typography>
            <Typography
                variant="h3"
                sx={{
                    color: primaryColor,
                    fontWeight: 700,
                    fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                }}
            >
                {days} ngày
            </Typography>
        </Box>
    )
}
