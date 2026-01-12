// Rate limiting utilities (client-side)

export interface RateLimitState {
    attempts: number
    lockedUntil: number | null
}

const RATE_LIMIT_KEY = (username: string) => `pin_attempts_${username}`
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 10 * 60 * 1000 // 10 minutes in milliseconds

export function checkRateLimit(username: string): {
    allowed: boolean
    remainingTime?: number
} {
    const state = getStoredState(username)

    if (state.lockedUntil && Date.now() < state.lockedUntil) {
        const remainingMs = state.lockedUntil - Date.now()
        return {
            allowed: false,
            remainingTime: Math.ceil(remainingMs / 1000), // seconds
        }
    }

    // Reset if lockout expired
    if (state.lockedUntil && Date.now() >= state.lockedUntil) {
        resetRateLimit(username)
    }

    return { allowed: true }
}

export function recordFailedAttempt(username: string): void {
    const state = getStoredState(username)
    state.attempts += 1

    if (state.attempts >= MAX_ATTEMPTS) {
        state.lockedUntil = Date.now() + LOCKOUT_DURATION
        state.attempts = 0
    }

    saveState(username, state)
}

export function resetRateLimit(username: string): void {
    const initialState: RateLimitState = {
        attempts: 0,
        lockedUntil: null,
    }
    saveState(username, initialState)
}

function getStoredState(username: string): RateLimitState {
    if (typeof window === 'undefined') {
        return { attempts: 0, lockedUntil: null }
    }

    const stored = localStorage.getItem(RATE_LIMIT_KEY(username))
    if (!stored) {
        return { attempts: 0, lockedUntil: null }
    }

    try {
        return JSON.parse(stored)
    } catch {
        return { attempts: 0, lockedUntil: null }
    }
}

function saveState(username: string, state: RateLimitState): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(RATE_LIMIT_KEY(username), JSON.stringify(state))
}

// Format remaining time for display
export function formatRemainingTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes > 0) {
        return `${minutes} phút ${remainingSeconds} giây`
    }
    return `${remainingSeconds} giây`
}
