'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'framer-motion';

interface TemplateWrapperProps {
    username: string;
    linkId: string;
    children: React.ReactNode;
}

export default function TemplateWrapper({ username, linkId, children }: TemplateWrapperProps) {
    const { viewMode, setGuestAuth } = useAuthStore();

    // Auto-authenticate as guest on mount (public access)
    useEffect(() => {
        if (!viewMode) {
            setGuestAuth(linkId, username);
        }
    }, [linkId, username, viewMode, setGuestAuth]);

    return (
        <>
            {/* Main content with fade-in animation */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="min-h-screen"
            >
                {children}
            </motion.div>
        </>
    );
}
