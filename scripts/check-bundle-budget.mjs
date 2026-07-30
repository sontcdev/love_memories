#!/usr/bin/env node
/**
 * First Load JS budget check (UX roadmap E5).
 *
 * Reproduces the "First Load JS" column of `next build` by reading
 * `.next/app-build-manifest.json` — the authoritative list of client chunks the
 * browser must download before a route becomes interactive — and gzipping each
 * chunk exactly the way Next does when it prints the build summary.
 *
 * Verified against `next build` output for this repo: /[slug] 114 kB,
 * /[slug]/edit 362 kB, /admin/links 287 kB.
 *
 * Usage:
 *   npm run budget            # check the budgeted routes, exit 1 on regression
 *   npm run budget -- --all   # also list routes that have no budget yet
 *   npm run budget -- --json  # machine-readable output for CI annotations
 *
 * This is a .mjs file on purpose: tsconfig.json excludes scripts/ from
 * typechecking, so nothing here may rely on TS.
 */

import { gzipSync } from "node:zlib";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const NEXT_DIR = path.resolve(process.cwd(), ".next");
const APP_BUILD_MANIFEST = path.join(NEXT_DIR, "app-build-manifest.json");
const APP_PATH_ROUTES_MANIFEST = path.join(NEXT_DIR, "app-path-routes-manifest.json");

/**
 * Budgets in kB (1 kB = 1000 B, matching the `next build` summary).
 *
 * Each value is the measured First Load JS at the time the budget was written,
 * plus ~10% headroom. Raising a number here should be a deliberate, reviewed
 * act — that is the whole point of the file.
 */
const BUDGETS_KB = {
    // measured 114.4 kB — after code-splitting templates/lock screens by LinkType
    "/[slug]": 126,
    // measured 231.1 kB — the route was rolled back to the deploy edit client, which
    // statically imports every panel and per-type profile form (no code splitting).
    // That is deploy's own cost and must not be "optimised" away: doing so would
    // break byte-parity with deploy. The split implementation still exists as
    // TemplateEditShell + the *V2 forms, used by WEDDING/TRAVEL/FRIENDSHIP; it
    // measured 117.3 kB when it served all 10 LinkTypes.
    "/[slug]/edit": 245,
    // measured 167.6 kB — bulk actions and management UI added, crypto shim removed
    "/admin/links": 185,
    // measured 108.7 kB
    "/admin/game-cards": 120,
    // measured 100.6 kB — was 231 kB before the crypto shim was removed
    "/admin/login": 111,
};

const args = process.argv.slice(2);
const SHOW_ALL = args.includes("--all");
const AS_JSON = args.includes("--json");

/** 1 kB = 1000 B, the unit `next build` prints. */
const toKB = (bytes) => bytes / 1000;
const fmtKB = (bytes) => `${toKB(bytes).toFixed(1)} kB`;

function fail(message, hint) {
    console.error(`\n✗ ${message}`);
    if (hint) console.error(`  ${hint}`);
    console.error("");
    process.exit(1);
}

function readJson(file, label) {
    try {
        return JSON.parse(readFileSync(file, "utf8"));
    } catch (err) {
        if (err.code === "ENOENT") {
            fail(`Missing ${label} at ${path.relative(process.cwd(), file)}`, "Run `npm run build` first.");
        }
        fail(`Could not parse ${label}: ${err.message}`);
    }
}

/** Gzipped size of one chunk, cached so shared chunks are compressed once. */
const gzipCache = new Map();
function gzipSizeOf(relFile) {
    if (gzipCache.has(relFile)) return gzipCache.get(relFile);

    const abs = path.join(NEXT_DIR, relFile);
    let size;
    try {
        // level 9 + the raw buffer is what Next's own build reporter measures.
        size = gzipSync(readFileSync(abs), { level: 9 }).length;
    } catch (err) {
        fail(
            `Chunk referenced by the build manifest is missing: ${relFile}`,
            `(${err.code ?? err.message}) The .next/ directory looks stale — re-run \`npm run build\`.`
        );
    }
    gzipCache.set(relFile, size);
    return size;
}

/**
 * First Load JS for one app-build-manifest entry: the gzipped total of its
 * unique .js chunks. CSS is excluded, as in the `next build` summary.
 */
function firstLoadJsBytes(chunks) {
    const files = [...new Set(chunks)].filter((f) => f.endsWith(".js"));
    return {
        bytes: files.reduce((total, f) => total + gzipSizeOf(f), 0),
        chunkCount: files.length,
    };
}

function main() {
    try {
        statSync(NEXT_DIR);
    } catch {
        fail("No .next/ directory found.", "Run `npm run build` first.");
    }

    const appBuildManifest = readJson(APP_BUILD_MANIFEST, "app-build-manifest.json");
    const pathRoutes = readJson(APP_PATH_ROUTES_MANIFEST, "app-path-routes-manifest.json");

    // Manifest keys are internal ("/[slug]/edit/page"); budgets use the public
    // route ("/[slug]/edit"). app-path-routes-manifest.json is that mapping.
    const routeToManifestKey = new Map();
    for (const [manifestKey, route] of Object.entries(pathRoutes)) {
        if (manifestKey in appBuildManifest.pages) routeToManifestKey.set(route, manifestKey);
    }

    const rows = [];
    const unbudgeted = [];

    for (const [route, budgetKB] of Object.entries(BUDGETS_KB)) {
        const manifestKey = routeToManifestKey.get(route);
        if (!manifestKey) {
            fail(
                `Budgeted route ${route} is not in the build manifest.`,
                "It was renamed or removed — update BUDGETS_KB in scripts/check-bundle-budget.mjs."
            );
        }

        const { bytes, chunkCount } = firstLoadJsBytes(appBuildManifest.pages[manifestKey]);
        const budgetBytes = budgetKB * 1000;
        rows.push({
            route,
            chunkCount,
            actualBytes: bytes,
            budgetBytes,
            overBytes: bytes - budgetBytes,
            usedPct: (bytes / budgetBytes) * 100,
            ok: bytes <= budgetBytes,
        });
    }

    for (const [route, manifestKey] of routeToManifestKey) {
        if (route in BUDGETS_KB) continue;
        const { bytes } = firstLoadJsBytes(appBuildManifest.pages[manifestKey]);
        unbudgeted.push({ route, actualBytes: bytes });
    }
    unbudgeted.sort((a, b) => b.actualBytes - a.actualBytes);

    if (AS_JSON) {
        console.log(
            JSON.stringify(
                {
                    ok: rows.every((r) => r.ok),
                    routes: rows.map((r) => ({
                        route: r.route,
                        firstLoadKB: Number(toKB(r.actualBytes).toFixed(1)),
                        budgetKB: Number(toKB(r.budgetBytes).toFixed(1)),
                        usedPct: Number(r.usedPct.toFixed(1)),
                        ok: r.ok,
                    })),
                    unbudgeted: unbudgeted.map((r) => ({
                        route: r.route,
                        firstLoadKB: Number(toKB(r.actualBytes).toFixed(1)),
                    })),
                },
                null,
                2
            )
        );
        process.exit(rows.every((r) => r.ok) ? 0 : 1);
    }

    printTable(rows, unbudgeted);

    const failures = rows.filter((r) => !r.ok);
    if (failures.length > 0) {
        console.error(
            `✗ First Load JS budget exceeded on ${failures.length} route${failures.length > 1 ? "s" : ""}:`
        );
        for (const r of failures) {
            console.error(
                `  ${r.route} is ${fmtKB(r.overBytes)} over its ${fmtKB(r.budgetBytes)} budget ` +
                `(now ${fmtKB(r.actualBytes)}).`
            );
        }
        console.error(
            "\n  Shrink the route (dynamic import, drop a dependency) or, if the growth is\n" +
            "  intentional, raise the number in scripts/check-bundle-budget.mjs and say why\n" +
            "  in the commit message.\n"
        );
        process.exit(1);
    }

    console.log(`✓ All ${rows.length} budgeted routes are within their First Load JS budget.\n`);
}

function printTable(rows, unbudgeted) {
    const header = ["Route", "First Load JS", "Budget", "Used", "Status"];
    const body = rows.map((r) => [
        r.route,
        fmtKB(r.actualBytes),
        fmtKB(r.budgetBytes),
        `${r.usedPct.toFixed(0)}%`,
        r.ok ? "OK" : `OVER by ${fmtKB(r.overBytes)}`,
    ]);

    const widths = header.map((h, i) =>
        Math.max(h.length, ...body.map((row) => row[i].length))
    );
    const line = (cells, pad = " ") =>
        cells.map((c, i) => c.padEnd(widths[i], pad)).join(pad === "-" ? "-+-" : " | ");

    console.log("\nFirst Load JS budget — gzipped, from .next/app-build-manifest.json\n");
    console.log(`  ${line(header)}`);
    console.log(`  ${line(widths.map(() => ""), "-")}`);
    for (const row of body) console.log(`  ${line(row)}`);
    console.log("");

    if (SHOW_ALL && unbudgeted.length > 0) {
        console.log("  Routes without a budget:");
        for (const r of unbudgeted) {
            console.log(`    ${r.route.padEnd(24)} ${fmtKB(r.actualBytes)}`);
        }
        console.log("");
    } else if (unbudgeted.length > 0) {
        console.log(`  (${unbudgeted.length} route(s) have no budget — run with --all to list them.)\n`);
    }
}

main();
