"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

export interface UseAutoSaveOptions<T> {
    /** Current form values. Autosave triggers when this changes. */
    value: T;
    /**
     * Persists the value. Should resolve `{ success: false }` (or throw) on
     * failure — both are treated as an error so the indicator can show it.
     */
    save: (value: T) => Promise<{ success: boolean; error?: string } | void>;
    /**
     * Gate. Autosave only runs while true — callers pass something like
     * `isDirty && isValid` so we never persist a half-typed or invalid form.
     */
    enabled?: boolean;
    /** Quiet period after the last edit before saving. */
    delay?: number;
    /** How long the "saved" confirmation stays visible. */
    savedDuration?: number;
}

export interface UseAutoSaveResult {
    status: SaveStatus;
    /** Timestamp of the last successful save, or null. */
    lastSavedAt: Date | null;
    error: string | null;
    /** True between an edit and its successful save — drives the unload warning. */
    hasUnsavedChanges: boolean;
    /** Flush immediately, skipping the debounce (Ctrl/Cmd+S, or a manual button). */
    saveNow: () => void;
}

/**
 * Debounced autosave with an observable status.
 *
 * Design notes:
 * - The first render never saves. Mounting a form is not an edit, and saving on
 *   mount would rewrite every record just because someone opened the page.
 * - `save` is held in a ref so a caller passing an inline arrow function does
 *   not restart the debounce on every render.
 * - Saves are serialised: if a save is in flight when the timer fires, the new
 *   one is queued rather than raced, so an older payload can never land last.
 * - beforeunload is registered ONLY while there are unsaved changes. Keeping it
 *   permanently attached makes browsers show the leave-confirmation on every
 *   navigation, which trains people to click through it.
 */
export function useAutoSave<T>({
    value,
    save,
    enabled = true,
    delay = 1500,
    savedDuration = 2500,
}: UseAutoSaveOptions<T>): UseAutoSaveResult {
    const [status, setStatus] = useState<SaveStatus>("idle");
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    const saveRef = useRef(save);
    saveRef.current = save;

    const timerRef = useRef<number | null>(null);
    const savedTimerRef = useRef<number | null>(null);
    const isFirstRun = useRef(true);
    const inFlight = useRef(false);
    const queued = useRef<T | null>(null);
    const latestValue = useRef(value);
    latestValue.current = value;

    const hasUnsavedChanges = status === "pending" || status === "saving";

    const runSave = useCallback(async (payload: T) => {
        // Serialise: remember the newest payload and let the running save pick
        // it up when it finishes, instead of firing a second request.
        if (inFlight.current) {
            queued.current = payload;
            return;
        }

        inFlight.current = true;
        setStatus("saving");
        setError(null);

        try {
            const result = await saveRef.current(payload);
            if (result && result.success === false) {
                setStatus("error");
                setError(result.error ?? "Không thể lưu thay đổi");
            } else {
                setLastSavedAt(new Date());
                setStatus("saved");
                if (savedTimerRef.current !== null) window.clearTimeout(savedTimerRef.current);
                savedTimerRef.current = window.setTimeout(() => {
                    // Only fall back to idle if nothing new happened meanwhile.
                    setStatus((current) => (current === "saved" ? "idle" : current));
                }, savedDuration);
            }
        } catch (caught) {
            setStatus("error");
            setError(caught instanceof Error ? caught.message : "Không thể lưu thay đổi");
        } finally {
            inFlight.current = false;
            const next = queued.current;
            queued.current = null;
            if (next !== null) void runSave(next);
        }
    }, [savedDuration]);

    const saveNow = useCallback(() => {
        if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        void runSave(latestValue.current);
    }, [runSave]);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        if (!enabled) return;

        setStatus("pending");
        if (timerRef.current !== null) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
            timerRef.current = null;
            void runSave(latestValue.current);
        }, delay);

        return () => {
            if (timerRef.current !== null) {
                window.clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
        // `value` is intentionally the trigger; latestValue.current carries the payload.
    }, [value, enabled, delay, runSave]);

    // Clear timers on unmount so a pending debounce cannot setState on a dead component.
    useEffect(
        () => () => {
            if (timerRef.current !== null) window.clearTimeout(timerRef.current);
            if (savedTimerRef.current !== null) window.clearTimeout(savedTimerRef.current);
        },
        []
    );

    useEffect(() => {
        if (!hasUnsavedChanges) return;
        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            // Modern browsers show their own generic message; returnValue must
            // still be set for the prompt to appear at all.
            event.returnValue = "";
            return "";
        };
        window.addEventListener("beforeunload", onBeforeUnload);
        return () => window.removeEventListener("beforeunload", onBeforeUnload);
    }, [hasUnsavedChanges]);

    return { status, lastSavedAt, error, hasUnsavedChanges, saveNow };
}

/**
 * react-hook-form bridge for {@link useAutoSave}.
 *
 * `form.watch()` returns a NEW object on every render, which would restart the
 * debounce continuously and pin the status at "pending". So the trigger is the
 * serialised form value: identity only changes when the data actually changes.
 *
 * `enabled` defaults to `isDirty && isValid` — never persist a form the user has
 * not touched, and never persist one that would fail validation server-side.
 * Note that `isValid` is only trustworthy when the form uses
 * `mode: "onChange"` (or "all") with its resolver.
 */
export function useFormAutoSave<T extends Record<string, unknown>>({
    watch,
    isDirty,
    isValid,
    save,
    delay,
    enabled,
}: {
    watch: () => T;
    isDirty: boolean;
    isValid: boolean;
    save: (value: T) => Promise<{ success: boolean; error?: string } | void>;
    delay?: number;
    enabled?: boolean;
}): UseAutoSaveResult {
    const values = watch();
    const serialised = JSON.stringify(values);

    // `serialised` is the intentional identity key here: depending on `values`
    // would make this memo useless, since watch() returns a fresh object each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const stableValue = useMemo(() => values, [serialised]);

    return useAutoSave({
        value: stableValue,
        save,
        enabled: enabled ?? (isDirty && isValid),
        delay,
    });
}

