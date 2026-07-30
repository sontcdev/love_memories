import { describe, expect, it } from "vitest";

import {
    GAME_REGISTRY,
    getDefaultGameTemplate,
    getGameVariant,
    getGameVariants,
    normalizeGameTemplate,
    type GameVariantId,
} from "@/components/templates/game-registry";

/**
 * The 10 LinkType values from prisma/schema.prisma. Hard-coded rather than
 * imported from @prisma/client so this stays a pure unit test with no generated
 * client in the loop — and so adding an enum value without a registry entry
 * fails here instead of at runtime in a template.
 */
const LINK_TYPES = [
    "LOVE",
    "LOVE2",
    "EVERY",
    "IDOL",
    "GRAD_PERSONAL",
    "GRAD_CLASS",
    "GRAD_GROUP",
    "WEDDING",
    "TRAVEL",
    "FRIENDSHIP",
] as const;

const VARIANT_IDS: GameVariantId[] = ["A", "B", "C"];

describe("GAME_REGISTRY", () => {
    it("covers every LinkType exactly once", () => {
        expect(Object.keys(GAME_REGISTRY).sort()).toEqual([...LINK_TYPES].sort());
    });

    it.each(LINK_TYPES)("%s declares exactly the A/B/C variants in order", (linkType) => {
        const variants = GAME_REGISTRY[linkType];
        expect(variants).toHaveLength(3);
        expect(variants.map((v) => v.id)).toEqual(VARIANT_IDS);
    });

    it.each(LINK_TYPES)("%s variants all carry a label and description", (linkType) => {
        for (const variant of GAME_REGISTRY[linkType]) {
            expect(variant.label.trim()).not.toBe("");
            expect(variant.description.trim()).not.toBe("");
        }
    });

    it.each(LINK_TYPES)("%s variants use only the documented status values", (linkType) => {
        for (const variant of GAME_REGISTRY[linkType]) {
            expect(["ready", "coming-soon"]).toContain(variant.status);
        }
    });

    it("gives each LinkType three distinct variant labels", () => {
        for (const linkType of LINK_TYPES) {
            const labels = GAME_REGISTRY[linkType].map((v) => v.label);
            expect(new Set(labels).size).toBe(labels.length);
        }
    });
});

describe("getGameVariants()", () => {
    it.each(LINK_TYPES)("returns the registry entry for %s", (linkType) => {
        expect(getGameVariants(linkType)).toBe(GAME_REGISTRY[linkType]);
    });

    it("falls back to EVERY for an unknown link type", () => {
        // Simulates a DB row written by a newer schema than this build.
        const unknown = "NOT_A_LINK_TYPE" as (typeof LINK_TYPES)[number];
        expect(getGameVariants(unknown)).toBe(GAME_REGISTRY.EVERY);
    });
});

describe("getGameVariant()", () => {
    it.each(VARIANT_IDS)("resolves variant %s for a known link type", (id) => {
        const variant = getGameVariant("LOVE", id);
        expect(variant.id).toBe(id);
        expect(variant).toBe(GAME_REGISTRY.LOVE.find((v) => v.id === id));
    });

    it("falls back to variant A when the id is not present", () => {
        const bogus = "Z" as GameVariantId;
        expect(getGameVariant("IDOL", bogus)).toBe(GAME_REGISTRY.IDOL[0]);
    });

    it("never returns undefined for any link type / id pair", () => {
        for (const linkType of LINK_TYPES) {
            for (const id of VARIANT_IDS) {
                expect(getGameVariant(linkType, id)).toBeDefined();
            }
        }
    });
});

describe("getDefaultGameTemplate()", () => {
    it("is variant A", () => {
        expect(getDefaultGameTemplate()).toBe("A");
    });
});

describe("normalizeGameTemplate()", () => {
    it.each(VARIANT_IDS)("passes through the valid id %s", (id) => {
        expect(normalizeGameTemplate(id)).toBe(id);
    });

    it.each([
        ["null", null],
        ["undefined", undefined],
        ["empty string", ""],
        ["lowercase a", "a"],
        ["out of range D", "D"],
        ["whitespace-padded A", " A "],
        ["numeric string", "0"],
    ])("coerces %s to the default variant", (_label, value) => {
        expect(normalizeGameTemplate(value)).toBe("A");
    });
});
