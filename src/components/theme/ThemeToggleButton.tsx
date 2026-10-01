"use client";

import { Moon, Sun } from "lucide-react";

interface ThemeToggleButtonProps {
    isDark: boolean;
    onToggle: () => void;
    /** Per-template chrome (colors, shape, shadow). */
    className?: string;
    /** Icon sizing, defaults to the 4x4 used by most templates. */
    iconClassName?: string;
}

/**
 * Shared Night/Light toggle button. Visual chrome stays per-template via
 * `className` so each template keeps its own cosmetic conventions.
 */
export function ThemeToggleButton({
    isDark,
    onToggle,
    className = "",
    iconClassName = "w-4 h-4",
}: ThemeToggleButtonProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={className}
            title={isDark ? "Chế độ sáng" : "Chế độ tối"}
            aria-label={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
            aria-pressed={isDark}
        >
            {isDark ? <Sun className={iconClassName} /> : <Moon className={iconClassName} />}
        </button>
    );
}
