# IDOL public content flow

Last Verified: 2026-09-30 (source and test site)

## Route ownership in the current checkout

- `src/app/[slug]/page-client.tsx` routes `IDOL` to `src/components/templates/idol/IdolTemplateV2.tsx` and `IDOL_NEW` to `src/components/templates/idol-new/IdolNewTemplate.tsx`. The unsuffixed `idol/IdolTemplate.tsx` is present but not routed by this checkout.
- The current `IDOL` source is an ACT-style implementation. Its Act IV uses `IdolGameSection` for the default quiz and receives the timeline events; its letter UI uses `IdolLetterBox` without a recording control. These working-tree changes are not evidence that the test deployment has been updated.
- The edit route is selected independently: `src/app/[slug]/edit/page.tsx` sends `IDOL` to the legacy `edit-client.tsx` and `IDOL_NEW` to the V2 edit shell.

## Current source behavior

- `IdolTemplateV2` receives galleries, timelines, and letters from `page-client.tsx`. Its Act III renders `Timeline` records and plays a saved `video_url` through `VideoPlayer`.
- The legacy edit flow uses `TimelineManager` for IDOL events. `TimelineManager` exposes a YouTube/TikTok video URL. `src/app/actions/timeline-actions.ts` enforces a 20-event cap for new events and stores `video_url`. `CareerPathManager` is a separate event editor and is not mounted by the legacy IDOL edit page.
- Its Act IV renders `IdolGameSection`, whose quiz includes date questions generated from each valid timeline event and has no separate difficulty challenge. Act V renders `IdolLetterBox`, whose create form omits recording while preserving display of previously saved audio.
- The unsuffixed `idol/GameSection.tsx` and `idol/LetterBox.tsx` still implement the older dashboard quiz and recording form. They are not the current `IDOL` route in this checkout.

## Live verification boundary

The test site checked on 2026-09-30 showed the older pastel dashboard with five tabs, empty gallery and timeline, “Thử Thách Fandom” with Dễ/Trung bình/Khó, and a “Ghi âm (tùy chọn)” control in the letter form. This differs from the current checkout's `IDOL` route, so the test deployment is not evidence of the present V2 implementation. With no timeline records on that link, event-based quiz behavior cannot be runtime-verified there. The Figma section “IDOL · trang test thực tế · 2026-09-30” records these observed deployed states; ACT-style frames represent the current source target and require runtime verification after a future deployment.

## Source entrypoints

`src/app/[slug]/page-client.tsx`; `src/app/[slug]/edit/edit-client.tsx`; `src/components/templates/idol/IdolTemplate.tsx`; `src/components/templates/idol/GameSection.tsx`; `src/components/templates/idol/LetterBox.tsx`; `src/components/templates/idol/IdolTemplateV2.tsx`; `src/components/templates/idol/IdolGameSection.tsx`; `src/components/templates/idol/IdolLetterBox.tsx`; `src/components/edit/TimelineManager.tsx`; `src/app/actions/timeline-actions.ts`.
