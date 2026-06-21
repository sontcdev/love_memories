"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { generateSlug, generatePin } from "@/lib/utils";
import { LinkType } from "@prisma/client";
import { revalidateLinkCache } from "./auth-actions";

// ============================================================================
// ADMIN AUTHENTICATION
// ============================================================================

export async function loginAdmin(formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
        return { success: false, error: "Username and password are required" };
    }

    try {
        const admin = await prisma.admin.findUnique({
            where: { username },
        });

        if (!admin) {
            return { success: false, error: "Invalid credentials" };
        }

        const isValidPassword = await bcrypt.compare(password, admin.password_hash);

        if (!isValidPassword) {
            return { success: false, error: "Invalid credentials" };
        }

        // Set session cookie
        const cookieStore = await cookies();
        cookieStore.set("admin_session", admin.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return { success: true };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: "An error occurred during login" };
    }
}

export async function logoutAdmin() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    return { success: true };
}

export async function getAdminSession() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("admin_session")?.value;

    if (!sessionId) {
        return null;
    }

    const admin = await prisma.admin.findUnique({
        where: { id: sessionId },
        select: { id: true, username: true },
    });

    return admin;
}

// ============================================================================
// LINK MANAGEMENT
// ============================================================================

export async function getLinks() {
    try {
        const links = await prisma.link.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
            orderBy: {
                created_at: "desc",
            },
        });

        return { success: true, data: links };
    } catch (error) {
        console.error("Get links error:", error);
        return { success: false, error: "Failed to fetch links" };
    }
}

export async function createLink(formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const linkType = formData.get("linkType") as LinkType;

    if (!username) {
        return { success: false, error: "Username is required" };
    }

    try {
        // Check if username already exists
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return { success: false, error: "Username already exists" };
        }

        // Generate password if not provided
        const finalPassword = password || generatePin();

        // Generate unique slug
        let slug = generateSlug();
        let slugExists = await prisma.link.findUnique({ where: { slug } });
        while (slugExists) {
            slug = generateSlug();
            slugExists = await prisma.link.findUnique({ where: { slug } });
        }

        // Create user and link in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    username,
                    password_hash: finalPassword, // 6-digit PIN stored as-is
                },
            });

            // Create link
            const link = await tx.link.create({
                data: {
                    user_id: user.id,
                    slug,
                    type: linkType || "LOVE",
                    is_active: true,
                },
            });

            // Create default config
            await tx.linkConfig.create({
                data: {
                    link_id: link.id,
                },
            });

            return { user, link, password: finalPassword };
        });

        return {
            success: true,
            data: {
                userId: result.user.id,
                username: result.user.username,
                linkId: result.link.id,
                slug: result.link.slug,
                password: result.password,
            },
        };
    } catch (error) {
        console.error("Create link error:", error);
        return { success: false, error: "Failed to create link" };
    }
}

export async function deleteLink(linkId: string) {
    try {
        const link = await prisma.link.findUnique({
            where: { id: linkId },
            select: { user_id: true, slug: true },
        });

        if (!link) {
            return { success: false, error: "Link not found" };
        }

        // Delete user (cascades to link and all related data)
        await prisma.user.delete({
            where: { id: link.user_id },
        });

        // P-Fix 4: Invalidate public data cache
        await revalidateLinkCache(link.slug);

        return { success: true };
    } catch (error) {
        console.error("Delete link error:", error);
        return { success: false, error: "Failed to delete link" };
    }
}

export async function toggleLinkStatus(linkId: string) {
    try {
        const link = await prisma.link.findUnique({
            where: { id: linkId },
        });

        if (!link) {
            return { success: false, error: "Link not found" };
        }

        const updatedLink = await prisma.link.update({
            where: { id: linkId },
            data: { is_active: !link.is_active },
        });

        // P-Fix 4: Invalidate public data cache khi link thay đổi
        await revalidateLinkCache(updatedLink.slug);

        return { success: true, data: updatedLink };
    } catch (error) {
        console.error("Toggle link status error:", error);
        return { success: false, error: "Failed to toggle link status" };
    }
}

export async function resetLinkPin(linkId: string, customPin?: string) {
    try {
        const link = await prisma.link.findUnique({
            where: { id: linkId },
            include: {
                user: {
                    select: { id: true, username: true },
                },
            },
        });

        if (!link) {
            return { success: false, error: "Link not found" };
        }

        // Use custom PIN if provided, otherwise generate new one
        const newPin = customPin || generatePin();

        // Validate PIN format (6 digits)
        if (!/^\d{6}$/.test(newPin)) {
            return { success: false, error: "PIN must be exactly 6 digits" };
        }

        // Update user's password
        await prisma.user.update({
            where: { id: link.user_id },
            data: { password_hash: newPin },
        });

        // P-Fix 4: Invalidate public data cache
        await revalidateLinkCache(link.slug);

        return {
            success: true,
            data: {
                username: link.user.username,
                newPin,
            },
        };
    } catch (error) {
        console.error("Reset link PIN error:", error);
        return { success: false, error: "Failed to reset PIN" };
    }
}

// ============================================================================
// ADMIN SETUP (One-time use)
// ============================================================================

export async function createInitialAdmin(username: string, password: string) {
    try {
        const existingAdmin = await prisma.admin.findFirst();

        if (existingAdmin) {
            return { success: false, error: "Admin already exists" };
        }

        const password_hash = await bcrypt.hash(password, 10);

        const admin = await prisma.admin.create({
            data: {
                username,
                password_hash,
            },
        });

        return { success: true, data: { id: admin.id, username: admin.username } };
    } catch (error) {
        console.error("Create admin error:", error);
        return { success: false, error: "Failed to create admin" };
    }
}
