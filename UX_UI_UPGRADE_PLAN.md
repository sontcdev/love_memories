# UX/UI Workflow Upgrade — All 10 Templates

## Context

The app has grown to 10 `LinkType` templates with two parallel systems: a duplicated-by-design public template layer (`src/components/templates/{type}/`) and an edit workflow layer (`src/components/edit/templates/{type}/`) that's *already* mostly shared under the hood via `shared.tsx` but still has 10 near-identical wrapper files. Research (two Explore passes + file verification) surfaced live UX bugs (a broken music promise, a no-op popup handler), a discoverability gap (dark mode exists everywhere but is only reachable in one template), an accessibility regression (pinch-zoom disabled site-wide), and a large duplication that's safe to consolidate (the 10 `*EditClient.tsx` skeletons). This plan fixes the bugs first, then closes the discoverability gap, then consolidates the edit-shell duplication — in that order, since each phase is small, independently shippable, and de-risks the next.

Out of scope: collapsing the public `Template.tsx` files into a shared base (intentional duplication per project convention), any new visitor-facing features, and a visitor-facing game-variant picker (variant selection is owner-controlled by design).

## Phase 0 — Quick-win fixes (do first, one pass)

1. **`WeddingLetterBox` no-op popup handler** — `src/components/templates/wedding/WeddingTemplate.tsx` passes `onPopupOpenChange={() => {}}`. Add local `isPopupOpen` state (mirror `LoveTemplate.tsx`'s pattern) and use it to suppress the floating edit-button while the letter popup is open, matching Love's behavior.
2. **Delete confirmed dead code**: `src/components/templates/grad-group/GradGroupGameSection.tsx`, `GradGroupLetterBox.tsx` (unused — real template imports unprefixed `./GameSection`/`./LetterBox`), `src/components/shared/CardDrawGame.tsx` (self-referential only). Grep first to confirm zero external references.
3. **Re-enable pinch-zoom**: `src/app/layout.tsx` (~lines 127-131) — remove `maximumScale: 1, userScalable: false` from the `viewport` export. One-line, fixes WCAG 1.4.4 for all 10 templates at once.
4. **AGENTS.md doc-drift**: correct the "Edit Page" section (edit-client.tsx is a thin dispatcher, not a themed-layout applier) and remove the reference to the nonexistent `src/components/auth/LockScreen.tsx` (real file is `PinLockController.tsx`).

## Phase 1 — Fix the WelcomeOverlay / MusicPlayer broken promise

`src/app/[slug]/page-client.tsx` (~lines 221-228) has `<MusicPlayer>` commented out ("temporarily disabled — YouTube/TikTok playback issue"), but `handleWelcomeOpen` still calls `musicPlayerRef.current?.play()` when `linkData.config?.auto_play` is set, and `WelcomeOverlay.tsx` copy across all branches promises music will play. Net effect: every visitor is told music will play and it never does.

**Recommendation: restore `MusicPlayer`, don't rewrite the copy.** `MusicPlayer.tsx` is described as a sound, well-factored component — the disabling comment names a specific playback issue, not a design flaw, so the fix is scoped to one component rather than rewriting Vietnamese copy across 7 `WelcomeOverlay` branches.

Steps:
1. Re-enable the commented block in `page-client.tsx` in a dev branch; test both YouTube and TikTok sources through the real flow (WelcomeOverlay → dismiss → autoplay).
2. Check likely causes before restructuring anything: browser autoplay policy (tie `play()` to the same user gesture that dismisses `WelcomeOverlay`, not a later effect), and a mount/unmount race between `WelcomeOverlay` unmounting and `Template` mounting.
3. If one source (e.g., TikTok) has a genuine platform autoplay limitation, degrade gracefully for that source only (tap-to-play) rather than disabling the whole feature.
4. Only fall back to rewriting `WelcomeOverlay` copy if restoration proves infeasible.

## Phase 2 — Make dark/light mode reachable on all templates

Dark mode mechanics already exist everywhere via `src/components/theme/ThemeWrapper.tsx` (listens for a `theme-change` `CustomEvent`, toggles `.dark` on `<html>`, persists `theme_mode_${slug}` in localStorage), but only `GradGroupTemplate.tsx` exposes a visible toggle (Sun/Moon button + `handleThemeToggle`, confirmed at its lines ~72-142). The other 9 templates support dark mode but visitors have no way to turn it on.

1. Extract a shared `src/components/theme/ThemeToggleButton.tsx` (icon-swap button, `className` for per-template chrome) and a `useThemeToggle(slug)` hook that owns the `isDark` state, localStorage read/write, and `theme-change` dispatch — generalizing `GradGroupTemplate.tsx`'s existing inline logic exactly, so `ThemeWrapper`'s listener keeps working unchanged.
2. Refactor `GradGroupTemplate.tsx` to consume the new hook/button instead of its inline copy (dogfooding, removes duplication).
3. Mount `<ThemeToggleButton>` in the other 9 public templates (`love`, `love2`, `idol`, `grad-personal`, `grad-class`, `wedding`, `travel`, `friendship` — EVERY reuses `LoveTemplate` so it's covered by Love's change), each choosing its own placement/styling per its existing cosmetic conventions.
4. Spot-check each template's dark-mode Tailwind variants in `npm run dev` once the toggle is reachable — some may have gaps never previously visible.

## Phase 3 — Consolidate the 10 `*EditClient.tsx` skeletons

`src/components/edit/templates/{type}/*EditClient.tsx` (10 files, ~80-90 lines each) are structurally identical: `useTemplateEditState()` (from `shared.tsx`) → header (`EditBackLink` + title + `ViewPageLink` + optional `ThemeModeButton`) → tab nav via `tabsOf([...])` → `<EditFormContent activeTab=.../>`. They differ only in Tailwind classes and the tab-list array — unlike the public templates, this duplication has no design rationale (the real logic already lives centrally in `shared.tsx`).

1. Add `src/components/edit/templates/edit-shell-config.ts`: `Record<LinkType, { title, tabs, themeClasses, showThemeModeButton? }>`, following the same shape convention as the existing `capabilities.ts`. Populate by extracting what currently varies per file (tab arrays, header colors/fonts).
2. Add `src/components/edit/templates/TemplateEditShell.tsx`: one component that calls `useTemplateEditState()`, renders the header/tabs/`EditFormContent` using the config lookup — literally today's per-file body, generalized.
3. Update `src/app/[slug]/edit/edit-client.tsx` to render `<TemplateEditShell linkType={linkData.type} .../>` instead of switching across 10 components.
4. Visually verify parity per LinkType in `npm run dev`, then delete the 10 old `*EditClient.tsx` files.
5. `shared.tsx` and `capabilities.ts`/`TemplateFeaturePanel.tsx` stay as-is — `TemplateEditShell` is purely a consumer.

## Phase 4 — Opportunistic follow-ups (bundle into Phase 3's PR or backlog)

- **`TravelTemplate`'s extra `isAuthenticated` prop** (`page-client.tsx` line 198, confirmed unique among the 10 `renderTemplate()` branches) — check `TravelTemplate.tsx`'s usage; keep with a comment if genuinely needed, otherwise drop for a consistent prop contract.
- **`src/components/edit/index.ts` barrel** — add missing re-exports (`EditGradProfileForm`, `EditGradGroupProfileForm`, `EditWeddingProfileForm`, `EditTravelProfileForm`, `EditFriendshipProfileForm`) for import-path consistency.
- **Wedding's triple-redundant nav** (desktop dots + prev/next row + mobile tab bar simultaneously) — simplify to two modes. Wedding-specific, don't let it motivate touching other templates.
- Backlog only (not this pass): `EditProfileForm.tsx`'s per-type form size variance (143-1038 lines) — genuinely different data models, needs its own investigation into a shared field-building abstraction.

## Verification

No test suite exists. For each phase: `npm run build` (typecheck + build) then `npm run dev` and manually click through affected templates. Specifically verify:
- Phase 0: Wedding letter popup suppresses the edit button; pinch-zoom works on mobile viewport; app still builds after dead-file removal.
- Phase 1: music actually plays after WelcomeOverlay dismissal for both YouTube and TikTok sources, across at least one LinkType with `auto_play` on and one with it off.
- Phase 2: toggle appears and persists (`theme_mode_${slug}` in localStorage) correctly across all 10 rendered types, including reload-persistence.
- Phase 3: for every LinkType, edit page header/tabs/forms render identically to pre-refactor (tab order, labels, dark-mode toggle) before deleting old files.

## Status

- [x] Phase 0.2 — dead code deleted (`GradGroupGameSection.tsx`, `GradGroupLetterBox.tsx`, `CardDrawGame.tsx`)
- [x] Phase 0.3 — pinch-zoom re-enabled in `src/app/layout.tsx`
- [x] Phase 0.1 — WeddingLetterBox `isPopupOpen` wiring
- [x] Phase 0.4 — AGENTS.md doc-drift fix
- [x] Phase 1 — MusicPlayer restoration
- [x] Phase 2 — shared `useThemeToggle` + `ThemeToggleButton` extracted and adopted by all
  dark-capable templates. The 4 that were blocked are now resolved — see below.
- [x] Phase 3 — EditClient consolidation (10 files → 1 shell + config)
- [x] Phase 4 — opportunistic follow-ups

### Phase 2 correction

The plan's premise was wrong. It assumed "the other 9 templates support dark mode but
visitors have no way to turn it on". Measured reality:

| Template | dark styling | had visible toggle |
|---|---|---|
| `LOVE2`, `IDOL`, `GRAD_PERSONAL`, `GRAD_CLASS`, `GRAD_GROUP` | yes (29–65 `isDark` refs each) | **yes, already** |
| `LOVE`/`EVERY`, `WEDDING`, `TRAVEL`, `FRIENDSHIP` | **none** (0 `isDark`, 0 `dark:`) | no |

So there was no discoverability gap to close — all 5 dark-capable templates already had
a toggle. What the phase actually delivered is the deduplication it also called for: 5
identical inline copies of the localStorage + `theme-change` + `--theme-bg` logic
collapsed into `useThemeToggle`, plus a shared `ThemeToggleButton` (which also adds the
`aria-label`/`aria-pressed` the inline buttons lacked).

Mounting a toggle in the remaining 4 was **not** a UI change at the time — those
templates had no dark palette at all, so toggling would darken the page background via
`ThemeWrapper` while every card and text colour stayed hardcoded light.

### Phase 2 resolution

The 4 dark palettes were later authored (UX_ROADMAP Giai đoạn 5), which unblocked this,
and the toggles are now mounted:

| Template | Toggle | Note |
|---|---|---|
| `WEDDING` | 2 mount points | the top bar only exists once the invitation is open (`isCardOpen`), so a floating control covers the closed-envelope screen |
| `TRAVEL` | bottom bar | next to the existing settings link |
| `FRIENDSHIP` | header row | next to the existing settings link |
| `LOVE`/`EVERY` | `LoveTemplateV2` only | `LoveTemplate.tsx` was rolled back to deploy code and must stay byte-identical, so the routed file gets no control |

### Known pre-existing bug — FIXED

`ThemeWrapper.getDarkBgColor()` read `localStorage["profile_data_${slug}"]` to pick the
GRAD_GROUP sub-theme dark background, but nothing in the codebase ever wrote that key, so
`station`/`scrapbook` always fell back to caravan's `#0f0a07`. `ThemeWrapper` now takes a
`subTheme` prop sourced from `Link.profile_data.theme` on the server (`page-client.tsx`),
and also carries the previously missing `WEDDING`/`TRAVEL`/`FRIENDSHIP` backgrounds, which
had been falling through to the generic `#121214`.
