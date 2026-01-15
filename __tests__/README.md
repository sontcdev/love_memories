# RLS Security Testing Guide

## Overview
This directory contains security tests to verify your Supabase Row Level Security (RLS) policies are properly configured and prevent unauthorized access.

## Test Files

### 1. SQL Tests (`supabase/tests/rls_security_test.sql`)
Run directly in Supabase SQL Editor for immediate verification.

**How to run:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the entire `rls_security_test.sql` file
4. Click "Run"
5. Check the output in the "Results" tab

**What it tests:**
- ✅ Guest cannot update/delete any data
- ✅ User B cannot access User A's data
- ✅ Owner can CRUD their own data
- ✅ Cross-table permission checks

**Expected output:**
```
NOTICE:  Test data created successfully
NOTICE:  === TEST 1: Guest Attack (Unauthenticated) ===
NOTICE:  ✓ Messages protected: Guest cannot update
NOTICE:  ✓ Games protected: Guest cannot update
NOTICE:  ✓ Gallery protected: Guest cannot delete
NOTICE:  TEST 1: PASSED - All guest attacks blocked

NOTICE:  === TEST 2: Cross-User Attack ===
NOTICE:  ✓ Cross-user protection: User B cannot update User A messages
NOTICE:  ✓ Cross-user protection: User B cannot delete User A games
NOTICE:  TEST 2: PASSED - All cross-user attacks blocked

NOTICE:  === TEST 3: Valid Owner Update ===
NOTICE:  ✓ Owner can update: 1 message(s) updated
NOTICE:  ✓ Update verified: Content matches
NOTICE:  ✓ Owner can insert: 1 game(s) inserted
NOTICE:  ✓ Owner can delete: 1 image(s) deleted
NOTICE:  TEST 3: PASSED - All owner operations succeeded
```

### 2. Jest Tests (`__tests__/rls.test.ts`)
Automated tests using `@supabase/supabase-js` in Node.js environment.

**Setup:**
```bash
cd __tests__
npm install
```

**Configure `.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Run tests:**
```bash
npm test
```

**What it tests:**
- Guest attack scenarios
- Cross-user attack scenarios  
- Valid owner operations
- SQL injection prevention
- Sensitive data exposure

**Expected output:**
```
PASS  rls.test.ts
  RLS Security Tests
    TEST 1: Guest Attack (Unauthenticated)
      ✓ should FAIL when guest tries to update messages
      ✓ should FAIL when guest tries to update games
      ✓ should FAIL when guest tries to delete gallery
    TEST 2: Cross-User Attack
      ✓ should FAIL when User B tries to update User A messages
      ✓ should FAIL when trying to access other user link settings
    TEST 3: Valid Owner Update
      ✓ should SUCCEED when owner updates via API route
      ✓ should verify RLS allows SELECT for public data
    Additional Security Checks
      ✓ should not expose sensitive data in public queries
      ✓ should prevent SQL injection in queries

Tests: 9 passed, 9 total
```

## Security Scenarios Tested

### Scenario 1: Unauthenticated Guest Attack
**Threat:** Anonymous user trying to modify data without authentication.

**Attack vectors:**
- Direct UPDATE to `messages` table
- Direct DELETE from `gallery` table
- Direct INSERT to `games` table

**Protection:** RLS policies require authentication for write operations.

### Scenario 2: Cross-User Attack
**Threat:** Authenticated User B trying to access User A's data.

**Attack vectors:**
- User B updates User A's messages
- User B deletes User A's gallery
- User B reads User A's link settings

**Protection:** RLS policies check `link_id` in JWT claims matches the row's `link_id`.

### Scenario 3: Valid Owner Operations
**Verification:** Legitimate owner can perform CRUD on their own data.

**Operations:**
- Owner updates their messages ✅
- Owner inserts new games ✅
- Owner deletes gallery images ✅

## Current RLS Implementation

Your RLS policies use JWT claims to verify ownership:

```sql
-- Example policy (from schema.sql)
CREATE POLICY "Users can update own messages"
ON messages FOR UPDATE
TO authenticated
USING (
  link_id::text = current_setting('request.jwt.claims', true)::json->>'link_id'
);
```

**How it works:**
1. Client authenticates (password/PIN)
2. Server generates JWT with `link_id` claim
3. Supabase checks JWT claim against row data
4. Allow/deny based on match

## Important Notes

### Current MVP Limitations
⚠️ The MVP uses **simple authentication** without full JWT implementation:
- Admin dashboard uses env variable password
- Owner PIN verified via API routes
- No persistent JWT tokens

### For Production
To fully leverage RLS with JWT:
1. Implement Supabase Auth
2. Generate proper JWT tokens
3. Include `link_id` in token claims
4. Use authenticated client in API routes

### Why Tests May Show "Permission Denied"
This is **EXPECTED** and **GOOD**! It means:
- ✅ RLS is working
- ✅ Unauthorized access is blocked
- ✅ Your data is protected

## Troubleshooting

### SQL Tests Fail with "Function not found"
**Issue:** `crypt_password` function not created  
**Fix:** Run `supabase/functions/crypt_password.sql`

### Jest Tests Fail with "Cannot find module"
**Issue:** Dependencies not installed  
**Fix:** `cd __tests__ && npm install`

### All writes fail (even for owner)
**Issue:** RLS policies too restrictive  
**Fix:** Verify policies allow `authenticated` role

### Reads fail for public data
**Issue:** No SELECT policy for `anon` role  
**Fix:** Add SELECT policy for public tables

## Next Steps

After verifying tests pass:

1. **Review Policies:** Check all tables have appropriate RLS
2. **Test Edge Cases:** Add more specific attack scenarios
3. **Audit Logs:** Implement logging for security events
4. **Rate Limiting:** Add to prevent brute force
5. **Production Setup:** Implement full Supabase Auth

---

**Status:** ✅ RLS security tests complete and ready to run!
