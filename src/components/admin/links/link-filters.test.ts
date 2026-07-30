import { describe, expect, it } from "vitest";
import {
    DEFAULT_LINK_FILTERS,
    filterAndSortLinks,
    isFilterActive,
    type FilterableLink,
    type LinkFilterState,
} from "./link-filters";

/**
 * Test cho tầng logic thuần của bảng admin.
 *
 * Đặt cạnh mã nguồn (vitest.config.ts đã include `src/**` cho *.test.ts) vì đây
 * là logic nội bộ của component, không phải hợp đồng dùng chung như `lib/`.
 */

function link(overrides: Partial<FilterableLink> & { slug: string }): FilterableLink {
    return {
        type: "LOVE",
        is_active: true,
        is_favorite: false,
        created_at: new Date("2026-01-01T00:00:00Z"),
        user: { username: `user-${overrides.slug}` },
        ...overrides,
    };
}

const filters = (overrides: Partial<LinkFilterState> = {}): LinkFilterState => ({
    ...DEFAULT_LINK_FILTERS,
    ...overrides,
});

describe("isFilterActive", () => {
    it("trả về false với bộ lọc mặc định", () => {
        expect(isFilterActive(DEFAULT_LINK_FILTERS)).toBe(false);
    });

    it("bỏ qua khoảng trắng trong từ khoá", () => {
        expect(isFilterActive(filters({ search: "   " }))).toBe(false);
        expect(isFilterActive(filters({ search: " abc " }))).toBe(true);
    });

    it("không coi việc đổi thứ tự sắp xếp là đang lọc", () => {
        expect(isFilterActive(filters({ sort: "slug_asc" }))).toBe(false);
    });

    it("nhận ra từng bộ lọc thu hẹp danh sách", () => {
        expect(isFilterActive(filters({ type: "IDOL" }))).toBe(true);
        expect(isFilterActive(filters({ status: "INACTIVE" }))).toBe(true);
        expect(isFilterActive(filters({ favoritesOnly: true }))).toBe(true);
    });
});

describe("filterAndSortLinks", () => {
    const rows: FilterableLink[] = [
        link({ slug: "banh-mi", created_at: new Date("2026-03-01") }),
        link({
            slug: "ca-phe",
            type: "IDOL",
            is_active: false,
            is_favorite: true,
            created_at: new Date("2026-01-15"),
            user: { username: "Minh-Anh" },
        }),
        link({ slug: "dua-hau", type: "WEDDING", created_at: new Date("2026-02-10") }),
    ];

    it("mặc định sắp xếp mới nhất trước", () => {
        expect(filterAndSortLinks(rows, filters()).map((r) => r.slug)).toEqual([
            "banh-mi",
            "dua-hau",
            "ca-phe",
        ]);
    });

    it("sắp xếp được cũ nhất trước và theo slug hai chiều", () => {
        expect(filterAndSortLinks(rows, filters({ sort: "created_asc" })).map((r) => r.slug)).toEqual([
            "ca-phe",
            "dua-hau",
            "banh-mi",
        ]);
        expect(filterAndSortLinks(rows, filters({ sort: "slug_asc" })).map((r) => r.slug)).toEqual([
            "banh-mi",
            "ca-phe",
            "dua-hau",
        ]);
        expect(filterAndSortLinks(rows, filters({ sort: "slug_desc" })).map((r) => r.slug)).toEqual([
            "dua-hau",
            "ca-phe",
            "banh-mi",
        ]);
    });

    it("không làm thay đổi mảng gốc", () => {
        const original = rows.map((r) => r.slug);
        filterAndSortLinks(rows, filters({ sort: "slug_desc" }));
        expect(rows.map((r) => r.slug)).toEqual(original);
    });

    it("tìm theo slug, không phân biệt chữ hoa/thường", () => {
        expect(filterAndSortLinks(rows, filters({ search: "CA-PHE" })).map((r) => r.slug)).toEqual([
            "ca-phe",
        ]);
    });

    it("tìm theo cả tên người dùng", () => {
        expect(filterAndSortLinks(rows, filters({ search: "minh" })).map((r) => r.slug)).toEqual([
            "ca-phe",
        ]);
    });

    it("bỏ qua khoảng trắng hai đầu của từ khoá", () => {
        expect(filterAndSortLinks(rows, filters({ search: "  dua  " })).map((r) => r.slug)).toEqual([
            "dua-hau",
        ]);
    });

    it("lọc theo loại giao diện", () => {
        expect(filterAndSortLinks(rows, filters({ type: "WEDDING" })).map((r) => r.slug)).toEqual([
            "dua-hau",
        ]);
    });

    it("lọc theo trạng thái hoạt động", () => {
        expect(filterAndSortLinks(rows, filters({ status: "ACTIVE" })).map((r) => r.slug)).toEqual([
            "banh-mi",
            "dua-hau",
        ]);
        expect(filterAndSortLinks(rows, filters({ status: "INACTIVE" })).map((r) => r.slug)).toEqual([
            "ca-phe",
        ]);
    });

    it("lọc theo yêu thích", () => {
        expect(filterAndSortLinks(rows, filters({ favoritesOnly: true })).map((r) => r.slug)).toEqual([
            "ca-phe",
        ]);
    });

    it("gộp nhiều bộ lọc với nhau", () => {
        expect(
            filterAndSortLinks(rows, filters({ search: "a", status: "ACTIVE", type: "LOVE" })).map(
                (r) => r.slug
            )
        ).toEqual(["banh-mi"]);
    });

    it("trả về mảng rỗng khi không có gì khớp", () => {
        expect(filterAndSortLinks(rows, filters({ search: "không-tồn-tại" }))).toEqual([]);
    });

    it("chấp nhận created_at ở dạng chuỗi ISO", () => {
        const stringDates = [
            link({ slug: "cu", created_at: "2026-01-01T00:00:00.000Z" }),
            link({ slug: "moi", created_at: "2026-06-01T00:00:00.000Z" }),
        ];
        expect(filterAndSortLinks(stringDates, filters()).map((r) => r.slug)).toEqual(["moi", "cu"]);
    });
});
