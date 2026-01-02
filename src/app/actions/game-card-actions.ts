"use server";

import { prisma } from "@/lib/prisma";
import { GameLevel } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Get all game cards
export async function getGameCards() {
    try {
        const cards = await prisma.gameCard.findMany({
            orderBy: [
                { level: "asc" },
                { created_at: "desc" },
            ],
        });
        return { success: true, data: cards };
    } catch (error) {
        console.error("Error fetching game cards:", error);
        return { success: false, error: "Failed to fetch game cards" };
    }
}

// Create a new game card
export async function createGameCard(content: string, level: GameLevel) {
    try {
        const card = await prisma.gameCard.create({
            data: {
                content,
                level,
                is_active: true,
            },
        });
        revalidatePath("/admin/game-cards");
        return { success: true, data: card };
    } catch (error) {
        console.error("Error creating game card:", error);
        return { success: false, error: "Failed to create game card" };
    }
}

// Delete a game card
export async function deleteGameCard(cardId: string) {
    try {
        await prisma.gameCard.delete({
            where: { id: cardId },
        });
        revalidatePath("/admin/game-cards");
        return { success: true };
    } catch (error) {
        console.error("Error deleting game card:", error);
        return { success: false, error: "Failed to delete game card" };
    }
}

// Toggle card active status
export async function toggleGameCardStatus(cardId: string) {
    try {
        const card = await prisma.gameCard.findUnique({
            where: { id: cardId },
        });

        if (!card) {
            return { success: false, error: "Card not found" };
        }

        const updated = await prisma.gameCard.update({
            where: { id: cardId },
            data: { is_active: !card.is_active },
        });

        revalidatePath("/admin/game-cards");
        return { success: true, data: updated };
    } catch (error) {
        console.error("Error toggling game card:", error);
        return { success: false, error: "Failed to toggle game card" };
    }
}
