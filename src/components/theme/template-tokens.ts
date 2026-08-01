// Shared theming tokens for template rewrites (Idol/Travel/Love2/Grad Class).
// Turns a LinkConfig's `accent_color` (hex) + `font_family` (Google Fonts name
// already preloaded as CSS variables in app/layout.tsx) into CSS custom
// properties, so templates stop hardcoding their own Tailwind palettes.

import type { CSSProperties } from "react";

/** Maps FONT_OPTIONS values (see EditConfigFormV2/EditIdolConfigFormV2) to the
 *  `--font-*` CSS variables declared on <body> in app/layout.tsx. */
const FONT_VAR_MAP: Record<string, string> = {
    Inter: "var(--font-inter)",
    Roboto: "var(--font-roboto)",
    Poppins: "var(--font-poppins)",
    "Playfair Display": "var(--font-playfair)",
    "Dancing Script": "var(--font-dancing-script)",
    Quicksand: "var(--font-quicksand)",
    Nunito: "var(--font-nunito)",
    Pacifico: "var(--font-pacifico)",
    Montserrat: "var(--font-montserrat)",
    Comfortaa: "var(--font-comfortaa)",
    Caveat: "var(--font-caveat)",
};

export interface TemplateTokensInput {
    accentColor?: string | null;
    fontFamily?: string | null;
}

export interface TemplateTokens {
    /** Spread onto the template's root element `style` prop. */
    style: CSSProperties;
}

/**
 * Builds `--accent`/`--accent-soft`/`--accent-strong` custom properties from a
 * hex accent color (via `color-mix`, so it works with any hex without an
 * oklch conversion step) plus a `--font-display` variable for the chosen
 * font. Falls back to the same defaults as the LinkConfig schema.
 */
export function buildTemplateTokens({
    accentColor,
    fontFamily,
}: TemplateTokensInput): TemplateTokens {
    const accent = accentColor || "#a855f7";
    const font = FONT_VAR_MAP[fontFamily || "Inter"] || FONT_VAR_MAP.Inter;

    return {
        style: {
            "--accent": accent,
            "--font-display": font,
        } as CSSProperties,
    };
}
