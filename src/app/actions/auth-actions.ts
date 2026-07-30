"use server";

import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createLinkAccessToken, isValidLinkAccessToken } from "@/lib/auth";

export async function verifyLinkPassword(slug: string, pin: string) {
    if (!slug || !pin) {
        return { success: false, error: "Slug và mã PIN là bắt buộc" };
    }

    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
        return { success: false, error: "Mã PIN phải có 6 chữ số" };
    }

    try {
        const link = await prisma.link.findUnique({
            where: { slug },
            include: {
                user: {
                    select: {
                        password_hash: true,
                    },
                },
            },
        });

        if (!link) {
            return { success: false, error: "Không tìm thấy liên kết" };
        }

        if (!link.is_active) {
            return { success: false, error: "Liên kết này không hoạt động" };
        }

        const isValid = await bcrypt.compare(pin, link.user.password_hash);
        if (!isValid) {
            return { success: false, error: "Mã PIN không đúng" };
        }

        const sessionToken = createLinkAccessToken(slug, link.id);
        const accessToken = sessionToken;

        const cookieStore = await cookies();
        cookieStore.set(`session_${slug}`, sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        cookieStore.set(`access_token_${slug}`, accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        return { success: true };
    } catch (error) {
        console.error("Verify link password error:", error);
        return { success: false, error: "Đã xảy ra lỗi" };
    }
}

export async function checkLinkAccess(slug: string): Promise<boolean> {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(`session_${slug}`)?.value;

    if (!sessionToken) {
        return false;
    }

    const link = await prisma.link.findUnique({
        where: { slug },
        select: { id: true, is_active: true },
    });

    return !!link && isValidLinkAccessToken(sessionToken, slug, link.id) && link.is_active === true;
}

const getCachedLinkData = cache(async (slug: string) => {
    const link = await prisma.link.findUnique({
        where: { slug },
        include: {
            config: true,
            galleries: {
                orderBy: { sort_order: "asc" },
            },
            timelines: {
                // sort_order is the source of truth so a manual drag in the edit
                // page is reflected publicly; date is the tie-breaker. Existing
                // rows all have sort_order = 0 (column default), so this
                // reproduces the previous date-only ordering until the first drag.
                orderBy: [{ sort_order: "asc" }, { date: "asc" }],
            },
            letters: {
                orderBy: { sort_order: "asc" },
                include: {
                    replies: {
                        orderBy: { created_at: "asc" },
                    },
                },
            },
        },
    });
    return link;
});

const getCachedPublicData = cache(async (slug: string) => {
    const link = await prisma.link.findUnique({
        where: { slug },
        select: {
            id: true,
            slug: true,
            type: true,
            is_active: true,
            profile_data: true,
            config: true,
        },
    });
    return link;
});

export async function getLinkPublicData(slug: string) {
    try {
        const link = await getCachedPublicData(slug);
        if (!link) {
            return { success: false, error: "Không tìm thấy liên kết" };
        }
        return { success: true, data: link };
    } catch (error) {
        console.error("Get public data error:", error);
        return { success: false, error: "Không thể tải dữ liệu" };
    }
}

export async function getLinkData(slug: string) {
    try {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get(`session_${slug}`)?.value;

        if (!sessionToken) {
            return { success: false, error: "Chưa xác thực" };
        }

        const link = await prisma.link.findUnique({
            where: { slug },
            select: { id: true, is_active: true },
        });

        if (!link || !isValidLinkAccessToken(sessionToken, slug, link.id) || !link.is_active) {
            return { success: false, error: "Chưa xác thực" };
        }

        const fullLink = await getCachedLinkData(slug);
        if (!fullLink) {
            return { success: false, error: "Không tìm thấy liên kết" };
        }

        return { success: true, data: fullLink };
    } catch (error) {
        console.error("Get link data error:", error);
        return { success: false, error: "Không thể tải dữ liệu" };
    }
}
