"use client";

import { useEffect } from "react";

/**
 * Phím tắt cho bảng admin.
 *
 * Hai quy tắc bắt buộc:
 * 1. **Không chiếm phím khi con trỏ đang ở trong ô nhập.** Gõ dấu "/" trong ô
 *    tìm kiếm phải ra ký tự "/", không phải nhảy focus lần nữa.
 * 2. **Không chiếm Escape khi có dialog đang mở** — Escape lúc đó thuộc về
 *    dialog (Radix tự xử lý), nếu ta cũng xử lý thì một lần nhấn sẽ vừa đóng
 *    dialog vừa xoá lựa chọn.
 *
 * Ngoại lệ duy nhất: Escape *khi đang ở trong chính ô tìm kiếm* vẫn được nhận,
 * vì đó là hành vi người dùng mong đợi (xoá từ khoá vừa gõ).
 */
export function useAdminShortcuts({
    enabled,
    searchRef,
    onFocusSearch,
    onEscape,
}: {
    /** Tắt khi có dialog / hộp xác nhận đang mở. */
    enabled: boolean;
    searchRef: React.RefObject<HTMLInputElement>;
    onFocusSearch: () => void;
    onEscape: () => void;
}) {
    useEffect(() => {
        if (!enabled) return;

        const isEditable = (target: EventTarget | null): boolean => {
            if (!(target instanceof HTMLElement)) return false;
            const tag = target.tagName;
            return (
                tag === "INPUT" ||
                tag === "TEXTAREA" ||
                tag === "SELECT" ||
                target.isContentEditable
            );
        };

        // Lưới an toàn thứ hai cho các dialog tự quản state (ví dụ dialog tạo liên
        // kết): Radix gắn `data-state="open"` lên phần nội dung đang mở, nên chỉ
        // cần soi DOM là biết, không phải kéo state của từng dialog lên đây.
        const hasOpenDialog = (): boolean =>
            document.querySelector('[role="dialog"][data-state="open"]') !== null;

        const onKeyDown = (event: KeyboardEvent) => {
            // Bỏ qua khi có phím phụ trợ: Cmd+/ , Ctrl+/ … thuộc về trình duyệt.
            if (event.metaKey || event.ctrlKey || event.altKey) return;
            if (hasOpenDialog()) return;

            if (event.key === "/") {
                if (isEditable(event.target)) return;
                event.preventDefault();
                onFocusSearch();
                return;
            }

            if (event.key === "Escape") {
                const inSearchBox = event.target === searchRef.current;
                if (isEditable(event.target) && !inSearchBox) return;
                onEscape();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [enabled, searchRef, onFocusSearch, onEscape]);
}
