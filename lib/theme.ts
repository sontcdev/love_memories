/**
 * Convert hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}

/**
 * Lighten or darken a color
 */
function adjustColor(rgb: { r: number; g: number; b: number }, amount: number): string {
    const r = Math.max(0, Math.min(255, rgb.r + amount));
    const g = Math.max(0, Math.min(255, rgb.g + amount));
    const b = Math.max(0, Math.min(255, rgb.b + amount));
    return `${r} ${g} ${b}`;
}

/**
 * Generate color shades from a base color
 */
export function generateColorShades(hex: string): Record<string, string> {
    const rgb = hexToRgb(hex);
    if (!rgb) return {};

    return {
        50: adjustColor(rgb, 180),
        100: adjustColor(rgb, 150),
        200: adjustColor(rgb, 120),
        300: adjustColor(rgb, 80),
        400: adjustColor(rgb, 40),
        500: `${rgb.r} ${rgb.g} ${rgb.b}`, // Base color
        600: adjustColor(rgb, -20),
        700: adjustColor(rgb, -40),
        800: adjustColor(rgb, -60),
        900: adjustColor(rgb, -80),
        950: adjustColor(rgb, -100),
    };
}

/**
 * Generate CSS variables string for theme colors
 */
export function generateThemeCSS(themeColor: string): string {
    const shades = generateColorShades(themeColor);

    return Object.entries(shades)
        .map(([shade, rgb]) => `--primary-${shade}: ${rgb};`)
        .join('\n    ');
}

/**
 * Apply theme to document root
 */
export function applyTheme(themeColor: string) {
    const shades = generateColorShades(themeColor);

    Object.entries(shades).forEach(([shade, rgb]) => {
        document.documentElement.style.setProperty(`--primary-${shade}`, rgb);
    });
}
