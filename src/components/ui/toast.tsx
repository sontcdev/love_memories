"use client";

/**
 * Toast / notification system.
 *
 * Hand-rolled rather than pulling in `@radix-ui/react-toast`: only the dialog,
 * label, select and slot Radix packages are installed, and this needs no
 * portal/focus-trap behaviour beyond what a live region already gives us.
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success("Đã lưu thay đổi");
 *   toast.error("Không thể tải ảnh", "Ảnh vượt quá 50KB, vui lòng chọn ảnh nhỏ hơn.");
 */

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "warning" | "info";

export type ToastOptions = {
    title: string;
    description?: string;
    variant?: ToastVariant;
    /** ms before auto-dismiss. `0` keeps it until dismissed manually. */
    duration?: number;
};

type ToastRecord = Required<Omit<ToastOptions, "description">> & {
    id: number;
    description?: string;
};

export type ToastApi = {
    show: (options: ToastOptions) => number;
    success: (title: string, description?: string) => number;
    error: (title: string, description?: string) => number;
    warning: (title: string, description?: string) => number;
    info: (title: string, description?: string) => number;
    dismiss: (id: number) => void;
    dismissAll: () => void;
};

/** Errors get longer on screen — they usually carry an instruction to read. */
const DEFAULT_DURATION: Record<ToastVariant, number> = {
    success: 4000,
    info: 4000,
    warning: 6000,
    error: 8000,
};

/** Cap the stack so a loop of failures cannot bury the screen. */
const MAX_VISIBLE = 4;

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error("useToast() phải được dùng bên trong <ToastProvider>.");
    }
    return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastRecord[]>([]);
    const nextId = useRef(1);
    const timers = useRef(new Map<number, number>());

    const clearTimer = useCallback((id: number) => {
        const handle = timers.current.get(id);
        if (handle !== undefined) {
            window.clearTimeout(handle);
            timers.current.delete(id);
        }
    }, []);

    const dismiss = useCallback(
        (id: number) => {
            clearTimer(id);
            setToasts((current) => current.filter((t) => t.id !== id));
        },
        [clearTimer]
    );

    const startTimer = useCallback(
        (id: number, duration: number) => {
            if (duration <= 0) return;
            clearTimer(id);
            timers.current.set(id, window.setTimeout(() => dismiss(id), duration));
        },
        [clearTimer, dismiss]
    );

    const show = useCallback(
        ({ title, description, variant = "info", duration }: ToastOptions) => {
            const id = nextId.current++;
            const resolved = duration ?? DEFAULT_DURATION[variant];

            setToasts((current) => {
                const next = [...current, { id, title, description, variant, duration: resolved }];
                // Drop the oldest entries that no longer fit, clearing their timers.
                const overflow = next.slice(0, Math.max(0, next.length - MAX_VISIBLE));
                overflow.forEach((t) => clearTimer(t.id));
                return next.slice(-MAX_VISIBLE);
            });

            startTimer(id, resolved);
            return id;
        },
        [clearTimer, startTimer]
    );

    const dismissAll = useCallback(() => {
        timers.current.forEach((handle) => window.clearTimeout(handle));
        timers.current.clear();
        setToasts([]);
    }, []);

    // Clear every pending timer if the provider itself unmounts.
    useEffect(() => {
        const pending = timers.current;
        return () => {
            pending.forEach((handle) => window.clearTimeout(handle));
            pending.clear();
        };
    }, []);

    const api = useMemo<ToastApi>(
        () => ({
            show,
            success: (title, description) => show({ title, description, variant: "success" }),
            error: (title, description) => show({ title, description, variant: "error" }),
            warning: (title, description) => show({ title, description, variant: "warning" }),
            info: (title, description) => show({ title, description, variant: "info" }),
            dismiss,
            dismissAll,
        }),
        [show, dismiss, dismissAll]
    );

    return (
        <ToastContext.Provider value={api}>
            {children}
            <ToastViewport
                toasts={toasts}
                onDismiss={dismiss}
                onPause={clearTimer}
                onResume={startTimer}
            />
        </ToastContext.Provider>
    );
}

const VARIANT_STYLE: Record<ToastVariant, { wrap: string; icon: string; Icon: typeof Info }> = {
    success: {
        wrap: "border-emerald-200 bg-white text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950 dark:text-emerald-100",
        icon: "text-emerald-500",
        Icon: CheckCircle2,
    },
    error: {
        wrap: "border-rose-200 bg-white text-rose-900 dark:border-rose-500/30 dark:bg-rose-950 dark:text-rose-100",
        icon: "text-rose-500",
        Icon: AlertCircle,
    },
    warning: {
        wrap: "border-amber-200 bg-white text-amber-900 dark:border-amber-500/30 dark:bg-amber-950 dark:text-amber-100",
        icon: "text-amber-500",
        Icon: TriangleAlert,
    },
    info: {
        wrap: "border-slate-200 bg-white text-slate-900 dark:border-slate-500/30 dark:bg-slate-900 dark:text-slate-100",
        icon: "text-slate-500",
        Icon: Info,
    },
};

function ToastViewport({
    toasts,
    onDismiss,
    onPause,
    onResume,
}: {
    toasts: ToastRecord[];
    onDismiss: (id: number) => void;
    onPause: (id: number) => void;
    onResume: (id: number, duration: number) => void;
}) {
    return (
        <div
            // `pointer-events-none` on the stack so it never blocks clicks in the gap
            // between toasts; each card re-enables pointer events for itself.
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
            {toasts.map((toast) => {
                const style = VARIANT_STYLE[toast.variant];
                const isAlert = toast.variant === "error" || toast.variant === "warning";

                return (
                    <div
                        key={toast.id}
                        // Errors/warnings interrupt; success/info wait their turn.
                        role={isAlert ? "alert" : "status"}
                        aria-live={isAlert ? "assertive" : "polite"}
                        onMouseEnter={() => onPause(toast.id)}
                        onMouseLeave={() => onResume(toast.id, toast.duration)}
                        onFocus={() => onPause(toast.id)}
                        onBlur={() => onResume(toast.id, toast.duration)}
                        className={cn(
                            "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-3.5 shadow-lg backdrop-blur-sm",
                            "motion-safe:animate-toast-in",
                            style.wrap
                        )}
                    >
                        <style.Icon className={cn("mt-0.5 h-5 w-5 shrink-0", style.icon)} aria-hidden="true" />

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold leading-snug">{toast.title}</p>
                            {toast.description && (
                                <p className="mt-0.5 text-sm leading-snug opacity-80">{toast.description}</p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => onDismiss(toast.id)}
                            aria-label="Đóng thông báo"
                            className="-m-1 shrink-0 rounded-md p-1 opacity-50 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                        >
                            <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
