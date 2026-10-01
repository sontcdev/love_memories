"use client";

import { Loader2, Power, PowerOff, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BulkAction } from "./bulk-actions";

export interface BulkActionBarProps {
    selectedCount: number;
    /** Thao tác đang chạy, hoặc `null` khi rảnh. */
    runningAction: BulkAction | null;
    /** Tiến độ của thao tác đang chạy: đã xử lý / tổng số. */
    progress: { done: number; total: number } | null;
    onActivate: () => void;
    onDeactivate: () => void;
    onDelete: () => void;
    onClear: () => void;
}

/**
 * Thanh thao tác hàng loạt, chỉ xuất hiện khi đã chọn ít nhất 1 dòng.
 *
 * Hiển thị tiến độ ngay trên thanh (chứ không chỉ trong toast) vì với 20 liên
 * kết, mỗi liên kết là một lời gọi server riêng — người dùng cần thấy nó đang
 * chạy, không phải đứng im.
 */
export function BulkActionBar({
    selectedCount,
    runningAction,
    progress,
    onActivate,
    onDeactivate,
    onDelete,
    onClear,
}: BulkActionBarProps) {
    if (selectedCount === 0) return null;

    const busy = runningAction !== null;

    return (
        <div
            role="region"
            aria-label="Thao tác hàng loạt"
            className="flex flex-col gap-3 rounded-xl border border-violet-500/40 bg-violet-500/10 p-3 sm:flex-row sm:items-center sm:justify-between"
        >
            <p className="text-sm text-slate-200" aria-live="polite">
                Đã chọn <span className="font-semibold text-white">{selectedCount}</span> liên kết
                {busy && progress && (
                    <span className="ml-2 text-violet-300">
                        · Đang xử lý {progress.done}/{progress.total}…
                    </span>
                )}
            </p>

            <div className="flex flex-wrap items-center gap-2">
                <BulkButton
                    onClick={onActivate}
                    disabled={busy}
                    loading={runningAction === "activate"}
                    icon={<Power className="h-4 w-4" aria-hidden="true" />}
                    className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                >
                    Bật hoạt động
                </BulkButton>

                <BulkButton
                    onClick={onDeactivate}
                    disabled={busy}
                    loading={runningAction === "deactivate"}
                    icon={<PowerOff className="h-4 w-4" aria-hidden="true" />}
                    className="border-slate-500/40 bg-slate-500/10 text-slate-300 hover:bg-slate-500/20"
                >
                    Tạm dừng
                </BulkButton>

                <BulkButton
                    onClick={onDelete}
                    disabled={busy}
                    loading={runningAction === "delete"}
                    icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
                    className="border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                >
                    Xoá {selectedCount} liên kết
                </BulkButton>

                <BulkButton
                    onClick={onClear}
                    disabled={busy}
                    icon={<X className="h-4 w-4" aria-hidden="true" />}
                    className="border-slate-600 bg-slate-900/40 text-slate-300 hover:text-white"
                >
                    Bỏ chọn
                </BulkButton>
            </div>
        </div>
    );
}

function BulkButton({
    children,
    onClick,
    disabled,
    loading = false,
    icon,
    className,
}: {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    icon: React.ReactNode;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors",
                "disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : icon}
            {children}
        </button>
    );
}
