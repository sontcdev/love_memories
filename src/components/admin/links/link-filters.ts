import type { LinkType } from "@prisma/client";

/**
 * Lọc / tìm kiếm / sắp xếp cho bảng admin.
 *
 * Chạy hoàn toàn ở client trên **các dòng của trang hiện tại**: phân trang vẫn
 * do server đảm nhiệm (`?page=`), nên bộ lọc này không được đổi số trang hay
 * gọi lại server. Đây là lựa chọn có ý thức — lọc tức thì trên 20 dòng nhanh
 * hơn một vòng round-trip, đổi lại nó không tìm được liên kết ở trang khác.
 * Vì vậy thanh lọc luôn hiển thị rõ "trong trang này".
 */

export type LinkStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

export type LinkSortKey = "created_desc" | "created_asc" | "slug_asc" | "slug_desc";

export interface LinkFilterState {
    /** Khớp với slug hoặc tên người dùng, không phân biệt chữ hoa/thường. */
    search: string;
    type: LinkType | "ALL";
    status: LinkStatusFilter;
    /** Chỉ hiện liên kết đã đánh dấu yêu thích. */
    favoritesOnly: boolean;
    sort: LinkSortKey;
}

export const DEFAULT_LINK_FILTERS: LinkFilterState = {
    search: "",
    type: "ALL",
    status: "ALL",
    favoritesOnly: false,
    sort: "created_desc",
};

export const LINK_SORT_LABELS: Record<LinkSortKey, string> = {
    created_desc: "Mới nhất trước",
    created_asc: "Cũ nhất trước",
    slug_asc: "Slug A → Z",
    slug_desc: "Slug Z → A",
};

/**
 * Hình dạng tối thiểu mà bộ lọc cần. Cố tình không dùng thẳng `Link` của Prisma
 * để hàm còn kiểm thử được mà không phải dựng cả một bản ghi thật.
 */
export interface FilterableLink {
    slug: string;
    type: LinkType;
    is_active: boolean;
    is_favorite: boolean;
    created_at: Date | string;
    user: { username: string };
}

/** Có bộ lọc nào đang thu hẹp danh sách không (thứ tự sắp xếp không tính). */
export function isFilterActive(filters: LinkFilterState): boolean {
    return (
        filters.search.trim() !== "" ||
        filters.type !== "ALL" ||
        filters.status !== "ALL" ||
        filters.favoritesOnly
    );
}

function timeOf(value: Date | string): number {
    const time = value instanceof Date ? value.getTime() : new Date(value).getTime();
    // Ngày không hợp lệ bị đẩy xuống cuối thay vì làm hỏng toàn bộ thứ tự.
    return Number.isNaN(time) ? 0 : time;
}

export function filterAndSortLinks<T extends FilterableLink>(
    links: T[],
    filters: LinkFilterState
): T[] {
    const term = filters.search.trim().toLowerCase();

    const filtered = links.filter((link) => {
        if (term) {
            const haystack = `${link.slug} ${link.user.username}`.toLowerCase();
            if (!haystack.includes(term)) return false;
        }
        if (filters.type !== "ALL" && link.type !== filters.type) return false;
        if (filters.status === "ACTIVE" && !link.is_active) return false;
        if (filters.status === "INACTIVE" && link.is_active) return false;
        if (filters.favoritesOnly && !link.is_favorite) return false;
        return true;
    });

    // `sort()` tại chỗ trên bản đã `filter()` — mảng gốc từ state không bị đụng tới.
    return filtered.sort((a, b) => {
        switch (filters.sort) {
            case "created_asc":
                return timeOf(a.created_at) - timeOf(b.created_at);
            case "slug_asc":
                return a.slug.localeCompare(b.slug, "vi");
            case "slug_desc":
                return b.slug.localeCompare(a.slug, "vi");
            case "created_desc":
            default:
                return timeOf(b.created_at) - timeOf(a.created_at);
        }
    });
}
