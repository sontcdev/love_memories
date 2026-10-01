"use server";

import { prisma } from "@/lib/prisma";
import { Prisma, LinkType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getAdminSession } from "./admin-actions";
import { generatePin, generateSlug } from "@/lib/tokens";

/**
 * Admin-side link management: favourites, tags, duplication and JSON
 * import/export (UX_ROADMAP Giai đoạn 5).
 *
 * Every function re-checks the admin session itself. Server actions are
 * individually addressable HTTP endpoints, so relying on the calling page's
 * guard would leave them open.
 */

async function requireAdmin() {
    const session = await getAdminSession();
    if (!session) return null;
    return session;
}

export async function toggleFavorite(linkId: string) {
    if (!(await requireAdmin())) {
        return { success: false as const, error: "Chưa đăng nhập" };
    }

    try {
        const current = await prisma.link.findUnique({
            where: { id: linkId },
            select: { is_favorite: true },
        });
        if (!current) return { success: false as const, error: "Không tìm thấy liên kết" };

        const link = await prisma.link.update({
            where: { id: linkId },
            data: { is_favorite: !current.is_favorite },
            select: { id: true, is_favorite: true },
        });

        revalidatePath("/admin/links");
        return { success: true as const, data: link };
    } catch (error) {
        console.error("toggleFavorite failed", error);
        return { success: false as const, error: "Không thể cập nhật yêu thích" };
    }
}

export async function setTags(linkId: string, tags: string[]) {
    if (!(await requireAdmin())) {
        return { success: false as const, error: "Chưa đăng nhập" };
    }

    // Normalise: trim, drop empties, de-duplicate case-insensitively, cap length.
    const seen = new Set<string>();
    const cleaned: string[] = [];
    for (const raw of tags) {
        const tag = raw.trim().slice(0, 30);
        if (!tag) continue;
        const key = tag.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        cleaned.push(tag);
        if (cleaned.length >= 10) break;
    }

    try {
        const link = await prisma.link.update({
            where: { id: linkId },
            data: { tags: cleaned },
            select: { id: true, tags: true },
        });

        revalidatePath("/admin/links");
        return { success: true as const, data: link };
    } catch (error) {
        console.error("setTags failed", error);
        return { success: false as const, error: "Không thể cập nhật nhãn" };
    }
}

/**
 * Clones a link's content into a brand new link + user.
 *
 * A new User is required because `Link.user_id` is `@unique` — one link per
 * user — so a copy cannot share the original's owner.
 */
export async function duplicateLink(linkId: string) {
    if (!(await requireAdmin())) {
        return { success: false as const, error: "Chưa đăng nhập" };
    }

    try {
        const source = await prisma.link.findUnique({
            where: { id: linkId },
            include: {
                user: { select: { username: true } },
                config: true,
                galleries: true,
                timelines: true,
            },
        });

        if (!source) return { success: false as const, error: "Không tìm thấy liên kết" };

        let username = `${source.user.username}-copy`;
        let suffix = 1;
        while (await prisma.user.findUnique({ where: { username } })) {
            suffix += 1;
            username = `${source.user.username}-copy${suffix}`;
        }

        let slug = generateSlug();
        while (await prisma.link.findUnique({ where: { slug } })) {
            slug = generateSlug();
        }

        const pin = generatePin();
        const password_hash = await bcrypt.hash(pin, 10);

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({ data: { username, password_hash } });

            const link = await tx.link.create({
                data: {
                    user_id: user.id,
                    slug,
                    type: source.type,
                    is_active: source.is_active,
                    // A copy starts unpublished: it is a working draft until the
                    // new owner decides to go live.
                    is_published: false,
                    profile_data: (source.profile_data ?? Prisma.JsonNull) as Prisma.InputJsonValue,
                    tags: source.tags,
                },
            });

            await tx.linkConfig.create({
                data: source.config
                    ? {
                        link_id: link.id,
                        background_color: source.config.background_color,
                        accent_color: source.config.accent_color,
                        text_color: source.config.text_color,
                        font_family: source.config.font_family,
                        music_url: source.config.music_url,
                        auto_play: source.config.auto_play,
                        game_template: source.config.game_template,
                    }
                    : { link_id: link.id },
            });

            if (source.galleries.length > 0) {
                await tx.gallery.createMany({
                    data: source.galleries.map((g) => ({
                        link_id: link.id,
                        image_url: g.image_url,
                        caption: g.caption,
                        sort_order: g.sort_order,
                    })),
                });
            }

            if (source.timelines.length > 0) {
                await tx.timeline.createMany({
                    data: source.timelines.map((t) => ({
                        link_id: link.id,
                        date: t.date,
                        title: t.title,
                        description: t.description,
                        image_url: t.image_url,
                        video_url: t.video_url,
                        audio_url: t.audio_url,
                        sort_order: t.sort_order,
                    })),
                });
            }

            return { link, username, pin };
        });

        revalidatePath("/admin/links");
        return {
            success: true as const,
            data: { slug: result.link.slug, username: result.username, pin: result.pin },
        };
    } catch (error) {
        console.error("duplicateLink failed", error);
        return { success: false as const, error: "Không thể nhân bản liên kết" };
    }
}

export interface LinkExport {
    version: 1;
    type: LinkType;
    profile_data: unknown;
    config: {
        background_color: string | null;
        accent_color: string | null;
        text_color: string | null;
        font_family: string | null;
        music_url: string | null;
        auto_play: boolean;
        game_template: string | null;
    } | null;
    galleries: { image_url: string; caption: string | null; sort_order: number }[];
    timelines: {
        date: string;
        title: string;
        description: string | null;
        image_url: string | null;
        video_url: string | null;
        audio_url: string | null;
        sort_order: number;
    }[];
}

/**
 * Serialises a link's content to JSON.
 *
 * Deliberately excludes credentials (the PIN lives in `User.password_hash`),
 * ids and timestamps — an export is meant to be shared or archived, so it must
 * not carry secrets or collide on import.
 */
export async function exportLink(linkId: string) {
    if (!(await requireAdmin())) {
        return { success: false as const, error: "Chưa đăng nhập" };
    }

    try {
        const link = await prisma.link.findUnique({
            where: { id: linkId },
            include: { config: true, galleries: true, timelines: true },
        });

        if (!link) return { success: false as const, error: "Không tìm thấy liên kết" };

        const payload: LinkExport = {
            version: 1,
            type: link.type,
            profile_data: link.profile_data ?? null,
            config: link.config
                ? {
                    background_color: link.config.background_color,
                    accent_color: link.config.accent_color,
                    text_color: link.config.text_color,
                    font_family: link.config.font_family,
                    music_url: link.config.music_url,
                    auto_play: link.config.auto_play,
                    game_template: link.config.game_template,
                }
                : null,
            galleries: link.galleries
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((g) => ({ image_url: g.image_url, caption: g.caption, sort_order: g.sort_order })),
            timelines: link.timelines
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((t) => ({
                    date: t.date.toISOString(),
                    title: t.title,
                    description: t.description,
                    image_url: t.image_url,
                    video_url: t.video_url,
                    audio_url: t.audio_url,
                    sort_order: t.sort_order,
                })),
        };

        return { success: true as const, data: payload };
    } catch (error) {
        console.error("exportLink failed", error);
        return { success: false as const, error: "Không thể xuất dữ liệu" };
    }
}

/** Creates a new link from an {@link exportLink} payload. */
export async function importLink(raw: string, username?: string) {
    if (!(await requireAdmin())) {
        return { success: false as const, error: "Chưa đăng nhập" };
    }

    let payload: LinkExport;
    try {
        payload = JSON.parse(raw) as LinkExport;
    } catch {
        return { success: false as const, error: "Tệp JSON không hợp lệ" };
    }

    if (payload?.version !== 1 || !payload.type) {
        return { success: false as const, error: "Định dạng không được hỗ trợ" };
    }

    const validTypes = Object.values(LinkType) as string[];
    if (!validTypes.includes(payload.type)) {
        return { success: false as const, error: `Loại trang không hợp lệ: ${payload.type}` };
    }

    try {
        let finalUsername = (username?.trim() || `import-${Date.now()}`).slice(0, 50);
        while (await prisma.user.findUnique({ where: { username: finalUsername } })) {
            finalUsername = `${finalUsername}-1`;
        }

        let slug = generateSlug();
        while (await prisma.link.findUnique({ where: { slug } })) {
            slug = generateSlug();
        }

        const pin = generatePin();
        const password_hash = await bcrypt.hash(pin, 10);

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({ data: { username: finalUsername, password_hash } });

            const link = await tx.link.create({
                data: {
                    user_id: user.id,
                    slug,
                    type: payload.type,
                    // Imported content is unreviewed, so it starts as a draft.
                    is_published: false,
                    profile_data: (payload.profile_data ?? Prisma.JsonNull) as Prisma.InputJsonValue,
                },
            });

            await tx.linkConfig.create({
                data: {
                    link_id: link.id,
                    background_color: payload.config?.background_color ?? undefined,
                    accent_color: payload.config?.accent_color ?? undefined,
                    text_color: payload.config?.text_color ?? undefined,
                    font_family: payload.config?.font_family ?? undefined,
                    music_url: payload.config?.music_url ?? null,
                    auto_play: payload.config?.auto_play ?? false,
                    game_template: payload.config?.game_template ?? undefined,
                },
            });

            if (payload.galleries?.length) {
                await tx.gallery.createMany({
                    data: payload.galleries.slice(0, 20).map((g, index) => ({
                        link_id: link.id,
                        image_url: g.image_url,
                        caption: g.caption ?? null,
                        sort_order: g.sort_order ?? index,
                    })),
                });
            }

            if (payload.timelines?.length) {
                await tx.timeline.createMany({
                    // `date` is required by the schema; fall back to now() rather
                    // than dropping the event, so a malformed export still imports.
                    data: payload.timelines.slice(0, 10).map((t, index) => ({
                        link_id: link.id,
                        date: t.date ? new Date(t.date) : new Date(),
                        title: t.title,
                        description: t.description ?? null,
                        image_url: t.image_url ?? null,
                        video_url: t.video_url ?? null,
                        audio_url: t.audio_url ?? null,
                        sort_order: t.sort_order ?? index,
                    })),
                });
            }

            return { link };
        });

        revalidatePath("/admin/links");
        return {
            success: true as const,
            data: { slug: result.link.slug, username: finalUsername, pin },
        };
    } catch (error) {
        console.error("importLink failed", error);
        return { success: false as const, error: "Không thể nhập dữ liệu" };
    }
}
