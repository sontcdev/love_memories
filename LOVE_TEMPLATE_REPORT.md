# Báo cáo Template "Love" - Web Embee

## 📋 Tổng quan dự án

Template "Love" là một website tình yêu cá nhân hóa được xây dựng bằng **Next.js**, **TypeScript**, **Tailwind CSS** và **Supabase**, cho phép các cặp đôi tạo và chia sẻ kỷ niệm tình yêu của họ.

---

## 🔍 1. Validation Input & Giới hạn kí tự

### 1.1 **Hồ sơ cá nhân (Profile Form)**
File: [`EditProfileForm.tsx`](file:///Users/trinhcongson/Documents/SOURCES/IT/web_embee/src/components/edit/EditProfileForm.tsx)

| Trường | Validation | Giới hạn | Bắt buộc |
|--------|-----------|----------|----------|
| `boy_name` | Chuỗi không rỗng | **Max 50 ký tự** | ✅ Bắt buộc |
| `girl_name` | Chuỗi không rỗng | **Max 50 ký tự** | ✅ Bắt buộc |
| `title` | Chuỗi | **Max 100 ký tự** | ❌ Tùy chọn |
| `short_note` | Chuỗi | **Max 200 ký tự** | ❌ Tùy chọn |
| `anniversary_date` | Định dạng ngày | - | ❌ Tùy chọn |
| `boy_avatar` | File ảnh | **Max 50KB** (sau nén)<br>**Max 300x300px** | ❌ Tùy chọn |
| `girl_avatar` | File ảnh | **Max 50KB** (sau nén)<br>**Max 300x300px** | ❌ Tùy chọn |

**Schema Zod:**
```typescript
const loveProfileSchema = z.object({
    boy_name: z.string().min(1, "Required").max(50),
    girl_name: z.string().min(1, "Required").max(50),
    anniversary_date: z.string().optional(),
    title: z.string().max(100).optional(),
    short_note: z.string().max(200).optional(),
});
```

---

### 1.2 **Bộ sưu tập ảnh (Gallery Manager)**
File: [`GalleryManager.tsx`](file:///Users/trinhcongson/Documents/SOURCES/IT/web_embee/src/components/edit/GalleryManager.tsx)

| Trường | Validation | Giới hạn |
|--------|-----------|----------|
| **Số lượng ảnh** | - | **Max 20 ảnh** (`MAX_PHOTOS = 20`) |
| **Upload mỗi lần** | - | **Max 5 ảnh/lần** |
| **Kích thước file** | File ảnh | **Max 5MB** ban đầu |
| **Caption** | Chuỗi | **Max 50 ký tự** |
| **Nén ảnh** | Tự động | **Target 50KB** sau khi upload |

**Validation:**
```typescript
maxLength={50}        // Caption input
maxFiles={Math.min(5, remainingSlots)}
maxSizeMB={5}
targetSizeKB={50}     // Auto compress
```

---

### 1.3 **Dòng thời gian (Timeline Manager)**
File: [`TimelineManager.tsx`](file:///Users/trinhcongson/Documents/SOURCES/IT/web_embee/src/components/edit/TimelineManager.tsx)

| Trường | Validation | Giới hạn |
|--------|-----------|----------|
| **Số lượng sự kiện** | - | **Max 10 sự kiện** (`MAX_EVENTS = 10`) |
| `title` | Chuỗi không rỗng | **Max 50 ký tự** |
| `date` | Định dạng ngày | - |
| `description` | Chuỗi | **Max 300 ký tự** |
| `image_url` | File ảnh | **Max 5MB** |
| `video_url` | URL YouTube/TikTok | Valid URL |
| `audio_url` | File âm thanh | **Max 300 giây** (5 phút) |

**Validation code:**
```typescript
maxLength={50}   // Title
maxLength={300}  // Description
maxSizeMB={5}    // Image
maxDurationSeconds={300}  // Voice recording
```

---

### 1.4 **Thư tình (Letter Box)**
File: [`LetterBox.tsx`](file:///Users/trinhcongson/Documents/SOURCES/IT/web_embee/src/components/features/LetterBox.tsx)

| Trường | Validation | Giới hạn |
|--------|-----------|----------|
| `title` | Chuỗi không rỗng | **Max 50 ký tự** |
| `content` | Chuỗi không rỗng | **Max 1000 ký tự** |
| `reply` | Chuỗi | **Max 300 ký tự** |
| `video_url` | URL YouTube/TikTok | Valid URL |
| `audio_url` | File âm thanh | **Max 300 giây** |

**Validation:**
```typescript
maxLength={50}    // Title
maxLength={1000}  // Content
maxLength={300}   // Reply
```

---

### 1.5 **Upload ảnh (Image Upload)**
File: [`ImageUpload.tsx`](file:///Users/trinhcongson/Documents/SOURCES/IT/web_embee/src/components/ui/ImageUpload.tsx)

| Thuộc tính | Giá trị mặc định |
|-----------|------------------|
| `maxSizeMB` | **10MB** (kích thước ban đầu) |
| `targetSizeKB` | **50KB** (kích thước sau nén) |
| `maxWidth` | **1920px** |
| `acceptedTypes` | `image/jpeg`, `image/png`, `image/webp`, `image/gif` |

**Compression Algorithm:**
- Sử dụng **Binary Search** để tìm quality tối ưu
- Tự động resize nếu width > 1920px
- Nén xuống target 50KB trong tối đa 8 lần thử

```typescript
async function compressImage(
    file: File,
    targetSizeKB: number = 50,
    maxWidth: number = 1920
): Promise<File>
```

---

### 1.6 **Cấu hình giao diện (Config Form)**
File: [`EditConfigForm.tsx`](file:///Users/trinhcongson/Documents/SOURCES/IT/web_embee/src/components/edit/EditConfigForm.tsx)

| Trường | Validation | Giới hạn |
|--------|-----------|----------|
| `background_color` | Hex color | Regex: `^#[0-9A-Fa-f]{6}$` |
| `accent_color` | Hex color | Regex: `^#[0-9A-Fa-f]{6}$` |
| `font_family` | Danh sách fonts | 7 lựa chọn |
| `music_url` | URL | Valid URL format |
| `auto_play` | Boolean | true/false |

**Schema Zod:**
```typescript
const configSchema = z.object({
    background_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
    accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
    font_family: z.string().optional(),
    music_url: z.string().url("Invalid URL").optional(),
    auto_play: z.boolean().optional(),
});
```

---

### 1.7 **Ghi âm (Voice Recorder)**
File: [`VoiceRecorder.tsx`](file:///Users/trinhcongson/Documents/SOURCES/IT/web_embee/src/components/media/VoiceRecorder.tsx)

| Thuộc tính | Giá trị |
|-----------|---------|
| `maxDurationSeconds` | **300 giây** (5 phút) |
| **Auto-stop** | Tự động dừng khi đạt giới hạn |

---

### 1.8 **Admin - PIN Code**
File: [`LockScreen.tsx`](file:///Users/trinhcongson/Documents/SOURCES/IT/web_embee/src/components/auth/LockScreen.tsx)

| Trường | Validation |
|--------|-----------|
| PIN input | **1 ký tự/ô** (`maxLength={1}`) |
| PIN length | **6 chữ số** |

---

## 🎨 2. Các tính năng của Template "Love"

### 2.1 **📸 Bộ sưu tập ảnh (Gallery)**

#### Tính năng:
- ✅ Upload tối đa **20 ảnh**
- ✅ Upload nhiều ảnh cùng lúc (tối đa 5 ảnh/lần)
- ✅ **Drag & Drop** để sắp xếp lại thứ tự
- ✅ Thêm caption cho mỗi ảnh (max 50 ký tự)
- ✅ **Lightbox** xem ảnh toàn màn hình
- ✅ Điều hướng bằng phím tắt: `←` `→` `Esc`
- ✅ Shimmer loading effect
- ✅ Tự động nén ảnh xuống 50KB

#### UI/UX:
- Grid layout: 2 cột (mobile), 3 cột (desktop)
- Hover effects với scale animation
- Caption hiển thị ở cuối ảnh
- Delete/Edit buttons on hover

---

### 2.2 **📅 Dòng thời gian (Timeline)**

#### Tính năng:
- ✅ Tối đa **10 sự kiện**
- ✅ Mỗi sự kiện có:
  - Tiêu đề (max 50 ký tự)
  - Ngày tháng
  - Mô tả (max 300 ký tự)
  - 1 ảnh (tùy chọn)
  - 1 video YouTube/TikTok (tùy chọn)
  - 1 file ghi âm (tùy chọn, max 5 phút)
- ✅ Tự động sắp xếp theo thời gian
- ✅ **Optimistic UI updates** (cập nhật ngay lập tức)

#### UI/UX:
- Timeline vertical với đường kẻ
- Date badge gradient
- Hỗ trợ multi-media (ảnh, video, audio)
- Responsive design

---

### 2.3 **💌 Thư tình (Letter Box)**

#### Tính năng:
- ✅ Viết thư không giới hạn số lượng
- ✅ Mỗi thư có:
  - Tiêu đề (max 50 ký tự)
  - Nội dung (max 1000 ký tự)
  - Video (tùy chọn)
  - Ghi âm (tùy chọn)
- ✅ Trả lời thư (max 300 ký tự)
- ✅ Xóa thư và câu trả lời
- ✅ Expand/Collapse để đọc

#### UI/UX:
- Card layout với gradient header
- Unread indicator
- Reply thread hiển thị dưới thư gốc
- Theme-aware colors (love/every/idol)

---

### 2.4 **🎮 Trò chơi thử thách (Game Section)**
File: [`GameSection.tsx`](file:///Users/trinhcongson/Documents/SOURCES/IT/web_embee/src/components/features/GameSection.tsx)

#### Tính năng:
- ✅ 3 mức độ: **Dễ**, **Trung bình**, **Khó**
- ✅ Random câu hỏi thử thách từ database
- ✅ **Flip card animation** (3D)
- ✅ Shuffle để đổi câu hỏi khác
- ✅ Reset để chọn lại độ khó

#### UI/UX:
- 3D card flip effect
- Gradient buttons theo theme
- Loading spinner
- Shine effect on hover

---

### 2.5 **⚙️ Cấu hình giao diện (Theme Settings)**

#### Tính năng:
- ✅ Tùy chỉnh **màu nền** (8 preset + custom)
- ✅ Tùy chỉnh **màu nhấn** cho buttons (8 preset + custom)
- ✅ Chọn **font chữ** (7 fonts)
- ✅ Thêm **nhạc nền** (URL)
- ✅ Tự động phát nhạc (checkbox)

#### Fonts hỗ trợ:
1. Inter (Default)
2. Roboto
3. Poppins
4. Playfair Display (Serif)
5. Dancing Script (Cursive)
6. Quicksand
7. Nunito

---

### 2.6 **❤️ Đếm ngày bên nhau (Day Counter)**

#### Tính năng:
- ✅ Tính số ngày đã yêu từ ngày kỷ niệm
- ✅ Hiển thị real-time (tự động cập nhật)
- ✅ Breakdown theo: Years, Months, Days, Hours, Minutes, Seconds

#### UI/UX:
- Animated counter
- Gradient text
- Responsive grid layout

---

### 2.7 **🎵 Media Players**

#### Video Player:
- ✅ Hỗ trợ **YouTube** và **TikTok**
- ✅ Responsive iframe
- ✅ Auto embed

#### Voice Recorder:
- ✅ Ghi âm browser (MediaRecorder API)
- ✅ Max 5 phút
- ✅ Upload lên Supabase Storage
- ✅ Playback controls

---

### 2.8 **🔒 Bảo mật**

#### Lock Screen với PIN:
- ✅ PIN 6 chữ số
- ✅ Mã hóa với bcrypt
- ✅ Session-based authentication
- ✅ Middleware protection cho /edit routes

---

### 2.9 **📱 Responsive Design**

#### Breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

#### Tối ưu mobile:
- Touch-friendly buttons
- Swipe gestures cho gallery
- Collapsible sections
- Bottom navigation

---

## 🏗️ Kiến trúc kỹ thuật

### Tech Stack:
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Validation:** Zod
- **Form:** React Hook Form
- **Drag & Drop:** @dnd-kit
- **Icons:** Lucide React

### File Structure:
```
src/
├── components/
│   ├── templates/
│   │   └── LoveTemplate.tsx          # Main template
│   ├── edit/
│   │   ├── EditProfileForm.tsx       # Edit profile
│   │   ├── EditConfigForm.tsx        # Theme settings
│   │   ├── GalleryManager.tsx        # Manage gallery
│   │   └── TimelineManager.tsx       # Manage timeline
│   ├── features/
│   │   ├── LetterBox.tsx             # Letters
│   │   ├── GameSection.tsx           # Game
│   │   ├── GalleryGrid.tsx           # Gallery display
│   │   └── DayCounter.tsx            # Counter
│   ├── ui/
│   │   ├── ImageUpload.tsx           # Image upload
│   │   └── MultiImageUpload.tsx      # Multiple upload
│   ├── media/
│   │   ├── VoiceRecorder.tsx         # Voice recorder
│   │   └── VideoPlayer.tsx           # Video player
│   └── auth/
│       └── LockScreen.tsx            # PIN auth
```

---

## 📊 Giới hạn tổng quan

| Tính năng | Giới hạn |
|-----------|----------|
| **Gallery** | 20 ảnh |
| **Timeline** | 10 sự kiện |
| **Letters** | Không giới hạn |
| **Image size** | 50KB (sau nén) |
| **Video** | YouTube/TikTok embed |
| **Audio** | 5 phút |
| **Tên** | 50 ký tự |
| **Title** | 100 ký tự |
| **Note** | 200 ký tự |
| **Letter content** | 1000 ký tự |
| **Timeline description** | 300 ký tự |

---

## 🎯 Điểm nổi bật

1. **Tự động nén ảnh**: Tất cả ảnh đều được nén xuống 50KB, tiết kiệm bandwidth
2. **Optimistic UI**: Cập nhật giao diện ngay lập tức, không cần chờ server
3. **Drag & Drop**: Sắp xếp ảnh dễ dàng
4. **Multi-media**: Hỗ trợ ảnh, video, và ghi âm
5. **Theme customization**: Tùy chỉnh màu sắc và font chữ
6. **Responsive**: Hoạt động mượt mà trên mọi thiết bị
7. **Validation**: Kiểm tra đầu vào chặt chẽ với Zod
8. **Security**: PIN protection cho trang edit

---

## 💡 Gợi ý cải tiến

1. ✨ Thêm filter/search cho gallery
2. ✨ Export timeline thành PDF
3. ✨ Thêm reactions cho letters (❤️ 👍 😍)
4. ✨ Multiple themes (not just Love)
5. ✨ Collaborative editing (real-time)
6. ✨ Mobile app version
7. ✨ Social sharing features
8. ✨ Backup/export data

---

> **Lưu ý:** Tất cả các validation đều được thực hiện ở cả client-side (Zod) và server-side để đảm bảo tính toàn vẹn dữ liệu.
