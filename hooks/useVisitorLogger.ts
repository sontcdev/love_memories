'use client';

import { useEffect } from 'react';
import { logGuestAccess } from '@/app/actions/analytics';

/**
 * Custom hook to log unique visitors per browser session
 * 
 * Deduplication Logic:
 * - Uses sessionStorage to track if this browser session already visited this link
 * - Only logs once per session (refreshing won't create duplicate logs)
 * - Session ends when browser is closed
 * 
 * @param linkId - The ID of the link being visited
 */
export function useVisitorLogger(linkId: string) {
    useEffect(() => {
        const sessionKey = `visited_${linkId}`;

        // Check if already visited in this session
        const hasVisited = sessionStorage.getItem(sessionKey);

        if (!hasVisited) {
            // Log the visit
            const userAgent = navigator.userAgent;

            logGuestAccess(linkId, userAgent)
                .then(() => {
                    // Mark as visited in this session
                    sessionStorage.setItem(sessionKey, 'true');
                })
                .catch((error) => {
                    console.error('Failed to log visitor:', error);
                    // Don't break the app if logging fails
                });
        }
    }, [linkId]);
}
