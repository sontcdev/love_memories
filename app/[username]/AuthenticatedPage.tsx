'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PinScreen from '@/components/auth/PinScreen'
import type { Page } from '@/lib/types'

interface AuthenticatedPageProps {
    page: Page
}

export default function AuthenticatedPage({ page }: AuthenticatedPageProps) {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    const handleAuthSuccess = () => {
        setIsAuthenticated(true)
        // Redirect to home page
        router.push(`/${page.username}/home`)
    }

    if (!isAuthenticated) {
        return <PinScreen page={page} onSuccess={handleAuthSuccess} />
    }

    // This shouldn't render as we redirect immediately
    return null
}
