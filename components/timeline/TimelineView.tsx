'use client'

import { Box, Typography } from '@mui/material'
import TimelineItem from './TimelineItem'
import type { ContentItem } from '@/lib/types'

interface TimelineViewProps {
    entries: ContentItem[]
    primaryColor: string
}

export default function TimelineView({ entries, primaryColor }: TimelineViewProps) {
    // Sort by event_date ASC, then by created_at ASC
    const sortedEntries = [...entries].sort((a, b) => {
        const dateA = new Date(a.event_date || a.created_at).getTime()
        const dateB = new Date(b.event_date || b.created_at).getTime()

        if (dateA !== dateB) {
            return dateA - dateB
        }

        // Same date, sort by created_at (older first)
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })

    if (sortedEntries.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                    Chưa có sự kiện nào
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Thêm các mốc quan trọng vào Timeline
                </Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ py: 4 }}>
            {sortedEntries.map((entry, index) => (
                <TimelineItem
                    key={entry.id}
                    entry={entry}
                    primaryColor={primaryColor}
                    isLast={index === sortedEntries.length - 1}
                />
            ))}
        </Box>
    )
}
