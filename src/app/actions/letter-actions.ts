"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Types
export type LetterWithReplies = Awaited<ReturnType<typeof getLettersInternal>>[number];

async function getLettersInternal(linkId: string) {
    return prisma.letter.findMany({
        where: { link_id: linkId },
        include: {
            replies: {
                orderBy: { created_at: "asc" },
            },
        },
        orderBy: { created_at: "desc" },
    });
}

// Get all letters for a link by slug
export async function getLetters(slug: string) {
    try {
        const link = await prisma.link.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!link) {
            return { success: false, error: "Link not found" };
        }

        const letters = await getLettersInternal(link.id);
        return { success: true, data: letters };
    } catch (error) {
        console.error("Error fetching letters:", error);
        return { success: false, error: "Failed to fetch letters" };
    }
}

// Create a new letter
export async function createLetter(
    slug: string,
    data: {
        title: string;
        sender?: string;
        content: string;
        image_url?: string;
        video_url?: string;
        audio_url?: string;
        unlock_date?: Date | null;
    }
) {
    try {
        const link = await prisma.link.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!link) {
            return { success: false, error: "Link not found" };
        }

        // Get max sort order
        const maxSort = await prisma.letter.findFirst({
            where: { link_id: link.id },
            orderBy: { sort_order: "desc" },
            select: { sort_order: true },
        });

        const letter = await prisma.letter.create({
            data: {
                link_id: link.id,
                title: data.title,
                sender: data.sender || null,
                content: data.content,
                image_url: data.image_url,
                video_url: data.video_url,
                audio_url: data.audio_url,
                unlock_date: data.unlock_date || null,
                sort_order: (maxSort?.sort_order || 0) + 1,
            },
            include: { replies: true },
        });

        revalidatePath(`/${slug}`);
        return { success: true, data: letter };
    } catch (error) {
        console.error("Error creating letter:", error);
        return { success: false, error: "Failed to create letter" };
    }
}

// Reply to a letter
export async function replyToLetter(letterId: string, content: string, slug: string) {
    try {
        // Validate content length
        const trimmedContent = content.trim().slice(0, 300);
        if (!trimmedContent) {
            return { success: false, error: "Reply content is required" };
        }

        const reply = await prisma.letterReply.create({
            data: {
                letter_id: letterId,
                content: trimmedContent,
            },
        });

        // Mark letter as read
        await prisma.letter.update({
            where: { id: letterId },
            data: { is_read: true },
        });

        revalidatePath(`/${slug}`);
        return { success: true, data: reply };
    } catch (error) {
        console.error("Error replying to letter:", error);
        return { success: false, error: "Failed to send reply" };
    }
}

// Delete a letter
export async function deleteLetter(letterId: string, slug: string) {
    try {
        await prisma.letter.delete({
            where: { id: letterId },
        });

        revalidatePath(`/${slug}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting letter:", error);
        return { success: false, error: "Failed to delete letter" };
    }
}

// Delete a reply
export async function deleteReply(replyId: string, slug: string) {
    try {
        await prisma.letterReply.delete({
            where: { id: replyId },
        });

        revalidatePath(`/${slug}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting reply:", error);
        return { success: false, error: "Failed to delete reply" };
    }
}
