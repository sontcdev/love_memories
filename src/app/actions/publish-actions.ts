"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { verifyAccess } from "@/lib/auth";

/**
 * Publish state and edit history for a page owner.
 *
 * `is_published` is deliberately separate from `is_active`:
 * - `is_active`   — the admin's kill switch (billing, abuse).
 * - `is_published` — the owner's intentional "go live".
 * Both default to true, so existing links behave exactly as before.
 */

const MAX_REVISIONS = 20;

export async function setPublishState(slug: string, published: boolean) {
    const access = await verifyAccess(slug);
    if (!access.success || !access.linkId) {
        return { success: false as const, error: access.error || "Không có quyền truy cập" };
    }

    try {
        const link = await prisma.link.update({
            where: { id: access.linkId },
            data: {
                is_published: published,
                // Stamp the first publish only; re-publishing keeps the original date.
                ...(published ? { published_at: new Date() } : {}),
            },
            select: { is_published: true, published_at: true },
        });

        // The public route is cached; without this the page would keep serving
        // the old state after publishing.
        revalidatePath(`/${slug}`);
        revalidatePath(`/${slug}/edit`);

        return { success: true as const, data: link };
    } catch (error) {
        console.error("setPublishState failed", error);
        return { success: false as const, error: "Không thể cập nhật trạng thái đăng" };
    }
}

/**
 * Snapshots the link's current `profile_data` so the owner can roll back.
 *
 * Trimmed to the newest MAX_REVISIONS to keep the table bounded — this is a
 * convenience history, not an audit log.
 */
export async function createRevision(slug: string, label?: string) {
    const access = await verifyAccess(slug);
    if (!access.success || !access.linkId) {
        return { success: false as const, error: access.error || "Không có quyền truy cập" };
    }

    try {
        const link = await prisma.link.findUnique({
            where: { id: access.linkId },
            select: { profile_data: true },
        });

        const revision = await prisma.linkRevision.create({
            data: {
                link_id: access.linkId,
                profile_data: (link?.profile_data ?? Prisma.JsonNull) as Prisma.InputJsonValue,
                label: label ?? "Tự động lưu",
            },
            select: { id: true, created_at: true, label: true },
        });

        const stale = await prisma.linkRevision.findMany({
            where: { link_id: access.linkId },
            orderBy: { created_at: "desc" },
            skip: MAX_REVISIONS,
            select: { id: true },
        });
        if (stale.length > 0) {
            await prisma.linkRevision.deleteMany({
                where: { id: { in: stale.map((r) => r.id) } },
            });
        }

        return { success: true as const, data: revision };
    } catch (error) {
        console.error("createRevision failed", error);
        return { success: false as const, error: "Không thể tạo bản lưu" };
    }
}

export async function listRevisions(slug: string) {
    const access = await verifyAccess(slug);
    if (!access.success || !access.linkId) {
        return { success: false as const, error: access.error || "Không có quyền truy cập" };
    }

    try {
        const revisions = await prisma.linkRevision.findMany({
            where: { link_id: access.linkId },
            orderBy: { created_at: "desc" },
            take: MAX_REVISIONS,
            select: { id: true, label: true, created_at: true },
        });
        return { success: true as const, data: revisions };
    } catch (error) {
        console.error("listRevisions failed", error);
        return { success: false as const, error: "Không thể tải lịch sử" };
    }
}

export async function restoreRevision(slug: string, revisionId: string) {
    const access = await verifyAccess(slug);
    if (!access.success || !access.linkId) {
        return { success: false as const, error: access.error || "Không có quyền truy cập" };
    }

    try {
        const revision = await prisma.linkRevision.findFirst({
            // Scoped by link_id as well as id, so one owner cannot restore
            // another link's revision by guessing an id.
            where: { id: revisionId, link_id: access.linkId },
            select: { profile_data: true },
        });

        if (!revision) {
            return { success: false as const, error: "Không tìm thấy bản lưu" };
        }

        // Snapshot what we are about to overwrite, so restoring is itself undoable.
        await createRevision(slug, "Trước khi hoàn tác");

        await prisma.link.update({
            where: { id: access.linkId },
            data: { profile_data: (revision.profile_data ?? Prisma.JsonNull) as Prisma.InputJsonValue },
        });

        revalidatePath(`/${slug}`);
        revalidatePath(`/${slug}/edit`);

        return { success: true as const };
    } catch (error) {
        console.error("restoreRevision failed", error);
        return { success: false as const, error: "Không thể hoàn tác" };
    }
}
