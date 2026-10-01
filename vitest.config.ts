import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Vitest is kept in its own config rather than folded into next.config.mjs:
 * Next never reads this file, and Vitest needs the React plugin + jsdom that
 * the Next build would otherwise ignore.
 */
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            // Must stay in sync with the `@/*` -> `./src/*` path in tsconfig.json.
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./tests/setup.ts"],
        include: ["tests/**/*.{test,spec}.{ts,tsx}", "src/**/*.{test,spec}.{ts,tsx}"],
        // `.next/` contains generated copies of app code; without this exclusion
        // Vitest would try to collect tests out of the build output.
        exclude: [
            "**/node_modules/**",
            "**/.next/**",
            "**/dist/**",
            "**/build/**",
            "**/coverage/**",
        ],
        // Tailwind is never asserted on at runtime — only class strings are.
        css: false,
        restoreMocks: true,
        clearMocks: true,
    },
});
