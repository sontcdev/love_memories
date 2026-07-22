# AGENTS.md

Next.js 14 App Router + Prisma + Supabase app for personalized anniversary/memory websites. Users get unique slugs (`/[slug]`) with galleries, timelines, letters, and games. PWA-enabled.

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
npm run dev                    # Dev server (localhost:3000)
npm run build                  # Build (runs prisma generate first)
npm start                      # Production server
npm run lint                   # ESLint

npm run db:push                # Push schema changes
npm run db:studio              # Prisma Studio GUI
npm run db:seed                # Seed database
npx tsx scripts/reset-admin.ts # Reset admin (admin/admin123)
npx tsx scripts/activate-links.ts # Activate all links
```

**Critical:** `npm run build` runs `prisma generate` first. `postinstall` hook also runs it after `npm install`.

**Environment:** Requires `DATABASE_URL` and `DIRECT_URL` (Supabase pooling).

**Schema:** Key models: `User`, `Link`, `Gallery`, `Timeline`, `Letter`, `GameCard`, `Admin`.
- `LinkType` enum: `LOVE`, `LOVE2`, `EVERY`, `IDOL`, `GRAD_PERSONAL`, `GRAD_CLASS`, `GRAD_GROUP`
- `Link.profile_data` is JSON. Always cast: `profile_data: data as Prisma.InputJsonValue`

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

Each template is **completely decoupled** under `src/components/templates/`. Each has its own `GameSection.tsx` and `LetterBox.tsx` copies for isolated editing.

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

`GRAD_GROUP` has 3 sub-themes in `Link.profile_data.theme`: `caravan` (wood/amber), `scrapbook` (kraft/polaroid), `station` (neon/cyberpunk). All support Night/Light mode.

### Night/Light Mode

All templates except `LOVE` support Night/Light toggle. State in `localStorage` key `theme_mode_${slug}`.

**TDZ gotcha:** Initialize `isDark` BEFORE helper functions that reference it:
```tsx
const [overrideDark, setOverrideDark] = useState<boolean | null>(null);
const isDark = overrideDark !== null ? overrideDark : false; // ← before getThemeProps()
const getThemeProps = () => ({ bgClass: isDark ? "dark" : "light" });
```

## Edit Page

`src/app/[slug]/edit/edit-client.tsx` applies themed layout by link type:
- Love/Love2: white card
- Idol: holographic stage + neon grid
- GRAD_*: notebook layout (wood sidebar, lined paper, spiral rings). Colors adapt per sub-theme.

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

## Verification

No tests. After changes:
1. `npm run build` — typecheck + build
2. `npm run dev` — manual test
3. For templates: test Night/Light toggle, sub-theme switching, middleware protection

## Key Files

- Templates: `src/components/templates/{love,love2,idol,grad-personal,grad-class,grad-group}/`
- Edit forms: `src/components/edit/Edit*ProfileForm.tsx`
- Edit page: `src/app/[slug]/edit/edit-client.tsx`
- Lock screen: `src/components/auth/LockScreen.tsx`
- Middleware: `src/middleware.ts:60-110`
- Server actions: `src/app/actions/*.ts` (profile-actions.ts has all profile types)
- Admin panel: `src/app/admin/links/links-table.tsx`
- Schema: `prisma/schema.prisma`
- Spec: `LOVE_TEMPLATE_REPORT.md` (Vietnamese), `docx/` folder

## AI Behavior & Coding Rules

- **Role:** You act as an expert Next.js 14 (App Router) and Prisma 6 developer.
- **Component Isolation:** Explicitly separate Server Components and Client Components using `"use client"` at the very top only when necessary.
- **Data Access:** Always utilize Prisma Client for querying the Supabase PostgreSQL database. Never write raw SQL unless explicitly asked.
- **Styling Convention:** Combine Tailwind classes using `clsx` and `tailwind-merge` via your standard `cn()` utility.
- **Output Style:** Provide concise, direct code solutions. **Do not write long theoretical explanations.** Focus purely on the implementation.
