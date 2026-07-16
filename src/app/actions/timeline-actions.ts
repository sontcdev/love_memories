"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifyAccess } from "@/lib/auth";

const MAX_TIMELINE_EVENTS = 10;

export async function getTimelineEvents(slug: string) {
    try {
        const access = await verifyAccess(slug);
        if (!access.success || !access.linkId) {
            return { success: false, error: access.error, data: [] };
        }

        const events = await prisma.timeline.findMany({
            where: { link_id: access.linkId },
            orderBy: { date: "asc" },
        });

        return { success: true, data: events };
    } catch (error) {
        console.error("Get timeline events error:", error);
        return { success: false, error: "Không thể tải dòng thời gian", data: [] };
    }
}

interface TimelineEventData {
    id?: string;
    title: string;
    date: string;
    description?: string;
    image_url?: string;
    video_url?: string;
    audio_url?: string;
}

export async function upsertTimelineEvent(slug: string, data: TimelineEventData) {
    try {
        if (!data.title?.trim()) {
            return { success: false, error: "Tiêu đề là bắt buộc" };
        }

        if (!data.date) {
            return { success: false, error: "Ngày là bắt buộc" };
        }

        const access = await verifyAccess(slug);
        if (!access.success || !access.linkId) {
            return { success: false, error: access.error };
        }

        if (!data.id) {
            const currentCount = await prisma.timeline.count({
                where: { link_id: access.linkId },
            });

            if (currentCount >= MAX_TIMELINE_EVENTS) {
                return {
                    success: false,
                    error: `Tối đa ${MAX_TIMELINE_EVENTS} sự kiện được phép`,
                };
            }
        }

        if (data.id) {
            const existing = await prisma.timeline.findFirst({
                where: { id: data.id, link_id: access.linkId },
            });

            if (!existing) {
                return { success: false, error: "Không tìm thấy sự kiện" };
            }

            const updated = await prisma.timeline.update({
                where: { id: data.id },
                data: {
                    title: data.title.trim(),
                    date: new Date(data.date),
                    description: data.description?.trim() || null,
                    image_url: data.image_url || null,
                    video_url: data.video_url || null,
                    audio_url: data.audio_url || null,
                },
            });

            revalidatePath(`/${slug}`);
            revalidatePath(`/${slug}/edit`);

            return { success: true, data: updated };
        } else {
            const created = await prisma.timeline.create({
                data: {
                    link_id: access.linkId,
                    title: data.title.trim(),
                    date: new Date(data.date),
                    description: data.description?.trim() || null,
                    image_url: data.image_url || null,
                    video_url: data.video_url || null,
                    audio_url: data.audio_url || null,
                },
            });

            revalidatePath(`/${slug}`);
            revalidatePath(`/${slug}/edit`);

            return { success: true, data: created };
        }
    } catch (error) {
        console.error("Upsert timeline event error:", error);
        return { success: false, error: "Không thể lưu sự kiện" };
    }
}

export async function deleteTimelineEvent(slug: string, eventId: string) {
    try {
        const access = await verifyAccess(slug);
        if (!access.success || !access.linkId) {
            return { success: false, error: access.error };
        }

        const existing = await prisma.timeline.findFirst({
            where: { id: eventId, link_id: access.linkId },
        });

        if (!existing) {
            return { success: false, error: "Không tìm thấy sự kiện" };
        }

        await prisma.timeline.delete({
            where: { id: eventId },
        });

        revalidatePath(`/${slug}`);
        revalidatePath(`/${slug}/edit`);

        return { success: true };
    } catch (error) {
        console.error("Delete timeline event error:", error);
        return { success: false, error: "Không thể xóa sự kiện" };
    }
}

export async function getTimelineEventCount(slug: string) {
    try {
        const access = await verifyAccess(slug);
        if (!access.success || !access.linkId) {
            return { success: false, count: 0 };
        }

        const count = await prisma.timeline.count({
            where: { link_id: access.linkId },
        });

        return { success: true, count, max: MAX_TIMELINE_EVENTS };
    } catch (error) {
        console.error("Get timeline count error:", error);
        return { success: false, count: 0 };
    }
}
