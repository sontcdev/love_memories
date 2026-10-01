# Template Redesign Plan - Hoàn toàn riêng biệt

## Tổng quan
Mỗi template sẽ có 5 components riêng biệt, không dùng chung:
1. **LockScreen** - Màn hình nhập PIN theo theme
2. **Template chính** - Hero, sections, animations
3. **Edit page** - Form design theo theme
4. **LetterBox** - Guestbook/letter component
5. **GameSection** - Mini game với gameplay khác nhau

---

## 1. LOVE Template (Classic Couple)

### Concept
- **Theme**: Lãng mạn, cổ điển, tone hồng/đỏ
- **Vibe**: Tình yêu ngọt ngào, kỷ niệm đôi lứa

### Components
#### LockScreen
- Background: Gradient hồng pastel với trái tim floating
- Input: Dạng trái tim, mỗi digit là 1 trái tim nhỏ
- Animation: Hearts floating khi nhập đúng

#### Template chính
- Hero: 2 avatar tròn với viền trái tim, tên couple ở giữa
- Timeline: Dạng timeline dọc với icon trái tim
- Gallery: Grid dạng polaroid với caption handwritten font
- Sections: Our Story, Memories, Letters, Game

#### LetterBox
- Style: Thiếp thư cổ điển với seal wax
- Input: Dạng viết thư với envelope animation
- Display: Letter cards với fold effect

#### GameSection: "Memory Match"
- **Gameplay**: Lật thẻ tìm cặp giống nhau (hình ảnh của couple)
- **UI**: Cards dạng polaroid, flip animation 3D
- **Win condition**: Tìm được tất cả cặp trong thời gian ngắn nhất
- **Scoring**: Dựa trên số lần lật và thời gian

---

## 2. LOVE2 Template (Scrapbook)

### Concept
- **Theme**: Craft paper, handmade, vintage
- **Vibe**: Sổ lưu niệm thủ công, sticker, washi tape

### Components
#### LockScreen
- Background: Kraft paper texture
- Input: Dạng typewriter font trên giấy note
- Animation: Sticker peel effect khi unlock

#### Template chính
- Hero: Scrapbook page với photo dán bằng washi tape
- Timeline: Dạng sticky notes dán trên corkboard
- Gallery: Masonry layout với tape corners
- Sections: Our Memories, Timeline, Gallery, Notes

#### LetterBox
- Style: Post-it notes trên corkboard
- Input: Dạng viết trên sticky note
- Display: Notes với nhiều màu sắc, rotation ngẫu nhiên

#### GameSection: "Scrapbook Puzzle"
- **Gameplay**: Drag & drop photos vào đúng vị trí trong scrapbook
- **UI**: Photos có thể rotate, resize
- **Win condition**: Đặt tất cả photos vào đúng spots
- **Scoring**: Dựa trên độ chính xác và thời gian

---

## 3. IDOL Template (Fanpage)

### Concept
- **Theme**: Concert, neon, holographic
- **Vibe**: Fan club, concert vibes, energetic

### Components
#### LockScreen
- Background: Dark với neon lights, stage effect
- Input: LED display style
- Animation: Spotlight effect, confetti khi unlock

#### Template chính
- Hero: Stage background với spotlight, idol photo center
- Timeline: Dạng concert setlist
- Gallery: Grid với holographic frame
- Sections: Idol Profile, Concert Memories, Fan Letters, Quiz

#### LetterBox
- Style: Lightstick messages
- Input: Dạng chat bubble với glow effect
- Display: Messages với neon border, pulse animation

#### GameSection: "Idol Quiz"
- **Gameplay**: Trivia về idol (sinh nhật, bài hát, sự kiện)
- **UI**: Multiple choice với neon buttons
- **Win condition**: Trả lời đúng tất cả câu hỏi
- **Scoring**: Points cho mỗi câu đúng, bonus cho speed

---

## 4. GRAD_PERSONAL Template (Student Graduation)

### Concept
- **Theme**: Academic, emerald green, laurel wreath
- **Vibe**: Thành tựu cá nhân, tốt nghiệp, tương lai

### Components
#### LockScreen
- Background: Emerald gradient với laurel wreath
- Input: Dạng bằng cấp, serif font
- Animation: Graduation cap toss khi unlock

#### Template chính
- Hero: Portrait frame với laurel wreath, student name
- Timeline: Academic journey từ nhập học đến tốt nghiệp
- Gallery: Formal photos với frame cổ điển
- Sections: My Journey, Achievements, Memories, Wishes

#### LetterBox
- Style: Parchment scroll
- Input: Dạng viết trên giấy cổ
- Display: Letters cuộn lại, seal wax

#### GameSection: "Achievement Badge"
- **Gameplay**: Collect badges bằng cách hoàn thành challenges
- **UI**: Badge collection grid
- **Win condition**: Thu thập tất cả badges
- **Scoring**: Points cho mỗi badge

---

## 5. GRAD_CLASS Template (Class Yearbook)

### Concept
- **Theme**: Blackboard, chalk, school memories
- **Vibe**: Kỷ niệm lớp học, yearbook, tập thể

### Components
#### LockScreen
- Background: Blackboard texture
- Input: Chalk handwriting style
- Animation: Chalk dust effect khi unlock

#### Template chính
- Hero: Class photo trên blackboard background
- Timeline: School year events
- Gallery: Class photos với chalk frame
- Sections: Our Class, Teachers, Events, Messages

#### LetterBox
- Style: Chalkboard messages
- Input: Chalk writing effect
- Display: Messages viết bằng phấn trên bảng

#### GameSection: "Class Trivia"
- **Gameplay**: Quiz về lớp học (teacher names, class events, inside jokes)
- **UI**: Chalk style multiple choice
- **Win condition**: Trả lời đúng tất cả
- **Scoring**: Points + class rank

---

## 6. GRAD_GROUP Template (Friend Group)

### Concept
- **Theme**: 3 sub-themes (caravan, scrapbook, station)
- **Vibe**: Nhóm bạn, chuyến đi, thanh xuân

### Components
#### LockScreen
- Background: Theo sub-theme (wood/kraft/neon)
- Input: Theo sub-theme
- Animation: Theo sub-theme

#### Template chính
- Hero: Group photo với theme background
- Timeline: Group activities
- Gallery: Group photos
- Sections: Our Group, Members, Adventures, Messages

#### LetterBox
- Style: Theo sub-theme
- Input: Theo sub-theme
- Display: Theo sub-theme

#### GameSection: "Friendship Quiz"
- **Gameplay**: "Ai hiểu ai nhất?" - Quiz về members trong group
- **UI**: Member cards với quiz questions
- **Win condition**: Đoán đúng sở thích/thói quen của bạn bè
- **Scoring**: Match percentage

---

## 7. WEDDING Template

### Concept
- **Theme**: Elegant, gold/ivory, floral
- **Vibe**: Đám cưới, lãng mạn, trang trọng

### Components
#### LockScreen
- Background: Ivory với floral border
- Input: Elegant serif font với gold accent
- Animation: Flower petals falling khi unlock

#### Template chính
- Hero: Couple photo với floral frame, wedding date
- Timeline: Love story từ gặp nhau đến cưới
- Gallery: Pre-wedding, wedding photos
- Sections: Our Story, Wedding Details, Gallery, Wishes

#### LetterBox
- Style: Wedding card với ribbon
- Input: Elegant form
- Display: Cards với floral border

#### GameSection: "Wedding Countdown Quiz"
- **Gameplay**: Quiz về couple (first date, proposal, wedding details)
- **UI**: Elegant cards với floral design
- **Win condition**: Trả lời đúng tất cả
- **Scoring**: Points + "Love Score"

---

## 8. TRAVEL Template

### Concept
- **Theme**: Adventure, sky blue, passport stamps
- **Vibe**: Du lịch, khám phá, tự do

### Components
#### LockScreen
- Background: World map với compass
- Input: Passport stamp style
- Animation: Plane flying khi unlock

#### Template chính
- Hero: Destination photo với map overlay
- Timeline: Trip itinerary
- Gallery: Travel photos với location tags
- Sections: Our Journey, Destinations, Gallery, Travel Notes

#### LetterBox
- Style: Postcard
- Input: Postcard form với stamp
- Display: Postcards với map background

#### GameSection: "Destination Quiz"
- **Gameplay**: "Địa danh này ở đâu?" - Quiz về places đã đến
- **UI**: Map với pins, photo clues
- **Win condition**: Đoán đúng tất cả địa danh
- **Scoring**: Points + "Explorer Rank"

---

## 9. FRIENDSHIP Template

### Concept
- **Theme**: Vibrant, colorful, playful
- **Vibe**: Bạn bè, vui vẻ, năng động

### Components
#### LockScreen
- Background: Colorful gradient với emoji floating
- Input: Playful rounded font
- Animation: Confetti explosion khi unlock

#### Template chính
- Hero: Group photo với colorful frame
- Timeline: Friendship milestones
- Gallery: Fun photos, memes
- Sections: Our Squad, Memories, Gallery, Messages

#### LetterBox
- Style: Chat bubbles
- Input: Chat message style
- Display: Messages dạng chat conversation

#### GameSection: "Who Said It?"
- **Gameplay**: "Ai nói câu này?" - Đoán ai đã nói quote/fact
- **UI**: Quote cards với member avatars
- **Win condition**: Đoán đúng tất cả
- **Scoring**: Points + "Best Friend Rank"

---

## Implementation Order

### Phase 1: Core Components (Week 1-2)
1. Tạo folder structure cho từng template
2. Implement LockScreen riêng cho mỗi template
3. Implement LetterBox riêng cho mỗi template

### Phase 2: GameSection (Week 3-4)
1. Implement GameSection với gameplay khác nhau
2. Test gameplay cho từng template

### Phase 3: Edit Page (Week 5)
1. Redesign EditProfileForm cho từng template
2. Match theme với template chính

### Phase 4: Polish (Week 6)
1. Animation refinement
2. Mobile responsive
3. Performance optimization

---

## File Structure

```
src/components/templates/
├── love/
│   ├── LoveTemplate.tsx
│   ├── LoveLockScreen.tsx
│   ├── LoveLetterBox.tsx
│   └── LoveGameSection.tsx
├── love2/
│   ├── Love2Template.tsx
│   ├── Love2LockScreen.tsx
│   ├── Love2LetterBox.tsx
│   └── Love2GameSection.tsx
├── idol/
│   ├── IdolTemplate.tsx
│   ├── IdolLockScreen.tsx
│   ├── IdolLetterBox.tsx
│   └── IdolGameSection.tsx
├── grad-personal/
│   ├── GradPersonalTemplate.tsx
│   ├── GradPersonalLockScreen.tsx
│   ├── GradPersonalLetterBox.tsx
│   └── GradPersonalGameSection.tsx
├── grad-class/
│   ├── GradClassTemplate.tsx
│   ├── GradClassLockScreen.tsx
│   ├── GradClassLetterBox.tsx
│   └── GradClassGameSection.tsx
├── grad-group/
│   ├── GradGroupTemplate.tsx
│   ├── GradGroupLockScreen.tsx
│   ├── GradGroupLetterBox.tsx
│   └── GradGroupGameSection.tsx
├── wedding/
│   ├── WeddingTemplate.tsx
│   ├── WeddingLockScreen.tsx
│   ├── WeddingLetterBox.tsx
│   └── WeddingGameSection.tsx
├── travel/
│   ├── TravelTemplate.tsx
│   ├── TravelLockScreen.tsx
│   ├── TravelLetterBox.tsx
│   └── TravelGameSection.tsx
└── friendship/
    ├── FriendshipTemplate.tsx
    ├── FriendshipLockScreen.tsx
    ├── FriendshipLetterBox.tsx
    └── FriendshipGameSection.tsx
```

---

## Notes

- Mỗi template hoàn toàn độc lập, không import từ shared components
- Gameplay khác nhau, không chỉ đổi màu/UI
- Responsive cho mobile và desktop
- Performance: Lazy load images, optimize animations
- Accessibility: Keyboard navigation, screen reader support
