"use client";

import { useCallback, useMemo } from "react";
import { useToast } from "@/components/ui/toast";

export type FormMessage = { type: "success" | "error"; text: string } | null;

/**
 * Bridges the old per-form `message` state onto the global toast system.
 *
 * Before this, each edit form held its own
 * `useState<{ type, text } | null>` and rendered its own coloured banner, then
 * threaded `message` + `setMessage` down through props. That meant feedback
 * looked different in every form, and a banner rendered below the fold could be
 * missed entirely.
 *
 * The returned function is deliberately shaped like the old `setMessage` so
 * call sites need no rewriting:
 *
 *   const setMessage = useFormFeedback();
 *   setMessage({ type: "error", text: "Không thể cập nhật" });
 *
 * `setMessage(null)` used to mean "clear the banner". Toasts dismiss
 * themselves, so null is accepted and ignored rather than being a special case
 * every caller has to think about.
 */
export function useFormFeedback() {
    const toast = useToast();

    return useCallback(
        (message: FormMessage) => {
            if (!message) return;
            if (message.type === "success") {
                toast.success(message.text);
            } else {
                toast.error(message.text);
            }
        },
        [toast]
    );
}

/**
 * Same bridge, but also exposes the toast api for forms that want richer
 * feedback than success/error (e.g. a warning when hitting the 20-photo limit).
 */
export function useFormToast() {
    const toast = useToast();
    const setMessage = useFormFeedback();

    return useMemo(() => ({ ...toast, setMessage }), [toast, setMessage]);
}
