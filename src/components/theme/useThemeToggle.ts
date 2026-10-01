"use client";

import { useCallback, useEffect, useState } from "react";

interface UseThemeToggleOptions {
    /** Per-slug persistence key: `theme_mode_${slug}` */
    slug: string;
    /** Background applied to `--theme-bg` in night mode (per-template palette). */
    darkBg: string;
    /** Background applied to `--theme-bg` in light mode. */
    lightBg: string;
    /** Mode used when the visitor has no stored preference yet. */
    defaultDark?: boolean;
}

export interface ThemeToggleState {
    isDark: boolean;
    toggle: () => void;
}

/**
 * Owns the Night/Light state for a public template: reads/writes
 * `theme_mode_${slug}` in localStorage, dispatches the `theme-change`
 * CustomEvent that `ThemeWrapper` listens for, and keeps `--theme-bg` in sync.
 *
 * This is the generalized form of the logic that was duplicated inline in
 * Love2/Idol/GradClass/GradPersonal/GradGroup templates.
 *
 * Note: call this before any helper that reads `isDark` — see the TDZ gotcha in
 * AGENTS.md. Because the hook returns `isDark` directly, hoisting it to the top
 * of the component satisfies that automatically.
 */
export function useThemeToggle({
    slug,
    darkBg,
    lightBg,
    defaultDark = false,
}: UseThemeToggleOptions): ThemeToggleState {
    const [overrideDark, setOverrideDark] = useState<boolean | null>(null);
    const isDark = overrideDark !== null ? overrideDark : defaultDark;

    const applyBg = useCallback(
        (dark: boolean) => {
            document.documentElement.style.setProperty(
                "--theme-bg",
                dark ? darkBg : lightBg
            );
        },
        [darkBg, lightBg]
    );

    // Restore the stored preference on mount.
    useEffect(() => {
        const saved = localStorage.getItem(`theme_mode_${slug}`);
        if (!saved) return;
        const isSavedDark = saved === "dark";
        setOverrideDark(isSavedDark);
        applyBg(isSavedDark);
    }, [slug, applyBg]);

    // Stay in sync when another control (e.g. the lock screen) flips the mode.
    useEffect(() => {
        const handleThemeChange = (event: Event) => {
            const detail = (event as CustomEvent).detail;
            if (detail && typeof detail.isDark === "boolean") {
                setOverrideDark(detail.isDark);
            }
        };
        window.addEventListener("theme-change", handleThemeChange);
        return () => window.removeEventListener("theme-change", handleThemeChange);
    }, []);

    const toggle = useCallback(() => {
        const nextDark = !isDark;
        setOverrideDark(nextDark);
        localStorage.setItem(`theme_mode_${slug}`, nextDark ? "dark" : "light");
        window.dispatchEvent(
            new CustomEvent("theme-change", { detail: { isDark: nextDark } })
        );
        // Applied synchronously inside the click handler so the background swaps
        // in the same frame as the rest of the template.
        applyBg(nextDark);
    }, [isDark, slug, applyBg]);

    return { isDark, toggle };
}
