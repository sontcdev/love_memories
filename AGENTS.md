# AGENTS.md

## Project Overview

Next.js 14 (App Router) + TypeScript + Prisma + Supabase application for personalized anniversary/love memory websites. Users get unique slugs (`/[slug]`) with galleries, timelines, letters, and games. PWA-enabled with offline support.

## Tech Stack

**Core:**
- Next.js 14.2.35 (App Router)
- TypeScript 5
- React 18

**Database & Backend:**
- Prisma 6.19.1 (ORM)
- PostgreSQL via Supabase
- Supabase JS 2.89.0 (storage, auth)

**Styling & UI:**
- Tailwind CSS 3.4.1
- Radix UI (dialog, label, select, slot)
- Lucide React (icons)
- class-variance-authority + clsx + tailwind-merge (utility)

**Forms & Validation:**
- React Hook Form 7.69.0
- Zod 4.2.1
- @hookform/resolvers 5.2.2

**Features:**
- @dnd-kit (drag & drop for gallery sorting)
- react-swipeable (mobile gestures)
- html-to-image (QR code generation)
- react-qr-code (QR display)
- bcryptjs (password hashing)
- next-pwa 5.6.0 (PWA support)

**Dev Tools:**
- ESLint (next/core-web-vitals, next/typescript)
- PostCSS
- tsx (for running scripts)

## Recommended Skills

Agent skills available for this stack:

**Next.js/React/TypeScript:**
- `sickn33/antigravity-awesome-skills@react-nextjs-development` (776 installs)
- `davila7/claude-code-templates@react-dev` (494 installs)
- `duyet/claude-plugins@react-nextjs-patterns` (298 installs)

**Forms & Validation:**
- `ovachiever/droid-tings@react-hook-form-zod` (572 installs)
- `erichowens/some_claude_skills@form-validation-architect` (121 installs)

**Database & Prisma:**
- `mindrally/skills@prisma-development` (427 installs)

**Tailwind CSS:**
- `heygen-com/hyperframes@tailwind` (70K installs)

Install with: `npx skills add <owner/repo@skill> -g -y`

## Build & Development

```bash
npm run dev                    # Start dev server (localhost:3000)
npm run build                  # Build (runs prisma generate first)
npm start                      # Production server
npm run lint                   # ESLint via Next.js
```

**Critical:** `npm run build` automatically runs `prisma generate` first (see `package.json:7`). The `postinstall` hook also runs `prisma generate`.

## Database & Prisma

```bash
npm run db:push                # Push schema changes to database
npm run db:studio              # Open Prisma Studio GUI
npm run db:seed                # Seed database with sample data
npx tsx scripts/reset-admin.ts # Reset admin account (admin/admin123)
npx tsx scripts/activate-links.ts # Activate all user links
```

**Environment:** Requires `DATABASE_URL` and `DIRECT_URL` (Supabase connection pooling).

**Schema:** PostgreSQL via Supabase. Key models: `User`, `Link`, `Gallery`, `Timeline`, `Letter`, `GameCard`, `Admin`. See `prisma/schema.prisma:1-218`.
- `LinkType` values: `LOVE`, `LOVE2`, `EVERY`, `IDOL`, `GRAD_PERSONAL`, `GRAD_CLASS`, `GRAD_GROUP` (added `LOVE2`, `GRAD_PERSONAL`, `GRAD_CLASS`, and `GRAD_GROUP`).

**JSON profile_data:** Each link stores rich profile data as a JSON blob in `Link.profile_data`. When writing to this field via Prisma, always cast with `as Prisma.InputJsonValue` to satisfy Prisma 6 strict JSON type constraints.

## Architecture

- **Path alias:** `@/*` maps to `./src/*` (tsconfig.json:24-27)
- **App structure:** Next.js App Router with dynamic `[slug]` routes
- **Server actions:** `src/app/actions/*` (8 files: admin, auth, gallery, game, letter, profile, timeline)
- **Middleware:** Session-based auth protection at `src/middleware.ts`
  - Admin routes: `/admin/*` requires `admin_session` cookie
  - User edit routes: `/[slug]/edit`, `/[slug]/letters`, `/[slug]/timeline` require `session_{slug}` cookie
- **Database client:** Singleton Prisma client at `src/lib/prisma.ts`
- **Storage:** Supabase client at `src/lib/supabase.ts` for file uploads

## Templates

Each template is **completely decoupled and self-contained** in its own folder under `src/components/templates/`. Templates do NOT share components with each other — each folder has its own copies of `GameSection.tsx` and `LetterBox.tsx` for safe isolated editing.

### Template Overview

| LinkType | Folder | Theme Name | Description |
|---|---|---|---|
| `LOVE` | `love/` | Classic Love | Original couple template |
| `LOVE2` | `love2/` | Scrapbook / Polaroid | Craft paper, sticky notes, polaroid photos |
| `IDOL` | `idol/` | Concert Fanpage | Neon stage, holographic, concert vibes |
| `GRAD_PERSONAL` | `grad-personal/` | Emerald Desk | Individual student graduation — desk, laurel, phoenix |
| `GRAD_CLASS` | `grad-class/` | Blackboard Yearbook | Whole class collective — corkboard, chalkboard |
| `GRAD_GROUP` | `grad-group/` | Chuyến Xe Thanh Xuân | Friend group graduation with 3 selectable sub-themes |

### GRAD_GROUP Sub-Themes

The `GRAD_GROUP` template supports 3 sub-themes stored inside `Link.profile_data.theme`:

| `theme` value | Display Name | Visual Style |
|---|---|---|
| `caravan` | Chuyến Xe Thanh Xuân | Warm wood, amber, road-trip wanderlust |
| `scrapbook` | Sổ Tay Polaroid | Kraft paper, polaroid photos, patchwork |
| `station` | Trạm Ký Ức | Dark neon, violet tram station, cyberpunk |

All 3 sub-themes support both **Night mode** and **Light mode** toggle.

### Night/Light Mode

All templates except the original `LOVE` support Night/Light mode toggle. The toggle state is persisted in `localStorage` under key `theme_mode_${slug}`. Key implementation pattern:

```tsx
// ALWAYS initialize isDark BEFORE any function that references it (avoid TDZ error)
const [overrideDark, setOverrideDark] = useState<boolean | null>(null);
const isDark = overrideDark !== null ? overrideDark : false; // ← must come here

const getThemeProps = () => {
    // now safe to reference isDark inside
    return { bgClass: isDark ? "dark-bg" : "light-bg", ... };
};
```

## Edit Page (`/[slug]/edit`)

The edit page (`src/app/[slug]/edit/edit-client.tsx`) auto-detects the link type and applies themed layout:

- **Love / Love2:** Standard white card dashboard
- **Idol:** Holographic stage with neon grid overlay, laser beams, bokeh bubbles
- **GRAD_PERSONAL / GRAD_CLASS / GRAD_GROUP:** Notebook-style layout — wood sidebar + lined paper content area + spiral ring binder divider decorations. Colors adapt per sub-theme.

**Theme detection in edit-client:**
```tsx
const isGrad = linkData.type === "GRAD_PERSONAL" || linkData.type === "GRAD_CLASS" || linkData.type === "GRAD_GROUP";
let gradTheme = "emerald"; // default for GRAD_PERSONAL
if (linkData.type === "GRAD_CLASS") gradTheme = "chalkboard";
else if (linkData.type === "GRAD_GROUP") {
    const profileData = linkData.profile_data as Record<string, unknown> | null;
    gradTheme = (profileData?.theme as string) || "caravan";
}
```

## Key Constraints

**Media limits** (enforced in components, validated server-side):
- Gallery: max 20 photos, 5 uploads/batch, target 50KB after compression
- Timeline: max 10 events
- Voice recordings: max 300 seconds (5 minutes)
- Image uploads: compress to 50KB target, max 1920px width, binary search for optimal quality

**Text limits:**
- Names: 50 chars
- Letter title: 50 chars, content: 1000 chars
- Timeline title: 50 chars, description: 300 chars
- Gallery caption: 50 chars

**GRAD_GROUP specific limits:**
- Members: recommended max 12 per group
- Quiz questions: supports custom badges (perfect/good/normal titles & descriptions)
- Goals/Roadmap: travel milestones stored in `profile_data.goals[]`

## Next.js Configuration

**PWA:** Enabled in production via `next-pwa` (next.config.mjs:26-85). Disabled in development. Service worker writes to `public/`.

**Image remotePatterns:** Allows `*.supabase.co` and `*.supabase.in` storage URLs (next.config.mjs:6-17).

**Server Actions:** Body size limit raised to 10MB (next.config.mjs:20-23).

## Common Gotchas

1. **Build errors on Windows:** Prisma generate may fail with `EPERM` errors. Run with elevated permissions or in WSL.

2. **Scripts are excluded from TypeScript:** `tsconfig.json` excludes `scripts/` directory. Use `npx tsx` to run scripts directly.

3. **User PIN is 6 digits:** `User.password_hash` is varchar(6) in schema but actually stores bcrypt hash (schema comment is misleading at prisma/schema.prisma:51).

4. **Session cookies are slug-specific:** Each link has its own session cookie `session_{slug}`, not a global user session.

5. **PWA files regenerate on build:** Don't manually edit `public/sw.js` or `public/workbox-*.js` - they're generated by next-pwa.

6. **Image compression is client-side:** Binary search algorithm in ImageUpload component, not server-side. Uploads may timeout on slow connections.

7. **`isDark` must be initialized before `getThemeProps()`:** In templates that call `isDark` inside a helper function, declare `isDark` immediately after the `overrideDark` state — before the helper function definition — to avoid a TDZ (Temporal Dead Zone) `ReferenceError` at runtime.

8. **Prisma JSON field type:** When updating `profile_data`, always cast the value: `data: { profile_data: newData as Prisma.InputJsonValue }`. Import `Prisma` from `@prisma/client`. Sub-types like `GroupMember[]` are not directly assignable to Prisma's JSON type without this cast.

9. **Sub-themes stored in JSON:** `GRAD_GROUP` sub-theme is stored in `profile_data.theme`, not a dedicated DB column. This avoids migration overhead while allowing full customizability.

## Testing & Verification

No test framework configured. Manual testing workflow:
1. Check TypeScript: `npm run build` includes full typecheck
2. Run dev server: `npm run dev` and test routes
3. Verify middleware protection (try accessing `/[slug]/edit` without auth)
4. Test image uploads and compression
5. For GRAD_GROUP: verify sub-theme switching updates template and edit page styles
6. For Night/Light mode: verify toggle persists across page reloads via localStorage

## Useful File Locations

- **Templates:**
  - `src/components/templates/love/LoveTemplate.tsx` (Original love template)
  - `src/components/templates/love2/Love2Template.tsx` (New love template - Scrapbook/Polaroid style)
  - `src/components/templates/grad-personal/GradPersonalTemplate.tsx` (Individual graduation template - Emerald Desk theme)
  - `src/components/templates/grad-class/GradClassTemplate.tsx` (Class collective yearbook template - Blackboard/Corkboard theme)
  - `src/components/templates/grad-group/GradGroupTemplate.tsx` (Group graduation template - Chuyến Xe Thanh Xuân theme with caravan, scrapbook, station sub-themes)
  - `src/components/templates/idol/IdolTemplate.tsx` (Idol fanpage template)
  *Note:* Each template is completely decoupled and self-contained in its respective folder, containing its own copies of `GameSection.tsx` and `LetterBox.tsx` for easy isolated editing.

- **Profile Edit Forms:**
  - `src/components/edit/EditProfileForm.tsx` (Standard profile editor routing — dispatches to the correct form by `LinkType`)
  - `src/components/edit/EditGradProfileForm.tsx` (Individual & class graduation profile editor form)
  - `src/components/edit/EditGradGroupProfileForm.tsx` (Group graduation profile editor form — sub-theme selector, member cards, badge customizer, travel roadmap)
  - `src/components/edit/EditIdolProfileForm.tsx` (Idol fanpage profile editor form)

- **Edit Page Client:**
  - `src/app/[slug]/edit/edit-client.tsx` (Unified edit layout with themed backgrounds per template type)

- **PIN Screen / Lock Screen:**
  - `src/components/auth/LockScreen.tsx` (PIN screen styling with custom themes per template)

- **Auth middleware:** `src/middleware.ts:60-110`
- **Server actions:** `src/app/actions/*.ts`
  - `profile-actions.ts` — exports `updateLinkProfile`, all profile data types (`LoveProfileData`, `IdolProfileData`, `GradPersonalProfileData`, `GradClassProfileData`, `GradGroupProfileData`, `GroupMember`)
- **Admin panel:**
  - `src/app/admin/links/links-table.tsx` (Create/manage links, supports all `LinkType` values including `GRAD_GROUP`)
- **Database schema:** `prisma/schema.prisma`
- **Full feature spec:** `LOVE_TEMPLATE_REPORT.md` (in Vietnamese)
- **New template spec & requirements docs:** `docx/` folder
