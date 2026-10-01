const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;
const HEX_COLOR_SHORT_REGEX = /^#[0-9a-fA-F]{3}$/;

export function isValidHexColor(color: string): boolean {
    return HEX_COLOR_REGEX.test(color) || HEX_COLOR_SHORT_REGEX.test(color);
}

export function sanitizeHexColor(color: string | null | undefined, fallback = "#ffffff"): string {
    if (!color) return fallback;
    if (HEX_COLOR_REGEX.test(color)) return color;
    if (HEX_COLOR_SHORT_REGEX.test(color)) return color;
    return fallback;
}

export function isDarkBackground(hex?: string | null): boolean {
    if (!hex) return false;
    const color = hex.replace("#", "");
    if (color.length !== 6) return false;
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 120;
}
