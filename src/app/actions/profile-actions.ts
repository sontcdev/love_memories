"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ============================================================================
// PROFILE DATA TYPES
// ============================================================================

export interface LoveProfileData {
    boy_name?: string;
    girl_name?: string;
    boy_avatar?: string;
    girl_avatar?: string;
    anniversary_date?: string;
    title?: string;
    short_note?: string;
}

export type ProfileData = LoveProfileData;

// ============================================================================
// CONFIG DATA TYPES
// ============================================================================

export interface LinkConfigData {
    background_color?: string;
    accent_color?: string;
    font_family?: string;
    music_url?: string;
    auto_play?: boolean;
}

// ============================================================================
// AUTH HELPER
// ============================================================================

async function verifyAccess(slug: string): Promise<boolean> {
    const cookieStore = await cookies();
    const cookieName = `access_token_${slug}`;
    const accessToken = cookieStore.get(cookieName)?.value;

    if (!accessToken) return false;

    const link = await prisma.link.findUnique({
        where: { slug },
        select: { id: true, is_active: true },
    });

    return link?.id === accessToken && link?.is_active === true;
}

// ============================================================================
// UPDATE PROFILE DATA
// ============================================================================

export async function updateLinkProfile(
    slug: string,
    data: ProfileData
): Promise<{ success: boolean; error?: string }> {
    try {
        // Verify access
        const hasAccess = await verifyAccess(slug);
        if (!hasAccess) {
            return { success: false, error: "Unauthorized" };
        }

        // Get current link
        const link = await prisma.link.findUnique({
            where: { slug },
            select: { id: true, profile_data: true },
        });

        if (!link) {
            return { success: false, error: "Link not found" };
        }

        // Merge with existing data
        const currentData = (link.profile_data as Record<string, unknown>) || {};
        const newData = { ...currentData, ...data };

        // Update
        await prisma.link.update({
            where: { slug },
            data: { profile_data: newData },
        });

        revalidatePath(`/${slug}`);
        revalidatePath(`/${slug}/edit`);

        return { success: true };
    } catch (error) {
        console.error("Update profile error:", error);
        return { success: false, error: "Failed to update profile" };
    }
}

// ============================================================================
// UPDATE LINK CONFIG
// ============================================================================

export async function updateLinkConfig(
    slug: string,
    config: LinkConfigData
): Promise<{ success: boolean; error?: string }> {
    try {
        // Verify access
        const hasAccess = await verifyAccess(slug);
        if (!hasAccess) {
            return { success: false, error: "Unauthorized" };
        }

        // Get link
        const link = await prisma.link.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!link) {
            return { success: false, error: "Link not found" };
        }

        // Upsert config
        await prisma.linkConfig.upsert({
            where: { link_id: link.id },
            create: {
                link_id: link.id,
                background_color: config.background_color,
                accent_color: config.accent_color,
                font_family: config.font_family,
                music_url: config.music_url,
                auto_play: config.auto_play ?? false,
            },
            update: {
                background_color: config.background_color,
                accent_color: config.accent_color,
                font_family: config.font_family,
                music_url: config.music_url,
                auto_play: config.auto_play,
            },
        });

        revalidatePath(`/${slug}`);
        revalidatePath(`/${slug}/edit`);

        return { success: true };
    } catch (error) {
        console.error("Update config error:", error);
        return { success: false, error: "Failed to update config" };
    }
}

// ============================================================================
// GET LINK FOR EDIT
// ============================================================================

export async function getLinkForEdit(slug: string) {
    try {
        // Verify access
        const hasAccess = await verifyAccess(slug);
        if (!hasAccess) {
            return { success: false, error: "Unauthorized" };
        }

        const link = await prisma.link.findUnique({
            where: { slug },
            include: {
                config: true,
                galleries: { orderBy: { sort_order: "asc" } },
                timelines: { orderBy: { date: "asc" } },
                letters: { orderBy: { sort_order: "asc" } },
            },
        });

        if (!link) {
            return { success: false, error: "Link not found" };
        }

        return { success: true, data: link };
    } catch (error) {
        console.error("Get link for edit error:", error);
        return { success: false, error: "Failed to fetch link" };
    }
}
