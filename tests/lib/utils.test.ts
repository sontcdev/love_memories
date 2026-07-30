import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";
import { generatePin, generateSessionToken, generateSlug } from "@/lib/tokens";

describe("cn()", () => {
    it("joins plain class strings", () => {
        expect(cn("flex", "items-center")).toBe("flex items-center");
    });

    it("drops falsy values instead of emitting 'false'/'undefined'", () => {
        expect(cn("flex", false, undefined, null, "", "gap-2")).toBe("flex gap-2");
    });

    it("flattens arrays and conditional objects (clsx behaviour)", () => {
        expect(cn(["flex", "gap-2"], { hidden: false, "sr-only": true })).toBe("flex gap-2 sr-only");
    });

    it("lets a later Tailwind class win over an earlier one in the same group", () => {
        // This is the whole reason cn() exists: variant classes come first and
        // the caller's `className` must be able to override them.
        expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
        expect(cn("text-slate-700", "text-emerald-700")).toBe("text-emerald-700");
    });

    it("keeps classes from different groups side by side", () => {
        expect(cn("px-2", "py-4")).toBe("px-2 py-4");
    });

    it("does not let an unrelated prefix collapse a conflicting-looking class", () => {
        // `dark:bg-*` and `bg-*` are separate groups — both must survive, since
        // every ui primitive in this project ships a light + dark pair.
        expect(cn("bg-white dark:bg-slate-900")).toBe("bg-white dark:bg-slate-900");
    });

    it("resolves conflicts within the same responsive/dark variant only", () => {
        expect(cn("dark:bg-slate-900", "dark:bg-emerald-950")).toBe("dark:bg-emerald-950");
        expect(cn("bg-white", "dark:bg-emerald-950")).toBe("bg-white dark:bg-emerald-950");
    });

    it("returns an empty string with no input", () => {
        expect(cn()).toBe("");
    });
});

describe("generateSlug()", () => {
    it("defaults to 8 lowercase hex characters", () => {
        const slug = generateSlug();
        expect(slug).toHaveLength(8);
        expect(slug).toMatch(/^[0-9a-f]{8}$/);
    });

    it("honours a requested length, including odd lengths", () => {
        // randomBytes(ceil(len/2)) produces 2 hex chars per byte, so odd lengths
        // must be truncated rather than rounded up.
        expect(generateSlug(4)).toHaveLength(4);
        expect(generateSlug(5)).toHaveLength(5);
        expect(generateSlug(16)).toHaveLength(16);
    });

    it("does not repeat across calls", () => {
        const slugs = new Set(Array.from({ length: 200 }, () => generateSlug()));
        expect(slugs.size).toBe(200);
    });
});

describe("generatePin()", () => {
    it("always returns exactly 6 digits", () => {
        for (let i = 0; i < 500; i++) {
            const pin = generatePin();
            expect(pin).toMatch(/^\d{6}$/);
            // Never a leading zero, so the PIN cannot silently shrink to 5 chars.
            expect(Number(pin)).toBeGreaterThanOrEqual(100000);
            expect(Number(pin)).toBeLessThanOrEqual(999999);
        }
    });
});

describe("generateSessionToken()", () => {
    it("returns 64 hex characters (32 bytes of entropy)", () => {
        const token = generateSessionToken();
        expect(token).toMatch(/^[0-9a-f]{64}$/);
    });

    it("does not repeat across calls", () => {
        expect(generateSessionToken()).not.toBe(generateSessionToken());
    });
});
