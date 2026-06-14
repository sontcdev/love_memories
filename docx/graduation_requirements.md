# Yêu Cầu Tính Năng - Các Mẫu Thiết Kế Tốt Nghiệp (Graduation Templates)

Tài liệu này phác thảo các yêu cầu và tính năng chi tiết cho hai mẫu thiết kế (templates) liên quan đến Ngày Tốt Nghiệp trên hệ thống Love Memories:
1. **Template Cá Nhân (Graduation Personal)** - Dành cho một học sinh/sinh viên độc lập.
2. **Template Tập Thể Lớp (Graduation Class)** - Dành cho cả một tập thể lớp học.

---

## PHẦN I: TEMPLATE CÁ NHÂN (Graduation Personal)
*Mục đích: Tôn vinh hành trình cá nhân, lưu giữ kỷ niệm tuổi học trò và lời chúc từ bạn bè dành riêng cho học sinh đó.*

### 1. Thông tin cá nhân (Profile)
*   **Trường dữ liệu (`profile_data`):**
    *   Họ và tên học sinh.
    *   Ảnh đại diện (ảnh chân dung kỷ yếu hoặc mặc đồ cử nhân).
    *   Thông tin lớp, trường, niên khóa.
    *   Châm ngôn cá nhân (Slogan).
    *   Ước mơ/Mục tiêu tương lai (Ví dụ: Đậu đại học X, trở thành Kỹ sư phần mềm...).
*   **Hiệu ứng thị giác:** Hiệu ứng rơi lá phượng, hoa bằng lăng, hoặc mũ cử nhân bay khi vừa mở trang.

### 2. Dòng thời gian cá nhân (Personal Timeline)
*   **Nội dung:** Kể câu chuyện từ ngày đầu nhập trường, các dấu mốc học tập/hoạt động nổi bật, cho đến ngày nhận bằng tốt nghiệp.
*   **Chi tiết mỗi mốc:** Hỗ trợ hình ảnh/video, tiêu đề kỷ niệm, mô tả và file ghi âm (voice note) của chính học sinh chia sẻ cảm xúc lúc đó.

### 3. Lưu bút cá nhân (Personal Guestbook)
*   **Cách thức:** Bạn bè quét mã QR hoặc truy cập đường dẫn để viết lưu bút, lời chúc cho riêng học sinh này.
*   **Tính năng hẹn ước (Time Capsule):** Cho phép người gửi khóa lời chúc/thư hẹn ước, chỉ mở ra vào một ngày cụ thể trong tương lai.

### 4. Album ảnh cá nhân (Personal Gallery)
*   **Phân loại:**
    *   *Ảnh chân dung tốt nghiệp / Cử nhân.*
    *   *Khoảnh khắc đời thường (chụp tại lớp, sân trường).*
    *   *Ảnh chụp chung với bạn bè thân thiết & gia đình.*

### 5. Trò chơi tương tác (Mini Game - Personal Trivia)
*   **Tên game:** "Bạn hiểu TỚ đến mức nào?"
*   **Mô tả:** Bộ câu hỏi trắc nghiệm vui về thói quen, sở thích, hoặc các bí mật nhỏ của học sinh này để bạn bè chơi thử thách.

---

## PHẦN II: TEMPLATE TẬP THỂ LỚP (Graduation Class)
*Mục đích: Lưu giữ ký ức chung của cả một tập thể lớp học, là cuốn kỷ yếu số để tất cả thành viên cùng truy cập và tương tác.*

### 1. Thông tin tập thể lớp (Class Profile)
*   **Trường dữ liệu (`profile_data`):**
    *   Tên lớp (ví dụ: *12A1*), trường và niên khóa.
    *   Tên Giáo viên chủ nhiệm (GVCN) kèm lời nhắn gửi/ảnh chân dung của thầy cô.
    *   Ban cán sự lớp (Lớp trưởng, Lớp phó, Thủ quỹ...).
    *   Slogan / Logo hoặc Mascot của lớp.
    *   Tổng số thành viên (Sĩ số).

### 2. Danh sách thành viên (Class Directory / Yearbook Grid)
*   **Giao diện:** Hiển thị danh sách/lưới ảnh đại diện của tất cả các thành viên trong lớp.
*   **Tương tác:** Khi bấm vào ảnh của một thành viên:
    *   Hiển thị một popup profile nhỏ của thành viên đó (Tên, biệt danh, ước mơ, lời chúc gửi tới lớp).
    *   *(Tùy chọn nâng cao)*: Liên kết trực tiếp tới trang cá nhân (Template Cá Nhân) của học sinh đó trên hệ thống nếu có.

### 3. Dòng thời gian tập thể (Class Timeline)
*   **Nội dung:** Tái hiện các sự kiện lớn của lớp: Hội trại, dã ngoại lớp, giải bóng đá trường, những buổi liên hoan, buổi học cuối cùng và lễ tốt nghiệp.
*   **Dữ liệu:** Ảnh/video tập thể lớp qua từng thời kỳ.

### 4. Góc kỷ niệm & Ảnh dìm (Class Gallery)
*   **Phân loại:**
    *   *Ảnh tập thể chính thức (Kỷ yếu lớp).*
    *   *Khoảnh khắc lớp học (Giờ ra chơi, bảng tin lớp, trò đùa tinh nghịch).*
    *   *Góc ảnh dìm (Funny moments):* Nơi lưu giữ những khoảnh khắc hài hước, khó đỡ của các thành viên.

### 5. Bảng lời chúc tập thể (Class Wish Wall)
*   Nơi thầy cô bộ môn, các phụ huynh hoặc chính các thành viên trong lớp để lại những lời nhắn nhủ, chúc mừng và cảm ơn gửi tới tập thể lớp.

### 6. Trò chơi tương tác (Mini Game - Class Trivia)
*   **Tên game:** "Bạn có phải là thành viên đích thực của lớp?"
*   **Mô tả:** Các câu hỏi trắc nghiệm hài hước về các sự kiện chấn động của lớp, câu nói bất hủ của thầy cô hoặc thói quen của các thành viên.

---

## THIẾT KẾ CƠ SỞ DỮ LIỆU (Database Update Suggestions)

### 1. Cập nhật `LinkType` trong [schema.prisma](file:///home/sontc/sources/love_memories/prisma/schema.prisma)
```prisma
enum LinkType {
  LOVE
  EVERY
  IDOL
  GRAD_PERSONAL // Template tốt nghiệp cá nhân
  GRAD_CLASS    // Template tốt nghiệp tập thể lớp
}
```

### 2. Cấu trúc `Link.profile_data` cho từng loại

#### Loại `GRAD_PERSONAL` (JSON):
```json
{
  "student_name": "Nguyễn Văn A",
  "class_name": "12A1",
  "school_name": "THPT Chuyên Hà Nội - Amsterdam",
  "graduation_year": "2026",
  "avatar_url": "https://...",
  "slogan": "Hãy hướng về phía mặt trời, bóng tối sẽ ngả sau lưng bạn.",
  "dream_job": "Kỹ sư AI",
  "dream_university": "Đại học Bách Khoa Hà Nội"
}
```

#### Loại `GRAD_CLASS` (JSON):
```json
{
  "class_name": "12A1",
  "school_name": "THPT Chuyên Hà Nội - Amsterdam",
  "graduation_year": "2026",
  "slogan": "12A1 - Sinh ra để tỏa sáng",
  "homeroom_teacher": {
    "name": "Nguyễn Thị B",
    "avatar_url": "https://...",
    "message": "Chúc các em luôn vững tin bước vào đời!"
  },
  "class_officers": {
    "monitor": "Trần Văn C",
    "vice_monitor": "Lê Thị D"
  },
  "members_count": 40
}
```
