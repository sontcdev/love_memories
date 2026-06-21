# CODEBASE SUMMARY - Love Memories

> Tài liệu tổng hợp toàn bộ mã nguồn dự án **Love Memories** (cập nhật: 21/06/2026).
> Stack: Next.js 14.2.35 (App Router) · TypeScript 5 · React 18 · Prisma 6.19.1 · PostgreSQL (Supabase) · Tailwind CSS 3.4.1 · next-pwa 5.6.0.

---

## 1. TỔNG QUAN

**Love Memories** là nền tảng tạo website kỷ niệm cá nhân hóa. Mỗi người dùng có một đường dẫn duy nhất `/{slug}` được bảo vệ bằng mã PIN 6 số, cho phép lưu giữ:

- Thư viện ảnh (gallery)
- Dòng thời gian kỷ niệm (timeline)
- Thư tay với ngày mở khóa (letters)
- Trò chơi thẻ bài / đố vui (game)
- Đếm ngày yêu (day counter)

Hệ thống hỗ trợ **6 templates** (Love, Love2, Idol, Grad-Personal, Grad-Class, Grad-Group), tích hợp PWA, quản lý qua trang admin riêng.

---

## 2. CẤU TRÚC THƯ MỤC

```
love_memories/
├── prisma/
│   ├── schema.prisma              # 10 models, 2 enums
│   └── seed.ts                    # 30 game cards (EASY/MEDIUM/HARD)
├── scripts/                       # Tiện ích npx tsx
│   ├── reset-admin.ts             # Reset admin (admin/admin123)
│   ├── activate-links.ts          # Activate tất cả link
│   ├── check-slug.ts              # Inspect 1 slug
│   └── update-music.ts            # Bulk set music_url
├── src/
│   ├── middleware.ts              # Auth: admin + session_{slug}
│   ├── lib/
│   │   ├── prisma.ts              # Singleton Prisma client
│   │   ├── supabase.ts            # Storage client (bucket "memories")
│   │   ├── utils.ts               # cn(), generateSlug(), generatePin()
│   │   └── edit-theme.ts          # Theme classes cho edit page
│   ├── app/
│   │   ├── layout.tsx             # Root layout + theme preload script
│   │   ├── page.tsx               # Redirect → /admin/login
│   │   ├── error.tsx              # Error boundary
│   │   ├── not-found.tsx          # 404 page
│   │   ├── offline/page.tsx       # PWA offline page
│   │   ├── api/upload/route.ts    # POST upload (max 10MB)
│   │   ├── actions/               # Server Actions (8 files)
│   │   │   ├── auth-actions.ts        # verifyLinkPassword, checkLinkAccess, getLinkData
│   │   │   ├── profile-actions.ts     # updateLinkProfile, updateLinkConfig (5 profile types)
│   │   │   ├── gallery-actions.ts     # add/update/delete/reorder gallery, timeline CRUD
│   │   │   ├── timeline-actions.ts    # upsertTimelineEvent (max 10), delete
│   │   │   ├── letter-actions.ts      # createLetter, replyToLetter (max 300 chars), delete
│   │   │   ├── game-actions.ts        # drawCard, submitQuizVote, getQuizStats
│   │   │   ├── game-card-actions.ts   # CRUD game cards (admin)
│   │   │   └── admin-actions.ts       # loginAdmin, createLink, resetPin, deleteLink, ...
│   │   ├── admin/                 # Trang quản trị
│   │   │   ├── layout.tsx, page.tsx (redirect)
│   │   │   ├── login/page.tsx
│   │   │   ├── setup/page.tsx      # Tạo admin lần đầu
│   │   │   ├── links/              # CRUD link người dùng
│   │   │   ├── game-cards/         # CRUD thẻ bài game
│   │   │   └── logout/route.ts     # POST logout
│   │   └── [slug]/
│   │       ├── page.tsx           # Public slug page (server)
│   │       ├── page-client.tsx    # Auth + render template (client)
│   │       ├── loading.tsx        # Skeleton
│   │       └── edit/
│   │           ├── page.tsx, edit-client.tsx, loading.tsx
│   └── components/
│       ├── auth/                  # LockScreen (634), IdolLockScreen (477)
│       ├── theme/ThemeWrapper.tsx # CSS vars + dark mode toggle
│       ├── admin/QRCodeDialog.tsx # Generate + download QR
│       ├── edit/                  # 11 files: EditProfileForm, EditIdolProfileForm,
│       │                          #   EditGradProfileForm, EditGradGroupProfileForm,
│       │                          #   EditConfigForm, GalleryManager, TimelineManager,
│       │                          #   MomentsManager, CareerPathManager, index.ts
│       ├── features/              # LetterBox, GameSection, GalleryGrid, DayCounter
│       ├── media/                 # VoiceRecorder, VideoPlayer, VideoInput
│       ├── music/                 # MusicPlayer (đã disable), WelcomeOverlay
│       ├── providers/             # LoadingProvider, NavigationProgress
│       ├── pwa/PWAInstallPrompt.tsx
│       ├── templates/             # 6 templates × 3 files + shared/GalleryLightbox
│       │   ├── love/              # Theme cổ điển (hồng)
│       │   ├── love2/             # Scrapbook / Polaroid
│       │   ├── idol/              # Concert fanpage (holographic)
│       │   ├── grad-personal/     # Emerald desk
│       │   ├── grad-class/        # Blackboard yearbook
│       │   ├── grad-group/        # 3 sub-themes: caravan/scrapbook/station
│       │   └── shared/GalleryLightbox.tsx
│       └── ui/                    # button, input, dialog, ImageUpload, ImageCropperModal...
├── public/                        # PWA assets, images
├── docx/plan_fix_1706.md          # Kế hoạch fix 9 issues (17/06/2026)
├── AGENTS.md                      # Hướng dẫn cho AI agents
├── FEATURE.md                     # Tổng quan tính năng
├── DEPLOYMENT.md                  # Hướng dẫn deploy
├── LOVE_TEMPLATE_REPORT.md        # Báo cáo chi tiết LOVE template
├── README.md, schema.sql
├── next.config.mjs                # PWA + image remotePatterns
├── tailwind.config.ts             # CSS variables + dark mode
├── tsconfig.json                  # @/* path alias, exclude scripts
├── postcss.config.mjs             # tailwindcss only
├── .eslintrc.json                 # next/core-web-vitals
└── package.json                   # Scripts: dev, build, db:*
```

**Tổng cộng**: ~76 file `.ts/.tsx` trong `src/`.

---

## 3. CẤU HÌNH & MIDDLEWARE

### `next.config.mjs`
- **Images**: Cho phép `*.supabase.co`, `*.supabase.in`
- **Server actions**: `bodySizeLimit: "10mb"`
- **allowedDevOrigins**: `100.82.144.128`, `157.245.148.90` (LAN dev)
- **PWA** (next-pwa): production-only, runtime caching cho Google Fonts (1 năm), images (30 ngày), Supabase (7 ngày), API (NetworkOnly).

### `tailwind.config.ts`
- Dark mode: `["class"]`
- CSS variables cho `border`, `input`, `ring`, `background`, `foreground`, `primary`, `theme.bg/accent/font`, …
- Custom keyframes: `accordion-down/up`, `shimmer`.

### `tsconfig.json`
- `strict: true`, alias `@/*` → `./src/*`
- **Loại trừ** `scripts/` (chạy riêng với `npx tsx`).

### `package.json` scripts
```bash
dev               # env-cmd -f .env.development next dev --turbo -H 0.0.0.0
build             # prisma generate && env-cmd -f .env.production next build
build:dev|prod    # Variants
start             # next start -H 0.0.0.0
lint              # next lint
postinstall       # prisma generate (auto)
db:push|seed|studio
```

### `src/middleware.ts` (110 dòng)
- **Admin routes** `/admin/*`: yêu cầu cookie `admin_session` (trừ `/admin/login`, `/admin/setup`).
- **Protected slug routes**: `/{slug}/edit`, `/{slug}/letters`, `/{slug}/timeline` → yêu cầu `session_{slug}` (thiếu → redirect `/{slug}?auth=required`).
- **Public**: tất cả còn lại.
- **Bypass**: `_next/static`, `_next/image`, `favicon.ico`, ảnh, `api/`.

---

## 4. DATABASE SCHEMA (10 models)

Database: **PostgreSQL (Supabase)** · Connection pooling qua `DATABASE_URL` + `DIRECT_URL`.

### Enums
- **`LinkType`**: `LOVE` · `LOVE2` · `EVERY` · `IDOL` · `GRAD_PERSONAL` · `GRAD_CLASS` · `GRAD_GROUP`
- **`GameLevel`**: `EASY` · `MEDIUM` · `HARD`

### Models

| Model | Mục đích | Quan hệ chính |
|---|---|---|
| **Admin** | Tài khoản quản trị (bcrypt) | — |
| **User** | Người dùng cuối, **PIN 6 số plain** | `Link?` (1-1) |
| **Link** | Thực thể cốt lõi. `profile_data: Json` chứa toàn bộ template-specific data | user, config, galleries, timelines, letters, quiz_votes |
| **LinkConfig** | Tùy chỉnh visual: bg/accent/text color, font, music | link (1-1) |
| **Gallery** | Ảnh trong thư viện (sort_order, caption) | link (N-1, CASCADE) |
| **Timeline** | Sự kiện (date, title, desc, image/video/audio URL) | link (N-1) |
| **Letter** | Thư tay (unlock_date, is_read, replies) | link, replies |
| **LetterReply** | Phản hồi thư | letter (N-1) |
| **GameCard** | Global thẻ bài game (level, content, is_active) | — |
| **QuizVote** | Vote cho thành viên trong GRAD_GROUP quiz | link (N-1) |

**Quan trọng**: `profile_data` luôn cast `as Prisma.InputJsonValue` khi ghi.

### `prisma/seed.ts`
- Insert 30 game cards (10 EASY + 10 MEDIUM + 10 HARD) câu hỏi cặp đôi. Bỏ qua nếu đã có.

---

## 5. LUỒNG XÁC THỰC

### 5.1. Admin
1. Truy cập `/admin/login` → nhập username/password → `loginAdmin()` (bcrypt verify) → set cookie `admin_session` (7 ngày).
2. `createInitialAdmin()` chỉ chạy được khi chưa có admin nào (`/admin/setup`).
3. `getAdminSession()` verify cookie → trả admin record hoặc `null`.

### 5.2. Người dùng (slug)
1. Truy cập `/{slug}` → server check `session_{slug}` cookie.
   - **Có cookie hợp lệ** → gọi `getLinkData(slug)` → render template.
   - **Không có** → gọi `getLinkPublicData(slug)` → render `LockScreen` (nhập PIN).
2. Nhập PIN (6 số) → `verifyLinkPassword(slug, pin)` so sánh `User.password_hash` (plain, không bcrypt) → set 2 cookies:
   - `session_{slug}` (auth gate, dùng cho middleware)
   - `access_token_{slug}` (auth upload, dùng cho `/api/upload` + server actions)

### 5.3. Edit page
- `checkLinkAccess(slug)` (server-side) → redirect nếu fail → fetch `getLinkData(slug)` → render `EditPageClient`.

---

## 6. SERVER ACTIONS (8 files)

| File | Functions chính |
|---|---|
| `auth-actions.ts` | `verifyLinkPassword`, `checkLinkAccess`, `getLinkData`, `getLinkPublicData`, `getCachedLinkData` (react.cache) |
| `profile-actions.ts` | `updateLinkProfile` (5 type interfaces), `updateLinkConfig` (Zod: hex color, URL), `getLinkForEdit` |
| `gallery-actions.ts` | `addGalleryImage`, `updateGalleryImage`, `deleteGalleryImage`, `reorderGalleryImages`, timeline CRUD |
| `timeline-actions.ts` | `upsertTimelineEvent` (**max 10**), `deleteTimelineEvent`, `getTimelineEventCount` |
| `letter-actions.ts` | `createLetter`, `replyToLetter` (max 300 chars, mark is_read), `deleteLetter`, `deleteReply` |
| `game-actions.ts` | `drawCard(level, excludeIds?)`, `submitQuizVote` (GRAD_GROUP), `getQuizStats` |
| `game-card-actions.ts` | `getGameCards`, `createGameCard`, `deleteGameCard`, `toggleGameCardStatus` |
| `admin-actions.ts` | `loginAdmin`, `logoutAdmin`, `getLinks`, `createLink` (transaction user→link→config), `deleteLink`, `toggleLinkStatus`, `resetLinkPin`, `createInitialAdmin` |

---

## 7. PROFILE DATA INTERFACES

| LinkType | Interface | Fields chính |
|---|---|---|
| `LOVE` / `LOVE2` | `LoveProfileData` | boy_name, girl_name, boy_avatar, girl_avatar, anniversary_date, title, short_note |
| `IDOL` | `IdolProfileData` | idol_name, fan_name, idol_avatar, fan_avatar, debut_date, title, slogan |
| `GRAD_PERSONAL` | `GradPersonalProfileData` | student_name, class_name, school_name, graduation_year, student_avatar, slogan, dream_job, dream_university, title, **quiz[]**, **goals[]** |
| `GRAD_CLASS` | `GradClassProfileData` | class_name, school_name, graduation_year, slogan, members_count, homeroom_teacher (name/avatar/message), class_officers_monitor, class_officers_vice_monitor, title |
| `GRAD_GROUP` | `GradGroupProfileData` | group_name, group_avatar, graduation_year, slogan, title, **theme** (`caravan`\|`scrapbook`\|`station`), **members[]** (name, nickname, avatar, quote, dream_university, dream_job, facebook, instagram), quiz[], quiz_badges{}, goals[] |

---

## 8. TEMPLATES (6 — mỗi template decoupled hoàn toàn)

Mỗi template có bộ 3 file riêng: `*Template.tsx`, `LetterBox.tsx`, `GameSection.tsx` (chia sẻ code ở mức minimal, để chỉnh sửa độc lập).

| Folder | Theme | Mô tả | Night/Light |
|---|---|---|---|
| `love/` | Classic Love | Avatar cặp đôi, dancing-script title, day counter. 4 tabs: gallery, timeline, letters, game | ❌ |
| `love2/` | Scrapbook / Polaroid | Giấy kraft, washi tape, polaroid xoay, falling petals. 5 tabs (home + 4) | ✅ |
| `idol/` | Concert Fanpage | Holographic stage, neon grid, laser beams, bokeh. Hearts counter, countdown debut. 5 tabs (home + 4) | ✅ |
| `grad-personal/` | Emerald Desk | Gỗ/nâu, cánh hoa rơi, nón tốt nghiệp, notebook với spiral rings. 5 tabs | ✅ |
| `grad-class/` | Blackboard Yearbook | Bảng đen phấn, bụi phấn. Member 3D flip cards. 5 tabs | ✅ |
| `grad-group/` | Chuyến Xe Thanh Xuân | **3 sub-themes** (`caravan`/`scrapbook`/`station`). 6 tabs (members + 5). Corkboard sticky notes | ✅ |

### Sub-themes GRAD_GROUP
- **caravan** (default): gỗ/amber, particles ✈️, compass emblem
- **scrapbook**: kraft paper, sticker 📸
- **station**: violet/cyberpunk, rain animation, train emblem

### State Night/Light Mode
- `localStorage` key: `theme_mode_{slug}`
- **TDZ gotcha**: phải khởi tạo `isDark` TRƯỚC helper functions dùng nó.

### Special games theo template
- `love/love2/grad-class`: Card flip 3D, 3 levels (EASY/MEDIUM/HARD)
- `idol`: Card flip (giống love)
- `grad-personal`: **Quiz** multiple choice + badge (Tri Kỷ Tri Âm/Bạn Thân/Bạn Xã Giao/Người Lạ)
- `grad-group`: **Vote** cho thành viên qua `submitQuizVote()` → hiển thị top voted

---

## 9. EDIT PAGE (`src/app/[slug]/edit/`)

`edit-client.tsx` (496 dòng) — Client component với 4 tabs: `profile`, `gallery`, `timeline`, `settings`.

### Theme layout theo type
- **Love/Love2**: white card
- **Idol**: holographic stage + neon grid, laser beams, bokeh
- **GRAD_***: notebook layout — wood sidebar, lined paper, spiral rings (màu sắc thay đổi theo sub-theme qua `getEditThemeClasses()`)

### Components sử dụng (dynamic import, ssr: false)
- `EditProfileForm` (dispatcher theo LinkType)
- `EditConfigForm` / `EditIdolConfigForm` (theme colors, fonts)
- `GalleryManager` — max 20 ảnh, 5/batch, drag-drop reorder (@dnd-kit)
- `TimelineManager` — max 10 events, useOptimistic
- `MomentsManager` — phiên bản cũ của GalleryManager
- `CareerPathManager` — phiên bản Idol của TimelineManager

### Tính năng
- Theme toggle (Sun/Moon) cho IDOL + GRAD_*
- QR Code panel ở sidebar (Idol/Grad) → generate URL `${origin}/${slug}` qua `react-qr-code` + `html-to-image`
- Nút "Xem trang" → back to `/{slug}`

---

## 10. LOCK SCREEN & WELCOME OVERLAY

### `LockScreen.tsx` (634 dòng) — Tất cả template trừ Idol
- 6 ô input số, auto-submit khi đầy, hỗ trợ keyboard global (0-9/Backspace/Esc/Enter).
- Per-template theme config (gradient, particles, icons).
- LocalStorage: `theme_mode_{slug}`.

### `IdolLockScreen.tsx` (477 dòng) — Idol-specific
- Holographic theme: gradient orbs, 15 bokeh particles, neon ring around idol avatar.

### `WelcomeOverlay.tsx` (900+ dòng)
- Overlay toàn màn hình trước khi vào page. `sessionStorage['welcome_shown']`.
- 9 thiết kế khác nhau theo LinkType + sub-theme.
- Click → `onOpen()` → trigger `MusicPlayer.play()`.

---

## 11. CÁC MODULE TÍNH NĂNG (`src/components/features/`)

| Component | Mô tả |
|---|---|
| `LetterBox.tsx` (660) | Quản lý thư: tạo, mở khóa theo `unlock_date`, reply (max 300 chars). Hỗ trợ ảnh/YouTube/TikTok/audio. Theme colors: love/every/idol |
| `GameSection.tsx` (250) | Card flip 3D, 3 levels, shuffle qua `excludeIds` |
| `GalleryGrid.tsx` (198) | Grid + lightbox modal với keyboard nav (Esc/←/→), shimmer skeleton |
| `DayCounter.tsx` (155) | Real-time elapsed (years/months/days/hours/min/sec), update 1s hoặc 60s |

---

## 12. MEDIA COMPONENTS

| File | Chức năng |
|---|---|
| `VoiceRecorder.tsx` (417) | MediaRecorder API, **max 300s**, MIME fallback (webm/opus → webm → ogg → m4a), iOS Safari compat, upload `/api/upload` với `type="voice"` |
| `VideoPlayer.tsx` (142) | Parse YouTube (watch?v=, youtu.be/, embed/, shorts/) → embed iframe. TikTok → link card (embed unreliable) |
| `VideoInput.tsx` (230) | URL input + real-time validation + thumbnail preview |

---

## 13. UI COMPONENTS (`src/components/ui/`)

| File | Mô tả |
|---|---|
| `button.tsx` | CVA variants (default/destructive/outline/secondary/ghost/link × size sm/lg/icon) + `asChild` |
| `input.tsx`, `textarea.tsx`, `label.tsx` | Form primitives (Radix label) |
| `dialog.tsx` | Radix Dialog (Root/Trigger/Portal/Overlay/Content/Header/Footer/Title/Description) |
| `select.tsx` | Radix Select full bộ |
| `switch.tsx` | Custom toggle (role="switch") |
| `table.tsx` | HTML table primitives |
| `ConfirmDialog.tsx` | Variants danger/warning/info với icon + button colors |
| `ImageUpload.tsx` (344) | **Binary search compression** (50KB target, 1920px max, 8 attempts). Drag-drop, preview. POST `/api/upload` |
| `MultiImageUpload.tsx` (325) | Max 5 files, parallel processing, status grid (pending/compressing/uploading/done/error) |
| `ImageCropperModal.tsx` (340) | Square crop 280×280, zoom 1-3x, output 400×400 JPEG q=0.9 |
| `ShimmerImage.tsx` | Next/Image wrapper với skeleton loading |

---

## 14. PROVIDERS

- **`LoadingProvider.tsx`** (57): Context `useLoading()` → spinner overlay + message
- **`NavigationProgress.tsx`** (71): Top progress bar gradient (pink→purple→indigo) khi route change, click delegation trên `<a>`

---

## 15. MUSIC PLAYER (TẠM THỜI DISABLED)

`MusicPlayer.tsx` (300 dòng) hiện đang được **comment-out** trong `page-client.tsx` do lỗi YouTube/TikTok playback trên production (xem `docx/plan_fix_1706.md` issue #5+#6).

- Hỗ trợ YouTube (qua IFrame API) + audio files (HTMLAudioElement)
- Auto-mute start để bypass autoplay policy → unmute khi user interaction
- Pause event từ `VoiceRecorder`

---

## 16. PWA

- **next-pwa**: production-only
- **PWAInstallPrompt.tsx**: lắng nghe `beforeinstallprompt`, delay 5s, localStorage `pwa-install-dismissed`, slide-in animation
- **offline/page.tsx**: PWA offline fallback với SVG heart

---

## 17. ADMIN PAGES

| Route | Mô tả |
|---|---|
| `/admin/login` | Form username/password → `loginAdmin()` |
| `/admin/setup` | One-time tạo admin đầu tiên (cảnh báo xóa sau khi tạo) |
| `/admin/links` | Bảng liên kết: tạo link (username + PIN + LinkType), toggle status, reset PIN, delete, QR code |
| `/admin/game-cards` | CRUD thẻ bài game với filter EASY/MEDIUM/HARD |
| `/admin/logout` (POST) | Clear `admin_session` → redirect login |

### `links-table.tsx` (718 dòng)
- 6 cột: Username, Liên kết, Giao diện (icon + badge theo type), Trạng thái, Ngày tạo, Hành động.
- Create Dialog → Credentials Dialog với copy buttons.
- QR Code Dialog → `QRCodeDialog` (6 presets + custom color, transparent bg, PNG download).
- Reset PIN Dialog (custom 6 digits hoặc random).

---

## 18. SCRIPTS (npx tsx)

```bash
npx tsx scripts/reset-admin.ts     # admin/admin123
npx tsx scripts/activate-links.ts  # is_active: true cho tất cả
npx tsx scripts/check-slug.ts      # Inspect hardcoded slug '7n8ybjex'
npx tsx scripts/update-music.ts    # Bulk set music_url cho tất cả config
```

---

## 19. GIỚI HẠN

### Media
- Gallery: **20 ảnh**, batch **5**, target **50KB**
- Timeline: **10 events**
- Voice: **300 giây**
- Image upload: **50KB** target, **1920px** max width, binary search compression

### Text
- Names: **50 chars**
- Letter title: **50** / content: **1000**
- Timeline title: **50** / description: **300**
- Gallery caption: **50**
- Letter reply: **300**

### GRAD_GROUP
- Members: **12** khuyến nghị
- Goals: `profile_data.goals[]`
- Quiz questions: **10 max**, 4 options mỗi câu

### API
- Upload max: **10MB** (server actions cũng 10MB)
- Image crop output: 400×400 JPEG q=0.9

---

## 20. CÁC VẤN ĐỀ ĐANG MỞ (`docx/plan_fix_1706.md` — 17/06/2026)

| # | Mức độ | Vấn đề | File ảnh hưởng |
|---|---|---|---|
| 1 | **High** | Color picker không save/load đúng (thiếu `accent_color` trong `initialConfig`) | `edit-client.tsx`, `EditConfigForm` |
| 2 | Medium | Chưa có `text_color` (cần schema + UI) | `LinkConfig`, template |
| 3 | **Critical** | Truy cập `/{slug}` không cần PIN khi `session` cookie tồn tại không hợp lệ | `page.tsx`, `page-client.tsx` |
| 4 | Medium | GRAD_GROUP: "Niên khóa" → "Mốc thời gian", hiển thị 3 dòng | `GradGroupTemplate` |
| 5+6 | Medium | Ẩn MusicPlayer (YouTube/TikTok lỗi) | `page-client.tsx` |
| 7 | Medium | Batch upload không hoạt động | `MultiImageUpload` |
| 8 | Medium | Voice recording không hoạt động | `VoiceRecorder` |
| 9 | Low | Xóa nút "Chia sẻ bình chọn" GRAD_GROUP quiz | `GameSection.tsx` (grad-group) |

**Thứ tự ưu tiên**: #3 (auth) > #1 (color) > #7 (batch) > #8 (voice) > #5+6 (hide music) > #4 (rename) > #2 (text color) > #9 (remove share).

---

## 21. GOTCHAS & LƯU Ý KỸ THUẬT

1. **Prisma JSON cast**: `profile_data: data as Prisma.InputJsonValue` (import từ `@prisma/client`)
2. **TDZ trong templates**: Khởi tạo `isDark` TRƯỚC helper functions dùng nó
3. **Cookies per-slug**: `session_{slug}`, `access_token_{slug}` — KHÔNG dùng global
4. **PWA auto-generated**: Không sửa `public/sw.js`, `workbox-*.js`
5. **Image compression client-side**: Binary search trong `ImageUpload`
6. **Scripts excluded**: `tsconfig.json` loại trừ `scripts/`, chạy bằng `npx tsx`
7. **Sub-themes trong JSON**: `GRAD_GROUP` theme lưu ở `profile_data.theme`, không phải DB column
8. **Prisma trên Windows**: Dùng WSL hoặc elevated permissions cho `prisma generate`
9. **MusicPlayer disabled**: Đang tạm ẩn do bug YouTube/TikTok playback
10. **Login PIN plain text**: `User.password_hash` là PIN 6 số dạng plain (không bcrypt) — chỉ bcrypt cho `Admin.password_hash`
11. **Dark mode CSS**: `ThemeWrapper` set CSS vars (`--theme-bg`, `--theme-font`, `--theme-accent`, `--theme-text`) + global `.dark` class
12. **ThemeWrapper optimizeColor**: dark mode cần HSL L≥62, light mode cần L≤45

---

## 22. TÀI LIỆU LIÊN QUAN

- **`AGENTS.md`** — Hướng dẫn AI agents (auto-generated)
- **`FEATURE.md`** (140) — Tổng quan tính năng & kiến trúc
- **`DEPLOYMENT.md`** (614) — Hướng dẫn deploy (IP:Port, Domain + Cloudflare, PM2, SSL, troubleshooting 8 lỗi)
- **`LOVE_TEMPLATE_REPORT.md`** (412) — Báo cáo chi tiết LOVE template (Zod schemas, 8 tính năng chính, 8 gợi ý cải tiến)
- **`docx/plan_fix_1706.md`** (404) — Kế hoạch fix 9 issues
- **`README.md`** — Default Next.js README
- **`schema.sql`** — SQL schema dump

---

## 23. ENDPOINTS TÓM TẮT

| Method | Path | Auth | Mục đích |
|---|---|---|---|
| `POST` | `/api/upload` | `access_token_{slug}` | Upload file (max 10MB) → Supabase bucket `memories` |
| `POST` | `/admin/logout` | — | Clear admin session |

---

## 24. STACK & DEPENDENCIES CHÍNH

| Category | Thư viện |
|---|---|
| Framework | Next.js 14.2.35, React 18 |
| Language | TypeScript 5 |
| Database | Prisma 6.19.1, @prisma/client, Supabase JS |
| Auth | bcryptjs (Admin only), cookie-based sessions |
| UI | Radix UI (dialog, label, select, slot), lucide-react, react-qr-code |
| Form | react-hook-form 7.69, @hookform/resolvers, Zod 4.2 |
| Style | Tailwind 3.4.1, tailwind-merge, class-variance-authority, tailwindcss-animate |
| Drag-drop | @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities |
| Media | html-to-image, MediaRecorder API (native), YouTube IFrame API (native) |
| PWA | next-pwa 5.6.0 |
| Misc | react-swipeable (lightbox), env-cmd (env switching), tsx (script runner) |

---

*Tài liệu được tạo tự động từ khảo sát toàn bộ codebase. Cập nhật khi có thay đổi lớn.*