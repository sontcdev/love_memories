import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export interface AccessResult {
    success: boolean;
    linkId?: string;
    error?: string;
}

function getAccessSecret(): string {
    return process.env.AUTH_SECRET
        || process.env.NEXTAUTH_SECRET
        || process.env.ADMIN_SECRET
        || process.env.DATABASE_URL
        || "love_memories_dev_secret";
}

function signLinkAccess(slug: string, linkId: string): string {
    return crypto
        .createHmac("sha256", getAccessSecret())
        .update(`${slug}:${linkId}`)
        .digest("hex");
}

export function createLinkAccessToken(slug: string, linkId: string): string {
    return `${linkId}.${signLinkAccess(slug, linkId)}`;
}

export function isValidLinkAccessToken(token: string | undefined, slug: string, linkId: string): boolean {
    if (!token) return false;

    const [tokenLinkId, signature] = token.split(".");
    if (tokenLinkId !== linkId || !signature) return false;

    const expectedSignature = signLinkAccess(slug, linkId);
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    return signatureBuffer.length === expectedBuffer.length
        && crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}

export async function verifyAccess(slug: string): Promise<AccessResult> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(`access_token_${slug}`)?.value;
    const sessionToken = cookieStore.get(`session_${slug}`)?.value;

    if (!accessToken && !sessionToken) {
        return { success: false, error: "Không có quyền truy cập" };
    }

    const link = await prisma.link.findUnique({
        where: { slug },
        select: { id: true, is_active: true },
    });

    if (!link || (!isValidLinkAccessToken(accessToken, slug, link.id) && !isValidLinkAccessToken(sessionToken, slug, link.id))) {
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

    return !!link && isValidLinkAccessToken(sessionToken, slug, link.id) && link.is_active === true;
}
