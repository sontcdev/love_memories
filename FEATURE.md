# Danh Sách Tính Năng & Cập Nhật Hệ Thống (FEATURE.md)

## 📋 Tổng Quan Dự Án
Hệ thống **Love Memories** (Next.js 14 + Tailwind CSS + Prisma + Supabase) hỗ trợ tạo lập các trang web kỷ niệm tình yêu, sự kiện lớp học, và lưu giữ khoảnh khắc cá nhân hóa. Mỗi người dùng được cung cấp một liên kết riêng (`/[slug]`) được bảo mật bằng mã PIN. Người dùng có thể chỉnh sửa cấu hình trực tuyến, quản lý bộ sưu tập ảnh, dòng thời gian, viết thư gửi gắm thông điệp, chơi trò chơi tương tác (Quiz) và kích hoạt chế độ nhạc nền.

---

## 🎨 1. Các Mẫu Giao Diện (Templates) & Chủ Đề (Themes)

Hệ thống cung cấp **7 loại template chính** (dựa trên `LinkType` enum trong [schema.prisma](file:///home/sontc/sources/love_memories/prisma/schema.prisma)), phục vụ đa dạng nhu cầu (tình yêu, sự nghiệp idol, tốt nghiệp cá nhân/tập thể).

### 1.1. Nhóm Template Tình Yêu (Love & Couple)
- **LOVE (Classic Love):**
  - **Mô tả:** Giao diện tình yêu cổ điển với hiệu ứng trái tim bay và gam màu hồng/đỏ ngọt ngào.
  - **File triển khai:** [LoveTemplate.tsx](file:///home/sontc/sources/love_memories/src/components/templates/love/LoveTemplate.tsx)
- **LOVE2 (Scrapbook / Polaroid - Mới):**
  - **Mô tả:** Phong cách vintage, giả lập sổ dán thủ công (scrapbook), ảnh Polaroid nghiêng nghệ thuật, giấy ghi chú note dán thủ công, cúc áo, kẹp giấy.
  - **File triển khai:** [Love2Template.tsx](file:///home/sontc/sources/love_memories/src/components/templates/love2/Love2Template.tsx)

### 1.2. Nhóm Template Người Nổi Tiếng / Fanpage (Idol Fanpage)
- **IDOL (Concert Fanpage - Cập nhật):**
  - **Mô tả:** Phong cách sân khấu nhạc hội với lưới neon cyberpunk, hiệu ứng bong bóng bokeh, luồng sáng laser chuyển động liên tục. Trang chủ được tái thiết kế tinh tế, sửa lỗi copy link chia sẻ.
  - **File triển khai:** [IdolTemplate.tsx](file:///home/sontc/sources/love_memories/src/components/templates/idol/IdolTemplate.tsx)

### 1.3. Nhóm Template Tốt Nghiệp (Graduation - Mới)
- **GRAD_PERSONAL (Emerald Desk):**
  - **Mô tả:** Giao diện tốt nghiệp cho cá nhân. Thiết kế giả lập góc bàn học/làm việc bằng gỗ tinh tế với cành nguyệt quế vàng, biểu tượng chim phượng hoàng lửa kiêu hãnh.
  - **File triển khai:** [GradPersonalTemplate.tsx](file:///home/sontc/sources/love_memories/src/components/templates/grad-personal/GradPersonalTemplate.tsx)
- **GRAD_CLASS (Blackboard Yearbook):**
  - **Mô tả:** Giao diện tốt nghiệp cho tập thể lớp. Sử dụng phông nền bảng đen viết phấn, kết hợp bảng ghim bần (corkboard) treo ảnh tập thể của cả lớp.
  - **File triển khai:** [GradClassTemplate.tsx](file:///home/sontc/sources/love_memories/src/components/templates/grad-class/GradClassTemplate.tsx)
- **GRAD_GROUP (Chuyến Xe Thanh Xuân - Mới & Cao Cấp):**
  - **Mô tả:** Giao diện tốt nghiệp dành cho nhóm bạn thân, hỗ trợ chọn lựa **3 chủ đề phụ (Sub-themes)** cực kỳ đẹp mắt được lưu trong trường JSON `profile_data.theme`:
    - **`caravan` (Chuyến Xe Thanh Xuân):** Tông màu gỗ ấm, hổ phách, mang phong thái phiêu lưu, chuyến xe dã ngoại.
    - **`scrapbook` (Sổ Tay Polaroid):** Nền giấy xi măng (kraft paper), patchwork thô mộc, dán ảnh scrapbook.
    - **`station` (Trạm Ký Ức):** Tông màu tím/neon tối đậm phong cách cyberpunk, giả lập một trạm xe điện ký ức lung linh trong đêm.
  - **File triển khai:** [GradGroupTemplate.tsx](file:///home/sontc/sources/love_memories/src/components/templates/grad-group/GradGroupTemplate.tsx)

| Template Type | Giao Diện | Theme Mặc Định | Hỗ Trợ Chế Độ Sáng/Tối (Light/Night) | Tính Năng Đặc Biệt |
|---|---|---|---|---|
| `LOVE` | Classic Love | Pink Romance | ❌ Không (Cố định hồng/đỏ) | Hiệu ứng cánh hoa rơi, trái tim bay |
| `LOVE2` | Polaroid Scrapbook | Kraft Retro | ✅ Có | Polaroid ảnh nghiêng, giấy note |
| `IDOL` | Concert Fanpage | Holographic Laser | ✅ Có | Lưới neon, laser beams, bong bóng bokeh |
| `GRAD_PERSONAL` | Emerald Desk | Emerald / Wood | ✅ Có | Phượng hoàng lửa, góc học tập |
| `GRAD_CLASS` | Blackboard Yearbook | Chalkboard / Corkboard | ✅ Có | Bảng ghim ảnh tập thể, chữ viết phấn |
| `GRAD_GROUP` | Chuyến Xe Thanh Xuân | Caravan / Scrapbook / Station | ✅ Có | Bản đồ lộ trình, danh sách thành viên |

---

## 🛠️ 2. Các Tính Năng Chức Năng Chính (Core Modules)

### 2.1. Đếm Ngày Kỷ Niệm & Thông Tin Nhân Vật (`DayCounter` & `WelcomeOverlay`)
- Hiển thị số ngày đã đồng hành cùng nhau (tình yêu) hoặc đếm ngược/đếm xuôi ngày ra trường.
- [WelcomeOverlay.tsx](file:///home/sontc/sources/love_memories/src/components/music/WelcomeOverlay.tsx) yêu cầu người dùng nhấn "Khám Phá" để kích hoạt âm thanh tự động nhằm tránh các chính sách autoplay của trình duyệt.
- File liên quan: [DayCounter.tsx](file:///home/sontc/sources/love_memories/src/components/features/DayCounter.tsx)

### 2.2. Bộ Sưu Tập Khoảnh Khắc (Gallery Manager)
- Hiển thị lưới ảnh Polaroid hoặc ảnh ghép mượt mà với hiệu ứng hover sinh động.
- Hỗ trợ tải lên hàng loạt ảnh, nén ảnh tự động ngay trên trình duyệt (client-side compression) xuống kích thước mục tiêu **50KB** để tối ưu hóa băng thông tải trang.
- File liên quan: [GalleryGrid.tsx](file:///home/sontc/sources/love_memories/src/components/features/GalleryGrid.tsx), [GalleryManager.tsx](file:///home/sontc/sources/love_memories/src/components/edit/GalleryManager.tsx)

### 2.3. Dòng Thời Gian Kỷ Niệm (Timeline Events)
- Cho phép lưu lại các cột mốc quan trọng theo thứ tự thời gian.
- Hỗ trợ ảnh đính kèm, tiêu đề ngắn, mô tả chi tiết, liên kết video (YouTube/TikTok) và ghi âm lời thoại (audio) hoặc tải lên file âm thanh.
- File liên quan: [TimelineManager.tsx](file:///home/sontc/sources/love_memories/src/components/edit/TimelineManager.tsx)

### 2.4. Hòm Thư Chúc Mừng / Thư Tình (Letter Box)
- Hệ thống gửi nhận lời nhắn/thư tay bí mật.
- **Tính năng mở khóa thư theo thời gian:** Cho phép thiết lập ngày giờ mở khóa cụ thể. Thư chỉ có thể đọc sau khi thời gian đếm ngược kết thúc (đồng bộ thời gian thực phía máy khách qua state `currentTime` tránh crash).
- Cho phép người nhận viết phản hồi (Reply) hiển thị trực tiếp.
- File liên quan: [LetterBox.tsx](file:///home/sontc/sources/love_memories/src/components/features/LetterBox.tsx)

### 2.5. Trò Chơi Tương Tác / Mini-Quiz (`GameSection`)
- Trò chơi trắc nghiệm vui về các kỷ niệm chung.
- Tùy chỉnh danh hiệu nhận được dựa trên điểm số (ví dụ: Xuất sắc, Khá, Trung bình) với tiêu đề và mô tả tùy chỉnh.
- File liên quan: [GameSection.tsx](file:///home/sontc/sources/love_memories/src/components/features/GameSection.tsx)

### 2.6. Bản Đồ Lộ Trình / Mục Tiêu Bạn Bè (`goals` - Chỉ dành cho `GRAD_GROUP`)
- Thiết lập các cột mốc tương lai chung của nhóm bạn thân (ví dụ: Chuyến đi Đà Lạt 2026, Họp lớp 2028, v.v.).
- Được cấu trúc động trong cấu hình và lưu trữ dưới dạng mảng JSON `goals[]`.

---

## ⚙️ 3. Hệ Thống Quản Lý & Chỉnh Sửa (Dashboard Customization)

### 3.1. Giao Diện Edit Đồng Bộ Theo Template (`/[slug]/edit`)
Trang chỉnh sửa [edit-client.tsx](file:///home/sontc/sources/love_memories/src/app/[slug]/edit/edit-client.tsx) tự động nhận diện loại Template để áp dụng phong cách thiết kế tương ứng:
- **Love / Love2:** Thể hiện dưới dạng thẻ card trắng thanh lịch, nhẹ nhàng.
- **Idol:** Thiết kế Holographic lung linh, phủ lưới neon tím-hồng.
- **GRAD_PERSONAL / GRAD_CLASS / GRAD_GROUP:** Giao diện cuốn sổ lò xo cổ điển (Notebook-style) với thanh gỗ bên lề trái (wood sidebar), trang giấy kẻ ngang (lined paper) ở giữa và hình ảnh lò xo liên kết (spiral ring binder decorations). Màu sắc sổ tự động thay đổi theo các chủ đề con (`caravan`, `scrapbook`, `station`).

### 3.2. Biểu Mẫu Cấu Thiết Lập Chuyên Biệt
Mỗi loại template sở hữu một biểu mẫu chỉnh sửa thông tin riêng:
- [EditProfileForm.tsx](file:///home/sontc/sources/love_memories/src/components/edit/EditProfileForm.tsx): Định tuyến và phân phối đến biểu mẫu tương ứng dựa vào `LinkType`.
- [EditGradProfileForm.tsx](file:///home/sontc/sources/love_memories/src/components/edit/EditGradProfileForm.tsx): Chỉnh sửa tên học sinh/lớp, niên khóa, châm ngôn tốt nghiệp, ảnh đại diện cho cá nhân/tập thể lớp.
- [EditGradGroupProfileForm.tsx](file:///home/sontc/sources/love_memories/src/components/edit/EditGradGroupProfileForm.tsx): Form phức hợp cao cấp cho nhóm tốt nghiệp:
  - Chọn lựa nhanh giữa 3 chủ đề phụ: Caravan, Scrapbook, Station.
  - Quản lý thẻ thông tin của từng thành viên trong nhóm (Avatar, Tên, Biệt danh, Châm ngôn cá nhân).
  - Tùy biến danh hiệu nhận được khi chơi Quiz.
  - Quản lý danh sách lộ trình hành trình (`goals`).
- [EditIdolProfileForm.tsx](file:///home/sontc/sources/love_memories/src/components/edit/EditIdolProfileForm.tsx): Cấu hình thông tin nghệ sĩ, fandom, ngày debut và các thiết lập hiệu ứng sân khấu.

---

## 🏗️ 4. Kiến Trúc Kỹ Thuật Nổi Bật

### 4.1. Kiến Trúc Decoupled Templates
Để đảm bảo tính độc lập và an toàn khi nâng cấp, toàn bộ các thư mục template trong `src/components/templates/` đều được **decouple hoàn toàn**. Mỗi thư mục template chứa các bản copy riêng biệt của `GameSection.tsx` và `LetterBox.tsx`. Thay đổi code ở template này hoàn toàn không ảnh hưởng tới template khác.

### 4.2. Chế Độ Sáng/Tối Độc Lập (Night/Light Mode)
- Trạng thái màu sắc được lưu trữ trực tiếp tại `localStorage` dưới khóa `theme_mode_${slug}` giúp trang web duy trì trạng thái sáng/tối trong các phiên truy cập tiếp theo.
- Khắc phục triệt để lỗi TDZ (Temporal Dead Zone) bằng cách khai báo biến trạng thái `isDark` ngay trước các hàm tiện ích tính toán lớp CSS.

### 4.3. Quản Lý Dữ Liệu Cấu Hình Động (Prisma JSON profile_data)
- Cấu hình tùy biến sâu được lưu trữ dưới dạng JSON blob trong cột `Link.profile_data`.
- Khi thực hiện cập nhật cơ sở dữ liệu qua các server actions như [profile-actions.ts](file:///home/sontc/sources/love_memories/src/app/actions/profile-actions.ts), dữ liệu được ép kiểu tường minh `as Prisma.InputJsonValue` để vượt qua ràng buộc kiểm tra kiểu nghiêm ngặt của Prisma 6.

### 4.4. Đăng Nhập & Phân Quyền Bằng Cookie
- Hệ thống phân chia quyền truy cập dựa trên cookie động theo từng slug cá nhân thay vì một phiên đăng nhập dùng chung.
- Đường dẫn chỉnh sửa `/[slug]/edit` yêu cầu cookie `session_{slug}`, trong khi trang quản trị yêu cầu cookie `admin_session`. Việc kiểm soát này được thực thi chặt chẽ tại middleware của Next.js.

### 4.5. Cơ chế Tự động phát nhạc thông minh (Autoplay & DOM Isolation)
- **Cô lập Iframe bằng `containerRef`**: Đính kèm YouTube iframe vào một container HTML tĩnh rỗng được quản lý qua `useRef` nhằm tránh bị React Virtual DOM ghi đè và hủy khi component `MusicPlayer` re-render (ví dụ lúc thay đổi trạng thái playing/muted), khắc phục triệt để lỗi `The YouTube player is not attached to the DOM`.
- **Lách luật Autoplay bằng Auto-Mute**: Khởi tạo trình phát ở chế độ tắt tiếng (`mute: 1`) để được trình duyệt cho phép tự động chạy ngầm, sau đó mở tiếng (`unMute()`) ngay khi nhận tương tác đầu tiên của người dùng thông qua bộ lắng nghe sự kiện toàn trang (`click`, `touchstart`, `keydown`).
- **Tránh Race Condition (Tranh chấp luồng)**: Sử dụng cờ hiệu `hasInteractedRef` để bật âm thanh ngay khi player sẵn sàng nếu người dùng tương tác trước khi sự kiện `onReady` kích hoạt.
- **Tải trước từ màn hình khóa (LockScreen Preload)**: Đưa cấu phần phát nhạc ra ngoài khối xác thực trong [page-client.tsx](file:///home/sontc/sources/love_memories/src/app/[slug]/page-client.tsx) để tải trước YouTube API ngay từ lúc người dùng đang ở LockScreen nhập PIN, đảm bảo trình phát sẵn sàng tức thì khi mở khoá thành công.
- **Sử dụng domain `youtube-nocookie.com`**: Thay đổi máy chủ nhúng sang tên miền không lưu cookie giúp loại bỏ hoàn toàn các cảnh báo CORS / `postMessage` origin mismatch trên môi trường phát triển HTTP mạng LAN.

---

## 📐 5. Giới Hạn & Kiểm Soát Dữ Liệu (Constraints)

| Hạng Mục | Ràng Buộc Kỹ Thuật | Tệp Thực Thi Liên Quan |
|---|---|---|
| **Số lượng ảnh tối đa** | Tối đa **20 ảnh** trong bộ sưu tập | [GalleryManager.tsx](file:///home/sontc/sources/love_memories/src/components/edit/GalleryManager.tsx) |
| **Giới hạn tải lên** | Tối đa **5 ảnh** trên một đợt tải lên | [MultiImageUpload.tsx](file:///home/sontc/sources/love_memories/src/components/ui/MultiImageUpload.tsx) |
| **Kích thước ảnh sau nén** | Đạt mục tiêu **50KB** (sử dụng thuật toán Binary Search để giảm chất lượng chất lượng và độ phân giải tối đa 1920px trên Client) | [ImageUpload.tsx](file:///home/sontc/sources/love_memories/src/components/ui/ImageUpload.tsx) |
| **Độ dài âm thanh ghi âm** | Tối đa **300 giây (5 phút)** | [TimelineManager.tsx](file:///home/sontc/sources/love_memories/src/components/edit/TimelineManager.tsx) |
| **Giới hạn ký tự văn bản** | - Tên đối tượng: **50 ký tự**<br>- Tiêu đề thư: **50 ký tự**<br>- Nội dung thư: **1000 ký tự**<br>- Phản hồi thư: **300 ký tự**<br>- Tiêu đề sự kiện dòng thời gian: **50 ký tự**<br>- Mô tả sự kiện dòng thời gian: **300 ký tự**<br>- Chú thích ảnh bộ sưu tập: **50 ký tự** | [LetterBox.tsx](file:///home/sontc/sources/love_memories/src/components/features/LetterBox.tsx), [TimelineManager.tsx](file:///home/sontc/sources/love_memories/src/components/edit/TimelineManager.tsx) |
| **Số thành viên khuyên dùng** | Nhóm tốt nghiệp đề xuất tối đa **12 thành viên** | [EditGradGroupProfileForm.tsx](file:///home/sontc/sources/love_memories/src/components/edit/EditGradGroupProfileForm.tsx) |
