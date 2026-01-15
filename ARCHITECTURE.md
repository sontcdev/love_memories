# Digital Memories MVP - Architecture Documentation

## Page Structure Overview

### Dynamic Route: `/[username]`

**File:** `app/[username]/page.tsx`

This is a **Next.js Server Component** that handles:
- Server-side data fetching from Supabase
- Username validation
- 404 error handling
- Passing initial data to client components

### Component Hierarchy

```
┌─────────────────────────────────────────────┐
│     app/[username]/page.tsx (Server)        │
│  - Fetches link data                        │
│  - Validates username                       │
│  - Returns 404 if not found                 │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│   TemplateWrapper (Client Component)        │
│  - Manages authentication state (Zustand)   │
│  - Handles Layer 1: Guest Password Gate     │
│  - Handles Layer 2: Owner PIN Modal         │
│  - Shows Edit Mode Toggle                   │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│      HomePage (Client Component)            │
│                                              │
│  1. TapToOpenOverlay                         │
│     └─ Solves mobile autoplay issue         │
│                                              │
│  2. MusicPlayer (Floating Controls)          │
│     └─ YouTube iframe + visualizer          │
│                                              │
│  3. Hero Section                             │
│     ├─ Names (gradient text)                │
│     ├─ Short note                           │
│     └─ DaysCounter (animated)               │
│                                              │
│  4. Gallery Section                          │
│     ├─ MasonryGallery                       │
│     └─ GalleryUploader (owner only)         │
│                                              │
│  5. TimeCapsule                              │
│     └─ Locked/unlocked envelopes            │
│                                              │
│  6. FlashcardGame                            │
│     └─ 3D flip cards                        │
│                                              │
│  7. Timeline (Coming Soon)                   │
│                                              │
│  8. Footer                                   │
└─────────────────────────────────────────────┘
```

## Data Flow

### 1. Server Component (page.tsx)
```typescript
// Runs on server only
const { data: link } = await supabase
  .from('links')
  .select('id, username, settings, is_active')
  .eq('username', username)
  .single();

// Show 404 if not found
if (!link) notFound();

// Pass to client components
<TemplateWrapper linkId={link.id}>
  <HomePage settings={link.settings} />
</TemplateWrapper>
```

### 2. Authentication Layer (TemplateWrapper)
```typescript
// Client component with Zustand state
const { isAuthenticated, viewMode } = useAuthStore();

// Layer 1: Password Gate
if (!isAuthenticated) {
  return <GuestPasswordGate />;
}

// Layer 2: Owner PIN (modal overlay)
<OwnerPinModal isOpen={showPinModal} />
```

### 3. Content Layer (HomePage)
```typescript
// Controlled by tap-to-open overlay
const [isOpened, setIsOpened] = useState(false);

// All modules receive linkId for data fetching
<MasonryGallery linkId={linkId} />
<TimeCapsule linkId={linkId} />
<FlashcardGame linkId={linkId} />
```

## State Management

### Zustand Store (useAuthStore)
**Location:** `store/useAuthStore.ts`

```typescript
interface AuthStore {
  isAuthenticated: boolean;
  viewMode: 'guest' | 'owner' | null;
  linkId: string | null;
  username: string | null;
  
  setGuestAuth(linkId, username): void;
  setOwnerAuth(linkId, username): void;
  logout(): void; // Downgrade to guest
  reset(): void;  // Complete logout
}
```

**Persistence:** SessionStorage (cleared on browser close)

## Authentication Flow

### Guest Access
1. Visit `/username`
2. **Server:** Fetch link data
3. **Client:** Check Zustand → not authenticated
4. **Show:** Password gate overlay
5. **Submit:** Call `/api/auth/verify-password`
6. **Success:** `setGuestAuth()` → content reveals

### Owner Access (Upgrade)
1. Already in as guest
2. Click "Chế độ Chỉnh sửa" button
3. **Show:** PIN modal (6 digits)
4. **Submit:** Call `/api/auth/verify-pin`
5. **Success:** `setOwnerAuth()` → edit UI appears

## Module Integration

### Each Module is Self-Contained

**TimeCapsule:**
- Fetches own data from `messages` table
- Uses server time API (`/api/server-time`)
- Owner: Add/delete letters
- Guest: View unlocked letters

**FlashcardGame:**
- Fetches from `games` table
- Owner: CRUD questions
- Guest: Play only, auto-reset

**MasonryGallery:**
- Fetches from `gallery` table
- Owner: Upload (compressed), delete
- Guest: View only, lightbox

## Error Handling

### 404 Not Found
**File:** `app/[username]/not-found.tsx`

Triggered when:
- Username doesn't exist
- Link is inactive (`is_active = false`)

### API Errors
Each module handles its own errors:
- Failed uploads → Alert user
- Failed deletes → Confirm before retrying
- Network errors → Console log + user feedback

## Performance Optimizations

### Server Side
- ✅ Server Components for initial data fetch
- ✅ Single database query per page load
- ✅ Metadata generation for SEO

### Client Side
- ✅ Lazy loading gallery images
- ✅ Image compression before upload
- ✅ Zustand session persistence (no refetch)
- ✅ CSS transforms for animations (GPU)
- ✅ Debounced API calls

### Asset Optimization
- Images compressed to max 1080px, 0.8 quality
- YouTube audio-only (hidden iframe)
- Tailwind CSS purging unused styles

## Security

### Row Level Security (RLS)
All tables have policies enforcing:
- Guest: SELECT only
- Owner: Full CRUD (validated by JWT claim)
- Admin: Full access

### Authentication
- Passwords: bcrypt hashed in database
- PINs: bcrypt hashed (6 digits)
- Server time: Prevents client manipulation
- Session: HttpOnly cookies (future)

## Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## Deploy Checklist

- [ ] Set environment variables in Vercel
- [ ] Create Supabase `gallery` storage bucket
- [ ] Run RLS policies from `schema.sql`
- [ ] Run storage policies from `storage_setup.sql`
- [ ] Test with production data
- [ ] Verify 404 page works
- [ ] Test authentication flow
- [ ] Check mobile responsiveness

---

**Current Status:** ✅ All core modules integrated and functional
