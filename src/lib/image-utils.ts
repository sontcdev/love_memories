import type { ImageProps } from "next/image";

export function getSupabaseBlurUrl(url: string | null | undefined, size = 20): string | undefined {
    if (!url) return undefined;
    if (!url.includes("supabase")) return undefined;

    try {
        const urlObj = new URL(url);
        urlObj.searchParams.set("width", size.toString());
        urlObj.searchParams.set("height", size.toString());
        urlObj.searchParams.set("resize", "cover");
        urlObj.searchParams.set("quality", "30");
        return urlObj.toString();
    } catch {
        return undefined;
    }
}

export const TINY_BLUR =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMCAxMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+";

export const heroSizes = "(max-width: 640px) 96px, (max-width: 768px) 112px, 128px";

export const gallerySizes = {
    thumbnail: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
    fullscreen: "100vw",
    polaroid: "(max-width: 640px) 80vw, 320px",
};

export type OptimizedImageProps = Omit<ImageProps, "placeholder" | "blurDataURL"> & {
    placeholder?: "blur" | "empty";
    blurDataURL?: string;
};