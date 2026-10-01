"use client";

import { Check, CloudOff, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SaveStatus } from "./useAutoSave";

export interface SaveStatusIndicatorProps {
    status: SaveStatus;
    lastSavedAt?: Date | null;
    error?: string | null;
    /** Shown as a retry affordance when a save failed. */
    onRetry?: () => void;
    className?: string;
}

function formatTime(date: Date) {
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Tells the page owner whether their work is safe.
 *
 * Without this, autosave is worse than no autosave: changes appear to persist
 * with no way to tell whether they actually did. The failure state is therefore
 * the important one — it is the only status that is actionable, so it gets a
 * retry button and `role="alert"`.
 *
 * The polite statuses use `aria-live="polite"` so a screen reader is not
 * interrupted mid-sentence every time the debounce fires.
 */
export function SaveStatusIndicator({
    status,
    lastSavedAt,
    error,
    onRetry,
    className,
}: SaveStatusIndicatorProps) {
    if (status === "idle" && !lastSavedAt) return null;

    if (status === "error") {
        return (
            <div
                role="alert"
                className={cn(
                    "flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs text-rose-700",
                    "dark:border-rose-700/60 dark:bg-rose-900/30 dark:text-rose-300",
                    className
                )}
            >
                <CloudOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{error || "Lưu thất bại"}</span>
                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:no-underline"
                    >
                        <RefreshCw className="h-3 w-3" aria-hidden="true" />
                        Thử lại
                    </button>
                )}
            </div>
        );
    }

    const content =
        status === "saving" ? (
            <>
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden="true" />
                <span>Đang lưu…</span>
            </>
        ) : status === "pending" ? (
            <>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
                <span>Có thay đổi chưa lưu</span>
            </>
        ) : (
            <>
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <span>{lastSavedAt ? `Đã lưu lúc ${formatTime(lastSavedAt)}` : "Đã lưu"}</span>
            </>
        );

    return (
        <div
            role="status"
            aria-live="polite"
            className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-600",
                "dark:text-slate-300",
                className
            )}
        >
            {content}
        </div>
    );
}
