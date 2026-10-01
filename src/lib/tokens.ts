import { randomBytes } from "crypto";

/**
 * Credential and identifier generation. SERVER ONLY.
 *
 * These used to live in `src/lib/utils.ts` next to `cn()`. That was a costly
 * mistake: `cn()` is imported by every UI primitive, and the module-scope
 * `import { randomBytes } from "crypto"` meant webpack bundled a Node crypto
 * shim (~90 kB gzipped) into the client bundle of every route that rendered one
 * of those components. Keeping them in a separate module lets `cn()` stay
 * dependency-light.
 *
 * Do not import this file from a client component.
 */

export function generateSlug(length: number = 8): string {
    return randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length);
}

/**
 * 6-digit PIN handed to a page owner.
 *
 * Uses `Math.random`, which is NOT cryptographically secure. That is tolerable
 * only because the PIN is a low-value share gate, it is bcrypt-hashed at rest,
 * and it is delivered out of band by an admin. Do not reuse this for anything
 * that guards real secrets — use `generateSessionToken` instead.
 */
export function generatePin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateSessionToken(): string {
    return randomBytes(32).toString("hex");
}
