# Kế hoạch phát triển 3 Template mới: WEDDING, TRAVEL, FRIENDSHIP

## Tổng quan

Thêm 3 template mới vào hệ thống, nâng tổng số template từ 6 lên 9.

| Template | LinkType | Chủ đề | Phong cách |
|---|---|---|---|
| WEDDING | `WEDDING` | Đám cưới / Kỷ niệm ngày cưới | Sang trọng, lãng mạn, vàng/ivory |
| TRAVEL | `TRAVEL` | Kỷ niệm chuyến đi | Phiêu lưu, journal, earth tones |
| FRIENDSHIP | `FRIENDSHIP` | Tình bạn | Vui nhộn, colorful, doodle |

---

## 1. WEDDING Template

### Concept
Trang kỷ niệm đám cưới / kỷ niệm ngày cưới. Cô dâu & chú rể chia sẻ câu chuyện tình yêu, ảnh cưới, và khách mời để lại lời chúc.

### Visual Style
- **Màu chủ đạo**: Gold (#d4a853), Ivory (#fffff0), Blush (#fce4ec)
- **Font**: Serif cho tiêu đề (Playfair Display), Sans-serif cho nội dung
- **Decor**: Hoa văn floral, nhẫn cưới, trái tim vàng
- **Night mode**: Dark navy (#1a1a2e) + gold accents
- **Background**: Gradient ivory/gold nhẹ, pattern hoa văn

### profile_data (WEDDING)
```typescript
interface WeddingProfileData {
  bride_name?: string;        // Tên cô dâu
  groom_name?: string;        // Tên chú rể
  wedding_date?: string;      // Ngày cưới
  venue?: string;             // Địa điểm
  ceremony_time?: string;     // Giờ làm lễ
  reception_time?: string;    // Giờ tiệc
  bride_avatar?: string;      // Ảnh cô dâu
  groom_avatar?: string;      // Ảnh chú rể
  title?: string;             // Tiêu đề trang
  short_note?: string;        // Ghi chú ngắn
  love_story?: string;        // Câu chuyện tình yêu
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
  quiz_badges?: {
    perfect_title?: string;
    perfect_desc?: string;
    good_title?: string;
    good_desc?: string;
    average_title?: string;
    average_desc?: string;
    low_title?: string;
    low_desc?: string;
  };
}
```

### Sections
1. **Hero Section** - Tên cô dâu & chú rể, ảnh cưới, countdown đến ngày cưới
2. **Love Story Timeline** - Câu chuyện tình yêu (dùng Timeline model)
3. **Gallery** - Album ảnh cưới (dùng Gallery model)
4. **Event Details** - Thông tin tiệc (lễ, tiệc, dress code, map)
5. **Guest Book** - Sổ lưu bút (dùng LetterBox shared)
6. **Couple Quiz** - Quiz về đôi lứa (dùng CardDrawGame shared)

### Components cần tạo
| File | Mô tả |
|---|---|
| `src/components/templates/wedding/WeddingTemplate.tsx` | Template chính |
| `src/components/templates/wedding/WeddingHero.tsx` | Hero với countdown, ảnh cưới |
| `src/components/templates/wedding/EventDetails.tsx` | Thông tin sự kiện (lễ, tiệc) |
| `src/components/templates/wedding/CountdownTimer.tsx` | Đếm ngược đến ngày cưới |
| `src/components/edit/EditWeddingProfileForm.tsx` | Form chỉnh sửa profile |

### Shared components sử dụng
- `CardDrawGame` (theme mới: `wedding` - gold/ivory)
- `LetterBox` (theme mới: `wedding` - gold/ivory)

---

## 2. TRAVEL Template

### Concept
Trang kỷ niệm chuyến đi. Cá nhân hoặc nhóm chia sẻ hành trình, ảnh, và những khoảnh khắc đáng nhớ.

### Visual Style
- **Màu chủ đạo**: Earth tones - Terracotta (#c45e3a), Sage (#8fbc8f), Sand (#f4e4c1)
- **Font**: Rounded sans-serif (Nunito)
- **Decor**: Postcard, stamp, map pin, compass
- **Night mode**: Dark slate (#1e293b) + warm amber
- **Background**: Kraft paper texture, map pattern

### profile_data (TRAVEL)
```typescript
interface TravelProfileData {
  trip_name?: string;         // Tên chuyến đi
  start_date?: string;        // Ngày bắt đầu
  end_date?: string;          // Ngày kết thúc
  owner_name?: string;        // Tên người tạo
  destinations?: string;      // Các điểm đến (comma-separated)
  travelers?: string;         // Người tham gia
  title?: string;             // Tiêu đề trang
  short_note?: string;        // Ghi chú ngắn
  owner_avatar?: string;      // Ảnh đại diện
  trip_stats?: {
    days?: number;
    countries?: number;
    cities?: number;
    photos?: number;
    memories?: number;
  };
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
}
```

### Sections
1. **Hero Section** - Tên chuyến đi, destinations, trip stats (ngày, quốc gia, thành phố)
2. **Trip Stats** - Thống kê chuyến đi (icons: máy bay, camera, bản đồ)
3. **Photo Journal** - Gallery dạng journal/postcard (dùng Gallery model)
4. **Journey Timeline** - Timeline chuyến đi theo ngày (dùng Timeline model)
5. **Postcards** - Gửi postcard/lời nhắn (dùng LetterBox shared)
6. **Travel Quiz** - Quiz về chuyến đi (dùng CardDrawGame shared)

### Components cần tạo
| File | Mô tả |
|---|---|
| `src/components/templates/travel/TravelTemplate.tsx` | Template chính |
| `src/components/templates/travel/TravelHero.tsx` | Hero với map/compass |
| `src/components/templates/travel/TripStats.tsx` | Thống kê chuyến đi |
| `src/components/edit/EditTravelProfileForm.tsx` | Form chỉnh sửa profile |

### Shared components sử dụng
- `CardDrawGame` (theme mới: `travel` - earth tones)
- `LetterBox` (theme mới: `travel` - postcard style)

---

## 3. FRIENDSHIP Template

### Concept
Trang tình bạn. Nhóm bạn chia sẻ kỷ niệm, fun facts, và lời nhắn cho nhau.

### Visual Style
- **Màu chủ đạo**: Bright - Purple (#8b5cf6), Cyan (#06b6d4), Yellow (#fbbf24), Pink (#ec4899)
- **Font**: Rounded playful (Quicksand/Nunito)
- **Decor**: Stickers, doodles, emoji, confetti
- **Night mode**: Dark purple (#1a1025) + neon accents
- **Background**: Gradient nhiều màu pastel

### profile_data (FRIENDSHIP)
```typescript
interface FriendshipProfileData {
  group_name?: string;        // Tên nhóm
  owner_name?: string;        // Tên người tạo
  since_date?: string;        // Quen từ khi nào
  motto?: string;             // Phương châm / slogan
  title?: string;             // Tiêu đề trang
  short_note?: string;        // Ghi chú ngắn
  owner_avatar?: string;      // Ảnh đại diện
  members?: {
    id: string;
    name: string;
    nickname?: string;
    avatar?: string;
    quote?: string;
  }[];
  fun_facts?: {
    id: string;
    emoji: string;
    label: string;
    value: string;
  }[];
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
  quiz_badges?: {
    perfect_title?: string;
    perfect_desc?: string;
    good_title?: string;
    good_desc?: string;
    average_title?: string;
    average_desc?: string;
    low_title?: string;
    low_desc?: string;
  };
}
```

### Sections
1. **Hero Section** - Tên nhóm, slogan, avatar members, confetti animation
2. **Members Grid** - Grid thành viên với avatar, nickname, quote
3. **Fun Facts** - Fun facts về nhóm (emoji + label + value)
4. **Friendship Timeline** - Timeline kỷ niệm (dùng Timeline model)
5. **Gallery** - Album ảnh nhóm (dùng Gallery model)
6. **Letters** - Lời nhắn cho nhau (dùng LetterBox shared)
7. **Friendship Quiz** - Quiz tình bạn (dùng CardDrawGame shared)

### Components cần tạo
| File | Mô tả |
|---|---|
| `src/components/templates/friendship/FriendshipTemplate.tsx` | Template chính |
| `src/components/templates/friendship/FriendshipHero.tsx` | Hero với confetti |
| `src/components/templates/friendship/MembersGrid.tsx` | Grid thành viên |
| `src/components/templates/friendship/FunFacts.tsx` | Fun facts cards |
| `src/components/edit/EditFriendshipProfileForm.tsx` | Form chỉnh sửa profile |

### Shared components sử dụng
- `CardDrawGame` (theme mới: `friendship` - purple/cyan)
- `LetterBox` (theme mới: `friendship` - colorful)

---

## 4. File Changes - Integration Points

### 4.1 Database Schema
```
prisma/schema.prisma
  - Thêm WEDDING, TRAVEL, FRIENDSHIP vào enum LinkType
  - Run: npm run db:push
```

### 4.2 Server Actions
```
src/app/actions/profile-actions.ts
  - Thêm WeddingProfileData interface
  - Thêm TravelProfileData interface
  - Thêm FriendshipProfileData interface
  - Update updateLinkProfile() switch case cho 3 type mới
```

### 4.3 Page Routing
```
src/app/[slug]/page-client.tsx
  - Import WeddingTemplate, TravelTemplate, FriendshipTemplate
  - Thêm 3 case vào renderTemplate() switch
  - Thêm 3 case vào getWelcomeTitle() switch
```

### 4.4 Edit Page
```
src/components/edit/EditProfileForm.tsx
  - Import EditWeddingProfileForm, EditTravelProfileForm, EditFriendshipProfileForm
  - Thêm routing logic cho 3 type mới

src/app/[slug]/edit/edit-client.tsx
  - Update isGrad check (không cần thay đổi, WEDDING/TRAVEL/FRIENDSHIP không phải grad)
  - Update theme logic nếu cần
```

### 4.5 Admin Panel
```
src/app/admin/links/links-table.tsx
  - Thêm 3 SelectItem vào dropdown create link
  - Thêm icon cho WEDDING (Ring/Heart), TRAVEL (MapPin/Plane), FRIENDSHIP (Users/Smile)
  - Thêm badge color cho 3 type mới
  - Thêm vào getTypeIcon() và getTypeBadgeColor()
```

### 4.6 Shared Components Update
```
src/components/shared/CardDrawGame.tsx
  - Thêm theme "wedding" (gold/ivory)
  - Thêm theme "travel" (earth tones)
  - Thêm theme "friendship" (purple/cyan)

src/components/shared/LetterBox.tsx
  - Thêm theme "wedding" (gold/ivory)
  - Thêm theme "travel" (postcard style)
  - Thêm theme "friendship" (colorful)
```

### 4.7 Theme / Welcome
```
src/components/theme/ThemeWrapper.tsx
  - Thêm case cho WEDDING, TRAVEL, FRIENDSHIP (nếu có logic riêng)

src/components/music/WelcomeOverlay.tsx
  - Thêm case cho WEDDING, TRAVEL, FRIENDSHIP
```

---

## 5. Thứ tự thực hiện

### Phase A: Foundation (Ngày 1-2)
1. Update `prisma/schema.prisma` - thêm 3 LinkType
2. Update `src/app/actions/profile-actions.ts` - thêm interfaces
3. Update `src/app/admin/links/links-table.tsx` - thêm options
4. Update `src/app/[slug]/page-client.tsx` - thêm routing
5. Update shared components (CardDrawGame, LetterBox) - thêm themes

### Phase B: WEDDING Template (Ngày 3-5)
1. Tạo `src/components/templates/wedding/` folder
2. Tạo WeddingHero.tsx (countdown, couple info)
3. Tạo EventDetails.tsx (ceremony, reception info)
4. Tạo CountdownTimer.tsx
5. Tạo WeddingTemplate.tsx (tổng hợp sections)
6. Tạo EditWeddingProfileForm.tsx
7. Update EditProfileForm.tsx routing

### Phase C: TRAVEL Template (Ngày 6-8)
1. Tạo `src/components/templates/travel/` folder
2. Tạo TravelHero.tsx (map, compass, destinations)
3. Tạo TripStats.tsx (stats cards)
4. Tạo TravelTemplate.tsx
5. Tạo EditTravelProfileForm.tsx
6. Update EditProfileForm.tsx routing

### Phase D: FRIENDSHIP Template (Ngày 9-11)
1. Tạo `src/components/templates/friendship/` folder
2. Tạo FriendshipHero.tsx (confetti, group info)
3. Tạo MembersGrid.tsx (member cards)
4. Tạo FunFacts.tsx (fun fact cards)
5. Tạo FriendshipTemplate.tsx
6. Tạo EditFriendshipProfileForm.tsx
7. Update EditProfileForm.tsx routing

### Phase E: Polish & Test (Ngày 12-14)
1. Test Night/Light mode cho cả 3 template
2. Test responsive (mobile/tablet/desktop)
3. Test middleware protection (edit routes)
4. Test admin create link cho 3 type mới
5. Test shared components với theme mới
6. Run `npm run build` - fix type errors
7. Run `npm run lint` - fix lint errors

---

## 6. Tổng số file cần tạo/sửa

| Loại | Số lượng |
|---|---|
| File mới (template components) | ~15 files |
| File mới (edit forms) | 3 files |
| File sửa (integration) | ~8 files |
| **Tổng** | **~26 files** |

---

## 7. Ghi chú quan trọng

1. **Prisma JSON cast**: Luôn dùng `profile_data: data as Prisma.InputJsonValue`
2. **TDZ error**: Khai báo `isDark` TRƯỚC helper functions
3. **Session cookies**: Per-slug, không global
4. **Image compression**: Client-side binary search
5. **Vietnamese errors**: Tất cả error messages tiếng Việt
6. **Mỗi template hoàn toàn độc lập** trong folder riêng
7. **Shared components** chỉ dùng cho CardDraw và LetterBox, các component khác (Hero, Stats, etc.) là riêng per template
