"use client";

import { useEffect, useState, ReactNode } from "react";
import { useParams } from "next/navigation";

interface ThemeConfig {
    background_color?: string | null;
    font_family?: string | null;
    accent_color?: string | null;
    text_color?: string | null;
}

interface ThemeWrapperProps {
    config: ThemeConfig | null;
    children: ReactNode;
    type?: string;
}

// Default theme values
const DEFAULT_THEME = {
    background_color: "#ffffff",
    font_family: "Inter, sans-serif",
    accent_color: "#ec4899",
    text_color: "#1f2937",
};

// Font family mapping
const FONT_FAMILIES: Record<string, string> = {
    "Inter": "var(--font-inter), sans-serif",
    "Roboto": "var(--font-roboto), sans-serif",
    "Poppins": "var(--font-poppins), sans-serif",
    "Playfair Display": "var(--font-playfair), serif",
    "Dancing Script": "var(--font-dancing-script), cursive",
    "Quicksand": "var(--font-quicksand), sans-serif",
    "Nunito": "var(--font-nunito), sans-serif",
    "Pacifico": "var(--font-pacifico), cursive",
    "Montserrat": "var(--font-montserrat), sans-serif",
    "Comfortaa": "var(--font-comfortaa), sans-serif",
    "Caveat": "var(--font-caveat), cursive",
};

// Hex to HSL helper
function hexToHsl(hex: string): { h: number; s: number; l: number } {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

// HSL to Hex helper
function hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

    const rHex = Math.round((r + m) * 255).toString(16).padStart(2, "0");
    const gHex = Math.round((g + m) * 255).toString(16).padStart(2, "0");
    const bHex = Math.round((b + m) * 255).toString(16).padStart(2, "0");

    return `#${rHex}${gHex}${bHex}`;
}

// Determine contrasting text color based on background lightness
function getContrastColor(bgHex: string, darkText = "#1f2937", lightText = "#f1f5f9"): string {
    try {
        const { l } = hexToHsl(bgHex);
        return l > 50 ? darkText : lightText;
    } catch {
        return darkText;
    }
}

// Optimize accent color for proper contrast
function optimizeColor(hexColor: string, isDark: boolean): string {
    try {
        const { h, s, l } = hexToHsl(hexColor);
        if (isDark) {
            // Under dark mode, accent colors need to be bright enough to be visible (L >= 62)
            if (l < 62) {
                return hslToHex(h, Math.max(s, 55), 68);
            }
        } else {
            // Under light mode, accent colors need to be dark enough to be readable against light bg (L <= 45)
            if (l > 45) {
                return hslToHex(h, Math.max(s, 65), 38);
            }
        }
    } catch {
        // Fallback to original color on error
    }
    return hexColor;
}

export function ThemeWrapper({ config, children, type }: ThemeWrapperProps) {
    const params = useParams();
    const slug = params?.slug as string | undefined;

    const bgColor = config?.background_color || DEFAULT_THEME.background_color;
    const fontFamily = config?.font_family || DEFAULT_THEME.font_family;
    const accentColor = config?.accent_color || DEFAULT_THEME.accent_color;

    const resolvedFont = FONT_FAMILIES[fontFamily] || fontFamily;

    const [isDark, setIsDark] = useState(false);

    // Initial check from localStorage on mount
    useEffect(() => {
        if (!slug) return;
        const saved = localStorage.getItem(`theme_mode_${slug}`);
        if (saved) {
            setIsDark(saved === "dark");
        }
    }, [slug]);

    // Listen to theme changes from event dispatcher
    useEffect(() => {
        const handleThemeChange = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail && typeof customEvent.detail.isDark === "boolean") {
                setIsDark(customEvent.detail.isDark);
            }
        };
        window.addEventListener("theme-change", handleThemeChange);
        return () => window.removeEventListener("theme-change", handleThemeChange);
    }, []);

    // Fallback: MutationObserver to detect dark class toggled on DOM children
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    const target = mutation.target as HTMLElement;
                    if (target.classList.contains("dark")) {
                        setIsDark(true);
                    } else if (target.tagName === "DIV" && target.parentElement === document.body) {
                        // Check other siblings if they lost it
                        setIsDark(false);
                    }
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"]
        });

        return () => observer.disconnect();
    }, []);

    // Get dark mode background color matching templates
    const getDarkBgColor = () => {
        switch (type) {
            case "IDOL":
                return "#0b0813";
            case "LOVE2":
                return "#181614";
            case "GRAD_PERSONAL":
                return "#0f0a07";
            case "GRAD_CLASS":
                return "#162a22";
            case "GRAD_GROUP":
                // Guess caravan as default or read from local storage if available
                if (typeof window !== "undefined" && slug) {
                    try {
                        const savedProfile = localStorage.getItem(`profile_data_${slug}`);
                        if (savedProfile) {
                            const parsed = JSON.parse(savedProfile);
                            if (parsed.theme === "station") return "#05040a";
                            if (parsed.theme === "scrapbook") return "#1c1611";
                        }
                    } catch {}
                }
                return "#0f0a07"; // default Caravan dark bg
            default:
                return "#121214";
        }
    };

    const darkBgColor = getDarkBgColor();
    const resolvedBgColor = isDark ? darkBgColor : bgColor;
    const resolvedAccentColor = optimizeColor(accentColor, isDark);
    const resolvedTextColor = getContrastColor(resolvedBgColor);

    // Apply CSS variables to document html
    useEffect(() => {
        const root = document.documentElement;

        root.style.setProperty("--theme-bg", resolvedBgColor);
        root.style.setProperty("--theme-font", resolvedFont);
        root.style.setProperty("--theme-accent", resolvedAccentColor);
        root.style.setProperty("--theme-text", resolvedTextColor);

        // Toggle global dark class on documentElement for tailwind compatibility
        if (isDark) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        return () => {
            root.style.removeProperty("--theme-bg");
            root.style.removeProperty("--theme-font");
            root.style.removeProperty("--theme-accent");
            root.style.removeProperty("--theme-text");
            root.classList.remove("dark");
        };
    }, [resolvedBgColor, resolvedFont, resolvedAccentColor, resolvedTextColor, isDark]);

    return (
        <div
            className="min-h-screen transition-colors duration-500"
            style={{
                backgroundColor: resolvedBgColor,
                color: resolvedTextColor,
                fontFamily: resolvedFont,
            }}
        >
            {children}
        </div>
    );
}
