# 🚀 Hướng Dẫn Cài Đặt Supabase

Chạy các file SQL theo thứ tự sau trong **Supabase SQL Editor**:

---

## ✅ Bước 1: Tạo Database & Functions

**File:** `1_setup_database.sql`

**Làm gì:**
- Tạo extensions (uuid, pgcrypto)
- Tạo functions (crypt_password, verify PIN/password, get_server_time)
- Tạo tables (links, gallery, messages, games, memories)
- Tạo indexes
- Thiết lập RLS policies

**Cách chạy:**
1. Mở Supabase Dashboard → SQL Editor
2. Copy toàn bộ nội dung file `1_setup_database.sql`
3. Paste vào SQL Editor
4. Click "Run"
5. Đợi success message: ✅ Database setup complete!

---

## ✅ Bước 2: Tạo Storage Bucket

**Không cần chạy SQL**, làm thủ công trong Supabase Dashboard:

1. Click **Storage** (left sidebar)
2. Click **"New bucket"**
3. Nhập tên: `gallery`
4. Check ✅ **"Public bucket"**
5. Click **"Create bucket"**

---

## ✅ Bước 3: Thiết Lập Storage Policies

**File:** `2_setup_storage.sql`

**Làm gì:**
- Cho phép người dùng upload/view/delete ảnh trong bucket `gallery`

**Cách chạy:**
1. Quay lại SQL Editor
2. Copy toàn bộ nội dung file `2_setup_storage.sql`
3. Paste và click "Run"
4. Đợi success message: ✅ Storage policies configured!

---

## 🎉 Hoàn Tất!

Database đã sẵn sàng! Bây giờ bạn có thể:
- Tạo link mới từ http://localhost:3000/admin
- Upload ảnh vào Gallery
- Tạo Time Capsule letters
- Thêm Flashcard questions

---

## 📝 Lưu Ý Quan Trọng

### Environment Variables

Đảm bảo file `.env.local` có đầy đủ:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=admin123
```

**Lấy Service Role Key:**
1. Supabase Dashboard → Settings → API
2. Copy **service_role** key (KHÔNG phải anon key!)

---

## 🐛 Troubleshooting

### Lỗi "function crypt_password does not exist"
→ Chạy lại `1_setup_database.sql`

### Lỗi "401 Unauthorized" khi upload ảnh
→ Chạy lại `2_setup_storage.sql`

### Lỗi "new row violates row-level security policy"
→ Kiểm tra RLS policies được tạo đúng trong Supabase Dashboard → Database → Policies

---

## ✅ Kiểm Tra Setup Thành Công

Chạy query này trong SQL Editor để verify:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('links', 'gallery', 'messages', 'games', 'memories');

-- Check functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('crypt_password', 'verify_owner_pin', 'verify_guest_password', 'get_server_time');

-- Check storage bucket exists
SELECT name FROM storage.buckets WHERE name = 'gallery';
```

Kết quả mong đợi:
- 5 tables
- 4 functions
- 1 bucket

---

**Nếu gặp vấn đề, kiểm tra lại từng bước!** 🔍
