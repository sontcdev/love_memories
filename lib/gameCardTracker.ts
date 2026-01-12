// Game card tracker - prevents showing same card twice

import type { DifficultyLevel, GameCard } from './types'

const STORAGE_KEY = (level: DifficultyLevel, username: string) =>
    `game_shown_cards_${level}_${username}`

export class GameCardTracker {
    private level: DifficultyLevel
    private username: string
    private shownCards: Set<string>

    constructor(level: DifficultyLevel, username: string) {
        this.level = level
        this.username = username
        this.shownCards = this.loadShownCards()
    }

    private loadShownCards(): Set<string> {
        if (typeof window === 'undefined') return new Set()

        const stored = sessionStorage.getItem(STORAGE_KEY(this.level, this.username))
        return stored ? new Set(JSON.parse(stored)) : new Set()
    }

    private saveShownCards(): void {
        if (typeof window === 'undefined') return

        sessionStorage.setItem(
            STORAGE_KEY(this.level, this.username),
            JSON.stringify(Array.from(this.shownCards))
        )
    }

    markAsShown(cardId: string): void {
        this.shownCards.add(cardId)
        this.saveShownCards()
    }

    getRandomCard(availableCards: GameCard[]): GameCard | null {
        if (availableCards.length === 0) return null

        const unshownCards = availableCards.filter(
            (card) => !this.shownCards.has(card.id)
        )

        // Reset if all cards have been shown
        if (unshownCards.length === 0) {
            this.reset()
            // Return random card from full pool
            return availableCards[Math.floor(Math.random() * availableCards.length)]
        }

        // Return random card from unshown pool
        return unshownCards[Math.floor(Math.random() * unshownCards.length)]
    }

    reset(): void {
        this.shownCards.clear()
        this.saveShownCards()
    }

    getShownCount(): number {
        return this.shownCards.size
    }
}
