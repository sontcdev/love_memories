"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { generateSlug, generatePin, generateSessionToken } from "@/lib/utils";
import { LinkType } from "@prisma/client";

export async function loginAdmin(formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
        return { success: false, error: "Tên đăng nhập và mật khẩu là bắt buộc" };
    }

    try {
        const admin = await prisma.admin.findUnique({
            where: { username },
        });

        if (!admin) {
            return { success: false, error: "Thông tin đăng nhập không đúng" };
        }

        const isValidPassword = await bcrypt.compare(password, admin.password_hash);

        if (!isValidPassword) {
            return { success: false, error: "Thông tin đăng nhập không đúng" };
        }

        const sessionToken = generateSessionToken();
        
        await prisma.admin.update({
            where: { id: admin.id },
            data: { session_token: sessionToken },
        });
        
        const cookieStore = await cookies();
        cookieStore.set("admin_session", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return { success: true };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: "Đã xảy ra lỗi khi đăng nhập" };
    }
}

export async function logoutAdmin() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session")?.value;
    
    if (sessionToken) {
        await prisma.admin.updateMany({
            where: { session_token: sessionToken },
            data: { session_token: null },
        });
    }
    
    cookieStore.delete("admin_session");
    return { success: true };
}

export async function getAdminSession() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session")?.value;

    if (!sessionToken) {
        return null;
    }

    const admin = await prisma.admin.findUnique({
        where: { session_token: sessionToken },
        select: { id: true, username: true },
    });

    return admin;
}

export async function getLinks(page: number = 1, pageSize: number = 50) {
    try {
        const skip = (page - 1) * pageSize;

        const [links, total] = await Promise.all([
            prisma.link.findMany({
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
                skip,
                take: pageSize,
            }),
            prisma.link.count(),
        ]);

        return {
            success: true,
            data: links,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    } catch (error) {
        console.error("Get links error:", error);
        return { success: false, error: "Không thể tải danh sách liên kết" };
    }
}

export async function createLink(formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const linkType = formData.get("linkType") as LinkType;

    if (!username) {
        return { success: false, error: "Tên người dùng là bắt buộc" };
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return { success: false, error: "Tên người dùng đã tồn tại" };
        }

        const finalPassword = password || generatePin();

        const password_hash = await bcrypt.hash(finalPassword, 10);

        let slug = generateSlug();
        let slugExists = await prisma.link.findUnique({ where: { slug } });
        while (slugExists) {
            slug = generateSlug();
            slugExists = await prisma.link.findUnique({ where: { slug } });
        }

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    username,
                    password_hash,
                },
            });

            const link = await tx.link.create({
                data: {
                    user_id: user.id,
                    slug,
                    type: linkType || "LOVE",
                    is_active: true,
                },
            });

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
        return { success: false, error: "Không thể tạo liên kết" };
    }
}

export async function deleteLink(linkId: string) {
    try {
        const link = await prisma.link.findUnique({
            where: { id: linkId },
            select: { user_id: true },
        });

        if (!link) {
            return { success: false, error: "Không tìm thấy liên kết" };
        }

        await prisma.user.delete({
            where: { id: link.user_id },
        });

        return { success: true };
    } catch (error) {
        console.error("Delete link error:", error);
        return { success: false, error: "Không thể xóa liên kết" };
    }
}

export async function toggleLinkStatus(linkId: string) {
    try {
        const link = await prisma.link.findUnique({
            where: { id: linkId },
        });

        if (!link) {
            return { success: false, error: "Không tìm thấy liên kết" };
        }

        const updatedLink = await prisma.link.update({
            where: { id: linkId },
            data: { is_active: !link.is_active },
        });

        return { success: true, data: updatedLink };
    } catch (error) {
        console.error("Toggle link status error:", error);
        return { success: false, error: "Không thể thay đổi trạng thái" };
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
            return { success: false, error: "Không tìm thấy liên kết" };
        }

        const newPin = customPin || generatePin();

        if (!/^\d{6}$/.test(newPin)) {
            return { success: false, error: "Mã PIN phải có đúng 6 chữ số" };
        }

        const password_hash = await bcrypt.hash(newPin, 10);

        await prisma.user.update({
            where: { id: link.user_id },
            data: { password_hash },
        });

        return {
            success: true,
            data: {
                username: link.user.username,
                newPin,
            },
        };
    } catch (error) {
        console.error("Reset link PIN error:", error);
        return { success: false, error: "Không thể đặt lại mã PIN" };
    }
}

export async function createInitialAdmin(username: string, password: string) {
    try {
        const existingAdmin = await prisma.admin.findFirst();

        if (existingAdmin) {
            return { success: false, error: "Quản trị viên đã tồn tại" };
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
        return { success: false, error: "Không thể tạo quản trị viên" };
    }
}
