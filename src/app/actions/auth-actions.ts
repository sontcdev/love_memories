"use server";

import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export async function verifyLinkPassword(slug: string, pin: string) {
    if (!slug || !pin) {
        return { success: false, error: "Slug and PIN are required" };
    }

    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
        return { success: false, error: "PIN must be 6 digits" };
    }

    try {
        // Find link by slug
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
            return { success: false, error: "Link not found" };
        }

        if (!link.is_active) {
            return { success: false, error: "This link is not active" };
        }

        // Verify PIN (stored as plain 6-digit string)
        if (link.user.password_hash !== pin) {
            return { success: false, error: "Invalid PIN" };
        }

        // Set session cookie (expires when browser closes)
        const cookieStore = await cookies();
        cookieStore.set(`session_${slug}`, link.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            // No maxAge = session cookie (expires when browser closes)
        });

        // Set access token cookie for edit page access (same as session)
        cookieStore.set(`access_token_${slug}`, link.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            // No maxAge = session cookie (expires when browser closes)
        });

        return { success: true };
    } catch (error) {
        console.error("Verify link password error:", error);
        return { success: false, error: "An error occurred" };
    }
}

export async function checkLinkAccess(slug: string): Promise<boolean> {
    // Check for session cookie (set after PIN verification)
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(`session_${slug}`)?.value;

    if (!sessionToken) {
        return false;
    }

    // Verify the session is still valid (link exists and matches)
    const link = await prisma.link.findUnique({
        where: { slug },
        select: { id: true, is_active: true },
    });

    return link?.id === sessionToken && link?.is_active === true;
}

// Cached version of getLinkData - prevents duplicate queries during same request
const getCachedLinkData = cache(async (slug: string) => {
    const link = await prisma.link.findUnique({
        where: { slug },
        include: {
            config: true,
            galleries: {
                orderBy: { sort_order: "asc" },
            },
            timelines: {
                orderBy: { date: "asc" },
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
            return { success: false, error: "Link not found" };
        }
        return { success: true, data: link };
    } catch (error) {
        console.error("Get public data error:", error);
        return { success: false, error: "Failed to fetch" };
    }
}

export async function getLinkData(slug: string) {
    try {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get(`session_${slug}`)?.value;

        if (!sessionToken) {
            return { success: false, error: "Unauthorized" };
        }

        const link = await prisma.link.findUnique({
            where: { slug },
            select: { id: true, is_active: true },
        });

        if (!link || link.id !== sessionToken || !link.is_active) {
            return { success: false, error: "Unauthorized" };
        }

        const fullLink = await getCachedLinkData(slug);
        if (!fullLink) {
            return { success: false, error: "Link not found" };
        }

        return { success: true, data: fullLink };
    } catch (error) {
        console.error("Get link data error:", error);
        return { success: false, error: "Failed to fetch link data" };
    }
}

