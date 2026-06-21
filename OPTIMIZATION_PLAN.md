# PLAN TỐI ƯU HÓA HIỆU NĂNG — LOVE_MEMORIES

> **Vấn đề**: Thời gian tải trang quá lâu (ước tính FCP/TTI > 5s trên 3G).
> **Nguyên nhân gốc**: Bundle 1.48MB / 33 chunks · 11 Google Fonts preload · WelcomeOverlay 848 dòng · Template duplication 90%+ · ThemeWrapper 3 useEffects + MutationObserver.
> **Mục tiêu**: FCP < 1.5s · TTI < 3s · Bundle < 600KB · Lighthouse Performance > 85.

---

## TÓM TẮT NHANH (TL;DR)

| # | Hạng mục | Tác động | Thời gian | Ưu tiên |
|---|---|---|---|---|
| **P0.1** | Loại bỏ 11 Google Fonts preload khỏi `layout.tsx` | 🔴 CỰC CAO (-2s FCP) | 30 phút | **Ngay** |
| **P0.2** | Dynamic import WelcomeOverlay (848 dòng) | 🔴 CAO (-150KB JS) | 20 phút | **Ngay** |
| **P0.3** | Gộp 2 query trong `getLinkData` | 🟠 CAO (-200ms TTFB) | 15 phút | **Ngay** |
| **P0.4** | Lazy load template theo `link.type` thay vì dynamic toàn bộ | 🔴 CAO (-300KB JS) | 1 giờ | **Ngay** |
| **P0.5** | Bỏ import MusicPlayer (đã disabled) | 🟠 TRUNG BÌNH (-30KB) | 5 phút | **Ngay** |
| **P1.1** | Deduplicate LetterBox & GameSection | 🟠 CAO (-200KB JS) | 2 giờ | Tuần 1 |
| **P1.2** | Loại bỏ MutationObserver trong ThemeWrapper | 🟠 CAO (-50ms TBT) | 30 phút | Tuần 1 |
| **P1.3** | Lazy load admin pages | 🟡 TB (-100KB) | 30 phút | Tuần 1 |
| **P1.4** | Lazy load edit page components | 🟡 TB (-80KB) | 1 giờ | Tuần 1 |
| **P2.1** | Pagination galleries/timelines/letters | 🟡 TB (-300ms) | 2 giờ | Tuần 2 |
| **P2.2** | Next/Image optimization (sizes, blur placeholder) | 🟡 TB | 1 giờ | Tuần 2 |
| **P2.3** | Streaming với Suspense | 🟡 TB (-500ms perceived) | 1 giờ | Tuần 2 |
| **P3.1** | Route-level code splitting | 🟢 THẤP | 1 giờ | Tuần 3 |
| **P3.2** | Bundle analyzer + CI guard | 🟢 THẤP | 30 phút | Tuần 3 |
| **P3.3** | CSS purging audit (custom keyframes) | 🟢 THẤP | 30 phút | Tuần 3 |

**Tổng thời gian ước tính**: ~12 giờ làm việc (chia 3 tuần).
**Cải thiện kỳ vọng**: Bundle **1.48MB → <500KB** (-66%), FCP **>3s → <1.5s** (-50%).

---

## PHÂN TÍCH BOTTLENECK HIỆN TẠI

### 🔴 P0.1 — 11 Google Fonts preload trong `layout.tsx:80-83`

```html
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Comfortaa:wght@400;700&family=Dancing+Script:wght@400;700&family=Inter:wght@400;500;700&family=Montserrat:wght@400;500;700&family=Nunito:wght@400;700&family=Pacifico&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Poppins:wght@400;500;600;700&family=Quicksand:wght@400;500;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
```

**Vấn đề**:
- 11 font families × 2-4 weights mỗi cái = **~35 file font** phải tải
- Ước tính **~500-800KB** chỉ riêng font files
- Tất cả admin pages, login page, edit page đều tải fonts dù không dùng
- CSS font được render-blocking → block FCP

**Fix** (3 bước):

```tsx
// src/app/layout.tsx - XÓA link Google Fonts hoàn toàn

// 1. XÓA: <link href="https://fonts.googleapis.com/..." />
// 2. XÓA: <link rel="preconnect" href="https://fonts.googleapis.com" />
// 3. XÓA: <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
```

Thay thế bằng **`next/font/google`** với subsetting + chỉ load fonts thực sự dùng:

```tsx
// src/app/layout.tsx
import { Inter, Dancing_Script, Pacifico } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "vietnamese"],  // ← QUAN TRỌNG: subset giảm 60-80%
  display: "swap",                    // ← Tránh FOIT (flash invisible text)
  variable: "--font-inter",
  weight: ["400", "500", "700"],
});

// Load các font khác CHỈ ở route cần
// (vd LoveTemplate chỉ dùng dancing-script → dynamic load trong template)
```

Hoặc tốt hơn: **mỗi template load font riêng** khi render (do templates đã là dynamic):

```tsx
// src/components/templates/love/LoveTemplate.tsx
import { Dancing_Script, Pacifico } from "next/font/google";

const dancing = Dancing_Script({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });
```

**Tác động**:
- ✅ FCP giảm **1-2 giây**
- ✅ TBT giảm **~200ms**
- ✅ Admin pages nhẹ hơn **~400KB**

---

### 🔴 P0.2 — WelcomeOverlay 848 dòng bundle trong client

`page-client.tsx:9, 182-188` import WelcomeOverlay ở top-level → toàn bộ 848 dòng + 15 lucide icons load cùng lúc với page.

**Fix**: Dynamic import + chỉ render sau khi user tương tác:

```tsx
// src/app/[slug]/page-client.tsx
import dynamic from "next/dynamic";

const WelcomeOverlay = dynamic(
  () => import("@/components/music/WelcomeOverlay").then(m => m.WelcomeOverlay),
  { 
    ssr: false,
    loading: () => null  // Welcome không cần loading state
  }
);

// Trong component:
const [showWelcome, setShowWelcome] = useState(false);

// CHỈ render sau khi linkData load xong:
useEffect(() => {
  if (linkData && !sessionStorage.getItem("welcome_shown")) {
    setShowWelcome(true);
  }
}, [linkData]);

return (
  <>
    {showWelcome && (
      <WelcomeOverlay {...props} />
    )}
    {renderTemplate()}
  </>
);
```

**Tác động**: JS bundle giảm **~100-150KB** initial.

---

### 🔴 P0.4 — Dynamic import 6 templates ngay từ đầu

`page-client.tsx:13-30` dynamic import **cả 6 templates** dù chỉ dùng 1. Mặc dù dynamic giúp chia chunk, nhưng metadata loading, types, shared imports vẫn bundle cùng page-client.

**Fix**: Di chuyển template selection sang **route-level dynamic**:

```tsx
// src/app/[slug]/page-client.tsx
import dynamic from "next/dynamic";

function renderTemplate(data: LinkWithRelations, slug: string) {
  // Lazy load ĐÚNG template cần thiết
  switch (data.type) {
    case "LOVE":
    case "EVERY":
      const LoveTemplate = dynamic(() => 
        import("@/components/templates/love/LoveTemplate").then(m => m.LoveTemplate),
        { ssr: false, loading: TemplateSkeleton }
      );
      return <LoveTemplate data={data} slug={slug} />;
    case "LOVE2":
      const Love2Template = dynamic(() => 
        import("@/components/templates/love2/Love2Template").then(m => m.Love2Template),
        { ssr: false, loading: TemplateSkeleton }
      );
      return <Love2Template data={data} slug={slug} />;
    // ... tương tự
  }
}
```

Hoặc tốt hơn: **route-level lazy loading** với App Router:

```
src/app/[slug]/templates/
├── love/page.tsx       # Server component wrap LoveTemplate
├── love2/page.tsx
├── idol/page.tsx
├── ...
```

→ Dùng `params.type` để redirect nhưng Next.js không cho phép slug phức tạp, nên giải pháp trên (switch + dynamic) là tối ưu nhất.

**Tác động**: JS bundle giảm **~300KB** initial.

---

### 🟠 P0.3 — Double query trong `getLinkData`

`src/app/actions/auth-actions.ts:139-167`:

```ts
export async function getLinkData(slug: string) {
    // Query 1: Verify access
    const link = await prisma.link.findUnique({
        where: { slug },
        select: { id: true, is_active: true },
    });
    
    // Query 2: Get full data
    const fullLink = await getCachedLinkData(slug);
    // ...
}
```

**Fix**: Gộp thành 1 query:

```ts
const getCachedFullData = cache(async (slug: string) => {
    return prisma.link.findUnique({
        where: { slug },
        include: {
            config: true,
            galleries: { orderBy: { sort_order: "asc" } },
            timelines: { orderBy: { date: "asc" } },
            letters: {
                orderBy: { sort_order: "asc" },
                include: { replies: { orderBy: { created_at: "asc" } } },
            },
        },
    });
});

export async function getLinkData(slug: string) {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(`session_${slug}`)?.value;
    if (!sessionToken) return { success: false, error: "Unauthorized" };

    const fullLink = await getCachedFullData(slug);
    if (!fullLink || fullLink.id !== sessionToken || !fullLink.is_active) {
        return { success: false, error: "Unauthorized" };
    }
    return { success: true, data: fullLink };
}
```

**Tác động**: TTFB giảm **~100-200ms**.

---

### 🟠 P0.5 — MusicPlayer vẫn trong bundle dù disabled

`src/app/[slug]/page-client.tsx:8`:
```ts
import type { MusicPlayerRef } from "@/components/music/MusicPlayer";
```

Import `type` không ảnh hưởng runtime, nhưng file MusicPlayer.tsx (300 dòng) vẫn được bundle vì các component khác import nó (e.g., WelcomeOverlay có thể tham chiếu).

**Fix**:
```ts
// XÓA: import type { MusicPlayerRef } from "@/components/music/MusicPlayer";
// XÓA: const musicPlayerRef = useRef<MusicPlayerRef>(null);
// XÓA: handleWelcomeOpen callback (đã vô dụng vì MusicPlayer disabled)
```

Đồng thời kiểm tra MusicPlayer không được import ở đâu khác. Nếu có, comment out và remove sau.

**Tác động**: JS bundle giảm **~30KB**.

---

## 🟠 P1.1 — Deduplicate LetterBox & GameSection (6 templates)

**Vấn đề**: 6 template folders, mỗi folder có LetterBox.tsx (~625 dòng) và GameSection.tsx (~229 dòng). 5/6 LetterBox files gần như identical, 4/6 GameSection files identical.

**Cách fix**: Refactor sang **shared components với theme prop**:

```
src/components/templates/shared/
├── LetterBox.tsx          # Single source of truth
├── GameSection.tsx        # Single source of truth
├── GalleryLightbox.tsx    # Đã có
└── types.ts               # Shared types
```

```tsx
// src/components/templates/shared/LetterBox.tsx
interface LetterBoxProps {
  slug: string;
  linkData: LinkWithRelations;
  theme: 'love' | 'every' | 'idol' | 'grad-personal' | 'grad-class' | 'grad-group';
}

export function LetterBox({ slug, linkData, theme }: LetterBoxProps) {
  // Single implementation với theme switch bên trong
  const themeConfig = getThemeConfig(theme);
  // ... (existing logic from love/LetterBox.tsx)
}
```

Mỗi template chỉ import từ shared:

```tsx
// src/components/templates/love/LoveTemplate.tsx
import { LetterBox } from "@/components/templates/shared/LetterBox";
import { GameSection } from "@/components/templates/shared/GameSection";
```

**Tuy nhiên** — nếu mỗi template cần chỉnh sửa giao diện letter riêng (e.g., corkboard cho GRAD_GROUP, wish jar cho GRAD_PERSONAL), cần **theme variants**:

```tsx
// src/components/templates/shared/LetterBox.tsx
export type LetterTheme = 'classic' | 'corkboard' | 'wishjar';

export function LetterBox({ slug, linkData, theme }: LetterBoxProps) {
  switch (theme) {
    case 'corkboard':
      return <CorkboardLetterBox {...} />;
    case 'wishjar':
      return <WishJarLetterBox {...} />;
    default:
      return <ClassicLetterBox {...} />;
  }
}
```

**Estimated savings**:
- Xóa 4 LetterBox files identical (~625 dòng × 4 = 2500 dòng)
- Xóa 3 GameSection files identical (~229 dòng × 3 = 690 dòng)
- Bundle giảm **~200KB** (đã được dynamic import nên tích lũy khi user mở letter/game tab)

**Lưu ý**: Giữ nguyên cấu trúc decoupled cho **variants đặc biệt** (corkboard, wishjar) — chỉ dedupe các phần giống nhau.

---

## 🟠 P1.2 — ThemeWrapper MutationObserver + 3 useEffects

`src/components/theme/ThemeWrapper.tsx:140-244`:
- 3 useEffect riêng biệt (localStorage, event listener, MutationObserver)
- MutationObserver quan sát `document.documentElement.attributes`
- Re-render không cần thiết khi theme không đổi

**Fix**: Gộp logic + bỏ MutationObserver (không cần thiết — theme chỉ đổi qua user interaction):

```tsx
"use client";
import { useEffect, useState, ReactNode } from "react";

export function ThemeWrapper({ config, children, type }: ThemeWrapperProps) {
  const [isDark, setIsDark] = useState(false);
  
  // SINGLE effect: init + listen + cleanup
  useEffect(() => {
    // 1. Init from localStorage
    const slug = window.location.pathname.split('/')[1];
    const saved = localStorage.getItem(`theme_mode_${slug}`);
    if (saved) setIsDark(saved === "dark");
    
    // 2. Listen to theme changes (only event, no MutationObserver)
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail?.isDark === "boolean") setIsDark(detail.isDark);
    };
    window.addEventListener("theme-change", handler);
    return () => window.removeEventListener("theme-change", handler);
  }, []); // ← Empty deps, run once
  
  // SINGLE effect: apply theme
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--theme-bg", resolvedBgColor);
    // ...
    root.classList.toggle("dark", isDark);
    return () => {
      root.classList.remove("dark");
    };
  }, [isDark, resolvedBgColor, resolvedAccentColor, resolvedTextColor]);
  
  return <div style={...}>{children}</div>;
}
```

**Tác động**: TBT giảm **~50ms**, ít re-render hơn.

---

## 🟡 P1.3 — Lazy load admin pages

`src/app/admin/` được bundle cùng route `/{slug}` vì Next.js có thể prefetch khi user click vào admin link.

**Fix**: Dùng `next/link` với `prefetch={false}` cho admin link (hoặc chuyển admin sang subdomain).

Đơn giản hơn: Wrap admin pages trong dynamic import:

```tsx
// src/app/admin/layout.tsx
import dynamic from "next/dynamic";

const AdminLayout = dynamic(() => import("./admin-layout-inner"), { ssr: false });
```

**Tác động**: JS bundle của slug pages giảm **~50KB**.

---

## 🟡 P1.4 — Lazy load edit page components

`src/app/[slug]/edit/edit-client.tsx` (496 dòng) đã dynamic import 5 components (EditProfileForm, EditConfigForm, GalleryManager, TimelineManager). 

**Vấn đề còn lại**: 
- `EditGradProfileForm` (1029 dòng), `EditGradGroupProfileForm` (751 dòng) import trong dispatcher `EditProfileForm.tsx`
- Form Zod schemas bundle toàn bộ

**Fix**: Dynamic theo LinkType:

```tsx
// src/components/edit/EditProfileForm.tsx
const EditIdolProfileForm = dynamic(() => import("./EditIdolProfileForm").then(m => m.EditIdolProfileForm));
const EditGradProfileForm = dynamic(() => import("./EditGradProfileForm").then(m => m.EditGradProfileForm));
const EditGradGroupProfileForm = dynamic(() => import("./EditGradGroupProfileForm").then(m => m.EditGradGroupProfileForm));

// Dispatch:
switch (linkType) {
  case "IDOL": return <EditIdolProfileForm {...} />;
  case "GRAD_PERSONAL":
  case "GRAD_CLASS":
    return <EditGradProfileForm {...} />;
  case "GRAD_GROUP":
    return <EditGradGroupProfileForm {...} />;
}
```

**Tác động**: Edit page bundle giảm **~80KB** initial.

---

## 🟡 P2.1 — Pagination cho galleries/timelines/letters

Hiện tại `getLinkData` fetch **toàn bộ** galleries/timelines/letters trong 1 query. Với user có 20 ảnh + 10 timeline + nhiều letters → JSON payload có thể >1MB.

**Fix**: Lazy load từng phần qua Suspense:

```tsx
// src/app/[slug]/page.tsx (Server Component)
import { Suspense } from "react";

export default async function SlugPage({ params }) {
    const { slug } = await params;
    const initialData = await getInitialData(slug); // Chỉ lấy profile + config + 5 galleries đầu
    
    return (
        <Suspense fallback={<TemplateSkeleton />}>
            <SlugPageClient initialData={initialData} slug={slug} />
        </Suspense>
    );
}
```

Trong `SlugPageClient`:
- Galleries đầu (5 ảnh) render ngay
- Còn lại lazy load khi user switch tab

**Tác động**: Initial response giảm **~300-500KB** JSON.

---

## 🟡 P2.2 — Next/Image optimization

Kiểm tra templates đang dùng `<Image>` từ next/image nhưng:
- Không có `placeholder="blur"` → no LQIP
- Không có `sizes` prop → browser tải ảnh lớn hơn cần
- Không có `priority` cho ảnh above-the-fold

**Fix template-by-template**:

```tsx
// LoveTemplate hero image
<Image
  src={boyAvatar}
  alt={boyName}
  width={120}
  height={120}
  priority              // ← Hero image
  placeholder="blur"
  blurDataURL={LQIP}    // ← Generate hoặc dùng default
  sizes="(max-width: 768px) 100vw, 120px"
/>

// Gallery images (lazy by default)
<Image
  src={gallery.image_url}
  alt={gallery.caption}
  width={500}
  height={500}
  sizes="(max-width: 768px) 50vw, 33vw"
  loading="lazy"
/>
```

**Generate LQIP server-side**:
- Supabase Storage hỗ trợ transformation: `?width=20&format=webp`
- Hoặc dùng `plaiceholder` package

**Tác động**: LCP cải thiện **~500ms-1s** (LCP element thường là hero avatar).

---

## 🟡 P2.3 — Streaming với Suspense

Next.js App Router hỗ trợ streaming HTML. Hiện tại page-client.tsx là client component → không tận dụng được.

**Fix**: Tách data fetching ra server components:

```tsx
// src/app/[slug]/page.tsx (Server Component - Streamable)
export default async function SlugPage({ params }) {
    const { slug } = await params;
    
    return (
        <>
            <SlugHeader slug={slug} />  {/* Server - render ngay */}
            <Suspense fallback={<Loading />}>
                <SlugData slug={slug} />  {/* Server - stream khi data ready */}
            </Suspense>
        </>
    );
}

async function SlugData({ slug }) {
    const data = await getLinkData(slug);
    if (!data.success) notFound();
    return <SlugPageClient initialData={data.data} slug={slug} />;
}
```

**Tác động**: TTFB + perceived load time giảm **~500ms**.

---

## 🟢 P3.1 — Route-level code splitting tối ưu hơn

Đã dynamic templates, nhưng có thể tốt hơn bằng cách:

```
src/app/[slug]/
├── page.tsx                      # Auth check + redirect
├── (unlocked)/
│   └── [type]/
│       ├── love/page.tsx         # Lazy LOVE template
│       ├── idol/page.tsx         # Lazy IDOL template
│       └── ...
└── (locked)/
    └── page.tsx                  # Lock screen
```

Cách này giúp mỗi template có route riêng → Next.js tự động chunk per-route.

**Trade-off**: Phức tạp hơn, có thể breaking change. Chỉ làm nếu cần tối ưu sâu hơn sau P1.

---

## 🟢 P3.2 — Bundle analyzer + CI guard

Cài `@next/bundle-analyzer`:

```bash
npm install --save-dev @next/bundle-analyzer
```

```js
// next.config.mjs
import withBundleAnalyzer from "@next/bundle-analyzer";

const withPWA = ...;
const bundleAnalyzer = withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

export default bundleAnalyzer(withPWA(nextConfig));
```

```json
// package.json
"analyze": "ANALYZE=true npm run build"
```

Thêm budget guard trong CI (optional):

```json
// .size-limit.json
[
  { "path": ".next/static/chunks/main-*.js", "limit": "200 KB" },
  { "path": ".next/static/chunks/pages/_app-*.js", "limit": "100 KB" }
]
```

---

## 🟢 P3.3 — CSS purging audit

Tailwind 3+ đã purge tốt, nhưng kiểm tra:
- Custom CSS trong `globals.css` có còn dùng không
- LockScreen custom keyframes (`drift`, `shake`, `pulseSlow`) có bị nhúng global không
- WelcomeOverlay 9 variants có CSS thừa không

**Fix**: Audit bằng PurgeCSS hoặc đọc lại từng file, đảm bảo mỗi class Tailwind thực sự dùng.

---

## CHECKLIST TRIỂN KHAI

### Tuần 1 (P0 + P1)
- [ ] **P0.1**: Xóa 11 Google Fonts khỏi `layout.tsx`, thay bằng `next/font/google` subset
- [ ] **P0.2**: Dynamic import WelcomeOverlay trong `page-client.tsx`
- [ ] **P0.3**: Gộp 2 query trong `getLinkData` 
- [ ] **P0.4**: Switch-based dynamic import cho 6 templates
- [ ] **P0.5**: Xóa import MusicPlayer
- [ ] **P1.1**: Refactor LetterBox/GameSection → shared components
- [ ] **P1.2**: Gộp ThemeWrapper useEffects + bỏ MutationObserver
- [ ] **P1.3**: Lazy load admin pages
- [ ] **P1.4**: Dynamic import edit forms theo LinkType
- [ ] **Verify**: `npm run build`, kiểm tra bundle size
- [ ] **Test**: Manual test tất cả 6 templates trên dev

### Tuần 2 (P2)
- [ ] **P2.1**: Pagination galleries/timelines/letters
- [ ] **P2.2**: Next/Image optimization (sizes, blur, priority)
- [ ] **P2.3**: Streaming với Suspense
- [ ] **Verify**: Lighthouse score > 85
- [ ] **Test**: Mobile viewport (375px, 768px)

### Tuần 3 (P3)
- [ ] **P3.1**: Route-level splitting (optional)
- [ ] **P3.2**: Bundle analyzer + size-limit CI
- [ ] **P3.3**: CSS purging audit
- [ ] **Final**: Lighthouse Performance > 90, FCP < 1.5s

---

## METRICS ĐO LƯỜNG

Trước khi bắt đầu, chạy Lighthouse để có baseline:

```bash
# Build production
npm run build
npm start

# Lighthouse (cần Chrome)
npx lighthouse http://localhost:3000/<test-slug> --view
```

**Baseline metrics cần đo**:
- **FCP** (First Contentful Paint): mục tiêu < 1.5s
- **LCP** (Largest Contentful Paint): mục tiêu < 2.5s
- **TBT** (Total Blocking Time): mục tiêu < 200ms
- **CLS** (Cumulative Layout Shift): mục tiêu < 0.1
- **Bundle size** (main + initial chunks): mục tiêu < 500KB
- **TTFB** (Time To First Byte): mục tiêu < 600ms

Đo trước/sau mỗi P0 để verify impact.

---

## RỦI RO & LƯU Ý

1. **Hydration mismatch**: Khi dynamic import WelcomeOverlay/ThemeWrapper, cần đảm bảo không có SSR/CSR mismatch. Dùng `ssr: false` cho client-only components.

2. **Auth bypass**: Bài fix P0.3 gộp query có thể ảnh hưởng đến security check. Cần test kỹ:
   - Cookie hợp lệ → access granted
   - Cookie sai → unauthorized
   - Link deactivated → unauthorized

3. **Decoupled templates**: Khi dedupe LetterBox/GameSection, cần test từng template riêng để đảm bảo variant (corkboard, wishjar) vẫn hoạt động đúng.

4. **Font subsetting**: `next/font/google` tự subset, nhưng cần đảm bảo font đó hỗ trợ Vietnamese characters (Inter, Roboto, Poppins, Montserrat, Quicksand, Nunito, Pacifico, Caveat có; một số có thể thiếu dấu).

5. **Image optimization**: Supabase URLs có transformation API — verify `?.width=20` syntax hoạt động. Nếu không, dùng placeholder mặc định.

6. **Regression test**: Sau mỗi P0, test luồng:
   - Truy cập `/{slug}` → LockScreen → nhập PIN → WelcomeOverlay → Template render
   - Switch tabs (gallery/timeline/letters/game)
   - Edit page: switch 4 tabs

---

## TÀI LIỆU THAM KHẢO

- [Next.js Performance Docs](https://nextjs.org/docs/app/building-your-application/optimizing)
- [next/font Optimization](https://nextjs.org/docs/app/api-reference/components/font)
- [Dynamic Imports](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [Web Vitals](https://web.dev/vitals/)
- [React Suspense Streaming](https://nextjs.org/docs/app/api-reference/file-conventions/loading)

---

*Plan tạo ngày 21/06/2026. Review và update sau mỗi sprint.*