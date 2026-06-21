"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 8;

async function verifyPublicAccess(slug: string): Promise<{ success: boolean; linkId?: string }> {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(`session_${slug}`)?.value;

    if (sessionToken) {
        const link = await prisma.link.findUnique({
            where: { slug },
            select: { id: true },
        });
        if (link?.id === sessionToken) {
            return { success: true, linkId: link.id };
        }
    }

    const link = await prisma.link.findUnique({
        where: { slug },
        select: { id: true, is_active: true },
    });

    if (link?.is_active) {
        return { success: true, linkId: link.id };
    }

    return { success: false };
}

export async function loadMoreGalleries(
    slug: string,
    skip: number,
    take: number = PAGE_SIZE
) {
    try {
        const access = await verifyPublicAccess(slug);
        if (!access.success || !access.linkId) {
            return { success: false, error: "Unauthorized" };
        }

        const [items, total] = await Promise.all([
            prisma.gallery.findMany({
                where: { link_id: access.linkId },
                orderBy: { sort_order: "asc" },
                skip,
                take,
            }),
            prisma.gallery.count({ where: { link_id: access.linkId } }),
        ]);

        return {
            success: true,
            data: items,
            pagination: {
                skip,
                take,
                loaded: skip + items.length,
                total,
                hasMore: skip + items.length < total,
            },
        };
    } catch (error) {
        console.error("Load more galleries error:", error);
        return { success: false, error: "Failed to load galleries" };
    }
}

export async function loadMoreTimelines(
    slug: string,
    skip: number,
    take: number = 6
) {
    try {
        const access = await verifyPublicAccess(slug);
        if (!access.success || !access.linkId) {
            return { success: false, error: "Unauthorized" };
        }

        const [items, total] = await Promise.all([
            prisma.timeline.findMany({
                where: { link_id: access.linkId },
                orderBy: { date: "asc" },
                skip,
                take,
            }),
            prisma.timeline.count({ where: { link_id: access.linkId } }),
        ]);

        return {
            success: true,
            data: items,
            pagination: {
                skip,
                take,
                loaded: skip + items.length,
                total,
                hasMore: skip + items.length < total,
            },
        };
    } catch (error) {
        console.error("Load more timelines error:", error);
        return { success: false, error: "Failed to load timelines" };
    }
}