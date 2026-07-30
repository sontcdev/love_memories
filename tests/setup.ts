/**
 * Global test setup, referenced by `setupFiles` in vitest.config.ts.
 *
 * `@testing-library/jest-dom/vitest` (rather than the bare package entry) is the
 * Vitest-specific entry point: it calls `expect.extend()` on Vitest's `expect`
 * and augments the `vitest` module so matchers like `toBeInTheDocument()` are
 * typed as well as registered.
 */
import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Unmount anything rendered by a test. Toast tests in particular leave a
// provider mounted with live timers, which would leak into the next test.
afterEach(() => {
    cleanup();
});
