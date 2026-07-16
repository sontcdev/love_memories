"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifyAccess } from "@/lib/auth";

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

export async function getLetters(slug: string) {
    try {
        const access = await verifyAccess(slug);
        if (!access.success || !access.linkId) {
            return { success: false, error: access.error };
        }

        const letters = await getLettersInternal(access.linkId);
        return { success: true, data: letters };
    } catch (error) {
        console.error("Error fetching letters:", error);
        return { success: false, error: "Không thể tải danh sách thư" };
    }
}

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
        const access = await verifyAccess(slug);
        if (!access.success || !access.linkId) {
            return { success: false, error: access.error };
        }

        const maxSort = await prisma.letter.findFirst({
            where: { link_id: access.linkId },
            orderBy: { sort_order: "desc" },
            select: { sort_order: true },
        });

        const letter = await prisma.letter.create({
            data: {
                link_id: access.linkId,
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
        return { success: false, error: "Không thể tạo thư" };
    }
}

export async function replyToLetter(letterId: string, content: string, slug: string) {
    try {
        const access = await verifyAccess(slug);
        if (!access.success || !access.linkId) {
            return { success: false, error: access.error };
        }

        const letter = await prisma.letter.findFirst({
            where: { id: letterId, link_id: access.linkId },
        });

        if (!letter) {
            return { success: false, error: "Không tìm thấy thư" };
        }

        const trimmedContent = content.trim().slice(0, 300);
        if (!trimmedContent) {
            return { success: false, error: "Nội dung phản hồi là bắt buộc" };
        }

        const reply = await prisma.letterReply.create({
            data: {
                letter_id: letterId,
                content: trimmedContent,
            },
        });

        await prisma.letter.update({
            where: { id: letterId },
            data: { is_read: true },
        });

        revalidatePath(`/${slug}`);
        return { success: true, data: reply };
    } catch (error) {
        console.error("Error replying to letter:", error);
        return { success: false, error: "Không thể gửi phản hồi" };
    }
}

export async function deleteLetter(letterId: string, slug: string) {
    try {
        const access = await verifyAccess(slug);
        if (!access.success || !access.linkId) {
            return { success: false, error: access.error };
        }

        const letter = await prisma.letter.findFirst({
            where: { id: letterId, link_id: access.linkId },
        });

        if (!letter) {
            return { success: false, error: "Không tìm thấy thư" };
        }

        await prisma.letter.delete({
            where: { id: letterId },
        });

        revalidatePath(`/${slug}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting letter:", error);
        return { success: false, error: "Không thể xóa thư" };
    }
}

export async function deleteReply(replyId: string, slug: string) {
    try {
        const access = await verifyAccess(slug);
        if (!access.success || !access.linkId) {
            return { success: false, error: access.error };
        }

        const reply = await prisma.letterReply.findFirst({
            where: {
                id: replyId,
                letter: { link_id: access.linkId },
            },
        });

        if (!reply) {
            return { success: false, error: "Không tìm thấy phản hồi" };
        }

        await prisma.letterReply.delete({
            where: { id: replyId },
        });

        revalidatePath(`/${slug}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting reply:", error);
        return { success: false, error: "Không thể xóa phản hồi" };
    }
}
