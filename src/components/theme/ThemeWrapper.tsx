"use client";

import { useEffect, ReactNode } from "react";

interface ThemeConfig {
    background_color?: string | null;
    font_family?: string | null;
    accent_color?: string | null;
}

interface ThemeWrapperProps {
    config: ThemeConfig | null;
    children: ReactNode;
}

// Default theme values
const DEFAULT_THEME = {
    background_color: "#ffffff",
    font_family: "Inter, sans-serif",
    accent_color: "#ec4899", // pink-500
};

// Font family mapping
const FONT_FAMILIES: Record<string, string> = {
    "Inter": "Inter, sans-serif",
    "Roboto": "Roboto, sans-serif",
    "Poppins": "Poppins, sans-serif",
    "Playfair Display": "'Playfair Display', serif",
    "Dancing Script": "'Dancing Script', cursive",
    "Quicksand": "Quicksand, sans-serif",
    "Nunito": "Nunito, sans-serif",
};

export function ThemeWrapper({ config, children }: ThemeWrapperProps) {
    const bgColor = config?.background_color || DEFAULT_THEME.background_color;
    const fontFamily = config?.font_family || DEFAULT_THEME.font_family;
    const accentColor = config?.accent_color || DEFAULT_THEME.accent_color;

    // Resolve font family
    const resolvedFont = FONT_FAMILIES[fontFamily] || fontFamily;

    // Apply CSS variables to document
    useEffect(() => {
        const root = document.documentElement;

        // Set CSS variables
        root.style.setProperty("--theme-bg", bgColor);
        root.style.setProperty("--theme-font", resolvedFont);
        root.style.setProperty("--theme-accent", accentColor);

        // Cleanup on unmount
        return () => {
            root.style.removeProperty("--theme-bg");
            root.style.removeProperty("--theme-font");
            root.style.removeProperty("--theme-accent");
        };
    }, [bgColor, resolvedFont, accentColor]);

    return (
        <div
            className="min-h-screen"
            style={{
                backgroundColor: bgColor,
                fontFamily: resolvedFont,
            }}
        >
            {children}
        </div>
    );
}
