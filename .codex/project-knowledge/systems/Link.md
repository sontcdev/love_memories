# Link

Last Verified: 2026-09-30

Source: `prisma/schema.prisma` (`model Link`); access: `src/lib/auth.ts`; public route: `src/app/[slug]/page.tsx`.

`Link` is the central page record. It owns a unique `slug`, a `LinkType`, template-dependent JSON `profile_data`, and a one-to-one `User`. Related content includes `LinkConfig`, galleries, timelines, letters, quiz votes, travel answers, and `LinkRevision` snapshots. Deleting a link cascades to those relationships as defined by the schema.

`is_active` is controlled by admin operations; `is_published` is controlled by the page owner. Both must permit access for an unauthenticated public view. An active owner may still view an unpublished draft after PIN verification. `is_favorite` and `tags` organize links and do not control visibility.

The enum currently contains `LOVE`, `LOVE2`, `EVERY`, `IDOL`, `IDOL_NEW`, `GRAD_PERSONAL`, `GRAD_CLASS`, `GRAD_GROUP`, `WEDDING`, `TRAVEL`, `FRIENDSHIP`, `BABY`, and `FAMILY`. Recheck the enum and both routing switches before changing a template or editor.
