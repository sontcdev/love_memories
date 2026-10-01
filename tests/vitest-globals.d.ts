/**
 * `globals: true` is enabled in vitest.config.ts, so `describe`/`it`/`expect`
 * exist at runtime without an import. This reference makes them exist for
 * `tsc --noEmit` too. Existing tests still import them explicitly, which is
 * clearer; this only keeps the implicit form from being a type error.
 */
/// <reference types="vitest/globals" />
