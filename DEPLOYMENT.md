# Hướng Dẫn Triển Khai Love Memories

## Mục Lục
- [Triển Khai Trực Tiếp Qua IP:Port](#triển-khai-trực-tiếp-qua-ipport)
- [Triển Khai Qua Domain + Cloudflare](#triển-khai-qua-domain--cloudflare)
- [SSL/HTTPS với Cloudflare](#sslhttps-với-cloudflare)
- [Quản Lý Process với PM2](#quản-lý-process-với-pm2)
- [Troubleshooting](#troubleshooting)

---

## Triển Khai Trực Tiếp Qua IP:Port

### 1. Cấu hình Next.js bind 0.0.0.0

File `package.json` đã được cấu hình để bind địa chỉ `0.0.0.0`:

```json
"scripts": {
  "dev": "next dev -H 0.0.0.0",
  "start": "next start -H 0.0.0.0"
}
```

### 2. Chạy Server

```bash
# Option A: Development mode (foreground)
npm run dev

# Option B: Production mode (cần build trước)
npm run build
npm run start

# Option C: Dùng script tự động (khuyến nghị)
./start.sh
# Chọn 1 (Development) hoặc 2 (Production)
# Chọn 2 (Background mode)
```

### 3. Kiểm tra firewall

```bash
# Kiểm tra firewall status
sudo ufw status

# Nếu firewall đang active, mở port 3000
sudo ufw allow 3000/tcp
sudo ufw reload
```

### 4. Truy cập

```
http://YOUR_VPS_IP:3000
```

**Lưu ý:** Phương pháp này không an toàn cho production vì:
- Không có HTTPS (dữ liệu không mã hóa)
- Port 3000 trực tiếp ra ngoài
- Không có reverse proxy để bảo vệ

---

## Triển Khai Qua Domain + Cloudflare

### Yêu cầu
- VPS với Ubuntu/Debian
- Domain đã trỏ về VPS
- Tài khoản Cloudflare (miễn phí)

### Bước 1: Cài đặt Nginx

```bash
# Cập nhật package list
sudo apt update

# Cài đặt Nginx
sudo apt install nginx -y

# Kiểm tra Nginx đang chạy
sudo systemctl status nginx

# Enable Nginx khởi động cùng hệ thống
sudo systemctl enable nginx
```

### Bước 2: Cấu hình Nginx Reverse Proxy

```bash
# Tạo file config cho site
sudo nano /etc/nginx/sites-available/love-memories
```

Nội dung file config:

```nginx
# Upstream định nghĩa backend Next.js
upstream nextjs_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    
    # Thay your-domain.com bằng domain thực của bạn
    server_name your-domain.com www.your-domain.com;
    
    # Giới hạn upload size (cho gallery images)
    client_max_body_size 10M;
    
    # Logging
    access_log /var/log/nginx/love-memories-access.log;
    error_log /var/log/nginx/love-memories-error.log;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    gzip_min_length 1000;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Next.js
    location / {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache static files
    location /_next/static/ {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        
        # Cache for 1 year
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # PWA service worker và manifest
    location ~ ^/(sw\.js|workbox-.*\.js|manifest\.json)$ {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        
        # Không cache service worker
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        expires 0;
    }
}
```

### Bước 3: Enable site và test config

```bash
# Tạo symbolic link để enable site
sudo ln -s /etc/nginx/sites-available/love-memories /etc/nginx/sites-enabled/

# Xóa default site nếu cần
sudo rm /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Nếu OK, reload Nginx
sudo systemctl reload nginx
```

### Bước 4: Cấu hình Cloudflare

#### 4.1. Add domain vào Cloudflare

1. Đăng nhập Cloudflare: https://dash.cloudflare.com
2. Click **Add a Site**
3. Nhập domain của bạn
4. Chọn plan **Free**
5. Cloudflare sẽ scan DNS records hiện tại

#### 4.2. Cập nhật Nameservers

1. Cloudflare cung cấp 2 nameservers (ví dụ: `aron.ns.cloudflare.com`, `mary.ns.cloudflare.com`)
2. Đăng nhập nhà cung cấp domain (GoDaddy, Namecheap, etc.)
3. Thay đổi nameservers sang nameservers của Cloudflare
4. Đợi DNS propagate (5 phút - 48 giờ)

#### 4.3. Cấu hình DNS Records

Trong Cloudflare Dashboard > DNS > Records:

| Type | Name | Content | Proxy Status | TTL |
|------|------|---------|--------------|-----|
| A | @ | YOUR_VPS_IP | Proxied (orange cloud) | Auto |
| A | www | YOUR_VPS_IP | Proxied (orange cloud) | Auto |

**Lưu ý:** Bật Proxy (orange cloud) để kích hoạt CDN và HTTPS của Cloudflare.

#### 4.4. Cấu hình SSL/TLS

1. Vào **SSL/TLS** > **Overview**
2. Chọn **Full** (recommended) hoặc **Flexible**:
   - **Flexible**: Browser ↔️ Cloudflare (HTTPS), Cloudflare ↔️ Server (HTTP)
   - **Full**: Browser ↔️ Cloudflare (HTTPS), Cloudflare ↔️ Server (HTTPS với self-signed cert)
   - **Full (strict)**: Cần SSL certificate hợp lệ trên server (dùng Certbot)

Với **Flexible**, không cần cài SSL trên VPS. Chọn này nếu bạn muốn đơn giản.

#### 4.5. Tối ưu Performance (Optional)

**Speed > Optimization:**
- ✅ Auto Minify: JavaScript, CSS, HTML
- ✅ Brotli compression
- ✅ Rocket Loader™

**Caching > Configuration:**
- Browser Cache TTL: 4 hours hoặc Respect Existing Headers

**Network:**
- ✅ HTTP/2
- ✅ HTTP/3 (with QUIC)
- ✅ WebSockets

### Bước 5: Cập nhật Environment Variables

File `.env.production`:

```bash
# Cập nhật NEXT_PUBLIC_URL với domain thực
NEXT_PUBLIC_URL=https://your-domain.com

# Các biến khác giữ nguyên
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

### Bước 6: Build và Deploy

```bash
# Di chuyển vào thư mục project
cd /home/sontc/sources/love_memories

# Build production
npm run build

# Dừng process cũ nếu có
pm2 stop love-memories
pm2 delete love-memories

# Start với PM2
pm2 start npm --name "love-memories" -- start

# Lưu danh sách PM2
pm2 save

# Enable PM2 startup
pm2 startup
# Copy và chạy lệnh mà PM2 output ra
```

### Bước 7: Test

1. Truy cập `https://your-domain.com`
2. Kiểm tra HTTPS working (ổ khóa xanh trên browser)
3. Test các tính năng: gallery upload, timeline, letters
4. Test responsive trên mobile
5. Test PWA: Add to Home Screen

---

## SSL/HTTPS với Cloudflare

### Option 1: Flexible SSL (Đơn giản nhất)

Cloudflare tự động cấp SSL certificate cho visitors. Không cần cài gì trên VPS.

**Ưu điểm:**
- Setup nhanh, không cần config server
- Free SSL certificate từ Cloudflare

**Nhược điểm:**
- Traffic giữa Cloudflare ↔️ VPS vẫn là HTTP (không mã hóa hoàn toàn)

### Option 2: Full SSL với Let's Encrypt (Khuyến nghị)

Cài SSL certificate thực trên VPS dùng Certbot.

```bash
# Cài Certbot
sudo apt install certbot python3-certbot-nginx -y

# Lấy SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Nhập email
# Chấp nhận Terms of Service
# Chọn redirect HTTP -> HTTPS
```

Certbot tự động:
- Lấy SSL certificate từ Let's Encrypt
- Cập nhật Nginx config
- Setup auto-renewal (certificate tự động gia hạn mỗi 90 ngày)

**Sau đó:** Vào Cloudflare SSL/TLS, chọn **Full (strict)**.

---

## Quản Lý Process với PM2

### Cài đặt PM2

```bash
# Cài PM2 globally
sudo npm install -g pm2

# Verify
pm2 --version
```

### Các lệnh PM2 cơ bản

```bash
# Start app
pm2 start npm --name "love-memories" -- start

# Start development mode
pm2 start npm --name "love-memories-dev" -- run dev

# Xem danh sách processes
pm2 list

# Xem logs
pm2 logs love-memories

# Xem logs realtime
pm2 logs love-memories --lines 100

# Stop app
pm2 stop love-memories

# Restart app
pm2 restart love-memories

# Delete app
pm2 delete love-memories

# Xem monitoring
pm2 monit

# Lưu danh sách processes
pm2 save

# Setup auto-start khi server reboot
pm2 startup
# Copy và chạy lệnh output
```

### PM2 Ecosystem Config (Advanced)

Tạo file `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'love-memories',
    script: 'npm',
    args: 'start',
    cwd: '/home/sontc/sources/love_memories',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

Sử dụng:

```bash
# Start bằng ecosystem
pm2 start ecosystem.config.js

# Reload với zero-downtime
pm2 reload ecosystem.config.js
```

---

## Troubleshooting

### 1. Web không lên dù log báo thành công

**Triệu chứng:** `npm run dev` báo "Ready in 4.7s" nhưng không truy cập được.

**Nguyên nhân:**
- Next.js chỉ bind `localhost` thay vì `0.0.0.0`
- Process bị zombie/stopped

**Giải pháp:**

```bash
# Kill tất cả Node processes
pkill -9 node

# Kiểm tra package.json có -H 0.0.0.0 chưa
cat package.json | grep '"dev":\|"start":'

# Nếu chưa có, thêm vào:
# "dev": "next dev -H 0.0.0.0"
# "start": "next start -H 0.0.0.0"

# Restart server
npm run dev
```

### 2. Port 3000 bị chiếm

```bash
# Kiểm tra process đang dùng port 3000
sudo lsof -i :3000

# Hoặc
sudo netstat -tlnp | grep 3000

# Kill process theo PID
kill -9 <PID>
```

### 3. Nginx 502 Bad Gateway

**Nguyên nhân:** Next.js app không chạy hoặc Nginx không kết nối được.

**Giải pháp:**

```bash
# Kiểm tra Next.js có đang chạy không
pm2 list

# Kiểm tra Next.js có listen port 3000 không
curl http://localhost:3000

# Kiểm tra Nginx error log
sudo tail -f /var/log/nginx/love-memories-error.log

# Restart cả 2
pm2 restart love-memories
sudo systemctl restart nginx
```

### 4. Database connection failed

**Triệu chứng:** Error connecting to Supabase database.

**Giải pháp:**

```bash
# Kiểm tra .env.production có đúng không
cat .env.production | grep DATABASE_URL

# Test connection
npm run db:push

# Nếu lỗi, kiểm tra:
# 1. DATABASE_URL có đúng format không
# 2. Supabase project có đang active không
# 3. IP VPS có trong Supabase firewall whitelist không (nếu có bật)
```

### 5. Images không load

**Nguyên nhân:** Next.js image optimization hoặc Supabase CORS.

**Giải pháp:**

```bash
# Kiểm tra next.config.mjs có remotePatterns chưa
cat next.config.mjs | grep remotePatterns -A 10

# Phải có:
# remotePatterns: [
#   {
#     protocol: 'https',
#     hostname: '*.supabase.co',
#   },
#   {
#     protocol: 'https',
#     hostname: '*.supabase.in',
#   }
# ]

# Rebuild
npm run build
pm2 restart love-memories
```

### 6. SSL/HTTPS issues

**Triệu chứng:** Mixed content warning, HTTPS không hoạt động.

**Giải pháp:**

```bash
# Kiểm tra NEXT_PUBLIC_URL có https:// chưa
cat .env.production | grep NEXT_PUBLIC_URL

# Phải là: https://your-domain.com (không có trailing slash)

# Cloudflare SSL mode phải là Full hoặc Flexible
# Check trong: Cloudflare Dashboard > SSL/TLS > Overview

# Rebuild
npm run build
pm2 restart love-memories
```

### 7. PM2 process bị killed khi logout SSH

**Nguyên nhân:** PM2 chưa được setup startup script.

**Giải pháp:**

```bash
# Enable PM2 startup
pm2 startup

# Copy và run lệnh output (ví dụ):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u sontc --hp /home/sontc

# Save process list
pm2 save

# Test: reboot VPS
sudo reboot

# Sau khi reboot, check
pm2 list
```

### 8. Cloudflare cache cũ

**Triệu chứng:** Deploy code mới nhưng user vẫn thấy version cũ.

**Giải pháp:**

1. Vào Cloudflare Dashboard
2. **Caching** > **Configuration**
3. Click **Purge Everything**
4. Hoặc dùng API:

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

---

## Checklist Deploy Production

- [ ] Database đã setup đúng (Supabase pooling)
- [ ] `.env.production` có tất cả các biến cần thiết
- [ ] `NEXT_PUBLIC_URL` dùng HTTPS và domain production
- [ ] `npm run build` chạy thành công, không có errors
- [ ] Nginx config đã test: `sudo nginx -t`
- [ ] PM2 đã save và setup startup
- [ ] Cloudflare DNS đã trỏ đúng IP
- [ ] SSL/TLS mode đã chọn (Flexible hoặc Full)
- [ ] Test upload images, timeline, letters
- [ ] Test responsive trên mobile
- [ ] Test PWA installation
- [ ] Backup database trước khi deploy

---

## Tài Liệu Tham Khảo

- Next.js Deployment: https://nextjs.org/docs/deployment
- Nginx Documentation: https://nginx.org/en/docs/
- Cloudflare Docs: https://developers.cloudflare.com/
- PM2 Documentation: https://pm2.keymetrics.io/docs/
- Let's Encrypt: https://letsencrypt.org/
- Supabase Connection Pooling: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler

---

**Lưu ý:** File này được tạo tự động. Cập nhật theo nhu cầu thực tế của project.
