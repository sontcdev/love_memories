# Project knowledge — love_memories

Last Verified: 2026-09-30

This directory is a retrieval map for future source work. Search by workflow or class, then verify every relevant claim against current source before editing. The code and Prisma schema remain authoritative. No customer data, credentials, or environment values belong here.

## Workflows

- [Public page, PIN, and publish flow](workflows/public-page-access.md) — `/{slug}`, lock screen, access cookies, publish and admin state.
- [Owner edit flow](workflows/owner-edit.md) — edit routing, profile/config writes, and revisions.
- [IDOL public content flow](workflows/idol-public-content.md) — timeline events, Fandom Quiz, ACT navigation, and fan letters.

## Systems

- [Link](systems/Link.md) — core persistent entity, ownership, content, and visibility flags.

## Source map

- Routes: `src/app/[slug]/page.tsx`, `page-client.tsx`, `edit/page.tsx`; admin routes under `src/app/admin/`.
- Server actions: `src/app/actions/`; access contract: `src/lib/auth.ts`; route precheck: `src/middleware.ts`.
- Public templates: `src/components/templates/`; edit UI: `src/components/edit/`.
- Database: `prisma/schema.prisma`, `src/lib/prisma.ts`; storage: `src/lib/supabase.ts` and `src/app/api/upload/route.ts`.
- Tests: `tests/` and co-located `*.test.ts(x)` under `src/`.

The current `LinkType` enum has 13 values, including `IDOL_NEW`, `BABY`, and `FAMILY`. Template routing is decided in `page-client.tsx`; edit routing is decided separately in `edit/page.tsx`. Check those files when older docs disagree.
