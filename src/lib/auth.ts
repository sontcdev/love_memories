import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export interface AccessResult {
    success: boolean;
    linkId?: string;
    error?: string;
}

export async function verifyAccess(slug: string): Promise<AccessResult> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(`access_token_${slug}`)?.value;

    if (!accessToken) {
        return { success: false, error: "Không có quyền truy cập" };
    }

    const link = await prisma.link.findUnique({
        where: { slug },
        select: { id: true, is_active: true },
    });

    if (!link || link.id !== accessToken) {
        return { success: false, error: "Quyền truy cập không hợp lệ" };
    }

    if (!link.is_active) {
        return { success: false, error: "Liên kết này không hoạt động" };
    }

    return { success: true, linkId: link.id };
}

export async function verifySession(slug: string): Promise<boolean> {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(`session_${slug}`)?.value;

    if (!sessionToken) return false;

    const link = await prisma.link.findUnique({
        where: { slug },
        select: { id: true, is_active: true },
    });

    return link?.id === sessionToken && link?.is_active === true;
}
