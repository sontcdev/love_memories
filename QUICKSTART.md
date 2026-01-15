# 🚀 Quick Start Guide - Digital Memories

## Prerequisites

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **Supabase account** (free tier works!)

---

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15
- React 19
- Supabase
- Framer Motion
- Tailwind CSS
- And more...

---

## Step 2: Set Up Supabase

### 2.1 Create Supabase Project

1. Go to https://supabase.com
2. Sign up / Log in
3. Click "New Project"
4. Choose organization, name, and password
5. Wait for project to be ready (~2 minutes)

### 2.2 Get Your Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### 2.3 Run Database Migrations

In Supabase dashboard, go to **SQL Editor** and run these files in order:

1. **`supabase/schema.sql`** - Creates all tables, policies, and functions
2. **`supabase/functions/verify_guest_password.sql`** - Password verification
3. **`supabase/functions/verify_owner_pin.sql`** - PIN verification  
4. **`supabase/functions/get_server_time.sql`** - Time validation
5. **`supabase/functions/crypt_password.sql`** - Password hashing
6. **`supabase/storage_setup.sql`** - Storage bucket setup

### 2.4 Create Storage Bucket

In Supabase dashboard:
1. Go to **Storage**
2. Click "Create a new bucket"
3. Name: `gallery`
4. Make it **Public**
5. Click "Create bucket"

---

## Step 3: Configure Environment Variables

Create `.env.local` file in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_PASSWORD=admin123
```

**Replace with your actual Supabase credentials!**

---

## Step 4: Run Development Server

```bash
npm run dev
```

The app will start at **http://localhost:3000**

---

## Step 5: Create Your First Link

1. Visit **http://localhost:3000/admin**
2. Login with password: `admin123` (or what you set in `.env.local`)
3. Click "Create Link"
4. Enter username (e.g., `john-and-jane`)
5. **SAVE THE PIN!** (You can't recover it)
6. Visit **http://localhost:3000/john-and-jane**

---

## 🎯 What You Should See

### Admin Dashboard (`/admin`)
- Login screen with purple/pink gradient
- After login: Table of links with create/reset/delete actions

### User Page (`/john-and-jane`)
- Password gate (if set) or PIN entry
- Music player with tap-to-open overlay
- Days counter animation
- Masonry gallery
- Time capsule with envelopes
- Flashcard game with 3D flip
- All with smooth animations!

---

## 🐛 Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Supabase connection failed"
- Check `.env.local` has correct credentials
- Verify Supabase project is active
- Check no typos in URL/key

### "RLS policy" errors
- Run all SQL migration files in Supabase
- Verify `gallery` storage bucket exists
- Check RLS policies are enabled

### Port 3000 already in use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

### Tailwind styles not working
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## 📁 Project Structure

```
love_memories/
├── app/                    # Next.js App Router
│   ├── [username]/        # Dynamic user pages
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   └── privacy/           # Privacy policy
├── components/            # React components
│   ├── auth/             # Authentication gates
│   ├── home/             # Home page modules
│   ├── modules/          # Interactive features
│   └── settings/         # Theme & settings
├── lib/                   # Utilities
│   ├── supabase/         # DB clients
│   └── theme.ts          # Color utilities
├── supabase/             # Database migrations
├── public/               # Static assets
│   ├── icons/           # PWA icons (to be generated)
│   └── manifest.json    # PWA manifest
└── .env.local           # Environment variables
```

---

## 🎨 Generate PWA Icons

Before deploying, generate app icons:

1. Visit https://www.pwabuilder.com/imageGenerator
2. Upload a 512x512 icon
3. Download and extract to `public/icons/`

See `PWA_ICONS_GUIDE.md` for details.

---

## 🚀 Deploy to Production

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - NEXT_PUBLIC_SITE_URL (your domain)
# - ADMIN_PASSWORD

# Deploy to production
vercel --prod
```

### Important for Production:
- [ ] Set all environment variables in Vercel
- [ ] Generate PWA icons
- [ ] Test on mobile devices
- [ ] Verify Supabase RLS policies
- [ ] Update `NEXT_PUBLIC_SITE_URL` to your domain

---

## 📚 Additional Features

### Optional: Sentry Error Tracking
See `SENTRY_SETUP.md` for integration guide.

### Optional: RLS Security Testing
Run tests from `supabase/tests/rls_security_test.sql`

---

## 🎉 You're All Set!

Your Digital Memories platform is now running!

**Default Admin Password:** `admin123` (change in production!)

**Need Help?** Check these files:
- `ARCHITECTURE.md` - System overview
- `SENTRY_SETUP.md` - Error tracking
- `PWA_ICONS_GUIDE.md` - PWA setup
- `walkthrough.md` - Feature walkthrough

---

**Happy coding! 💕**
