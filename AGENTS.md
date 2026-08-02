# AGENTS.md

Next.js 14 App Router + Prisma + Supabase app for personalized anniversary/memory websites. Users get unique slugs (`/[slug]`) with galleries, timelines, letters, and games. PWA-enabled.

> ## ⚠️ READ FIRST — development uses Supabase
>
> Development is configured to use the Supabase Session pooler at
> `aws-1-ap-south-1.pooler.supabase.com:5432` for project
> `llgblesxzhhmbfvfcfzr`. `LOCAL_POSTGRES_DOCKER=false`; do not silently switch
> development back to the isolated Docker database because it does not contain
> the 10 existing customer links.
>
> The complete Prisma schema, including `Link.is_published`, `published_at`,
> `is_favorite`, `tags` and `LinkRevision`, has been applied to Supabase. Before
> that migration, both a full REST JSON export and a native PostgreSQL 17.6 dump
> were stored under the gitignored `backups/supabase-20260730T065914Z/` directory.
>
> Supabase uses the newer publishable/secret API key format. The app maps those
> values onto its existing `NEXT_PUBLIC_SUPABASE_ANON_KEY` and
> `SUPABASE_SERVICE_ROLE_KEY` variables; upload validation accepts both legacy
> JWT service-role keys and new `sb_secret_` keys.

## Tech Stack

**Framework & Runtime**
- Next.js 14.2.35 (App Router)
- React 18
- TypeScript 5
- Node.js

**Database & ORM**
- PostgreSQL (Supabase)
- Prisma 6.19.1

**Styling & UI**
- Tailwind CSS 3.4.1
- Radix UI primitives (dialog, label, select)
- lucide-react (icons)
- class-variance-authority + clsx + tailwind-merge

**Forms & Validation**
- React Hook Form 7.69.0
- Zod 4.2.1 with @hookform/resolvers

**PWA & Performance**
- next-pwa 5.6.0 (production only)

**Utilities**
- bcryptjs (password hashing)
- html-to-image (screenshot generation)
- react-qr-code (QR codes)
- react-swipeable (touch gestures)
- @dnd-kit (drag and drop)



## Commands

```bash
./start.sh                     # ← the only command needed to run the app
npm run dev                    # Dev server (localhost:3000)
npm run build                  # Build (runs prisma generate first)
npm start                      # Production server
npm run lint                   # ESLint

npm test                       # Vitest, single run (vitest run)
npm run test:watch             # Vitest watch mode
npm run budget                 # First Load JS budget check (scripts/check-bundle-budget.mjs)

npm run db:push                # Push schema changes
npm run db:studio              # Prisma Studio GUI
npm run db:seed                # Seed database
npx tsx scripts/reset-admin.ts # Reset admin (admin/123123)
npx tsx scripts/activate-links.ts # Activate all links
```

`npm run budget` reads the build manifest and reproduces the "First Load JS" column
of `next build`, failing (exit 1) if a budgeted route regresses past its ceiling.
Budgets live in `BUDGETS_KB` in `scripts/check-bundle-budget.mjs`. Extra flags:
`-- --all` (also list unbudgeted routes), `-- --json` (CI-friendly output).

### `./start.sh` — the single entry point

`start.sh` is self-sufficient: it does every preparation step itself, so nothing
else has to be run first (`setup.sh` is only needed to create the profile files
from the `.example` templates in the first place).

Order of operations:
1. Copy the chosen profile (`.env.development` / `.env.production`) into both
   `.env` and `.env.local`. A real value from the chosen profile always wins;
   the previous local value is used only when the matching profile value is empty
   or still a placeholder. The values are also exported into the process so stale
   `DATABASE_URL` variables inherited from the terminal cannot override the files.
2. When `LOCAL_POSTGRES_DOCKER=true`, create/start the isolated local PostgreSQL
   container and wait for `pg_isready`.
3. Install `node_modules` if missing; verify Node ≥ 18.
4. `prisma generate`.
5. Compare `schema.prisma` against the live database with `prisma migrate diff`
   and run `prisma db push` automatically **only when drift is detected**.
6. `npm run build` when the production profile is selected and `.next/BUILD_ID`
   is absent.
7. Start the server.

Every prompt has a default, so pressing Enter three times gives
Development / Foreground / normal logs. Flags: `--auto` (`-y`) skips all prompts,
`--skip-checks` skips steps 2–6 (useful to boot the UI while the database is
down — data-backed pages will error), `--help`.

Two portability bugs were fixed in this script and must not be reintroduced:- It used GNU-style `sed -i "s|...|"`. BSD `sed` (macOS) treats the next argument
  as a backup-file suffix, so the command failed and the "preserve real keys"
  merge **silently did nothing**, overwriting `.env` with placeholders. The merge
  is now pure bash.
- `print_warning` was called in the PM2-missing branch but never defined.
macOS ships bash 3.2, so the script must avoid associative arrays (`declare -A`)
and other bash 4+ features.

**Only one dev server per checkout.** Before starting, `start.sh` finds Next
processes whose cwd is this project, kills them, and deletes `.next`. Two servers
sharing one `.next` (e.g. a second `npm run dev` landing on port 3001) makes the
newer instance overwrite the older one's output: every `/_next/static/*` request
404s, `app-paths-manifest.json` shrinks to `{}`, and the browser loops on
**"missing required error components, refreshing..."**. The fix is always
stop-all → `rm -rf .next` → start one server; the app code is not at fault.

**Critical:** `npm run build` runs `prisma generate` first. `postinstall` hook also runs it after `npm install`.

**Environment:** Requires `DATABASE_URL` and `DIRECT_URL`. Development uses the
Supabase Session pooler with `LOCAL_POSTGRES_DOCKER=false`. Supabase Storage uses
its publishable/secret API keys independently from the database connection.

**Schema:** Key models: `User`, `Link`, `Gallery`, `Timeline`, `Letter`, `LetterReply`, `GameCard`, `QuizVote`, `Admin`, `LinkRevision`.
- `LinkType` enum (10 values): `LOVE`, `LOVE2`, `EVERY`, `IDOL`, `GRAD_PERSONAL`, `GRAD_CLASS`, `GRAD_GROUP`, `WEDDING`, `TRAVEL`, `FRIENDSHIP`
- `Link.profile_data` is JSON, shape depends on `type`. Always cast: `profile_data: data as Prisma.InputJsonValue`
- `Admin` is a separate auth model from `User` — two independent session systems (see Architecture below).

### Publish state — two independent flags

`Link.is_published` and `Link.is_active` are **not** the same switch and must not be
conflated:

| Column | Owner | Default | Meaning |
|---|---|---|---|
| `is_published` | the page owner | `true` | Owner's intentional go-live. Paired with `published_at` (nullable timestamp of the first/most recent publish). |
| `is_active` | admin | `true` | Admin kill switch, used to take a page down regardless of the owner's wishes. |

A page is publicly viewable only when **both** are true. When gating a public route,
check both; when building owner-facing publish UI, only ever write `is_published`.

Other newer `Link` columns: `is_favorite` (`Boolean`, default `false` — owner's
pin/star) and `tags` (`String[]`, default `[]`).

`LinkRevision` (table `link_revisions`) snapshots a link's editable content before a
successful save so the owner can roll back: `link_id`, `profile_data` (Json?),
`label` (short Vietnamese label, e.g. `"Tự động lưu"`), `created_at`. Cascade-deleted
with its `Link`; indexed on `[link_id, created_at]`.

All five (`is_published`, `published_at`, `is_favorite`, `tags`,
`LinkRevision`) are present in the development Supabase database. Production must
still run the `./start.sh` schema-drift step against its own live database before
serving traffic.

## Architecture

- Path alias: `@/*` → `./src/*`
- App Router with dynamic `[slug]` routes
- Server actions: `src/app/actions/*`
- Middleware (`src/middleware.ts`): session-based auth
  - Admin routes `/admin/*` need `admin_session` cookie
  - Edit routes `/[slug]/edit`, `/[slug]/letters`, `/[slug]/timeline` need `session_{slug}` cookie
- Database: `src/lib/prisma.ts` (singleton)
- Storage: `src/lib/supabase.ts`

## Templates

Templates are **fully decoupled per LinkType** under `src/components/templates/`, duplicated rather than shared so each can evolve independently — there is no shared base component. Each folder owns its own `Template.tsx`, `LockScreen.tsx`, `GameSection.tsx`, and `LetterBox.tsx`. When adding a template feature, check whether it needs replicating across every template folder individually.

### Template Overview

| LinkType | Folder | Theme Name | Description |
|---|---|---|---|
| `LOVE` | `love/` | Classic Love | Original couple template |
| `LOVE2` | `love2/` | Scrapbook / Polaroid | Craft paper, sticky notes, polaroid photos |
| `EVERY` | *(reuses `love/`)* | Memory hub | No dedicated public template; reuses LOVE's components. Its edit chrome is the `EVERY` entry in `edit/templates/edit-shell-config.ts` |
| `IDOL` | `idol/` | Concert Fanpage | Neon stage, holographic, concert vibes |
| `GRAD_PERSONAL` | `grad-personal/` | Emerald Desk | Individual student graduation — desk, laurel, phoenix |
| `GRAD_CLASS` | `grad-class/` | Blackboard Yearbook | Whole class collective — corkboard, chalkboard |
| `GRAD_GROUP` | `grad-group/` | Chuyến Xe Thanh Xuân | Friend group graduation with 3 selectable sub-themes |
| `WEDDING` | `wedding/` | Invitation suite | Wedding invitation, ceremony timeline, love story |
| `TRAVEL` | `travel/` | Travel log | Trip itinerary — destinations, companions, day-by-day timeline |
| `FRIENDSHIP` | `friendship/` | Friend hub | Friend group vibe, motto, inside jokes, hangout milestones |

### Legacy templates vs `*TemplateV2`

The six templates that already existed on the `deploy` branch were rolled back to
**byte-identical deploy code**, and the newer UX-roadmap implementation was preserved
next to them as a `V2` component:

| Folder | Live (deploy parity) | New implementation |
|---|---|---|
| `love/` | `LoveTemplate.tsx` + `GameSection.tsx` + `LetterBox.tsx` | `LoveTemplateV2.tsx` |
| `love2/` | `Love2Template.tsx` + `GameSection.tsx` + `LetterBox.tsx` | `Love2TemplateV2.tsx` |
| `idol/` | `IdolTemplate.tsx` + `GameSection.tsx` + `LetterBox.tsx` | `IdolTemplateV2.tsx` |
| `grad-personal/` | `GradPersonalTemplate.tsx` + `GameSection.tsx` + `LetterBox.tsx` | `GradPersonalTemplateV2.tsx` |
| `grad-class/` | `GradClassTemplate.tsx` + `GameSection.tsx` + `LetterBox.tsx` | `GradClassTemplateV2.tsx` |
| `grad-group/` | `GradGroupTemplate.tsx` + `GameSection.tsx` + `LetterBox.tsx` | `GradGroupTemplateV2.tsx` |

Rules that follow from this split:

- The unsuffixed files must stay byte-identical to `deploy`. Verify with
  `git show deploy:<path> | diff - <path>`. Their trailing-whitespace noise is
  deploy's own — do not "clean" it, that would break parity.
- `src/app/[slug]/page-client.tsx` renders the **unsuffixed** components, so the public
  routes serve deploy behaviour. The `V2` files are compiled and typechecked but not
  routed; wiring them is a one-line change per LinkType in `page-client.tsx`.
- Only the `V2` components use the newer building blocks: `TemplateVariantGame`,
  `game-registry.ts`, `useThemeToggle`, `ThemeToggleButton`, and the prefixed
  sub-components (`LoveLetterBox`, `LoveGameSection`, `IdolLetterBox`,
  `GradClassLetterBox`, …). Do not import those from an unsuffixed template.
- `grad-personal` and `grad-group` V2 still import the shared `./GameSection` and
  `./LetterBox`; those two files happen to be identical on deploy and current, so they
  are shared rather than duplicated. Fork them before changing V2 behaviour there.
- `wedding/`, `travel/` and `friendship/` do not exist on `deploy` at all — they are
  new templates with no V2 counterpart and no rollback applies to them. The same is
  true of the shared new files `GameStub.tsx`, `TemplateLoading.tsx`,
  `TemplateVariantGame.tsx` and `game-registry.ts`.
- Per-template `*LockScreen.tsx` files are new too and stay in use, because
  `page-client.tsx` imports them independently of the template component.

### Game & edit-capability registries

- `src/components/templates/game-registry.ts` declares 3 game variants (`A`/`B`/`C`, each with `status: "ready" | "coming-soon"`) per `LinkType`. Each template's `GameSection.tsx` dispatches on the selected variant id.
- `src/components/edit/templates/capabilities.ts` declares per-`LinkType` edit-UI metadata (eyebrow/title/description/workflow steps), rendered by `src/components/edit/templates/TemplateFeaturePanel.tsx`.

### GRAD_GROUP Sub-Themes

`GRAD_GROUP` has 3 sub-themes in `Link.profile_data.theme`: `caravan` (wood/amber), `scrapbook` (kraft/polaroid), `station` (neon/cyberpunk). All support Night/Light mode.

### Night/Light Mode

State lives in `localStorage` key `theme_mode_${slug}`, and toggling dispatches a
`theme-change` `CustomEvent` that `src/components/theme/ThemeWrapper.tsx` listens for
(it owns the `.dark` class on `<html>` and the `--theme-*` CSS variables).

**All 10 public templates are dark-capable**, and the toggle is now mounted everywhere it
is safe to mount:

| Templates | Dark styling | Toggle mounted? |
|---|---|---|
| `LOVE2`, `IDOL`, `GRAD_PERSONAL`, `GRAD_CLASS`, `GRAD_GROUP` | yes | **yes** — deploy's own inline Sun/Moon control (that is where `ThemeToggleButton`'s Vietnamese `aria-label` copy comes from) |
| `WEDDING`, `TRAVEL`, `FRIENDSHIP` | yes | **yes** — shared `ThemeToggleButton` in the header/bottom bar |
| `LOVE` (and `EVERY`, which reuses it) | only in `LoveTemplateV2` | **no on the routed file** — `LoveTemplate.tsx` is deploy code with no dark palette; mounting a control there would break byte-parity. The toggle lives in `LoveTemplateV2.tsx` and ships when that component is routed |

`WEDDING` needs two mount points: its top bar only exists once the invitation is opened
(`isCardOpen`), so there is a second floating toggle on the closed-envelope screen — the
first thing a visitor sees.

`edit-shell-config.ts` has `supportsThemeMode: true` for the seven types whose chrome has
real dark variants. `LOVE`, `LOVE2` and `EVERY` are deliberately left off: their routed
public template is deploy code, so flipping the mode would darken the page background via
`ThemeWrapper` while the template stayed light. `tests/edit/edit-shell-theme.test.ts`
locks that invariant in, including that `GRAD_CLASS`/`GRAD_GROUP` are permanently dark
shells (`contentIsDark: true`) rather than two-mode ones.

`ThemeWrapper` must carry a dark background for every type whose template has one,
matching that template's `darkBg` exactly, or the page background and the template chrome
disagree. It also takes `subTheme` (from `Link.profile_data.theme`, passed by
`page-client.tsx`) for GRAD_GROUP: it used to read a localStorage key
`profile_data_${slug}` that nothing ever wrote, so `station` and `scrapbook` always fell
back to caravan's background.

The three new guestbook panels (`WeddingLetterBox`, `TravelLetterBox`,
`FriendshipLetterBox`) do receive `isDark` from their parents.

Shared implementation (use these instead of re-inlining the logic):
- `src/components/theme/useThemeToggle.ts` — `useThemeToggle({ slug, darkBg, lightBg, defaultDark? })` returns `{ isDark, toggle }`. Owns localStorage read/write, the `theme-change` dispatch, `--theme-bg` sync, and stays in sync when another control (e.g. the lock screen) flips the mode.
- `src/components/theme/ThemeToggleButton.tsx` — Sun/Moon icon button; pass per-template chrome via `className`.

```tsx
const { isDark, toggle } = useThemeToggle({ slug, darkBg: "#0b0813", lightBg: "#fff" });
<ThemeToggleButton isDark={isDark} onToggle={toggle} className="p-2.5 rounded-full ..." />
```

**TDZ gotcha:** `isDark` must be initialized BEFORE any helper that reads it. Calling
`useThemeToggle()` at the top of the component satisfies this automatically:
```tsx
const { isDark, toggle } = useThemeToggle({ ... }); // ← before getThemeProps()
const getThemeProps = () => ({ bgClass: isDark ? "dark" : "light" });
```

## Edit Page

The edit route is **split by generation**, mirroring the template rollback above.
`src/app/[slug]/edit/page.tsx` dispatches on `Link.type`:

| LinkType | Component | Code |
|---|---|---|
| `WEDDING`, `TRAVEL`, `FRIENDSHIP` (`V2_EDIT_TYPES`) | `EditPageClientV2` (`edit-client-v2.tsx`) | new shell — `TemplateEditShell` |
| the 7 types that exist on `deploy` (`LOVE`, `LOVE2`, `EVERY`, `IDOL`, `GRAD_PERSONAL`, `GRAD_CLASS`, `GRAD_GROUP`) | `EditPageClient` (`edit-client.tsx`) | **byte-identical deploy code** (646 lines, one file, no per-type components) |

`page.tsx` and `src/components/edit/index.ts` are the only two deploy-era files here
that intentionally differ from `deploy`: the first adds the dispatch, the second must
export both generations. Everything else listed below stays byte-identical to `deploy`
(`edit-client.tsx`, `loading.tsx`, and the ten shared forms).

### Two generations of the shared edit forms

| Deploy parity (used by `edit-client.tsx`) | New implementation (used by `TemplateEditShell`) |
|---|---|
| `EditProfileForm` | `EditProfileFormV2` |
| `EditConfigForm` | `EditConfigFormV2` |
| `EditIdolConfigForm` | `EditIdolConfigFormV2` |
| `EditIdolProfileForm` | `EditIdolProfileFormV2` |
| `EditGradProfileForm` | `EditGradProfileFormV2` |
| `EditGradGroupProfileForm` | `EditGradGroupProfileFormV2` |
| `GalleryManager` | `GalleryManagerV2` |
| `TimelineManager` | `TimelineManagerV2` |
| `MomentsManager` | `MomentsManagerV2` |
| `CareerPathManager` | `CareerPathManagerV2` |

Rules:

- Only the `V2` forms use `useAutoSave`, `useUndoRedo`, `useFormFeedback`,
  `SaveStatusIndicator`, `GameTemplateSelector` and `@dnd-kit`. The unsuffixed forms are
  deploy code with their own inline state and inline banners — **do not** "modernise"
  them, that breaks parity. Verify with `git show deploy:<path> | diff - <path>`.
- `EditProfileFormV2` dynamic-imports the `V2` per-type forms plus the three new ones
  (`EditWeddingProfileForm`, `EditTravelProfileForm`, `EditFriendshipProfileForm`, which
  have no deploy counterpart).
- `templates/shared.tsx` must keep pointing its `dynamic()` panels at the `*V2` modules.
- `/[slug]/edit` First Load JS is ~231 kB because deploy's client statically imports
  every panel. That is deploy's own cost; the budget in
  `scripts/check-bundle-budget.mjs` was raised to 245 kB for exactly this reason. The
  split implementation measured 117.3 kB when it served all 10 types.

### The new shell (V2 side only)

`TemplateEditShell.tsx` is **one** shell for the LinkTypes routed to it — the per-type
`*EditClient.tsx` files were removed because their JSX structure was identical and only
their Tailwind chrome differed.

- `TemplateEditShell.tsx` — owns the shared skeleton: `LoadingGate` → page → card →
  header (`EditBackLink` + eyebrow/title + optional `ThemeModeButton` + `ViewPageLink`)
  → `aside` (intro card + tab nav) → `main` (active-tab banner + `EditFormContent`).
- `edit-shell-config.ts` — `Record<LinkType, EditShellConfig>` holding the per-type
  chrome, copy, icons, tab order, `supportsThemeMode` and `contentIsDark`. Slots are
  either a class string or `(ctx: { isDark, subTheme }) => string` when they vary with
  night mode or a GRAD_GROUP sub-theme. It still carries entries for all 10 types even
  though only 3 are routed to it, so re-wiring a type is a one-line change in `page.tsx`.
- `shared.tsx` — logic layer (`useTemplateEditState()`, `EditBackLink`, `ViewPageLink`,
  `ThemeModeButton`, `TemplateTabButton`, `tabsOf()`, `EditFormContent`, `LoadingGate`).
- `capabilities.ts` / `TemplateFeaturePanel.tsx` — the shell's `features` tab.

Per-type looks: Love/Love2 white/craft card, Idol holographic stage + neon grid,
GRAD_* notebook layout (wood sidebar, lined paper) with colors per sub-theme.

### Shared building blocks — reuse, don't reinvent

**Feedback — one mechanism only.** `src/components/ui/toast.tsx` exports
`ToastProvider` (already mounted in `src/app/layout.tsx`) and `useToast()`. This is the
single mechanism for save/error feedback; do not add per-form inline banners,
`alert()`, or a second toast stack. Variants: `success | error | warning | info`.

- `src/components/edit/useFormFeedback.ts` — `useFormFeedback()` returns a
  `setMessage`-shaped API bridged onto toasts, so forms that already had a
  `message`/`setMessage` state can adopt toasts without restructuring. Also exports
  `useFormToast()`.
- `src/components/edit/useAutoSave.ts` — `useAutoSave()` (generic debounced save with
  a `SaveStatus` of `idle | pending | saving | saved | error`) and `useFormAutoSave()`,
  the react-hook-form bridge. Pair with `SaveStatusIndicator`.
- `src/components/edit/useUndoRedo.ts` — `useUndoRedo()` history stack.
- These three are re-exported from `src/components/edit/index.ts`, so
  `import { useAutoSave, useFormAutoSave, useUndoRedo } from "@/components/edit"` works.

**UI primitives** (newer, in `src/components/ui/`): `skeleton.tsx`
(`Skeleton`/`SkeletonText`/`SkeletonRow`), `badge.tsx` (`Badge`, `badgeVariants`),
`card.tsx` (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`,
`CardFooter`), `empty-state.tsx` (`EmptyState`), `tooltip.tsx` (`Tooltip`).

⚠️ There is **no barrel `index.ts` in `src/components/ui/`** — import per file
(`@/components/ui/badge`, not `@/components/ui`). `src/components/edit/index.ts` *is* a
barrel; `ui/` is not.

## Limits

**Media:**
- Gallery: max 20 photos, 5/batch, 50KB target
- Timeline: max 10 events
- Voice: max 300 seconds
- Images: 50KB target, 1920px max width, binary search compression

**Text:**
- Names: 50 chars
- Letter title: 50 / content: 1000
- Timeline title: 50 / description: 300
- Gallery caption: 50

**GRAD_GROUP:**
- Members: max 12 recommended
- Goals/roadmap in `profile_data.goals[]`

## Config

- PWA: production only (next.config.mjs:27-86). Service worker in `public/`.
- Image remotePatterns: `*.supabase.co`, `*.supabase.in`
- Server actions: 10MB body limit

## Gotchas

1. **Prisma JSON cast required:** `profile_data: data as Prisma.InputJsonValue` (import from `@prisma/client`)
2. **TDZ error in templates:** Declare `isDark` before helper functions that reference it
3. **Session cookies are per-slug:** `session_{slug}`, not global
4. **PWA files auto-generated:** Don't edit `public/sw.js` or `workbox-*.js`
5. **Image compression is client-side:** Binary search in ImageUpload component
6. **Scripts excluded from TS:** `tsconfig.json` excludes `scripts/`. Run with `npx tsx`
7. **Sub-themes in JSON:** `GRAD_GROUP` theme in `profile_data.theme`, not DB column
8. **Windows Prisma errors:** Use WSL or elevated permissions for `prisma generate`
9. **`src/lib/utils.ts` must contain ONLY `cn()`** — and must never import a Node
   built-in. `cn()` is imported by nearly every client component, so anything sitting
   next to it in that module gets bundled into nearly every client route. A
   module-scope `import { randomBytes } from "crypto"` there once dragged a crypto
   browser shim into every route rendering any component that calls `cn()`:
   `/admin/login` measured **231 kB** First Load JS, and **100.6 kB** after the shim
   was removed — a ~130 kB win (see the comments in `scripts/check-bundle-budget.mjs`).
   The credential helpers now live in `src/lib/tokens.ts` (**server only**):
   `generateSlug()`, `generatePin()`, `generateSessionToken()`. Never re-add them to
   `utils.ts`, and never import `tokens.ts` from a client component.
10. **Schema drift:** development Supabase is synchronized automatically by
    `./start.sh`. A production Supabase database is independent and must complete
    the same drift check successfully before traffic is served.

## Verification

There **are** tests: Vitest + React Testing Library, **282 tests across 13 files**
(config `vitest.config.ts`, setup `tests/setup.ts`). Test files live both under
`tests/` (`admin/`, `edit/`, `lib/`, `templates/`, `ui/`) and co-located in `src/`
(e.g. `src/components/admin/links/links-table.test.tsx`) — so don't assume `tests/` is
the whole suite.

Run all four after changes:

```bash
npm test            # Vitest — 282 tests, must all pass
npx tsc --noEmit    # typecheck only, fastest signal
npm run build       # prisma generate + next build
npm run budget      # First Load JS budgets, exit 1 on regression
```

Then, where relevant:
1. `npm run dev` — manual test
2. For templates: Night/Light toggle, sub-theme switching, middleware protection
3. Touching `src/lib/utils.ts` or anything imported by client components: re-run
   `npm run budget` (see the `cn()` gotcha below)

Note `npm run build` does not run the tests, and `npm test` does not typecheck the
whole project — they are separate signals.

## Deployment (Vercel)

- Single Vercel project `love-memories` (team `soncodekhongbugs-projects`). There is no
  separate "test" project — test vs. production is just two different domain aliases
  pointing at two different deployments of the same project.
- Production: branch `deploy` → domains `memorae.me`, `www.memorae.me`,
  `love-memories-rust.vercel.app`. Never touch these without an explicit request.
- Test: domain `test.memorae.me` (Cloudflare-fronted). Points at whichever deployment was
  last aliased to it — not automatically tied to a branch, so the alias step below is
  mandatory every time, even if you already aliased it earlier in the same session.
- **Every code change destined for test MUST go through `deploy-test`, and pushes MUST
  target that branch only** — never push a feature branch directly and alias it to
  `test.memorae.me`, and never leave the alias pointed at an older commit after new work
  is merged in.
  1. Merge the work branch into (or create) `deploy-test`, push it — Vercel's git
     integration auto-builds a preview deployment for that branch.
  2. Find that deployment: `vercel ls love-memories`, confirm with
     `vercel inspect <url>` that `target: preview` and the alias listed is
     `love-memories-git-deploy-test-...` (i.e. it was actually built from `deploy-test`,
     not a stale feature-branch build).
  3. Point the test domain at it: `vercel alias set <deployment-url> test.memorae.me`.
     Do this after **every** merge into `deploy-test`, even if `test.memorae.me` was
     already aliased to a previous `deploy-test` build — the alias does not move on its
     own when a new commit lands on the branch.
  4. Verify with `vercel alias ls` that `memorae.me`/`www.memorae.me` still point at their
     unchanged production deployment.
- Never run `vercel --prod`, `vercel promote`, or `vercel alias set ... memorae.me` /
  `www.memorae.me` unless explicitly asked to deploy to production.

### Test environment variables (`Preview` + `deploy-test` branch scope)

- `deploy-test` has its **own** `DATABASE_URL`/`DIRECT_URL`, scoped to
  `Preview` + git branch `deploy-test`, matching `.env.development` (project
  `llgblesxzhhmbfvfcfzr`) — it does **not** fall back to the generic
  `Development, Preview, Production` catch-all value. Do not delete these
  scoped vars to "fix" an apparently-empty Dashboard value; see next point.
- Vercel marks these as **Sensitive**, not Encrypted: once saved, the value can
  never be read again via Dashboard or `vercel env pull`/API — both show empty
  or `"[SENSITIVE]"` by design. That is not evidence of a misconfiguration.
  To actually verify what a live deployment is connected to, don't trust the
  Dashboard — query the runtime directly (see below).
- To replace a branch-scoped var: `vercel env rm <NAME> preview deploy-test --yes`
  then `printf '%s' "$VALUE" | vercel env add <NAME> preview deploy-test --yes`
  (the bare `vercel env rm <NAME> preview` errors when multiple scopes share the
  name — always pass the git branch explicitly).
- Changing an env var does **not** rebuild existing deployments — run
  `vercel redeploy <deployment-url> --target preview` (or push a new commit)
  and re-alias per the workflow above.

### Diagnosing "wrong DB" / "wrong credentials" on test

When login or data looks wrong on `test.memorae.me` and env vars *look*
correct, don't guess from Vercel config — prove it from the running code:
add a temporary route handler that runs a raw query
(`prisma.$queryRawUnsafe("SELECT current_database()")`) and/or calls the
actual server action directly (e.g. `loginAdmin()` with a hardcoded
`FormData`) and returns the result as JSON. Deploy it to `deploy-test`, curl
it, then **delete the route** once the question is answered — it is a
diagnostic aid, never a permanent endpoint (it would leak DB/session info
publicly if left in place).

## Key Files

- Templates: `src/components/templates/{love,love2,idol,grad-personal,grad-class,grad-group,wedding,travel,friendship}/`
- Edit route dispatch: `src/app/[slug]/edit/page.tsx` (`V2_EDIT_TYPES`)
- Edit page, deploy parity (7 types): `src/app/[slug]/edit/edit-client.tsx`
- Edit shell, V2 (WEDDING/TRAVEL/FRIENDSHIP): `src/components/edit/templates/TemplateEditShell.tsx` + `edit-shell-config.ts`
- Lock screen: `src/components/auth/PinLockController.tsx` (per-template lock screens live in each `templates/{type}/*LockScreen.tsx`)
- Middleware: `src/middleware.ts:60-110`
- Server actions: `src/app/actions/*.ts` (profile-actions.ts has all profile types)
- Admin panel: `src/app/admin/links/links-table.tsx`
- Design system reference (admin-only, noindex): `src/app/admin/design-system/`
- Schema: `prisma/schema.prisma`
- Spec: `LOVE_TEMPLATE_REPORT.md` (Vietnamese), `docx/` folder

## AI Behavior & Coding Rules

- **Role:** You act as an expert Next.js 14 (App Router) and Prisma 6 developer.
- **Component Isolation:** Explicitly separate Server Components and Client Components using `"use client"` at the very top only when necessary.
- **Data Access:** Always utilize Prisma Client for querying the Supabase PostgreSQL database. Never write raw SQL unless explicitly asked.
- **Styling Convention:** Combine Tailwind classes using `clsx` and `tailwind-merge` via your standard `cn()` utility.
- **Output Style:** Provide concise, direct code solutions. **Do not write long theoretical explanations.** Focus purely on the implementation.
