# 🔒 Rate Limiting Implementation Guide

## Overview
This project implements IP-based rate limiting on guest authentication to prevent brute force attacks.

---

## Implementation Details

### **Database Table: `login_attempts`**

**Schema:**
```sql
CREATE TABLE login_attempts (
    id UUID PRIMARY KEY,
    ip_address VARCHAR(45) UNIQUE NOT NULL,
    attempt_count INTEGER DEFAULT 1,
    last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Track failed login attempts per IP address

---

## Rate Limiting Rules

### **Limits:**
- **Max Attempts:** 5 failed attempts
- **Time Window:** 10 minutes
- **Response:** HTTP 429 (Too Many Requests)
- **Lockout Duration:** 10 minutes from first failed attempt

### **Logic Flow:**

```
1. User attempts guest login
2. Get client IP from request headers
3. Check login_attempts table:
   
   IF ip_address NOT EXISTS:
       → Create new record (count: 1)
       → Allow login attempt
   
   ELSE IF last_attempt_at > 10 minutes ago:
       → Reset count to 1
       → Allow login attempt
   
   ELSE IF attempt_count >= 5:
       → Return 429 Too Many Requests
       → Block login attempt
   
   ELSE:
       → Increment count
       → Allow login attempt

4. IF login successful:
       → Delete ip_address record (reset)
   
   IF login failed:
       → Keep incremented count
```

---

## IP Detection

**Headers Checked (in order):**
1. `x-forwarded-for` (Vercel, Cloudflare)
2. `x-real-ip` (Nginx)
3. Fallback: `'unknown'`

**Note:** On Vercel, `x-forwarded-for` is automatically populated with client IP.

---

## Setup Instructions

### **Step 1: Create Database Table**

Run this SQL in Supabase SQL Editor:

```sql
-- See: supabase/rate_limiting.sql
```

### **Step 2: Deploy Code**

The API route `app/api/auth/verify-password/route.ts` is already updated with rate limiting logic.

### **Step 3: Test**

**Manual Testing:**
1. Go to a password-protected link
2. Enter wrong password 5 times
3. On 6th attempt → Should see "Too many failed attempts" error
4. Wait 10 minutes or enter correct password to reset

**Automated Testing (Optional):**
```bash
# Use curl or Postman to test
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/verify-password \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"wrong"}'
  echo "\n"
done
```

---

## Error Messages

### **429 Response (Rate Limited):**
```json
{
  "error": "Too many failed attempts. Please try again in 10 minutes.",
  "rateLimitExceeded": true
}
```

### **401 Response (Invalid Password):**
```json
{
  "error": "Invalid credentials"
}
```

---

## Maintenance

### **Cleanup Old Records**

Run periodically (e.g., via cron job):

```sql
SELECT cleanup_old_login_attempts();
```

Or manually:
```sql
DELETE FROM login_attempts 
WHERE last_attempt_at < NOW() - INTERVAL '1 hour';
```

---

## Security Considerations

### **Strengths:**
✅ Prevents brute force attacks
✅ No additional paid services (uses existing Supabase)
✅ Automatic reset on successful login
✅ IP-based tracking works with proxies/CDNs

### **Limitations:**
⚠️ **Shared IPs:** Multiple users behind same NAT may be blocked together
⚠️ **IP Spoofing:** Attackers can rotate IPs to bypass (mitigated by using CDN IPs)
⚠️ **Database Load:** Every auth attempt writes to database

### **Future Enhancements:**
- Add CAPTCHA after 3 failed attempts
- Email notification to link owner on repeated failures
- Whitelist trusted IPs
- Add exponential backoff (1min, 5min, 10min, 1hr)

---

## Monitoring

### **Check Rate Limit Status:**

```sql
-- View all rate-limited IPs
SELECT 
    ip_address,
    attempt_count,
    last_attempt_at,
    NOW() - last_attempt_at as time_since_last
FROM login_attempts
WHERE attempt_count >= 5
ORDER BY last_attempt_at DESC;
```

### **Most Blocked IPs:**
```sql
SELECT ip_address, attempt_count, last_attempt_at
FROM login_attempts
ORDER BY attempt_count DESC
LIMIT 10;
```

---

## Troubleshooting

### **Issue: Always getting 429**
**Solution:** Check if your IP is in `login_attempts` table. Delete record:
```sql
DELETE FROM login_attempts WHERE ip_address = 'YOUR_IP';
```

### **Issue: Rate limit not working**
**Solution:** 
1. Verify table exists: `SELECT * FROM login_attempts LIMIT 1;`
2. Check RLS policies allow service_role
3. Verify IP detection in logs

### **Issue: IP always shows as 'unknown'**
**Solution:** 
- In development: This is normal (localhost)
- In production: Check Vercel headers are being forwarded

---

**Rate limiting active! Your app is now protected against brute force attacks.** 🛡️
