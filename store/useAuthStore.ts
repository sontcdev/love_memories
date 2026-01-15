import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ViewMode } from '@/types/database.types';

interface AuthStore {
    // State
    isAuthenticated: boolean;
    viewMode: ViewMode | null;
    linkId: string | null;
    username: string | null;

    // Actions
    setGuestAuth: (linkId: string, username: string) => void;
    setOwnerAuth: (linkId: string, username: string) => void;
    logout: () => void;
    reset: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            // Initial state
            isAuthenticated: false,
            viewMode: null,
            linkId: null,
            username: null,

            // Set guest authentication
            setGuestAuth: (linkId, username) => set({
                isAuthenticated: true,
                viewMode: 'guest',
                linkId,
                username,
            }),

            // Set owner authentication (upgrade from guest)
            setOwnerAuth: (linkId, username) => set({
                isAuthenticated: true,
                viewMode: 'owner',
                linkId,
                username,
            }),

            // Logout (downgrade to guest)
            logout: () => set((state) => ({
                ...state,
                viewMode: 'guest',
            })),

            // Complete reset (for navigation away)
            reset: () => set({
                isAuthenticated: false,
                viewMode: null,
                linkId: null,
                username: null,
            }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => sessionStorage), // Use sessionStorage for session-only persistence
        }
    )
);
