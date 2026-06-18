# Plan Fix - 17/06/2026

## Tổng quan 9 issues từ feedback

| # | Issue | Mức độ | Template ảnh hưởng |
|---|---|---|---|
| 1 | **BUG:** Chọn màu nền/màu nhấn → save → load lại không hiển thị màu đã chọn + đổi tên "Màu nền" → "Màu nền màn hình chờ" | **High** | ALL |
| 2 | Thêm chọn màu chữ | Medium | ALL |
| 3 | Truy cập web không cần nhập mật khẩu | **Critical** | ALL |
| 4 | Đổi "Niên khóa tốt nghiệp" → "Mốc thời gian" + hiển thị 3 dòng (Tiêu đề / Mốc thời gian / Slogan) | Medium | GRAD_GROUP |
| 5 | Ẩn music player (YouTube/TikTok không phát được) | Medium | ALL |
| 6 | Ẩn music player (giống #5 - cùng là lỗi phát nhạc) | Medium | ALL |
| 7 | Không up ảnh hàng loạt được | Medium | ALL (GalleryManager) |
| 8 | Không ghi âm được | Medium | ALL (LetterBox) |
| 9 | Xóa chia sẻ bình chọn ở câu đố | Low | GRAD_GROUP |

---

## Issue 1: BUG - Chọn màu → Save → Load lại không hiển thị màu đã chọn + Đổi tên label

### Vấn đề
- Chọn màu nền hoặc màu nhấn → bấm Save → báo thành công → nhưng load lại trang thì màu đã chọn không được hiển thị.
- Đổi label "Màu nền" thành "Màu nền màn hình chờ".

### Nguyên nhân (ĐÃ XÁC ĐỊNH)

**Bug 1: `accent_color` bị thiếu khi truyền `initialConfig`**
- File: `src/app/[slug]/edit/edit-client.tsx` (lines 503-508 và 514-519)
- Khi truyền `initialConfig` cho `EditConfigForm` và `EditIdolConfigForm`, field `accent_color` **KHÔNG được truyền**:
  ```tsx
  initialConfig={linkData.config ? {
      background_color: linkData.config.background_color ?? undefined,
      // accent_color: BỊ THIẾU!
      font_family: linkData.config.font_family ?? undefined,
      music_url: linkData.config.music_url ?? undefined,
      auto_play: linkData.config.auto_play,
  } : null}
  ```
- Hậu quả: Form luôn dùng default `#ec4899` (hoặc `#a855f7` cho IDOL) thay vì giá trị đã lưu trong DB.

**Bug 2: LockScreen.tsx KHÔNG dùng `config.background_color`**
- File: `src/components/auth/LockScreen.tsx` (lines 154-327)
- Lock screen **hardcode** gradient class theo từng template type, hoàn toàn bỏ qua `config.background_color` từ DB.
- Chỉ `IdolLockScreen.tsx` dùng `--theme-bg` từ config.
- Hậu quả: Dù user chọn màu nền và save thành công, lock screen vẫn hiển thị gradient hardcode.

**Bug 3: Edit page không re-fetch data sau khi save**
- Sau khi `updateLinkConfig()` thành công → `revalidatePath()` được gọi nhưng edit page là client component, không tự re-fetch.
- User phải F5 mới thấy giá trị mới (nhưng vẫn bị Bug 1 nên accent_color vẫn sai).

### Kế hoạch fix

**Bước 1:** Thêm `accent_color` vào `initialConfig` trong edit-client.tsx
- File: `src/app/[slug]/edit/edit-client.tsx`
- Thêm `accent_color: linkData.config.accent_color ?? undefined` vào cả 2 chỗ truyền initialConfig (lines 503-508 và 514-519)

**Bước 2:** Đổi label "Màu nền" → "Màu nền màn hình chờ"
- File: `src/components/edit/EditConfigForm.tsx` (line 130)
- File: `src/components/edit/EditIdolConfigForm.tsx` (line 130)

**Bước 3:** Fix LockScreen.tsx để dùng `config.background_color`
- File: `src/components/auth/LockScreen.tsx`
- Truyền `config` object vào LockScreen component
- Dùng `config.background_color` làm background thay vì hardcode gradient
- Giữ nguyên accent color cho button

**Bước 4:** Re-fetch data sau khi save (optional nhưng recommended)
- File: `src/app/[slug]/edit/edit-client.tsx`
- Sau khi `onSuccess` callback → re-fetch linkData hoặc update local state

### Files cần sửa
1. `src/app/[slug]/edit/edit-client.tsx` - thêm accent_color vào initialConfig (lines 503-519)
2. `src/components/edit/EditConfigForm.tsx` - đổi label (line 130)
3. `src/components/edit/EditIdolConfigForm.tsx` - đổi label (line 130)
4. `src/components/auth/LockScreen.tsx` - dùng config.background_color thay hardcode

---

## Issue 2: Thêm chọn màu chữ

### Vấn đề
- Hiện tại **chưa có** tính năng chọn màu chữ. Text color đang hardcode trong từng template.
- Cần thêm field `text_color` vào config + UI picker + apply lên templates.

### Phân tích code
- **Schema:** `LinkConfig` (prisma/schema.prisma:101-117) - chưa có `text_color`
- **ConfigData interface:** `src/app/actions/profile-actions.ts` (lines 118-124) - chưa có `text_color`
- **ThemeWrapper:** `src/components/theme/ThemeWrapper.tsx` - chưa set `--theme-text`
- **Templates:** Mỗi template hardcode text color riêng

### Kế hoạch

**Bước 1:** Thêm `text_color` vào schema
- File: `prisma/schema.prisma` - thêm field `text_color String? @default("#000000")` vào `LinkConfig`
- Chạy `npm run db:push`

**Bước 2:** Update TypeScript interfaces
- File: `src/app/actions/profile-actions.ts` - thêm `text_color` vào `LinkConfigData`

**Bước 3:** Thêm color picker UI
- File: `src/components/edit/EditConfigForm.tsx` - thêm section "Màu chữ" (tương tự accent color picker)
- File: `src/components/edit/EditIdolConfigForm.tsx` - tương tự

**Bước 4:** Apply text_color lên templates
- File: `src/components/theme/ThemeWrapper.tsx` - thêm CSS variable `--theme-text`
- Update tất cả 6 templates để dùng `var(--theme-text)` thay vì hardcode text color
  - `src/components/templates/love/LoveTemplate.tsx`
  - `src/components/templates/love2/Love2Template.tsx`
  - `src/components/templates/idol/IdolTemplate.tsx`
  - `src/components/templates/grad-personal/GradPersonalTemplate.tsx`
  - `src/components/templates/grad-class/GradClassTemplate.tsx`
  - `src/components/templates/grad-group/GradGroupTemplate.tsx`
- Update LockScreen components:
  - `src/components/auth/LockScreen.tsx`
  - `src/components/auth/IdolLockScreen.tsx`

**Bước 5:** Server action update
- File: `src/app/actions/config-actions.ts` - đảm bảo save/load `text_color`

### Files cần sửa
1. `prisma/schema.prisma`
2. `src/app/actions/profile-actions.ts`
3. `src/components/edit/EditConfigForm.tsx`
4. `src/components/edit/EditIdolConfigForm.tsx`
5. `src/components/theme/ThemeWrapper.tsx`
6. 6 template files
7. 2 lock screen files
8. `src/app/actions/config-actions.ts`

---

## Issue 3: Truy cập web không cần nhập mật khẩu

### Vấn đề
- Trang chính `/[slug]` **KHÔNG được bảo vệ bởi middleware**. Middleware chỉ chặn `/[slug]/edit`, `/[slug]/letters`, `/[slug]/timeline`.
- Lock screen là **client-side only** - dữ liệu đã được server render đầy đủ vào HTML.
- Người dùng có thể view source hoặc intercept data mà không cần nhập PIN.

### Phân tích code
- **Middleware:** `src/middleware.ts` (lines 108-109) - `/[slug]` fall through to public routes
- **Server page:** `src/app/[slug]/page.tsx` (line 58) - fetch full `linkData` server-side, pass to client
- **Client page:** `src/app/[slug]/page-client.tsx` (lines 31-32, 108-113) - lock screen chỉ là UI gate
- **Auth action:** `src/app/actions/auth-actions.ts` - `getLinkData()` (lines 111-124) không check auth
- **SEO metadata:** `src/app/[slug]/page.tsx` (lines 65-138) - expose names, slogans trong meta tags

### Kế hoạch

**Option A: Server-side auth gate (Recommended)**

**Bước 1:** Sửa `src/app/[slug]/page.tsx` - KHÔNG truyền full data khi chưa authenticated
- Nếu chưa có `session_{slug}` cookie → chỉ render LockScreen, KHÔNG fetch linkData
- Nếu authenticated → fetch đầy đủ linkData

**Bước 2:** Lazy load data sau khi unlock
- File: `src/app/[slug]/page-client.tsx`
- Sau khi verify PIN thành công → gọi server action `getLinkData()` để fetch data
- Show loading state trong khi fetch

**Bước 3:** Bảo vệ `getLinkData()` server action
- File: `src/app/actions/auth-actions.ts`
- Kiểm tra `session_{slug}` cookie trước khi trả data

**Bước 4:** Ẩn sensitive data khỏi SEO metadata khi chưa auth
- File: `src/app/[slug]/page.tsx` (lines 65-138)
- Chỉ show generic meta tags khi chưa authenticated

### Files cần sửa
1. `src/app/[slug]/page.tsx` - conditional data fetch
2. `src/app/[slug]/page-client.tsx` - lazy load after unlock
3. `src/app/actions/auth-actions.ts` - auth check in getLinkData

---

## Issue 4: Đổi "Niên khóa tốt nghiệp" → "Mốc thời gian" + Hiển thị 3 dòng

### Vấn đề
- Đổi tên field label từ "Niên khóa tốt nghiệp" thành "Mốc thời gian"
- Hiển thị ra bên ngoài theo thứ tự:
  1. Tiêu đề lưu niệm của nhóm
  2. Mốc thời gian
  3. Slogan của nhóm
- Hiện tại `title` (tiêu đề) **chưa hiển thị** ở GRAD_GROUP template

### Phân tích code
- **Edit form:** `src/components/edit/EditGradGroupProfileForm.tsx`
  - "Niên khóa tốt nghiệp" label: line 334-339
  - "Tiêu đề lưu niệm của nhóm" label: line 342-347
  - "Slogan của nhóm" label: line 350-356
- **Display template:** `src/components/templates/grad-group/GradGroupTemplate.tsx`
  - Header area: lines 216-217, 450-453
  - Hiện đang hiển thị: `"Niên khóa tốt nghiệp {year} * Chung mình bên nhau"`
  - `title` KHÔNG được hiển thị

### Kế hoạch

**Bước 1:** Đổi label trong edit form
- File: `src/components/edit/EditGradGroupProfileForm.tsx`
- Đổi "Niên khóa tốt nghiệp" → "Mốc thời gian" (line ~334)

**Bước 2:** Cập nhật display template
- File: `src/components/templates/grad-group/GradGroupTemplate.tsx`
- Thay đổi header section (lines ~216-217, ~450-453) hiển thị 3 dòng:
  ```
  {title}                    // Tiêu đề lưu niệm của nhóm
  {graduation_year}          // Mốc thời gian (bỏ prefix "Niên khóa...")
  {slogan}                   // Slogan của nhóm
  ```

**Bước 3:** Kiểm tra và update SEO metadata (nếu cần)
- File: `src/app/[slug]/page.tsx` (line 108)

### Files cần sửa
1. `src/components/edit/EditGradGroupProfileForm.tsx`
2. `src/components/templates/grad-group/GradGroupTemplate.tsx`
3. `src/app/[slug]/page.tsx` (SEO metadata)

---

## Issue 5+6: Ẩn Music Player (YouTube/TikTok không phát được)

### Vấn đề
- Trình phát nhạc nền qua link YouTube/TikTok đang bị lỗi không phát được.
- Yêu cầu: **Tạm ẩn** tính năng nhạc nền (cả input trong edit form và player ở màn hình chính).
- Issue 5 và Issue 6 cùng là lỗi phát nhạc → gộp lại.

### Phân tích code
- **Music URL input:** `src/components/edit/EditConfigForm.tsx` (lines 227-254) và `EditIdolConfigForm.tsx` (lines 257-292)
- **Music player:** `src/components/music/MusicPlayer.tsx` (300 lines)
- **Rendered at:** `src/app/[slug]/page-client.tsx` (lines 129-135)
- **Auto-play trigger:** `src/app/[slug]/page-client.tsx` (lines 41-46)
- **Schema:** `LinkConfig.music_url` (line 107), `LinkConfig.auto_play` (line 108)

### Kế hoạch (Tạm ẩn - KHÔNG xóa code)

**Bước 1:** Ẩn music URL input khỏi edit forms (comment hoặc hide UI)
- File: `src/components/edit/EditConfigForm.tsx` - ẩn section "Nhạc nền" (lines 227-254)
- File: `src/components/edit/EditIdolConfigForm.tsx` - ẩn section tương tự (lines 257-292)
- Dùng `{/* ... */}` comment hoặc conditional render để dễ restore sau này

**Bước 2:** Ẩn MusicPlayer render
- File: `src/app/[slug]/page-client.tsx` - comment hoặc disable MusicPlayer render (lines 129-135)
- Comment auto-play trigger (lines 41-46)
- Giữ nguyên import và ref để dễ restore

**Bước 3:** Giữ nguyên schema và server action
- KHÔNG xóa `music_url` và `auto_play` khỏi schema
- KHÔNG xóa MusicPlayer component file
- Giữ nguyên data trong DB (nếu có)

### Files cần sửa
1. `src/components/edit/EditConfigForm.tsx` - ẩn music section
2. `src/components/edit/EditIdolConfigForm.tsx` - ẩn music section
3. `src/app/[slug]/page-client.tsx` - ẩn MusicPlayer render

---

## Issue 7: Không up ảnh hàng loạt được

### Vấn đề
- Đang chỉ up được từng ảnh một, không up hàng loạt.

### Phân tích code
- **GalleryManager:** `src/components/edit/GalleryManager.tsx` (520 lines)
  - Modal upload dùng `MultiImageUpload` component (lines 366-371)
  - Max 5 files/batch, max 20 total
  - Handler `handleUploadComplete` (lines 180-203) dùng `Promise.all` để add parallel
- **MultiImageUpload:** `src/components/ui/MultiImageUpload.tsx` (327 lines)
  - Client-side compression + upload to `/api/upload`
- **Upload API:** `/api/upload` endpoint

### Debug cần làm
1. Kiểm tra `MultiImageUpload` component - có thể lỗi ở phần chọn nhiều files
2. Kiểm tra `<input type="file" multiple>` có set `multiple` attribute không
3. Kiểm tra upload API có handle concurrent uploads không
4. Kiểm tra browser console errors khi upload batch
5. Kiểm tra compression logic có crash với nhiều files không

### Kế hoạch

**Bước 1:** Kiểm tra input file element
- File: `src/components/ui/MultiImageUpload.tsx`
- Đảm bảo `<input type="file" multiple accept="image/*">` có attribute `multiple`

**Bước 2:** Kiểm tra drag & drop
- Đảm bảo drag-drop handler xử lý multiple files

**Bước 3:** Kiểm tra upload pipeline
- File: `src/app/api/upload/route.ts` - kiểm tra concurrent handling
- Kiểm tra memory/CPU khi compress nhiều ảnh cùng lúc

**Bước 4:** Fix dựa trên kết quả debug

### Files cần kiểm tra/sửa
1. `src/components/ui/MultiImageUpload.tsx`
2. `src/components/edit/GalleryManager.tsx`
3. `src/app/api/upload/route.ts`

---

## Issue 8: Không ghi âm được

### Vấn đề
- Không ghi âm được trên web.

### Phân tích code
- **VoiceRecorder:** `src/components/media/VoiceRecorder.tsx` (401 lines)
  - Dùng `MediaRecorder` API
  - MIME type detection (lines 16-32): m4a, webm, ogg
  - Max 300 seconds
  - Upload to `/api/upload` with `type: "voice"`
- **Used in:** Tất cả LetterBox components (6 templates) + CareerPathManager

### Debug cần làm
1. Kiểm tra `MediaRecorder` có được support trên browser test không
2. Kiểm tra `navigator.mediaDevices.getUserMedia()` permissions
3. Kiểm tra MIME type detection logic (lines 16-32)
4. Kiểm tra upload endpoint có handle audio files không
5. Kiểm tra HTTPS requirement (MediaRecorder requires secure context)
6. Kiểm tra iOS Safari compatibility (timeslice parameter)

### Kế hoạch

**Bước 1:** Kiểm tra MIME type support
- File: `src/components/media/VoiceRecorder.tsx` (lines 16-32)
- Đảm bảo fallback MIME type đúng cho mọi browser

**Bước 2:** Kiểm tra permissions handling
- Đảm bảo error handling tốt khi user deny mic permission
- Show clear error message

**Bước 3:** Kiểm tra upload
- File: `src/app/api/upload/route.ts` - đảm bảo handle audio files
- Kiểm tra file size limits cho voice recordings

**Bước 4:** Kiểm tra secure context
- MediaRecorder cần HTTPS hoặc localhost
- Nếu deploy trên HTTP → không hoạt động

**Bước 5:** Fix dựa trên kết quả debug

### Files cần kiểm tra/sửa
1. `src/components/media/VoiceRecorder.tsx`
2. `src/app/api/upload/route.ts`
3. Các LetterBox components (nếu cần)

---

## Issue 9: Xóa chia sẻ bình chọn ở câu đố

### Vấn đề
- Nút "Chia sẻ bình chọn" trong quiz không share được → xóa bỏ.

### Phân tích code
- **GRAD_GROUP GameSection:** `src/components/templates/grad-group/GameSection.tsx`
  - Share button: lines 291-298
  - `handleShare()` function: lines 126-131
  - `shareCopied` state: lines 56, 129-130
  - Chỉ copy clipboard, không dùng Web Share API

### Kế hoạch

**Bước 1:** Xóa share button và related code
- File: `src/components/templates/grad-group/GameSection.tsx`
  - Xóa share button JSX (lines 291-298)
  - Xóa `handleShare()` function (lines 126-131)
  - Xóa `shareCopied` state (line 56)

**Lưu ý:** Nếu Issue 6 đã xóa toàn bộ GameSection thì issue 9 tự động được giải quyết.

### Files cần sửa
1. `src/components/templates/grad-group/GameSection.tsx` (hoặc xóa nếu Issue 6 đã xử lý)

---

## Thứ tự ưu tiên thực hiện

| Ưu tiên | Issue | Lý do |
|---|---|---|
| 1 | **#3 - Auth bypass** | Security issue - Critical |
| 2 | **#1 - Color picker bug** | Functional bug - ảnh hưởng UX ngay |
| 3 | **#7 - Batch upload** | Functional bug |
| 4 | **#8 - Voice recording** | Functional bug |
| 5 | **#5+6 - Ẩn music player** | Tạm ẩn tính năng lỗi |
| 6 | **#4 - Đổi tên + hiển thị 3 dòng** | UI change, đơn giản |
| 7 | **#2 - Thêm màu chữ** | Feature mới, cần schema change |
| 8 | **#9 - Xóa share** | Cleanup |

## Nhóm công việc có thể gộp

- **Issue 5 + 6:** Cùng là ẩn music player → gộp thành 1 task
- **Issue 1 + 2:** Cùng liên quan đến color picker, có thể làm cùng lúc
- **Issue 7 + 8:** Cùng cần debug upload pipeline

## Tổng số files ảnh hưởng

~20-25 files cần sửa đổi, tập trung vào:
- `src/components/edit/` (5 files)
- `src/components/templates/` (6 template folders)
- `src/components/auth/` (2 files)
- `src/app/[slug]/` (2 files)
- `src/app/actions/` (3 files)
- `prisma/schema.prisma` (1 file)
- `src/components/theme/` (1 file)
- `src/components/music/` (1 file - optional xóa)
