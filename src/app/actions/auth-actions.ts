"use server";

import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

const COOKIE_EXPIRY_DAYS = 7;

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

        // No cookie storage - require PIN every time
        // User must enter PIN each time they open the page

        return { success: true };
    } catch (error) {
        console.error("Verify link password error:", error);
        return { success: false, error: "An error occurred" };
    }
}

export async function checkLinkAccess(slug: string): Promise<boolean> {
    const cookieStore = await cookies();
    const cookieName = `access_token_${slug}`;
    const accessToken = cookieStore.get(cookieName)?.value;

    if (!accessToken) {
        return false;
    }

    // Verify the token is still valid (link exists and matches)
    const link = await prisma.link.findUnique({
        where: { slug },
        select: { id: true, is_active: true },
    });

    return link?.id === accessToken && link?.is_active === true;
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

export async function getLinkData(slug: string) {
    try {
        const link = await getCachedLinkData(slug);

        if (!link) {
            return { success: false, error: "Link not found" };
        }

        return { success: true, data: link };
    } catch (error) {
        console.error("Get link data error:", error);
        return { success: false, error: "Failed to fetch link data" };
    }
}

