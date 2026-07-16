"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { verifyAccess } from "@/lib/auth";

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

export interface LinkConfigData {
    background_color?: string;
    accent_color?: string;
    text_color?: string;
    font_family?: string;
    music_url?: string;
    auto_play?: boolean;
}

export async function updateLinkProfile(
    slug: string,
    data: ProfileData
): Promise<{ success: boolean; error?: string }> {
    try {
        const access = await verifyAccess(slug);
        if (!access.success) {
            return { success: false, error: access.error };
        }

        const link = await prisma.link.findUnique({
            where: { slug },
            select: { id: true, profile_data: true },
        });

        if (!link) {
            return { success: false, error: "Không tìm thấy liên kết" };
        }

        const currentData = (link.profile_data as Record<string, unknown>) || {};
        const newData = { ...currentData, ...data };

        await prisma.link.update({
            where: { slug },
            data: { profile_data: newData as Prisma.InputJsonValue },
        });

        revalidatePath(`/${slug}`);
        revalidatePath(`/${slug}/edit`);

        return { success: true };
    } catch (error) {
        console.error("Update profile error:", error);
        return { success: false, error: "Không thể cập nhật hồ sơ" };
    }
}

export async function updateLinkConfig(
    slug: string,
    config: LinkConfigData
): Promise<{ success: boolean; error?: string }> {
    try {
        const access = await verifyAccess(slug);
        if (!access.success) {
            return { success: false, error: access.error };
        }

        const link = await prisma.link.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!link) {
            return { success: false, error: "Không tìm thấy liên kết" };
        }

        await prisma.linkConfig.upsert({
            where: { link_id: link.id },
            create: {
                link_id: link.id,
                background_color: config.background_color,
                accent_color: config.accent_color,
                text_color: config.text_color,
                font_family: config.font_family,
                music_url: config.music_url,
                auto_play: config.auto_play ?? false,
            },
            update: {
                background_color: config.background_color,
                accent_color: config.accent_color,
                text_color: config.text_color,
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
        return { success: false, error: "Không thể cập nhật cài đặt" };
    }
}

export async function getLinkForEdit(slug: string) {
    try {
        const access = await verifyAccess(slug);
        if (!access.success) {
            return { success: false, error: access.error };
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
            return { success: false, error: "Không tìm thấy liên kết" };
        }

        return { success: true, data: link };
    } catch (error) {
        console.error("Get link for edit error:", error);
        return { success: false, error: "Không thể tải dữ liệu" };
    }
}
