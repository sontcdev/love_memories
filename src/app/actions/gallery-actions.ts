"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Verify user has access to this link
async function verifyAccess(slug: string): Promise<{ success: boolean; linkId?: string; error?: string }> {
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

// ============== GALLERY ACTIONS ==============

export async function addGalleryImage(slug: string, imageUrl: string, caption?: string) {
    try {
        const access = await verifyAccess(slug);
        if (!access.success || !access.linkId) {
            return { success: false, error: access.error };
        }

        // Get max sort order
        const maxOrder = await prisma.gallery.aggregate({
            where: { link_id: access.linkId },
            _max: { sort_order: true },
        });

        const newImage = await prisma.gallery.create({
            data: {
                link_id: access.linkId,
                image_url: imageUrl,
                caption: caption || null,
                sort_order: (maxOrder._max.sort_order || 0) + 1,
            },
        });

        revalidatePath(`/${slug}`);
        revalidatePath(`/${slug}/edit`);

        return { success: true, data: newImage };
    } catch (error) {
        console.error("Add gallery image error:", error);
        return { success: false, error: "Failed to add image" };
    }
}

export async function updateGalleryImage(slug: string, imageId: string, caption: string) {
    try {
        const access = await verifyAccess(slug);
        if (!access.success || !access.linkId) {
            return { success: false, error: access.error };
        }

        const updated = await prisma.gallery.update({
            where: { id: imageId, link_id: access.linkId },
            data: { caption },
        });

        revalidatePath(`/${slug}`);
        revalidatePath(`/${slug}/edit`);

        return { success: true, data: updated };
    } catch (error) {
        console.error("Update gallery image error:", error);
        return { success: false, error: "Failed to update image" };
    }
}

export async function deleteGalleryImage(slug: string, imageId: string) {
    try {
        const access = await verifyAccess(slug);
        if (!access.success || !access.linkId) {
            return { success: false, error: access.error };
        }

        await prisma.gallery.delete({
            where: { id: imageId, link_id: access.linkId },
        });

        revalidatePath(`/${slug}`);
        revalidatePath(`/${slug}/edit`);

        return { success: true };
    } catch (error) {
        console.error("Delete gallery image error:", error);
        return { success: false, error: "Failed to delete image" };
    }
}

export async function reorderGalleryImages(slug: string, imageIds: string[]) {
    try {
        const access = await verifyAccess(slug);
        if (!access.success || !access.linkId) {
            return { success: false, error: access.error };
        }

        // Update sort order for each image
        await Promise.all(
            imageIds.map((id, index) =>
                prisma.gallery.update({
                    where: { id, link_id: access.linkId },
                    data: { sort_order: index + 1 },
                })
            )
        );

        revalidatePath(`/${slug}`);
        revalidatePath(`/${slug}/edit`);

        return { success: true };
    } catch (error) {
        console.error("Reorder gallery images error:", error);
        return { success: false, error: "Failed to reorder images" };
    }
}

// ============== TIMELINE ACTIONS ==============

export async function addTimelineEvent(
    slug: string,
    data: { title: string; date: string; description?: string; image_url?: string }
) {
    try {
        const access = await verifyAccess(slug);
        if (!access.success || !access.linkId) {
            return { success: false, error: access.error };
        }

        const newEvent = await prisma.timeline.create({
            data: {
                link_id: access.linkId,
                title: data.title,
                date: new Date(data.date),
                description: data.description || null,
                image_url: data.image_url || null,
            },
        });

        revalidatePath(`/${slug}`);
        revalidatePath(`/${slug}/edit`);

        return { success: true, data: newEvent };
    } catch (error) {
        console.error("Add timeline event error:", error);
        return { success: false, error: "Failed to add event" };
    }
}

export async function updateTimelineEvent(
    slug: string,
    eventId: string,
    data: { title?: string; date?: string; description?: string; image_url?: string }
) {
    try {
        const access = await verifyAccess(slug);
        if (!access.success || !access.linkId) {
            return { success: false, error: access.error };
        }

        const updated = await prisma.timeline.update({
            where: { id: eventId, link_id: access.linkId },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.date && { date: new Date(data.date) }),
                ...(data.description !== undefined && { description: data.description || null }),
                ...(data.image_url !== undefined && { image_url: data.image_url || null }),
            },
        });

        revalidatePath(`/${slug}`);
        revalidatePath(`/${slug}/edit`);

        return { success: true, data: updated };
    } catch (error) {
        console.error("Update timeline event error:", error);
        return { success: false, error: "Failed to update event" };
    }
}

export async function deleteTimelineEvent(slug: string, eventId: string) {
    try {
        const access = await verifyAccess(slug);
        if (!access.success || !access.linkId) {
            return { success: false, error: access.error };
        }

        await prisma.timeline.delete({
            where: { id: eventId, link_id: access.linkId },
        });

        revalidatePath(`/${slug}`);
        revalidatePath(`/${slug}/edit`);

        return { success: true };
    } catch (error) {
        console.error("Delete timeline event error:", error);
        return { success: false, error: "Failed to delete event" };
    }
}
