# Love Page Platform

Admin dashboard for managing Love Page Platform with Material Design UI.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Get your Supabase credentials from:
- Go to [supabase.com](https://supabase.com/dashboard)
- Select your project
- Go to Settings → API
- Copy "Project URL" and "anon public" key

### 3. Apply Database Migration

Follow the instructions in `supabase/README.md` to apply the database schema.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
web_embee/
├── app/
│   ├── admin/
│   │   ├── page.tsx           # Admin dashboard
│   │   ├── links/
│   │   │   ├── page.tsx       # Link management
│   │   │   └── actions.ts     # Link CRUD actions
│   │   └── games/
│   │       ├── page.tsx       # Game card management
│   │       └── actions.ts     # Game card CRUD actions
│   ├── [username]/
│   │   └── page.tsx           # Dynamic user pages (placeholder)
│   ├── layout.tsx             # Root layout with MUI theme
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
├── components/
│   ├── admin/
│   │   ├── LinkCreateForm.tsx # Link creation form
│   │   ├── LinkTable.tsx      # Links table with actions
│   │   ├── QRCodeDialog.tsx   # QR code generation & download
│   │   └── GameCardForm.tsx   # Game card create/edit form
│   └── ui/
│       └── ThemeProvider.tsx  # Material-UI theme
├── lib/
│   ├── supabase.ts            # Supabase client
│   └── types.ts               # TypeScript types
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── README.md              # Migration guide
└── package.json
```

## 🎨 Features

### Admin Dashboard (`/admin`)
- Clean Material Design interface
- Navigation to Links and Game Cards management

### Link Management (`/admin/links`)
- ✅ Create new links with username (slug)
- ✅ Select template type (LOVE, EVERY, IDOL)
- ✅ View all links in table
- ✅ Toggle active/inactive status
- ✅ Generate QR codes
- ✅ Download QR as PNG image
- ✅ Delete links with confirmation
- ✅ Template color badges

### Game Card Management (`/admin/games`)
- ✅ Add new game cards
- ✅ Edit existing cards
- ✅ Delete cards with confirmation
- ✅ Filter by difficulty level (Dễ, Vừa, Khó)
- ✅ Vietnamese language support
- ✅ Character counter (recommended 200 chars)

## 🎯 Design System

### Template Colors

**LOVE (Couple)**
- Background: `#FFCDD4` (Hồng phấn)
- Primary: `#E30523` (Đỏ đậm)
- Button Text: `#FFFFFF`

**EVERY (Family/Group)**
- Background: `#6AD59D` (Xanh ngọc)
- Primary: `#3D2181` (Tím đậm)
- Button Text: `#FFFFFF`

**IDOL (Fan Page)**
- Background: `#97D5FF` (Xanh dương)
- Primary: `#FFFFFF`
- Button Text: `#E30523`

### Fonts
- Nunito (primary)
- Montserrat (secondary)
- Both support Vietnamese characters

## 📝 Usage

### Creating a Link

1. Go to `/admin/links`
2. Fill in username (lowercase, alphanumeric, -, _)
3. Select template (LOVE, EVERY, or IDOL)
4. Click "Tạo Link"
5. Link will be created with null passcode (user sets later)

### Generating QR Code

1. In links table, click "QR Code" icon
2. Dialog shows large QR code with template colors
3. Click "Download PNG" to save
4. Click "Regenerate" to create new QR (same URL)
5. QR code points to `domain.com/username`

### Managing Game Cards

1. Go to `/admin/games`
2. Click "Thêm Card mới"
3. Enter question in Vietnamese
4. Select difficulty level
5. Save card
6. Filter by level using toggle buttons
7. Edit or delete cards as needed

## 🔧 Development

### Scripts

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: Material-UI v5
- **Database**: Supabase (PostgreSQL)
- **QR Codes**: qrcode.react
- **Image Export**: html-to-image
- **Styling**: Tailwind CSS (utility) + MUI (components)
- **Language**: TypeScript

## 🚧 Roadmap

- [x] Phase 1: Database Schema
- [x] Phase 2: Admin Features
- [ ] Phase 3: Dynamic Pages (LOVE, EVERY, IDOL templates)
- [ ] Phase 4: PIN Authentication
- [ ] Phase 5: Content Management (Gallery, Timeline, Letters)
- [ ] Phase 6: Game Features

## 📄 License

ISC
