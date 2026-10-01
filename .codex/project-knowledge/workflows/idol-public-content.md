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
- Section navigation is an in-page menu above the content, with three columns on phones and five at `sm` and wider widths. Its visible labels are Giới thiệu, Khoảnh Khắc, Sự Nghiệp, Fandom Quiz, and Gửi Idol; buttons no longer display ACT numbers. Selecting a section switches content and scrolls to the page top. The menu occupies layout space and scrolls with the page.
- The compose form uses the shared Radix Dialog portal, above the template's fixed controls. Its height is capped at `min(80dvh, 640px)`; only the fields scroll, while the header and Cancel/Send footer remain visible. Opening it does not autofocus an input. The portal copies the template accent from its trigger.
- Compose inputs and textareas use 16px text. Reply textareas use 16px on phones to prevent iOS Safari focus zoom without disabling user zoom.
- The gallery viewer preserves the full image with `object-contain`, uses a `min(65dvh, 720px)` image area with 4px padding, and caps the modal at `90dvh`.
- The unsuffixed `idol/GameSection.tsx` and `idol/LetterBox.tsx` still implement the older dashboard quiz and recording form. They are not the current `IDOL` route in this checkout.

## Live verification boundary

The screenshot's concert page is `/59c00aed` (`IDOL`); `/2570d319` is `IDOL_NEW`. On 2026-10-01, the updated in-page menu was checked locally at 320, 390, 768, and 1440px widths, with five descriptive labels and no horizontal overflow. All five section switches were checked. Editable mobile Figma frame `58:2` was updated and screenshot-verified. Event-based quiz behavior requires timeline records and was not checked in this navigation fix.

## Source entrypoints

The compact compose form was checked locally at 320, 390, 768, and 1440px widths; the portrait viewer was checked at 390px. Editable Figma frames `59:104` (compose) and `59:129` (photo viewer) were synchronized and screenshot-verified. Native iPhone keyboard behavior was not tested; the 16px input rule was verified in the browser.

`src/app/[slug]/page-client.tsx`; `src/app/[slug]/edit/edit-client.tsx`; `src/components/templates/idol/IdolTemplate.tsx`; `src/components/templates/idol/GameSection.tsx`; `src/components/templates/idol/LetterBox.tsx`; `src/components/templates/idol/IdolTemplateV2.tsx`; `src/components/templates/idol/IdolGameSection.tsx`; `src/components/templates/idol/IdolLetterBox.tsx`; `src/components/edit/TimelineManager.tsx`; `src/app/actions/timeline-actions.ts`.
