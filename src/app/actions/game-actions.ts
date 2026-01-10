"use server";

import { prisma } from "@/lib/prisma";
import { GameLevel } from "@prisma/client";

export interface DrawnCard {
    id: string;
    content: string;
    level: GameLevel;
}

export async function drawCard(
    level: "EASY" | "MEDIUM" | "HARD",
    excludeId?: string // Can be comma-separated list of IDs
): Promise<{ success: boolean; card?: DrawnCard; error?: string }> {
    try {
        // Parse excludeId as comma-separated list
        const excludeIds = excludeId ? excludeId.split(",").filter(id => id.trim()) : [];

        // Get all active cards for this level (cards are global, not per-link)
        const cards = await prisma.gameCard.findMany({
            where: {
                level: level,
                is_active: true,
                ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
            },
            select: {
                id: true,
                content: true,
                level: true,
            },
        });

        if (cards.length === 0) {
            // Check if ALL cards have been shown (no cards left after exclusion)
            if (excludeIds.length > 0) {
                return {
                    success: false,
                    error: "All cards shown"
                };
            }
            return {
                success: false,
                error: `No ${level.toLowerCase()} cards available`
            };
        }

        // Pick random card
        const randomIndex = Math.floor(Math.random() * cards.length);
        return { success: true, card: cards[randomIndex] };
    } catch (error) {
        console.error("Draw card error:", error);
        return { success: false, error: "Failed to draw card" };
    }
}

// Get card counts by level
export async function getCardCounts() {
    const counts = await prisma.gameCard.groupBy({
        by: ["level"],
        where: { is_active: true },
        _count: true,
    });

    return counts.reduce((acc, item) => {
        acc[item.level] = item._count;
        return acc;
    }, {} as Record<GameLevel, number>);
}
