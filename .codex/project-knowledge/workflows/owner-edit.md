# Owner edit flow

Last Verified: 2026-09-30

## Routing and responsibilities

- `src/app/[slug]/edit/page.tsx` checks link access, fetches full link data, then sends `IDOL_NEW`, `WEDDING`, `TRAVEL`, and `FRIENDSHIP` to `EditPageClientV2`; other types use `EditPageClient`.
- `EditPageClientV2` uses `src/components/edit/templates/TemplateEditShell.tsx`, which reads per-type chrome and tabs from `edit-shell-config.ts`. Legacy edit code lives in `src/app/[slug]/edit/edit-client.tsx`.
- The public page chooses its template independently in `src/app/[slug]/page-client.tsx`; do not infer edit routing from public template names.

## Writes and data

- `src/app/actions/profile-actions.ts` validates owner access, merges incoming fields into `Link.profile_data`, and revalidates the public and edit routes. Profile shapes vary by `LinkType`.
- `updateLinkConfig()` writes `LinkConfig` through Prisma `upsert`.
- `src/app/actions/publish-actions.ts` manages the owner's publish switch and `LinkRevision` snapshots. Revisions capture `profile_data`; they are convenience history limited to 20, not a full audit log.
- `src/lib/auth.ts` verifies signed slug-specific cookies against the current active link. Server actions must enforce access themselves; middleware is only a route precheck.
- Timeline events are owned by `src/app/actions/timeline-actions.ts`, with a shared 20-event limit across edit managers. `TimelineManager` exposes `video_url` for YouTube links; the public IDOL template renders saved video links in its event detail and builds Fandom Quiz date questions from the saved timelines.

## Source entrypoints

`src/app/[slug]/edit/page.tsx`; `src/app/[slug]/edit/edit-client.tsx`; `src/app/[slug]/edit/edit-client-v2.tsx`; `src/components/edit/templates/TemplateEditShell.tsx`; `src/components/edit/templates/edit-shell-config.ts`; `src/app/actions/profile-actions.ts`; `src/app/actions/publish-actions.ts`; `src/lib/auth.ts`.
