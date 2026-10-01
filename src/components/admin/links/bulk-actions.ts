import type { ToastVariant } from "@/components/ui/toast";

/**
 * Tổng hợp kết quả thao tác hàng loạt.
 *
 * Mỗi liên kết là một lời gọi server action riêng, nên "thành công một phần" là
 * trạng thái bình thường chứ không phải ngoại lệ. Tách phần diễn giải ra khỏi
 * component để nó thuần tuý, kiểm thử được, và để không có nhánh nào lặng lẽ
 * báo "Đã xong" khi thực tế chỉ 3/5 liên kết được xử lý.
 */

export type BulkAction = "activate" | "deactivate" | "delete";

export interface BulkOutcome {
    /** Số liên kết được chọn ban đầu. */
    total: number;
    /** Số liên kết đã đổi trạng thái / bị xoá thành công. */
    ok: number;
    /** Số liên kết server trả về lỗi. */
    failed: number;
    /** Số liên kết vốn đã ở trạng thái đích nên không cần gọi server. */
    skipped: number;
}

export interface BulkSummary {
    variant: ToastVariant;
    title: string;
    description?: string;
}

const VERB: Record<BulkAction, { done: string; none: string }> = {
    activate: { done: "bật", none: "bật được liên kết nào" },
    deactivate: { done: "tạm dừng", none: "tạm dừng được liên kết nào" },
    delete: { done: "xoá", none: "xoá được liên kết nào" },
};

export function summarizeBulk(action: BulkAction, outcome: BulkOutcome): BulkSummary {
    const { total, ok, failed, skipped } = outcome;
    const verb = VERB[action];
    const skippedNote =
        skipped > 0 ? `${skipped} liên kết đã ở trạng thái này nên được bỏ qua.` : undefined;

    // Không có gì để làm: mọi liên kết được chọn đều đã ở trạng thái đích.
    if (ok === 0 && failed === 0) {
        return {
            variant: "info",
            title: "Không có gì thay đổi",
            description: skippedNote ?? "Không có liên kết nào cần cập nhật.",
        };
    }

    if (failed === 0) {
        return {
            variant: "success",
            title: `Đã ${verb.done} ${ok} liên kết`,
            description: skippedNote,
        };
    }

    if (ok === 0) {
        return {
            variant: "error",
            title: `Không ${verb.none}`,
            description: [
                `Cả ${failed}/${total} liên kết đều thất bại.`,
                "Danh sách giữ nguyên trạng thái cũ. Vui lòng thử lại.",
            ].join(" "),
        };
    }

    // Thành công một phần — nói thẳng con số thay vì báo thành công chung chung.
    return {
        variant: "warning",
        title: `Đã ${verb.done} ${ok}/${total} liên kết`,
        description: [`${failed} liên kết thất bại và giữ nguyên trạng thái cũ.`, skippedNote]
            .filter(Boolean)
            .join(" "),
    };
}

/** Câu xác nhận xoá — phải nêu rõ số lượng sẽ bị xoá. */
export function bulkDeleteConfirmMessage(count: number): string {
    return `Xoá ${count} liên kết đã chọn? Toàn bộ ảnh, dòng thời gian và lời nhắn của ${count} liên kết này sẽ bị xoá vĩnh viễn và không thể hoàn tác.`;
}
