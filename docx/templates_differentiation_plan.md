# Kế Hoạch Đổi Mới & Phân Hóa Giao Diện (Templates Differentiation Plan)

Tài liệu này đề xuất giải pháp thiết kế chi tiết nhằm tái cấu trúc hoàn toàn các mẫu giao diện (templates) trên hệ thống Love Memories. Mục tiêu là loại bỏ sự trùng lặp về bố cục (layout dạng tab truyền thống) và tạo ra **4 phong cách trải nghiệm độc bản**, khác biệt hoàn toàn về cấu trúc, hiệu ứng thị giác và tính tương tác.

---

## 🎨 BẢNG SO SÁNH TỔNG QUAN

| Đặc trưng | 💖 LOVE TEMPLATE | 🌟 IDOL TEMPLATE | 🎓 GRAD_PERSONAL | 👥 GRAD_CLASS |
| :--- | :--- | :--- | :--- | :--- |
| **Giao diện chính** | Sổ tay kỷ niệm (Scrapbook) | Dashboard Live & Fandom | Trang kỷ yếu cá nhân | Bảng đen lớp học & Bảng ghim |
| **Bố cục (Layout)** | Cuộn vô tận dạng tạp chí | Feed mạng xã hội hiện đại | Thiết kế dạng bàn học ảo | Lưới kỷ yếu + Bảng note Miro |
| **Hiệu ứng đặc trưng** | Tim bay nhẹ, chuyển động mềm | Laser quét, hào quang neon | Lá phượng rơi, pháo hoa tốt nghiệp | Phấn viết bảng, nhãn dán tinh nghịch |
| **Font chữ** | Cursive / Chữ viết tay lãng mạn | Sans-serif hình khối mạnh mẽ | Chữ viết tay nắn nót học đường | Dạng chữ viết phấn, nét vẽ nguệch ngoạc |
| **Tương tác cốt lõi** | Mở phong thư vật lý | Trạm thả tim liên tục | Hũ thủy tinh chứa điều ước | Lật thẻ học sinh + Ghim sticker |

---

## 📑 CHI TIẾT PHƯƠNG ÁN CHO TỪNG TEMPLATE

### 1. 💖 Love Template - "Sổ Tay Kỷ Niệm Tình Yêu" (Anniversary Scrapbook)
*Không còn sử dụng hệ thống Tab cứng nhắc. Toàn bộ trang web là một cuốn sổ tay lãng mạn lật trang hoặc cuộn dọc mượt mà.*

*   **Bố cục & Giao diện (Layout):**
    *   Thiết kế dạng giấy Kraft, viền ren hoặc giấy Scrapbook với các góc bo tròn mềm mại.
    *   Ảnh trong thư viện được hiển thị dưới dạng các tấm ảnh **Polaroid** xếp chồng hơi lệch góc ngẫu nhiên, cố định bằng băng keo giả lập (Washi tape).
*   **Dòng thời gian (Timeline):**
    *   Chuyển đổi thành một "Con đường tình yêu" uốn lượn chạy dọc màn hình, nối các sự kiện bằng dải ruy-băng hồng thay vì đường kẻ nét đứt cơ bản.
*   **Trải nghiệm tương tác:**
    *   **Phong thư tình yêu:** Phần "Letters" sẽ hiển thị thành những phong bì thư gấp bằng giấy. Khi click vào, phong bì sẽ có hoạt ảnh mở nắp thư và rút lá thư bên trong ra.
    *   **Widget đếm ngày:** Đặt ở vị trí trung tâm nổi bật với đồng hồ chạy chi tiết đến từng giây kèm hiệu ứng đập nhẹ của trái tim.

---

### 2. 🌟 Idol Template - "Sân Khấu Live & Fandom Hub"
*Chuyển đổi hoàn toàn sang phong cách tối (Dark Mode) mặc định với giao diện đậm chất công nghệ, neon hiện đại và concert sôi động.*

*   **Bố cục & Giao diện (Layout):**
    *   Thiết kế dạng **Fandom Dashboard** giống như một ứng dụng streaming nhạc hoặc mạng xã hội của nghệ sĩ.
    *   Nền tối sâu thẳm (`#0a0a0c`) với lưới neon ẩn hiện và các dải sáng laser quét qua lại sân khấu.
*   **Sân khấu đa phương tiện (Media Stage):**
    *   Đưa trình phát Video (YouTube/TikTok) lên vị trí trung tâm giống màn hình lớn tại liveshow.
    *   Bên cạnh video có một **bảng chạy chữ (Marquee)** hiển thị các lời chúc của Fan trôi qua màn hình theo thời gian thực (giống tính năng chat trực tiếp trên Livestream).
*   **Trải nghiệm tương tác:**
    *   **Trạm cổ vũ (Cheer Station):** Nút thả tim phát sáng neon lớn. Khi nhấn, tim sẽ bay lên kèm hiệu ứng pháo sáng neon rực rỡ và đếm số lượng người thả tim trực tiếp.
    *   **Timeline:** Thiết kế dạng **Discography (Đĩa nhạc/Cột mốc sự nghiệp)** với icon đĩa than quay tròn hoặc cúp vàng danh giá.

---

### 3. 🎓 Graduation Personal - "Góc Học Tập Tuổi Học Trò"
*Tái tạo không gian phòng học hoài niệm với bàn học và những trang giấy lưu bút viết tay.*

*   **Bố cục & Giao diện (Layout):**
    *   Nền giao diện mô phỏng một **Bàn học gỗ** nhìn từ trên xuống (Desk setup), trên đó rải rác các vật dụng: cuốn sổ lưu bút, chiếc mũ cử nhân, thước kẻ, những nhãn dán dán góc bàn.
    *   Khi click vào cuốn sổ, giao diện mở ra hai trang giấy lưu bút viết tay nắn nót.
*   **Trải nghiệm tương tác:**
    *   **Hũ điều ước tương lai (Time Capsule):** Các bức thư lưu bút được cuộn tròn lại thả vào trong một chiếc hũ thủy tinh trên bàn học. Khi người xem click vào hũ, một bức thư ngẫu nhiên sẽ bay ra và mở ra đọc.
    *   **Bản đồ mục tiêu:** Con đường dẫn tới cổng trường đại học mơ ước hoặc công việc tương lai được vẽ tay dạng doodle hoạt hình dễ thương.

---

### 4. 👥 Graduation Class - "Bảng Tin Kỷ Yếu Tập Tập Thể"
*Mang không khí lớp học vui nhộn, gắn kết với thiết kế bảng xanh viết phấn và bảng ghim lưu bút.*

*   **Bố cục & Giao diện (Layout):**
    *   Nền bảng xanh lá cây (Chalkboard) với dòng chữ tiêu đề viết bằng nét phấn trắng và nét vẽ phấn xung quanh trang trí.
    *   Các mục nội dung chính được phân chia bằng các khung gỗ treo bảng ghim gỗ bần.
*   **Niên giám học sinh (Class Directory):**
    *   Hiển thị ảnh chân dung cả lớp dưới dạng lưới thẻ học sinh.
    *   Khi click vào một thẻ, thẻ đó sẽ **lật mặt sau (3D Flip Card animation)** để hiện biệt danh, "danh hiệu độc lạ" (do lớp bình chọn), ước mơ và chữ ký viết tay của học sinh đó.
*   **Góc ảnh dìm & Sticker:**
    *   Thư viện ảnh được sắp xếp tự do như một bảng ghim bần (Corkboard) với đinh ghim ở góc ảnh.
    *   Các thành viên có thể ghim sticker vui nhộn lên ảnh (như kính mắt ngầu, ria mép, vương miện vẽ tay).

---

## 🛠️ KẾ HOẠCH TRIỂN KHAI CHI TIẾT (Action Plan)

Để thực hiện kế hoạch này một cách an toàn mà không làm gián đoạn hệ thống hiện có:

### Giai đoạn 1: Chuẩn bị UI Tokens & Assets
1. Khai báo các font chữ mới từ Google Fonts trong layout của dự án (ví dụ: Dancing Script cho Love, VT323/Chalkboard-like fonts cho Class, các font Sans-serif sắc cạnh cho Idol).
2. Tạo các hình ảnh/svg assets cần thiết: washi tape, ghim bần, vết phấn bảng, phong bì thư gấp, hũ điều ước.

### Giai đoạn 2: Tái cấu trúc từng Component độc lập
*   **Tuần 1:** Triển khai **LoveTemplate** & **IdolTemplate** mới. Thay thế hoàn toàn cấu trúc hiển thị bên trong các file tương ứng mà không đổi props đầu vào.
*   **Tuần 2:** Triển khai **GradPersonalTemplate** & **GradClassTemplate** mới. Viết các hiệu ứng đặc thù (Flip Card lật 3D, Hũ điều ước mở thư).

### Giai đoạn 3: Tối ưu tương tác & Hoạt ảnh
*   Tích hợp thư viện Framer Motion hoặc sử dụng CSS Transitions/Animations thuần để viết các hoạt ảnh: lật trang sách, mở phong bì thư, tim neon bay, lá phượng rơi mượt mà trên cả máy tính lẫn di động.
*   Kiểm thử hiệu năng (Performance testing) để đảm bảo các hiệu ứng hoạt ảnh chạy mượt mà ở 60fps trên thiết bị di động cũ.

---

## 📱 THIẾT KẾ ĐÁP ỨNG (Responsive Design & Mobile-First)

Vì phần lớn người dùng sẽ truy cập trang qua quét mã QR trên điện thoại di động (mobile) trong khi quản trị viên/học sinh có thể tạo và xem trên máy tính (PC/Tablet), việc đảm bảo giao diện không bị vỡ trên mọi kích thước màn hình là bắt buộc.

### 1. Nguyên tắc Responsive cho từng Template:
*   **Love Template (Scrapbook):**
    *   *Trên PC:* Hiển thị cuốn sổ mở rộng 2 trang song song. Các ảnh Polaroid được xếp rải rác tự do ở 2 bên lề.
    *   *Trên Mobile:* Cuốn sổ tự động gập lại thành 1 trang dọc. Các ảnh Polaroid chuyển thành bố cục lưới 1 hoặc 2 cột để tránh chồng lấp che mất văn bản.
*   **Idol Template (Social Feed):**
    *   *Trên PC:* Bố cục 3 cột (Cột trái: Profile/Cheer, Cột giữa: Video/Live Chat, Cột phải: Album/Timeline) giống giao diện Web Instagram.
    *   *Trên Mobile:* Chuyển thành bố cục 1 cột cuộn dọc duy nhất, đưa trình phát Video lên đầu trang ghim cố định (sticky) khi cuộn.
*   **Grad Personal (Bàn học gỗ):**
    *   *Trên PC:* Mô phỏng toàn cảnh mặt bàn học rộng rãi (Desk setup) với đầy đủ các vật dụng trải rộng.
    *   *Trên Mobile:* Camera "zoom cận cảnh" vào tiêu điểm chính (cuốn sổ lưu bút mở rộng chiếm 100% chiều rộng). Các vật dụng khác (bút, mũ tốt nghiệp) thu nhỏ hoặc đẩy xuống chân trang để không choán không gian.
*   **Grad Class (Bảng đen):**
    *   *Trên PC:* Bảng đen lớn hiển thị lưới thẻ học sinh 4 hoặc 5 cột. Bảng ghim bần hiển thị song song ở bên cạnh.
    *   *Trên Mobile:* Lưới thẻ học sinh tự động co lại còn 2 cột. Các thành phần bảng ghim bần sẽ tự động xếp chồng (stack) xuống dưới bảng đen.

### 2. Kỹ thuật triển khai chi tiết:
*   Sử dụng hệ thống lưới Flexbox và Grid của Tailwind CSS kết hợp breakpoints chuẩn (`sm:`, `md:`, `lg:`).
*   Không sử dụng kích thước cứng (`width`, `height` bằng px cố định) cho các container chính; ưu tiên dùng `w-full`, `max-w-screen-...`, `aspect-video` hoặc `aspect-square`.
*   Font chữ và khoảng cách (padding/margin) sử dụng đơn vị tương đối hoặc thay đổi linh hoạt theo breakpoint (ví dụ: `text-2xl md:text-4xl`, `p-4 md:p-8`).
*   Bật hỗ trợ cử chỉ vuốt chạm (`touch-action: pan-y`, swipe gestures) cho các slide ảnh và popup trên điện thoại.

