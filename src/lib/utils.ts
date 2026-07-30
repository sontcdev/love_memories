import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind-aware class merger used by every UI component.
 *
 * Keep this module free of Node built-ins and heavy dependencies. The
 * credential helpers that used to live here imported `crypto`, which dragged a
 * ~90 kB browser shim into any route rendering a component that calls `cn()`.
 * They now live in `src/lib/tokens.ts`.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
