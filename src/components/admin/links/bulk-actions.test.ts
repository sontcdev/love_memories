import { describe, expect, it } from "vitest";
import { bulkDeleteConfirmMessage, summarizeBulk } from "./bulk-actions";

/**
 * Điểm mấu chốt của bộ test này: **không có** trường hợp nào mà một phần thất
 * bại lại được báo cáo như thành công toàn bộ. Đó chính là lỗi mà lớp tổng hợp
 * này tồn tại để chặn.
 */
describe("summarizeBulk", () => {
    it("báo thành công khi mọi liên kết đều xử lý được", () => {
        const summary = summarizeBulk("delete", { total: 5, ok: 5, failed: 0, skipped: 0 });
        expect(summary.variant).toBe("success");
        expect(summary.title).toBe("Đã xoá 5 liên kết");
    });

    it("nêu rõ 3/5 khi thất bại một phần", () => {
        const summary = summarizeBulk("delete", { total: 5, ok: 3, failed: 2, skipped: 0 });
        expect(summary.variant).toBe("warning");
        expect(summary.title).toBe("Đã xoá 3/5 liên kết");
        expect(summary.description).toContain("2 liên kết thất bại");
    });

    it("báo lỗi khi không xử lý được liên kết nào", () => {
        const summary = summarizeBulk("delete", { total: 4, ok: 0, failed: 4, skipped: 0 });
        expect(summary.variant).toBe("error");
        expect(summary.title).toBe("Không xoá được liên kết nào");
        expect(summary.description).toContain("4/4");
    });

    it("nói rõ số liên kết bị bỏ qua vì đã đúng trạng thái", () => {
        const summary = summarizeBulk("activate", { total: 5, ok: 3, failed: 0, skipped: 2 });
        expect(summary.variant).toBe("success");
        expect(summary.title).toBe("Đã bật 3 liên kết");
        expect(summary.description).toContain("2 liên kết đã ở trạng thái này");
    });

    it("không báo thành công khi thực tế không có gì thay đổi", () => {
        const summary = summarizeBulk("deactivate", { total: 3, ok: 0, failed: 0, skipped: 3 });
        expect(summary.variant).toBe("info");
        expect(summary.title).toBe("Không có gì thay đổi");
    });

    it("gộp cả số thất bại và số bỏ qua vào cùng một mô tả", () => {
        const summary = summarizeBulk("activate", { total: 6, ok: 2, failed: 3, skipped: 1 });
        expect(summary.variant).toBe("warning");
        expect(summary.title).toBe("Đã bật 2/6 liên kết");
        expect(summary.description).toContain("3 liên kết thất bại");
        expect(summary.description).toContain("1 liên kết đã ở trạng thái này");
    });

    it("dùng đúng động từ cho từng thao tác", () => {
        expect(summarizeBulk("activate", { total: 1, ok: 1, failed: 0, skipped: 0 }).title).toBe(
            "Đã bật 1 liên kết"
        );
        expect(summarizeBulk("deactivate", { total: 1, ok: 1, failed: 0, skipped: 0 }).title).toBe(
            "Đã tạm dừng 1 liên kết"
        );
        expect(summarizeBulk("delete", { total: 1, ok: 1, failed: 0, skipped: 0 }).title).toBe(
            "Đã xoá 1 liên kết"
        );
    });
});

describe("bulkDeleteConfirmMessage", () => {
    it("nêu rõ số liên kết sẽ bị xoá", () => {
        expect(bulkDeleteConfirmMessage(7)).toContain("Xoá 7 liên kết");
    });

    it("cảnh báo là không thể hoàn tác", () => {
        expect(bulkDeleteConfirmMessage(2)).toContain("không thể hoàn tác");
    });
});
