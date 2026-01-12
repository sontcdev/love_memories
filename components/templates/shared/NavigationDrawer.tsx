'use client'

import { useState } from 'react'
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Box,
    Typography,
    Divider,
} from '@mui/material'
import {
    Menu as MenuIcon,
    Home,
    Photo,
    Timeline,
    Mail,
    Games,
    Close,
} from '@mui/icons-material'
import { useRouter, usePathname } from 'next/navigation'
import type { TemplateType } from '@/lib/types'

interface NavigationDrawerProps {
    username: string
    templateType: TemplateType
    primaryColor: string
    backgroundColor: string
}

interface MenuItem {
    label: string
    icon: JSX.Element
    path: string
    templates: TemplateType[] | 'all'
}

const menuItems: MenuItem[] = [
    { label: 'Trang chủ', icon: <Home />, path: '/home', templates: 'all' },
    { label: 'Ảnh', icon: <Photo />, path: '/gallery', templates: 'all' },
    { label: 'Timeline', icon: <Timeline />, path: '/timeline', templates: 'all' },
    { label: 'Thư/Lời nhắn', icon: <Mail />, path: '/letters', templates: 'all' },
    { label: 'Game', icon: <Games />, path: '/game', templates: ['LOVE'] },
]

export default function NavigationDrawer({
    username,
    templateType,
    primaryColor,
    backgroundColor,
}: NavigationDrawerProps) {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    const filteredItems = menuItems.filter(
        (item) => item.templates === 'all' || item.templates.includes(templateType)
    )

    const handleNavigate = (path: string) => {
        router.push(`/${username}${path}`)
        setOpen(false)
    }

    return (
        <>
            {/* Menu Button */}
            <IconButton
                onClick={() => setOpen(true)}
                sx={{
                    position: 'fixed',
                    top: 16,
                    left: 16,
                    zIndex: 1100,
                    bgcolor: 'white',
                    boxShadow: 2,
                    '&:hover': {
                        bgcolor: 'grey.100',
                    },
                }}
            >
                <MenuIcon sx={{ color: primaryColor }} />
            </IconButton>

            {/* Drawer */}
            <Drawer
                anchor="left"
                open={open}
                onClose={() => setOpen(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: 280,
                    },
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        bgcolor: backgroundColor,
                        p: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="h6" fontWeight={700} sx={{ color: primaryColor }}>
                        Menu
                    </Typography>
                    <IconButton onClick={() => setOpen(false)} size="small">
                        <Close sx={{ color: primaryColor }} />
                    </IconButton>
                </Box>

                <Divider />

                {/* Menu Items */}
                <List sx={{ flex: 1 }}>
                    {filteredItems.map((item) => {
                        const isActive = pathname.includes(item.path)
                        return (
                            <ListItem key={item.path} disablePadding>
                                <ListItemButton
                                    onClick={() => handleNavigate(item.path)}
                                    sx={{
                                        bgcolor: isActive ? `${primaryColor}20` : 'transparent',
                                        '&:hover': {
                                            bgcolor: `${primaryColor}10`,
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ color: isActive ? primaryColor : 'inherit' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{
                                            fontWeight: isActive ? 600 : 400,
                                            color: isActive ? primaryColor : 'inherit',
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        )
                    })}
                </List>

                <Divider />

                {/* Footer */}
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                        @{username}
                    </Typography>
                </Box>
            </Drawer>
        </>
    )
}
