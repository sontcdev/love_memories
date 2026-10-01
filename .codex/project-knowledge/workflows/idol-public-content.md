# IDOL public content flow

Last Verified: 2026-10-01 (source and test site)

## Route ownership in the current checkout

- `src/app/[slug]/page-client.tsx` routes `IDOL` to `src/components/templates/idol/IdolTemplateV2.tsx` and `IDOL_NEW` to `src/components/templates/idol-new/IdolNewTemplate.tsx`. The unsuffixed `idol/IdolTemplate.tsx` is present but not routed by this checkout.
- The current `IDOL` source is an ACT-style implementation. Its Act IV uses `IdolGameSection` for the default quiz and receives the timeline events; its letter UI uses `IdolLetterBox` without a recording control.
- The edit route is selected independently: `src/app/[slug]/edit/page.tsx` sends `IDOL` to the legacy `edit-client.tsx` and `IDOL_NEW` to the V2 edit shell.

## Current source behavior

- `IdolTemplateV2` receives galleries, timelines, and letters from `page-client.tsx`. Its Act III renders `Timeline` records and plays a saved `video_url` through `VideoPlayer`.
- The legacy edit flow uses `TimelineManager` for IDOL events. `TimelineManager` exposes a YouTube/TikTok video URL. `src/app/actions/timeline-actions.ts` enforces a 20-event cap for new events and stores `video_url`. `CareerPathManager` is a separate event editor and is not mounted by the legacy IDOL edit page.
- Its Act IV renders `IdolGameSection`, whose quiz includes date questions generated from each valid timeline event and has no separate difficulty challenge. Act V renders `IdolLetterBox`, whose create form omits recording while preserving display of previously saved audio.
- On phones, the fixed ACT navigation spans the available width. When music is configured, it sits above the fixed music controls so Act V remains visible and tappable; without music, it stays at the bottom. At `sm` and wider widths, the navigation stays centered at the bottom.
- The unsuffixed `idol/GameSection.tsx` and `idol/LetterBox.tsx` still implement the older dashboard quiz and recording form. They are not the current `IDOL` route in this checkout.

## Live verification boundary

The test page `/2570d319` now serves the ACT-style IDOL UI. Its mobile screenshot on 2026-10-01 showed the bottom music controls covering Act V. The source change above addresses that overlap; runtime verification of the updated deployment remains required. Event-based quiz behavior requires timeline records and has not been verified on this link.

## Source entrypoints

`src/app/[slug]/page-client.tsx`; `src/app/[slug]/edit/edit-client.tsx`; `src/components/templates/idol/IdolTemplate.tsx`; `src/components/templates/idol/GameSection.tsx`; `src/components/templates/idol/LetterBox.tsx`; `src/components/templates/idol/IdolTemplateV2.tsx`; `src/components/templates/idol/IdolGameSection.tsx`; `src/components/templates/idol/IdolLetterBox.tsx`; `src/components/edit/TimelineManager.tsx`; `src/app/actions/timeline-actions.ts`.
