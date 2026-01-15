# 🔧 Fix "Create Link" Error - Step by Step

## ❌ Error You're Seeing:
```
Could not find the function public.crypt_password(password) in the schema cache
```

## ✅ Solution: Set Up Supabase Database

You need to run the SQL migration files in your Supabase project to create the required tables and functions.

---

## 📋 Step-by-Step Instructions

### **Step 1: Open Supabase SQL Editor**

1. Go to https://supabase.com
2. Click on your project: **wtjzdlaqzlxkhfuvectq**
3. Click **SQL Editor** in the left sidebar
4. Click **"New query"**

---

### **Step 2: Run Migration Files (IN ORDER)**

Copy and paste each file's content into the SQL Editor and click **"Run"**.

#### **1️⃣ Create Tables & Policies** (**REQUIRED**)
File: `supabase/schema.sql`

This creates all the tables (`links`, `messages`, `games`, `gallery`) and RLS policies.

**How to run:**
1. Open `g:\sources\love_memories\supabase\schema.sql` in VS Code
2. Copy ALL content (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor
4. Click **"Run"**

Wait for success message ✅

---

#### **2️⃣ Create Password Hashing Function** (**REQUIRED** - This fixes your error!)
File: `supabase/functions/crypt_password.sql`

This creates the `crypt_password` function needed for PIN generation.

**Content:**
```sql
-- Enable pgcrypto extension for bcrypt hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to hash password using bcrypt
CREATE OR REPLACE FUNCTION public.crypt_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**How to run:**
1. Copy the SQL above
2. Paste into Supabase SQL Editor
3. Click **"Run"**

---

#### **3️⃣ Create Guest Password Verification** (Optional for now)
File: `supabase/functions/verify_guest_password.sql`

**Content:**
```sql
CREATE OR REPLACE FUNCTION public.verify_guest_password(
  link_id UUID,
  password_attempt TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT guest_password_hash INTO stored_hash
  FROM links
  WHERE id = link_id;
  
  IF stored_hash IS NULL THEN
    RETURN TRUE; -- No password set
  END IF;
  
  RETURN stored_hash = crypt(password_attempt, stored_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### **4️⃣ Create PIN Verification** (Optional for now)
File: `supabase/functions/verify_owner_pin.sql`

**Content:**
```sql
CREATE OR REPLACE FUNCTION public.verify_owner_pin(
  link_id UUID,
  pin_attempt TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT owner_pin_hash INTO stored_hash
  FROM links
  WHERE id = link_id;
  
  IF stored_hash IS NULL THEN
    RETURN FALSE; -- No PIN set
  END IF;
  
  RETURN stored_hash = crypt(pin_attempt, stored_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### **5️⃣ Create Server Time Function** (Optional for now)
File: `supabase/functions/get_server_time.sql`

**Content:**
```sql
CREATE OR REPLACE FUNCTION public.get_server_time()
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
  RETURN NOW();
END;
$$ LANGUAGE plpgsql;
```

---

### **Step 3: Create Storage Bucket**

1. In Supabase dashboard, click **Storage** in left sidebar
2. Click **"New bucket"**
3. Set name: `gallery`
4. Check **"Public bucket"** ✅
5. Click **"Create bucket"**

---

### **Step 4: Verify Setup**

Go back to Supabase SQL Editor and run:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public';
```

You should see:
- **Tables:** `links`, `messages`, `games`, `gallery`
- **Functions:** `crypt_password`, `verify_guest_password`, `verify_owner_pin`, `get_server_time`

---

## ✅ Test Again

1. Go back to http://localhost:3000/admin
2. Click **"Create Link"**
3. Enter username: `sonhandsome`
4. Click **"Create Link"**

It should now work! ✨

You'll see:
- Link created successfully
- Generated PIN displayed
- Link URL shown

**SAVE THE PIN!** You can't recover it later.

---

## 🐛 Still Having Issues?

### Error: "relation 'links' does not exist"
→ Run `supabase/schema.sql` first

### Error: "function crypt_password does not exist"
→ Run step 2️⃣ above

### Error: "bucket 'gallery' not found"
→ Create storage bucket (step 3)

---

## 📝 Quick Reference

**Minimum required for "Create Link" to work:**
1. ✅ Run `schema.sql`
2. ✅ Run `crypt_password.sql` function

**For full functionality:**
- All SQL functions
- Storage bucket
- Environment variables configured

---

**Need more help?** Check `QUICKSTART.md` for the complete setup guide.
