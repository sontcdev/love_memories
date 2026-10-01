# Public page, PIN, and publish flow

Last Verified: 2026-10-01

## Trigger and flow

1. `src/app/[slug]/page.tsx` reads `session_{slug}`. An authenticated visitor gets `getLinkData()` and the full page; otherwise `getLinkPublicData()` supplies lock-screen data.
2. `src/app/[slug]/page-client.tsx` selects the lock screen and public template by `Link.type`. Templates are dynamically imported. `EVERY` reuses LOVE's public template.
3. `verifyLinkPassword()` in `src/app/actions/auth-actions.ts` checks the six-digit PIN against `User.password_hash` and sets `session_{slug}` and `access_token_{slug}`. The token is signed for the slug and link ID by `src/lib/auth.ts`.
4. After unlock, `SlugPageClient` fetches full link data. Owner edits use `verifyAccess()` or `verifySession()` in server code; middleware only checks cookie presence before redirecting protected routes.

## Visibility invariants

- `Link.is_active` is the admin control; inactive links are unavailable. `Link.is_published` is the owner's control for unauthenticated viewers. An authenticated owner can still view a draft.
- `page.tsx` reads publish state separately from `getLinkPublicData()` and shows a coming-soon screen for an unpublished page. `generateMetadata()` marks such a page `noindex`.
- `setPublishState()` in `src/app/actions/publish-actions.ts` checks owner access, writes only publish fields, and revalidates public and edit routes. `published_at` is set on publishing.
- `getPublishState()` currently falls back to published state if its query fails. Preserve or explicitly revisit this behavior during visibility changes.

## Public domains

- Production uses `https://memora.io.vn` and `https://www.memora.io.vn`, both on `love-memories-8espn675l-soncodekhongbugs-projects.vercel.app` (production target). On 2026-10-01, the test alias was found incorrectly pointing to that same deployment and was restored to `love-memories-g7dwrxkcn-soncodekhongbugs-projects.vercel.app` (Ready Preview, with the `deploy-test` branch alias). Production aliases were unchanged.
- Runtime verification after restoration: `/59c00aed` returns HTTP 200 on test and HTTP 404 on production; the test page assets reference `llgblesxzhhmbfvfcfzr.supabase.co`. Production database verification independently identified project `exqjkvxbsgbdgbrrulhq`. Preview `deploy-test` has branch-scoped database and Storage variables; never infer their values from the hidden Secret display.
- After every test deployment, explicitly assign `test.memora.io.vn` to the new verified `deploy-test` Preview deployment. Assigning it to a production deployment also gives test the production deployment environment snapshot.
- DNS remains managed at Tino. Deployment aliases can change; verify Vercel aliases before comparing environments.
- Existing slug paths are retained on the new production domains. Cookies are domain-scoped, so visitors must unlock or sign in again after switching domains.

## Production database schema verification

- On 2026-10-01, production schema was synchronized with `prisma/schema.prisma`: `link_configs.game_template`, `link_revisions`, `travel_unspoken_answers`, and the missing `LinkType` values (`IDOL_NEW`, `WEDDING`, `TRAVEL`, `FRIENDSHIP`, `BABY`, `FAMILY`). The two new tables have RLS enabled; server-side Prisma uses the database role.
- Production Vercel `DIRECT_URL` was added as a secret after verifying the Session pooler connection. Existing deployments retain their environment snapshot; future builds receive this variable. Runtime `DATABASE_URL` was retained.
- Before schema changes, all existing public tables were exported into a gitignored private backup. Verification confirmed all 9 production links and existing table data were preserved. Full public-link queries, admin session queries, revision counts, and travel-answer counts passed.
- Never seed production from test to repair missing schema. Compare schema and runtime queries independently from customer content.

## Source entrypoints

`src/app/[slug]/page.tsx`; `src/app/[slug]/page-client.tsx`; `src/app/actions/auth-actions.ts`; `src/app/actions/publish-actions.ts`; `src/lib/auth.ts`; `src/middleware.ts`; `prisma/schema.prisma`.
