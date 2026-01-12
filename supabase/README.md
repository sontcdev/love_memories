# Love Page Platform - Database Migration Guide

## 📋 Overview

This guide explains how to apply the database migration for the Love Page Platform on Supabase.

## 🚀 Quick Start

### Method 1: Supabase Dashboard (Recommended)

1. **Login to Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run Migration**
   - Copy the entire contents of `001_initial_schema.sql`
   - Paste into the SQL Editor
   - Click "Run" or press `Ctrl/Cmd + Enter`

4. **Verify Success**
   - Check for the success notification at the bottom
   - You should see: "✅ Love Page Platform schema installed successfully!"

### Method 2: Supabase CLI (Advanced)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref <your-project-ref>

# Apply migration
supabase db push
```

## 📊 What's Created

### Tables
- ✅ `pages` - Page configuration and authentication
- ✅ `page_data` - Homepage display data
- ✅ `content_items` - Gallery, timeline, letters, milestones
- ✅ `game_cards` - Global game card library

### ENUM Types
- ✅ `template_type_enum` - LOVE, EVERY, IDOL
- ✅ `mode_count_enum` - UP, DOWN, NONE
- ✅ `content_type_enum` - GALLERY, TIMELINE, LETTER, IDOL_MILESTONE
- ✅ `difficulty_level_enum` - EASY, MEDIUM, HARD

### Security
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Public read access for active pages
- ✅ Authenticated write access
- ✅ Automatic `updated_at` triggers

### Helper Functions
- ✅ `verify_page_passcode(username, passcode)` - Verify PIN
- ✅ `get_full_page_data(username)` - Get complete page data
- ✅ `generate_random_game_cards(level, limit)` - Get random game cards

### Sample Data
- ✅ 6 sample game cards (2 EASY, 2 MEDIUM, 2 HARD)

## 🔍 Verification

After running the migration, verify in Supabase Dashboard:

### 1. Check Tables
- Go to "Table Editor"
- You should see: `pages`, `page_data`, `content_items`, `game_cards`

### 2. Check Data Types
- Go to "Database" → "Types"
- Verify ENUM types are created

### 3. Test Sample Data
```sql
-- Should return 6 game cards
SELECT * FROM game_cards;

-- Should return empty (no pages yet)
SELECT * FROM pages;
```

## 📝 Next Steps

### 1. Create a Test Page

```sql
-- Insert a test page
INSERT INTO pages (username, passcode_hash, template_type, theme_config)
VALUES (
    'test-love',
    crypt('123456', gen_salt('bf')), -- Password: 123456
    'LOVE',
    '{"background": "#FFCDD4", "primary": "#E30523"}'::jsonb
);

-- Get the page_id for next step
SELECT id, username FROM pages WHERE username = 'test-love';
```

### 2. Add Page Data

```sql
-- Replace <page_id> with the actual UUID from previous query
INSERT INTO page_data (
    page_id,
    mode_count,
    target_date,
    title_text,
    participants,
    is_music_autoplay
)
VALUES (
    '<page_id>',
    'UP',
    '2024-02-14',
    'Chúng mình đã bên nhau được...',
    '[
        {
            "name": "Nguyễn Văn A",
            "dob": "1995-05-20",
            "role": "Boyfriend",
            "avatar_url": "https://example.com/avatar1.jpg"
        },
        {
            "name": "Trần Thị B",
            "dob": "1997-08-15",
            "role": "Girlfriend",
            "avatar_url": "https://example.com/avatar2.jpg"
        }
    ]'::jsonb,
    true
);
```

### 3. Add Sample Content

```sql
-- Add gallery item
INSERT INTO content_items (page_id, type, title, image_url, sort_order)
VALUES (
    '<page_id>',
    'GALLERY',
    'First Date',
    'https://example.com/photo1.jpg',
    1
);

-- Add timeline event
INSERT INTO content_items (page_id, type, title, content, date_event, sort_order)
VALUES (
    '<page_id>',
    'TIMELINE',
    'First Meeting',
    'Ngày đầu tiên chúng mình gặp nhau tại công viên...',
    '2024-02-14',
    1
);
```

### 4. Test Functions

```sql
-- Test passcode verification
SELECT verify_page_passcode('test-love', '123456'); -- Should return true
SELECT verify_page_passcode('test-love', '000000'); -- Should return false

-- Get full page data
SELECT get_full_page_data('test-love');

-- Get random game cards
SELECT * FROM generate_random_game_cards('EASY', 2);
SELECT * FROM generate_random_game_cards(NULL, 5); -- All levels
```

## 🔐 Security Notes

### RLS Policies
- **Public Access**: Only active pages (`is_active = true`) are visible to public
- **Authenticated Access**: Write operations require authentication
- **Passcode Protection**: Use `verify_page_passcode()` function for PIN verification

### Passcode Hashing
The migration uses **bcrypt** for passcode hashing via PostgreSQL's `pgcrypto` extension.

**To hash a passcode:**
```sql
-- Hash a 6-digit PIN
SELECT crypt('123456', gen_salt('bf'));
```

**To verify a passcode:**
```sql
-- Option 1: Use helper function
SELECT verify_page_passcode('username', '123456');

-- Option 2: Direct comparison
SELECT crypt('123456', passcode_hash) = passcode_hash
FROM pages
WHERE username = 'username';
```

## 🐛 Troubleshooting

### Error: "extension uuid-ossp does not exist"
**Solution:** Enable UUID extension in Supabase Dashboard
- Go to "Database" → "Extensions"
- Enable "uuid-ossp"

### Error: "extension pgcrypto does not exist"
**Solution:** The migration should auto-enable it, but if not:
- Go to "Database" → "Extensions"
- Enable "pgcrypto"

### Error: "type already exists"
**Solution:** Migration was already run. To reset:
```sql
-- WARNING: This will delete all data!
DROP TABLE IF EXISTS content_items CASCADE;
DROP TABLE IF EXISTS page_data CASCADE;
DROP TABLE IF EXISTS game_cards CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TYPE IF EXISTS difficulty_level_enum CASCADE;
DROP TYPE IF EXISTS content_type_enum CASCADE;
DROP TYPE IF EXISTS mode_count_enum CASCADE;
DROP TYPE IF EXISTS template_type_enum CASCADE;
```

## 📞 Support

If you encounter any issues:
1. Check Supabase logs in Dashboard → "Database" → "Logs"
2. Verify all extensions are enabled
3. Ensure proper RLS policies are applied

## 🎯 Design System Integration

The schema supports all three templates with their color palettes:

### Template LOVE
```json
{
  "background": "#FFCDD4",
  "primary": "#E30523",
  "buttonText": "#FFFFFF"
}
```

### Template EVERY
```json
{
  "background": "#6AD59D",
  "primary": "#3D2181",
  "buttonText": "#FFFFFF"
}
```

### Template IDOL
```json
{
  "background": "#97D5FF",
  "primary": "#FFFFFF",
  "buttonText": "#E30523"
}
```

Store custom colors in `pages.theme_config` as JSONB.
