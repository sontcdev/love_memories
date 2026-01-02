"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const MAX_TIMELINE_EVENTS = 10;

// ============================================================================
// AUTH HELPER
// ============================================================================

async function verifyAccess(slug: string): Promise<{
    success: boolean;
    linkId?: string;
    error?: string;
}> {
    const cookieStore = await cookies();
    const cookieName = `access_token_${slug}`;
    const accessToken = cookieStore.get(cookieName)?.value;

    if (!accessToken) {
        return { success: false, error: "Not authenticated" };
    }

    const link = await prisma.link.findUnique({
        where: { slug },
        select: { id: true, is_active: true },
    });

    if (!link || link.id !== accessToken) {
        return { success: false, error: "Invalid access" };
    }

    return { success: true, linkId: link.id };
}

// ============================================================================
// GET TIMELINE EVENTS
// ============================================================================

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
        return { success: false, error: "Failed to fetch events", data: [] };
    }
}

// ============================================================================
// UPSERT TIMELINE EVENT (Create or Update)
// ============================================================================

interface TimelineEventData {
    id?: string; // If provided, update; otherwise create
    title: string;
    date: string; // ISO date string
    description?: string;
    image_url?: string;
}

export async function upsertTimelineEvent(slug: string, data: TimelineEventData) {
    try {
        // Validation
        if (!data.title?.trim()) {
            return { success: false, error: "Title is required" };
        }

        if (!data.date) {
            return { success: false, error: "Date is required" };
        }

        const access = await verifyAccess(slug);
        if (!access.success || !access.linkId) {
            return { success: false, error: access.error };
        }

        // If creating new, check limit
        if (!data.id) {
            const currentCount = await prisma.timeline.count({
                where: { link_id: access.linkId },
            });

            if (currentCount >= MAX_TIMELINE_EVENTS) {
                return {
                    success: false,
                    error: `Maximum ${MAX_TIMELINE_EVENTS} events allowed`,
                };
            }
        }

        // Upsert
        if (data.id) {
            // UPDATE existing event
            const existing = await prisma.timeline.findFirst({
                where: { id: data.id, link_id: access.linkId },
            });

            if (!existing) {
                return { success: false, error: "Event not found" };
            }

            const updated = await prisma.timeline.update({
                where: { id: data.id },
                data: {
                    title: data.title.trim(),
                    date: new Date(data.date),
                    description: data.description?.trim() || null,
                    image_url: data.image_url || null,
                },
            });

            revalidatePath(`/${slug}`);
            revalidatePath(`/${slug}/edit`);

            return { success: true, data: updated };
        } else {
            // CREATE new event
            const created = await prisma.timeline.create({
                data: {
                    link_id: access.linkId,
                    title: data.title.trim(),
                    date: new Date(data.date),
                    description: data.description?.trim() || null,
                    image_url: data.image_url || null,
                },
            });

            revalidatePath(`/${slug}`);
            revalidatePath(`/${slug}/edit`);

            return { success: true, data: created };
        }
    } catch (error) {
        console.error("Upsert timeline event error:", error);
        return { success: false, error: "Failed to save event" };
    }
}

// ============================================================================
// DELETE TIMELINE EVENT
// ============================================================================

export async function deleteTimelineEvent(slug: string, eventId: string) {
    try {
        const access = await verifyAccess(slug);
        if (!access.success || !access.linkId) {
            return { success: false, error: access.error };
        }

        // Verify ownership
        const existing = await prisma.timeline.findFirst({
            where: { id: eventId, link_id: access.linkId },
        });

        if (!existing) {
            return { success: false, error: "Event not found" };
        }

        await prisma.timeline.delete({
            where: { id: eventId },
        });

        revalidatePath(`/${slug}`);
        revalidatePath(`/${slug}/edit`);

        return { success: true };
    } catch (error) {
        console.error("Delete timeline event error:", error);
        return { success: false, error: "Failed to delete event" };
    }
}

// ============================================================================
// GET EVENT COUNT (for validation UI)
// ============================================================================

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
