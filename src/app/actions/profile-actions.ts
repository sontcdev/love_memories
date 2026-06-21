"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { revalidateLinkCache } from "./auth-actions";

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

export interface IdolProfileData {
    idol_name?: string;
    fan_name?: string;
    idol_avatar?: string;
    fan_avatar?: string;
    debut_date?: string;
    title?: string;
    slogan?: string;
}

export interface GradPersonalProfileData {
    student_name?: string;
    class_name?: string;
    school_name?: string;
    graduation_year?: string;
    student_avatar?: string;
    slogan?: string;
    dream_job?: string;
    dream_university?: string;
    title?: string;
    quiz?: {
        question: string;
        options: string[];
        correctIndex: number;
    }[];
    goals?: {
        id: string;
        title: string;
        description: string;
        status: "todo" | "done";
    }[];
}

export interface GroupMember {
    id: string;
    name: string;
    nickname?: string;
    avatar?: string;
    quote?: string;
    dream_university?: string;
    dream_job?: string;
    facebook?: string;
    instagram?: string;
}

export interface GradGroupProfileData {
    group_name?: string;
    group_avatar?: string;
    graduation_year?: string;
    slogan?: string;
    title?: string;
    theme?: "caravan" | "scrapbook" | "station";
    members?: GroupMember[];
    quiz?: {
        question: string;
        options: string[];
        correctIndex: number;
    }[];
    quiz_badges?: {
        perfect_title?: string;
        perfect_desc?: string;
        good_title?: string;
        good_desc?: string;
        average_title?: string;
        average_desc?: string;
        low_title?: string;
        low_desc?: string;
    };
    goals?: {
        id: string;
        title: string;
        description: string;
        status: "todo" | "done";
    }[];
}

export interface GradClassProfileData {
    class_name?: string;
    school_name?: string;
    graduation_year?: string;
    slogan?: string;
    members_count?: number;
    homeroom_teacher_name?: string;
    homeroom_teacher_avatar?: string;
    homeroom_teacher_message?: string;
    class_officers_monitor?: string;
    class_officers_vice_monitor?: string;
    title?: string;
}

export type ProfileData = LoveProfileData | IdolProfileData | GradPersonalProfileData | GradClassProfileData | GradGroupProfileData;

// ============================================================================
// CONFIG DATA TYPES
// ============================================================================

export interface LinkConfigData {
    background_color?: string;
    accent_color?: string;
    text_color?: string;
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
            data: { profile_data: newData as Prisma.InputJsonValue },
        });

        revalidatePath(`/${slug}`);
        revalidatePath(`/${slug}/edit`);
        // P-Fix 4: Invalidate public data cache khi profile thay đổi
        await revalidateLinkCache(slug);

        return { success: true };
    } catch (error) {
        console.error("Update profile error:", error);
        return { success: false, error: "Failed to update profile" };
    }
}

// ============================================================================
// UPDATE LINK CONFIG
// ============================================================================

const configSchema = z.object({
    background_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
    accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
    text_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
    font_family: z.string().nullable().optional(),
    music_url: z.string().nullable().optional(),
    auto_play: z.boolean().optional(),
});

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

        // Validate config
        const parsed = configSchema.parse(config);

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
                background_color: parsed.background_color ?? null,
                accent_color: parsed.accent_color ?? null,
                text_color: parsed.text_color ?? null,
                font_family: parsed.font_family ?? null,
                music_url: parsed.music_url ?? null,
                auto_play: parsed.auto_play ?? false,
            },
            update: {
                background_color: parsed.background_color ?? null,
                accent_color: parsed.accent_color ?? null,
                text_color: parsed.text_color ?? null,
                font_family: parsed.font_family ?? null,
                music_url: parsed.music_url ?? null,
                auto_play: parsed.auto_play,
            },
        });

        revalidatePath(`/${slug}`);
        revalidatePath(`/${slug}/edit`);
        // P-Fix 4: Invalidate public data cache khi config thay đổi
        await revalidateLinkCache(slug);

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
