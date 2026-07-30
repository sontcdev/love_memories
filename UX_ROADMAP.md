# Kế hoạch nâng cao trải nghiệm người dùng (UX Roadmap)

Giai đoạn tiếp theo: **ngừng thêm template mới**, tập trung làm sâu trải nghiệm trên
10 template hiện có.

Tài liệu này dựa trên khảo sát code thực tế (không phải checklist chung). Mỗi phát
hiện đều có đường dẫn file để kiểm chứng.

---

## 1. Hiện trạng đã kiểm chứng

Đây là các phát hiện đo được trực tiếp từ codebase, là cơ sở cho toàn bộ đề xuất bên dưới.

| # | Phát hiện | Bằng chứng | Ảnh hưởng |
|---|---|---|---|
| 1 | **Không có hệ thống toast/notification nào** | `grep -rln "toast\|Toast" src/` → 0 kết quả | Mỗi form tự quản lý state `message` rồi truyền qua props (`EditProfileForm.tsx:56,179-190`). Phản hồi lưu/lỗi không nhất quán giữa các form |
| 2 | **Không hề code-split** | 0 kết quả cho `next/dynamic`, `React.lazy` trong toàn bộ `src/` | `page-client.tsx:6-23` import tĩnh **cả 10 template + 10 lock screen**. Khách xem 1 trang LOVE vẫn tải JS của Wedding, Travel, Friendship, Idol, 3 Grad… |
| 3 | **Bundle nặng** | `npm run build`: `/[slug]` = 135 kB route / **248 kB** First Load; `/[slug]/edit` = 96 kB / **362 kB** | Trang khách hàng và trang sửa đều vượt xa ngưỡng khuyến nghị (~130 kB) |
| 4 | **Trễ giả 500 ms mỗi lần vào trang sửa** | `edit/templates/shared.tsx:111-114` — `setTimeout(() => setIsInitializing(false), 500)` vô điều kiện, chặn toàn bộ render qua `LoadingGate` | Nửa giây chờ nhân tạo, không liên quan tới việc dữ liệu đã sẵn sàng hay chưa |
| 5 | **Phân trang admin bị hỏng** | `admin-actions.ts getLinks(page=1, pageSize=50)` trả về đủ `pagination.totalPages`, nhưng `admin/links/page.tsx:13` gọi `getLinks()` không tham số và **bỏ hoàn toàn** metadata | Từ link thứ 51 trở đi **không thể truy cập** bằng UI |
| 6 | **Bảng admin không có tìm kiếm / lọc / sắp xếp / thao tác hàng loạt** | `links-table.tsx` (751 dòng): `filter` duy nhất là lọc mảng sau khi xoá (dòng 173) | Vận hành thủ công, không scale |
| 7 | **Không có draft / preview / publish** | Không có route preview; `find src/app -name page.tsx` chỉ ra `/`, `/[slug]`, `/[slug]/edit`, `/admin/*` | Mọi thay đổi **live ngay** với khách. `Link.is_active` là thứ gần nhất với publish |
| 8 | **Không có auto-save, không undo/redo** | Không có state lịch sử trong `src/components/edit/` | Mất dữ liệu khi đóng tab / hết session |
| 9 | **Thư viện UI mỏng** | `src/components/ui/`: 12 file (button, dialog, input, label, select, switch, table, textarea, ConfirmDialog, ImageUpload, MultiImageUpload, ShimmerImage) | Thiếu toast, tooltip, skeleton, tabs, badge, card, dropdown, popover, command palette |
| 10 | **Design token có nhưng không được dùng** | `globals.css` có `:root` chuẩn shadcn (`--primary`, `--radius`, 99 dòng) | Template hardcode màu Tailwind trực tiếp. `tailwind.config.ts` chỉ có 3 keyframes; `spin-slow` bị khai báo lại rời rạc trong `WelcomeOverlay.tsx` (3 lần), `MusicPlayer.tsx`, `IdolTemplate.tsx` |
| 11 | **Dark mode chỉ có ở 5/10 template** | `LOVE2`, `IDOL`, `GRAD_PERSONAL`, `GRAD_CLASS`, `GRAD_GROUP` có 29–65 tham chiếu `isDark`. `LOVE`/`EVERY`, `WEDDING`, `TRAVEL`, `FRIENDSHIP` có **0** | Trải nghiệm không đồng nhất giữa các template |
| 12 | **Drag & drop chỉ dùng ở 2 chỗ** | `@dnd-kit` chỉ có trong `GalleryManager.tsx`, `MomentsManager.tsx` | `TimelineManager.tsx` (541 dòng) vẫn sắp xếp thủ công |
| 13 | **Middleware bảo vệ route không tồn tại** | `middleware.ts:28` bảo vệ `/letters`, `/timeline` nhưng 2 route này **không có** trong `src/app` | Config chết, gây hiểu sai khi bảo trì |
| 14 | **Không có test framework** | `package.json` không có script test | Không có lưới an toàn cho refactor |

### Mô hình nghiệp vụ (quan trọng cho mọi đề xuất workflow)

Hệ thống **không phải self-serve**. Không có route đăng ký cho khách. `createLink` nằm
trong `admin-actions.ts:125` — **admin tạo link**, rồi giao `slug` + PIN cho khách. Khách
chỉ vào `/[slug]/edit` để sửa nội dung.

Vì vậy "workflow người dùng" thực chất là **hai luồng tách biệt**, và cần tối ưu riêng:

- **Luồng vận hành (admin):** tạo link → cấp phát → theo dõi → hỗ trợ. Đây là nơi
  phát hiện #5 và #6 gây đau nhất.
- **Luồng khách hàng (chủ trang):** mở khoá PIN → sửa nội dung theo tab → xem trang.
  Đây là nơi #4, #7, #8 gây đau nhất.

---

## 2. Nguyên tắc định hướng

1. **Không phá trải nghiệm khách đang dùng.** Template công khai được nhân bản có chủ
   đích (theo `AGENTS.md`); mọi thay đổi thị giác phải sau cờ tính năng.
2. **Ưu tiên sửa cái đang hỏng trước khi thêm cái mới.** #5 (mất dữ liệu khỏi UI) và #4
   (trễ giả) rẻ hơn và đáng giá hơn bất kỳ tính năng mới nào.
3. **Dùng chung một cơ sở dữ liệu.** Mọi tính năng mới đọc/ghi đúng model hiện có
   (`Link`, `LinkConfig`, `Gallery`, `Timeline`, `Letter`), không tách bảng nội dung.
4. **Đo trước, tối ưu sau.** Mỗi hạng mục hiệu năng phải có số liệu trước/sau.

---

## 3. Hạng mục A — Design System

Mục tiêu: một ngôn ngữ thiết kế cho **vỏ ứng dụng** (admin + trang sửa), *không* áp lên
template công khai (vốn cố ý khác biệt để bán theo phong cách).

**A1. Chuẩn hoá token.** Đưa màu/spacing/radius/shadow/typography về `globals.css` +
`tailwind.config.ts`. Gom toàn bộ keyframe rời rạc (`spin-slow`, `pulse-ring`, `shimmer`,
`fadeIn`) vào một chỗ, bỏ khai báo styled-jsx trùng lặp ở 3 file.

**A2. Bổ sung primitive còn thiếu** vào `src/components/ui/`: `toast`, `tooltip`,
`skeleton`, `tabs`, `badge`, `card`, `dropdown-menu`, `popover`, `empty-state`.
Radix UI đã là dependency nên chi phí thấp.

**A3. Tách "chrome" khỏi "content".** Trang sửa đã có `edit-shell-config.ts` làm đúng
việc này. Áp cùng cách cho admin để 2 khu vực dùng chung component.

**A4. Tài liệu hoá.** Một route `/design-system` (chỉ dev/admin) render mọi primitive ở
mọi state. Đây là cách rẻ nhất để chống trôi thiết kế.

---

## 4. Hạng mục B — Workflow

### B1. Luồng khách hàng (chủ trang)

| Đề xuất | Vấn đề đang giải quyết |
|---|---|
| **Bỏ trễ giả 500 ms**, thay bằng skeleton thật gắn với trạng thái dữ liệu | #4 |
| **Auto-save theo debounce** (2–3 s) + chỉ báo "Đang lưu / Đã lưu lúc HH:mm" | #8 |
| **Preview thật** — `/[slug]/edit?preview=1` render template thật với dữ liệu nháp, không cần rời trang sửa | #7 |
| **Draft / Publish** — thêm `profile_data_draft` (JSON) vào `Link`; sửa ghi vào draft, "Xuất bản" copy sang `profile_data`. V1/V2 và mọi template dùng **chung** model này | #7 |
| **Undo/Redo** trong phiên sửa (Cmd/Ctrl+Z) bằng history stack ở `useTemplateEditState()` | #8 |
| **Onboarding lần đầu** — checklist 4 bước (ảnh đại diện → thư viện → mốc thời gian → nhạc) hiển thị mức hoàn thành | Khách không biết bắt đầu từ đâu |

> **Lưu ý tương thích:** `profile_data_draft` là cột **nullable**. Khi `NULL`, hệ thống
> đọc `profile_data` như hiện tại → khách cũ không bị ảnh hưởng, không cần migrate dữ liệu.

### B2. Luồng vận hành (admin)

| Đề xuất | Vấn đề |
|---|---|
| **Nối lại phân trang** — truyền `page`/`pageSize` và render `totalPages` đã có sẵn | #5 (đang mất dữ liệu khỏi UI) |
| **Tìm kiếm + lọc + sắp xếp** theo slug, `type`, `is_active`, ngày tạo | #6 |
| **Thao tác hàng loạt** — bật/tắt, xoá, xuất CSV cho nhiều link | #6 |
| **Nhân bản link** — copy `profile_data` + `config` sang slug mới | Tăng tốc bán hàng |
| **Wizard tạo link** — chọn template có thumbnail trực quan thay vì dropdown enum | Giảm sai sót khi tạo |

---

## 5. Hạng mục C — Tương tác nâng cao

- **Mở rộng drag & drop:** áp `@dnd-kit` (đã có) cho `TimelineManager.tsx`, thứ tự
  tab, và sắp xếp thành viên GRAD_GROUP. → #12
- **Phím tắt:** `Cmd/Ctrl+S` lưu, `Cmd+Z/Shift+Cmd+Z` undo/redo, `1–9` nhảy tab,
  `?` mở bảng phím tắt.
- **Command palette (`Cmd+K`):** nhảy nhanh tới tab/link/hành động — giá trị cao cho
  admin đang quản nhiều link.
- **Context menu (chuột phải)** trên thẻ ảnh / mốc thời gian: sửa, nhân bản, xoá, đặt
  làm ảnh bìa.
- **Chỉnh sửa tại chỗ (inline edit)** cho các trường ngắn (tên, caption) — bỏ bước mở form.
- **Upload hàng loạt kèm tiến độ từng ảnh** — `MultiImageUpload.tsx:225` đã cho chọn
  `multiple` và `GalleryManager` giới hạn tổng `MAX_PHOTOS = 20`, nhưng chưa có hàng đợi
  hiển thị tiến độ/retry theo từng ảnh. (Ghi chú: `AGENTS.md` nói "5 ảnh/lượt" — **không
  có** giới hạn này trong code, cần sửa tài liệu.)

---

## 6. Hạng mục D — Quản lý template

Tất cả đặt trên model hiện có, **không tách dữ liệu**:

- **Gắn nhãn / phân loại / đánh dấu yêu thích** — thêm `tags String[]` và
  `is_favorite Boolean @default(false)` vào `Link`. Mặc định rỗng/false → an toàn với dữ liệu cũ.
- **Lịch sử chỉnh sửa** — bảng mới `LinkRevision { id, link_id, profile_data, created_at, created_by }`.
  Chỉ **thêm** bảng phụ trợ; `Link.profile_data` vẫn là nguồn sự thật, nên V1/V2 đọc như nhau.
- **Nhân bản template** — copy `profile_data` + `config` + `galleries` + `timelines`.
- **Import/Export JSON** — xuất `profile_data` để sao lưu và di chuyển giữa các slug.
- **Chia sẻ** — link xem-chỉ-đọc có token hết hạn, phục vụ khách xem trước khi publish.

---

## 7. Hạng mục E — Hiệu năng

Sắp theo tỉ lệ lợi ích / công sức, cao nhất trước.

**E1. Code-split theo LinkType (lợi ích lớn nhất, công sức nhỏ).**
`page-client.tsx` đang import tĩnh 10 template + 10 lock screen. Chuyển sang
`next/dynamic` theo `linkData.type` — mỗi khách chỉ tải template của mình. Kỳ vọng giảm
phần lớn trong 135 kB route JS của `/[slug]`.

**E2. Code-split form sửa.** `shared.tsx` import tĩnh `EditProfileForm` và các manager;
`EditGradProfileForm` một mình đã 1.038 dòng, `EditGradGroupProfileForm` 725 dòng. Tải
theo tab đang mở → giảm 362 kB First Load của `/[slug]/edit`.

**E3. Bỏ trễ giả 500 ms** (#4) — cải thiện cảm nhận tức thì, gần như không tốn công.

**E4. Ảnh.** Thống nhất dùng `next/image`; hiện còn `<img>` thô (ví dụ
`LoveGameSection.tsx:246`). Kèm `blurDataURL` cho thư viện ảnh.

**E5. Ngân sách bundle trong CI** — chặn hồi quy sau khi đã tối ưu.

**E6. Streaming + Suspense** — trả vỏ trang trước, stream nội dung nặng sau.

---

## 8. Hạng mục F — Hỗ trợ người dùng

- **Empty state có hành động** cho mọi manager (thư viện/mốc thời gian/thư) — thay
  dòng chữ trơ bằng CTA. `TravelTemplate.tsx:343` đã làm đúng hướng này, cần nhân rộng.
- **Skeleton loading** đúng hình dạng nội dung, thay spinner toàn trang.
- **Thông báo lỗi rõ ràng** — thay thông báo kỹ thuật bằng câu tiếng Việt kèm cách xử lý;
  gắn với hệ thống toast ở A2 (#1).
- **Tooltip + trợ giúp theo ngữ cảnh** cho các trường không hiển nhiên (`music_url`
  hỗ trợ nguồn nào, giới hạn ảnh 50 KB…).
- **Gợi ý thông minh:** cảnh báo ảnh quá nặng, nhắc mốc thời gian trống, đề xuất
  caption từ tên file, cảnh báo trước khi rời trang khi còn thay đổi chưa lưu.
- **Đồng nhất dark mode (#11):** viết palette tối cho 4 template còn thiếu, hoặc **ẩn
  hẳn** toggle ở đó. Hiện tại nếu gắn toggle vào 4 template này sẽ **hỏng giao diện** —
  nền trang tối đi qua `ThemeWrapper` trong khi mọi thẻ/chữ vẫn màu sáng cố định.

---

## 9. Bảng ưu tiên tổng hợp

Cột **Tác động** = mức cải thiện cảm nhận của người dùng. **Chi phí** = S (≤1 ngày),
M (2–5 ngày), L (>1 tuần). Đây là ước lượng tương đối, cần chốt lại khi vào sprint.

### Ưu tiên CAO — làm trước

| Hạng mục | Tác động | Chi phí | Ghi chú |
|---|---|---|---|
| Nối lại phân trang admin (#5) | Rất cao | **S** | Đang **mất dữ liệu khỏi UI**. Backend đã sẵn sàng |
| Bỏ trễ giả 500 ms (#4) | Cao | **S** | Xoá 4 dòng |
| Code-split theo LinkType (E1) | Rất cao | **S–M** | Lợi ích/công sức tốt nhất toàn bộ kế hoạch |
| Hệ thống toast + chuẩn hoá lỗi (#1) | Cao | **S–M** | Chặn phụ thuộc cho hầu hết hạng mục sau |
| Auto-save + chỉ báo trạng thái (#8) | Rất cao | **M** | Chống mất dữ liệu — đau nhất với khách |
| Tìm kiếm / lọc / sắp xếp admin (#6) | Cao | **M** | Chặn nghẽn vận hành |
| Skeleton + empty state | Trung bình–cao | **M** | Phụ thuộc A2 |
| Dọn middleware chết (#13) | Thấp (UX) | **S** | Nợ kỹ thuật, làm kèm |

### Ưu tiên TRUNG BÌNH

| Hạng mục | Tác động | Chi phí |
|---|---|---|
| Preview thật trong trang sửa | Cao | **M** |
| Draft / Publish (`profile_data_draft`) | Cao | **M–L** |
| Code-split form sửa (E2) | Trung bình–cao | **M** |
| Design system: token + primitive (A1, A2) | Trung bình (nền tảng) | **M–L** |
| Undo/Redo | Trung bình | **M** |
| Nhân bản link + Import/Export | Trung bình | **M** |
| Mở rộng drag & drop (#12) | Trung bình | **S–M** |
| Phím tắt + bảng trợ giúp | Trung bình | **S–M** |
| Thao tác hàng loạt (admin) | Trung bình | **M** |
| Onboarding checklist | Trung bình–cao | **M** |
| Chuẩn hoá `next/image` (E4) | Trung bình | **S–M** |

### Ưu tiên THẤP

| Hạng mục | Tác động | Chi phí |
|---|---|---|
| Command palette (`Cmd+K`) | Trung bình (nhóm nhỏ) | **M** |
| Lịch sử chỉnh sửa (`LinkRevision`) | Trung bình | **L** |
| Gắn nhãn / yêu thích | Thấp–trung bình | **M** |
| Link chia sẻ chỉ-đọc | Thấp–trung bình | **M** |
| Palette tối cho 4 template (#11) | Trung bình | **L** | 
| Route `/design-system` | Thấp (nội bộ) | **S** |
| Context menu chuột phải | Thấp | **M** |
| Ngân sách bundle CI (E5) | Thấp (phòng ngừa) | **S** |

---

## 10. Roadmap theo giai đoạn

### Giai đoạn 1 — Sửa cái đang hỏng + thắng nhanh ✅ ĐÃ XONG
**Mục tiêu: không thêm tính năng, chỉ bỏ điểm đau.**

Phân trang admin (#5) · bỏ trễ 500 ms (#4) · code-split LinkType (E1) · dọn middleware
chết (#13) · hệ thống toast (#1).

**Kết quả đo được** (`npm run build`, exit 0, không phát sinh cảnh báo lint mới):

| Route | Trước | Sau | Thay đổi |
|---|---|---|---|
| `/[slug]` route JS | 135 kB | **22.4 kB** | **−83 %** |
| `/[slug]` First Load | 248 kB | **114 kB** | **−134 kB (−54 %)** |
| `/[slug]/edit` First Load | 362 kB | 362 kB | không đổi (E2 ở Giai đoạn 4) |
| `/admin/links` First Load | 286 kB | 287 kB | +1 kB (phân trang + toast) |
| shared by all | 87.3 kB | 87.9 kB | +0.6 kB (ToastProvider) |

Chi tiết đã làm:

- **#5** `admin/links/page.tsx` đọc `searchParams.page`, gọi `getLinks(page, 20)` và render
  component `LinksPagination` (link thuần, không cần JS phía client, mỗi trang bookmark
  được). Sửa kèm một lỗi thứ hai: tiêu đề đếm `links.length` (= cỡ trang) nên giờ dùng
  `pagination.total`.
- **#4** Bỏ `setTimeout(..., 500)` trong `shared.tsx`. Lưu ý: độ trễ này đang **che một
  lần nháy sai theme**, nên không xoá trơn — `isInitializing` khởi tạo bằng
  `supportsThemeMode` (6/10 template render tức thì) và được giải phóng ngay trong effect
  đọc localStorage đầu tiên.
- **E1** `page-client.tsx`: 20 import tĩnh → 18 `next/dynamic`, giữ `ssr: true` nên HTML
  không đổi. Thêm 2 `<Suspense>` với fallback `TemplateLoading` — quan trọng nhất là
  boundary quanh `renderTemplate()`, vì sau khi mở khoá PIN thì `isUnlocking` đã tắt mà
  chunk template có thể chưa về.
- **#13** `PROTECTED_SLUG_SUFFIXES` còn `["/edit"]`.
- **#1** `src/components/ui/toast.tsx` (tự viết, không thêm dependency vì
  `@radix-ui/react-toast` chưa được cài). Có `role="alert"`/`aria-live` theo mức độ,
  tạm dừng khi hover/focus, giới hạn 4 toast. Đã áp dụng thật trong `links-table.tsx`:
  bỏ `alert()` chặn luồng, và **bù một lỗi bị bỏ lặng** — `handleToggleStatus` thất bại
  trước đây không hề báo gì cho người dùng.

*Còn lại:* 17 form trong `src/components/edit/` vẫn dùng state `message` cục bộ. Việc
chuyển hết sang `useToast()` thuộc mục "chuẩn hoá thông báo lỗi" ở Giai đoạn 2.

### Giai đoạn 2 — Nền tảng design system ✅ ĐÃ XONG
Token + keyframe tập trung (A1) · primitive còn thiếu (A2) · skeleton + empty state ·
chuẩn hoá thông báo lỗi.

- **A1** — khảo sát tìm ~110 `@keyframes` trong `src/`, nhưng **tiền đề của kế hoạch
  sai một phần**: phần lớn là animation bản sắc của từng template, mà `AGENTS.md` yêu
  cầu giữ nhân bản. Chỉ gộp các primitive thực sự dùng chung. Ba phát hiện:
  `pulse-ring` ở `MusicPlayer` (box-shadow) và `IdolTemplate` (scale+opacity) là **hai
  hiệu ứng khác nhau trùng tên** — gộp mù sẽ làm hỏng một cái; `pulse-ring` trong
  `IdolTemplate` **không có consumer nào** (dead code); `spin-slow` cùng body nhưng
  khác thời lượng (3s vs 8s) nên giờ là một keyframe với hai animation
  (`spin-slow`/`spin-slower`).
- **A2** — thêm `skeleton`, `badge`, `card`, `empty-state`, `tooltip`. Bỏ `tabs`
  (shell đã có tab nav riêng), `popover`/`dropdown-menu` (chưa có nhu cầu thật).
- **Thông báo lỗi** — `useFormFeedback()` bắc cầu API `setMessage` cũ sang toast, nên
  32 call site không phải viết lại. Xoá 5 state `message` cục bộ và 11 banner. Net
  37 thêm / 209 xoá.
- **Skeleton + empty state** — 5 `EmptyState` mới. Phát hiện phủ định quan trọng: ba
  manager **không có** loading state client nào (nhận list từ server props), nên
  spinner hiện tại của chúng là đúng và skeleton sẽ là sai.

### Giai đoạn 3 — Workflow chủ trang ✅ ĐÃ XONG
Auto-save + chỉ báo (#8) · preview thật · draft/publish · undo/redo · onboarding.

- `useAutoSave` (debounce, tuần tự hoá để payload cũ không ghi sau payload mới,
  `beforeunload` chỉ gắn khi có thay đổi chưa lưu) + `useFormAutoSave` cho
  react-hook-form. **11 test** riêng cho hook này vì nó là lớp chống mất dữ liệu.
  Đã áp cho **cả 9 form**.
- `useUndoRedo` + 18 test. Quyết định đáng ghi: **không** chiếm Ctrl+Z khi con trỏ
  đang trong `<input>`/`<textarea>` — undo gốc của trình duyệt ở cấp ký tự là điều
  người đang gõ mong đợi.
- `is_published` (mặc định `true`) **tách biệt** `is_active`: một là chủ trang chủ
  động đăng, một là kill switch của admin. Link chưa đăng hiện màn hình "đang được
  chuẩn bị" thay vì 404, kèm `robots: noindex`.
- Preview bằng iframe cùng origin, đổi được viewport 390/768/desktop.
- **Còn thiếu:** đây là publish theo *khả năng hiển thị*. Nội dung vẫn lên sóng ngay
  khi lưu; cột `profile_data_draft` để staging nội dung chưa làm.

### Giai đoạn 4 — Hiệu năng & năng suất ✅ ĐÃ XONG
Code-split form sửa (E2) · `next/image` (E4) · drag & drop mở rộng · phím tắt · thao
tác hàng loạt · ngân sách bundle (E5).

**Phát hiện lớn nhất của cả dự án** nằm ở giai đoạn này. Khi điều tra vì sao
`/admin/game-cards` nhảy 99 → 239 kB chỉ vì thêm một `EmptyState`, dump danh sách
chunk theo route cho thấy nó bắt đầu nạp cùng một chunk 97.9 kB với `/admin/links`.
Nguyên nhân: `src/lib/utils.ts` có `import { randomBytes } from "crypto"` ở **module
scope**, cạnh `cn()`. Mọi client component đều import `cn()`, nên webpack nhồi shim
crypto của Node vào **mọi route** render bất kỳ component nào gọi `cn()`. Tách
`generateSlug`/`generatePin`/`generateSessionToken` sang `src/lib/tokens.ts` (chỉ
server) đã thu lại ~130 kB trên nhiều route.

### Giai đoạn 5 — Quản lý nâng cao ✅ ĐÃ XONG
Nhân bản · import/export · gắn nhãn/yêu thích · lịch sử chỉnh sửa · link chia sẻ ·
command palette · palette tối cho 4 template.

- `duplicateLink` phải tạo `User` mới vì `Link.user_id` là `@unique`; bản sao bắt đầu
  ở trạng thái nháp. `exportLink` loại bỏ credential/id/timestamp. `importLink` kiểm
  tra `version` và `LinkType` theo enum.
- `restoreRevision` giới hạn truy vấn theo **cả** `id` và `link_id`, nên chủ trang này
  không thể phục hồi bản lưu của trang khác bằng cách đoán id; nó cũng snapshot trạng
  thái hiện tại trước, nên hoàn tác cũng hoàn tác được.
- Palette tối cho LOVE/WEDDING/TRAVEL/FRIENDSHIP: 231 nhánh `isDark` + 70 hằng màu.
  Phải chuyển cả fill SVG hardcode (vương miện, la bàn, tem…) vì chúng sẽ vô hình trên
  nền tối. **Chưa mount toggle** — đúng theo quy tắc của `AGENTS.md` là palette phải có
  trước toggle.

### Giai đoạn 6 — Đóng các hạng mục còn treo ✅ ĐÃ XONG

Ba việc còn lại sau khi rollback V1/V2 (xem mục 12) đã hoàn tất:

- **Mount toggle Night/Light** cho `WEDDING` (2 điểm: top bar và màn hình thiệp đóng —
  top bar chỉ tồn tại khi `isCardOpen`), `TRAVEL`, `FRIENDSHIP` và `LoveTemplateV2`.
  `LoveTemplate.tsx` **không** được chạm: nó là code deploy, thêm nút sẽ phá byte-parity.
  Vì vậy LOVE/EVERY vẫn không có toggle trên đường dẫn công khai — đây là hệ quả trực
  tiếp của quyết định rollback, không phải việc bỏ sót.
- **Sửa bug `ThemeWrapper`** (đã ghi trong `UX_UI_UPGRADE_PLAN.md` là "found, not fixed"):
  nền tối của 3 type mới rơi vào `default: #121214` thay vì `darkBg` của template, và
  sub-theme GRAD_GROUP đọc localStorage key `profile_data_${slug}` mà **không nơi nào
  ghi** — nay nhận qua prop `subTheme` từ server. `station`/`scrapbook` giờ đúng nền.
- **A4 route design system**: `/admin/design-system` (nằm dưới `/admin` nên middleware
  `admin_session` bảo vệ sẵn, kèm `robots: noindex`). Mỗi nhóm primitive render hai lần
  — nền sáng và trong `.dark` — vì `dark:` là chỗ trôi thiết kế nhiều nhất. Có entry
  trong Command Palette (`Cmd+K`).

Kèm theo: `edit-shell-config.ts` bật `supportsThemeMode` cho 3 type dùng shell V2 **và**
viết palette tối cho chrome của chúng. Bật cờ mà giữ slot tĩnh sẽ tạo ra một nút bấm
không đổi gì trên màn hình, nên hai việc phải đi cùng nhau.

**Còn treo (cần quyết định sản phẩm, không phải việc kỹ thuật):**
`profile_data_draft` — staging nội dung. Hiện "Lưu" ghi thẳng vào `profile_data` nên
nội dung lên sóng ngay. Đổi sang ghi draft + nút "Xuất bản" **đổi nghĩa hành vi lưu của
mọi khách đang dùng**, nên cần chốt trước khi làm.

---

## 10b. Kết quả đo được sau Giai đoạn 2–5

| Route | Mốc ban đầu | Sau | Thay đổi |
|---|---|---|---|
| `/[slug]` | 248 kB | **114 kB** | **−54 %** |
| `/[slug]/edit` | 362 kB | **117 kB** | **−68 %** |
| `/admin/links` | 286 kB | 170 kB | −41 % |
| `/admin/login` | 231 kB | 102 kB | −56 % |
| `/admin/game-cards` | 99.2 kB | 109 kB | +10 kB (EmptyState + loading.tsx) |

Kiểm chứng: `npx tsc --noEmit` exit 0 · `npm test` 246/246 · `npm run build` exit 0 ·
`npm run budget` 5/5 route trong ngưỡng. Ngưỡng đã siết theo số đo mới — quan trọng,
vì ngưỡng 398 kB cũ của trang sửa sẽ âm thầm cho phép hồi quy 3.4×.

---

## 11. Chỉ số đo lường

Cần chốt số liệu **trước** Giai đoạn 1 để có mốc so sánh.

- **Hiệu năng:** First Load JS mỗi route (mốc hiện tại: `/[slug]` 248 kB,
  `/[slug]/edit` 362 kB); LCP, INP, CLS trên thiết bị di động.
- **Workflow:** số thao tác để hoàn tất 1 trang từ lúc nhận slug; tỉ lệ hoàn thành
  onboarding; tỉ lệ phiên sửa bị bỏ giữa dở.
- **Độ ổn định:** số lần mất dữ liệu do không lưu (kỳ vọng → 0 sau auto-save); tỉ lệ
  lỗi upload.
- **Vận hành:** thời gian admin tạo + cấp phát 1 link.

---

## 12. Rủi ro & điều kiện tiên quyết

**Rủi ro phát hành (cần quyết định trước Giai đoạn 1).**
Nhánh `deploy` (`0f627e6`) **chưa có** toàn bộ 23 commit redesign trên `feat/1607`,
gồm cả 3 template mới (`WEDDING`, `TRAVEL`, `FRIENDSHIP` — chưa có trong enum
`LinkType` của `deploy`) và bản vẽ lại 6 template cũ. Nghĩa là khách hiện tại đang
xem **bản cũ**, còn bản mới chưa phát hành.

Đây chính là lý do yêu cầu tách V1/V2 trước đó vẫn còn giá trị: nếu phát hành thẳng
`feat/1607`, giao diện của mọi khách đang dùng sẽ đổi đột ngột. Hai lựa chọn:

1. **Tách V1/V2 + cờ tính năng** (như đã yêu cầu ở lượt trước) — giữ V1 tại đường dẫn
   gốc, chuyển bản vẽ lại thành V2, thêm cờ trong `LinkConfig` để chọn luồng. Dùng
   chung DB, chuyển đổi chỉ là đổi luồng render.
2. **Phát hành thẳng** và chấp nhận khách thấy giao diện mới.

Kế hoạch UX này **độc lập** với lựa chọn đó, nhưng nếu chọn (1) thì nên làm **trước**
Giai đoạn 2, vì design system sẽ phải biết mình áp cho V1, V2, hay cả hai.

**Không có lưới an toàn (#14).** Chưa có test framework. Trước khi refactor auto-save
và draft/publish, nên dựng tối thiểu Vitest + React Testing Library cho tầng
`src/app/actions/*` và các manager. Chi phí **S–M**, giảm rủi ro đáng kể cho Giai đoạn 3.

**Ràng buộc bắt buộc giữ.**
- V1 và V2 dùng **chung** `Link`, `LinkConfig`, `Gallery`, `Timeline`, `Letter`.
- Mọi cột mới phải **nullable hoặc có default** để khách cũ không cần migrate.
- Template công khai nhân bản có chủ đích — **không** gộp thành base component
  (theo `AGENTS.md`).
