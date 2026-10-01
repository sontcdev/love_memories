"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight tooltip.
 *
 * Hand-rolled rather than pulling in `@radix-ui/react-tooltip`, matching the
 * approach already taken for ConfirmDialog / toast in this project.
 *
 * Accessibility notes:
 * - The trigger gets `aria-describedby`, so the tip is announced as a
 *   description of the control instead of as separate content.
 * - Opens on focus as well as hover, so keyboard users get it too.
 * - Escape closes it, matching the dialog behaviour elsewhere.
 * - A tooltip must never hold the ONLY copy of essential information; treat it
 *   as an enhancement (it is unreachable on touch devices).
 */
export interface TooltipProps {
    /** Tip text. Keep it short — one line ideally. */
    content: React.ReactNode;
    children: React.ReactElement;
    side?: "top" | "bottom" | "left" | "right";
    /** Delay before showing, ms. Avoids flickering when sweeping the pointer. */
    delay?: number;
    className?: string;
}

const SIDE_CLASSES: Record<NonNullable<TooltipProps["side"]>, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
};

let tooltipCounter = 0;

export function Tooltip({ content, children, side = "top", delay = 250, className }: TooltipProps) {
    const [open, setOpen] = React.useState(false);
    const timer = React.useRef<number | null>(null);
    // useId would be ideal, but a module counter keeps this stable across the
    // React 18 double-render in development without an extra import.
    const [id] = React.useState(() => `tooltip-${++tooltipCounter}`);

    const clear = React.useCallback(() => {
        if (timer.current !== null) {
            window.clearTimeout(timer.current);
            timer.current = null;
        }
    }, []);

    const show = React.useCallback(() => {
        clear();
        timer.current = window.setTimeout(() => setOpen(true), delay);
    }, [clear, delay]);

    const hide = React.useCallback(() => {
        clear();
        setOpen(false);
    }, [clear]);

    // Always clean up a pending timer, otherwise unmounting mid-delay would
    // call setState on a dead component.
    React.useEffect(() => clear, [clear]);

    React.useEffect(() => {
        if (!open) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") hide();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, hide]);

    const trigger = React.cloneElement(children, {
        "aria-describedby": open ? id : undefined,
        onMouseEnter: show,
        onMouseLeave: hide,
        onFocus: show,
        onBlur: hide,
    });

    return (
        <span className="relative inline-flex">
            {trigger}
            {open && (
                <span
                    id={id}
                    role="tooltip"
                    className={cn(
                        "pointer-events-none absolute z-50 rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-lg",
                        "max-w-[16rem] whitespace-normal text-center",
                        SIDE_CLASSES[side],
                        className
                    )}
                >
                    {content}
                </span>
            )}
        </span>
    );
}
