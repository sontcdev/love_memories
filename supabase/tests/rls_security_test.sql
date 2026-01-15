-- =====================================================
-- Supabase RLS Policy Security Tests
-- =====================================================
-- Run these tests in Supabase SQL Editor to verify
-- Row Level Security policies are working correctly
-- =====================================================

-- Setup: Create test data
DO $$
DECLARE
  link_a_id UUID;
  link_b_id UUID;
  test_pin_hash TEXT;
BEGIN
  -- Clean up any existing test data
  DELETE FROM games WHERE link_id IN (
    SELECT id FROM links WHERE username IN ('test-user-a', 'test-user-b')
  );
  DELETE FROM messages WHERE link_id IN (
    SELECT id FROM links WHERE username IN ('test-user-a', 'test-user-b')
  );
  DELETE FROM gallery WHERE link_id IN (
    SELECT id FROM links WHERE username IN ('test-user-a', 'test-user-b')
  );
  DELETE FROM links WHERE username IN ('test-user-a', 'test-user-b');

  -- Create test PIN hash (PIN: 123456)
  test_pin_hash := crypt('123456', gen_salt('bf'));

  -- Create User A's link
  INSERT INTO links (username, template_type, owner_pin_hash, settings)
  VALUES ('test-user-a', 'love', test_pin_hash, '{"names": ["Alice", "Bob"]}'::jsonb)
  RETURNING id INTO link_a_id;

  -- Create User B's link  
  INSERT INTO links (username, template_type, owner_pin_hash, settings)
  VALUES ('test-user-b', 'love', test_pin_hash, '{"names": ["Charlie", "Diana"]}'::jsonb)
  RETURNING id INTO link_b_id;

  -- Add some test data to User A's link
  INSERT INTO messages (link_id, title, content, open_at)
  VALUES (link_a_id, 'Test Message A', 'This belongs to User A', NOW() + INTERVAL '1 day');

  INSERT INTO games (link_id, question, answer)
  VALUES (link_a_id, 'User A Question', 'User A Answer');

  INSERT INTO gallery (link_id, image_url, sort_order)
  VALUES (link_a_id, 'https://example.com/image-a.jpg', 0);

  RAISE NOTICE 'Test data created successfully';
  RAISE NOTICE 'Link A ID: %', link_a_id;
  RAISE NOTICE 'Link B ID: %', link_b_id;
END $$;

-- =====================================================
-- TEST 1: Guest Attack - Unauthenticated Update
-- =====================================================
-- Expected: FAIL (RLS should block)
-- =====================================================

DO $$
DECLARE
  test_link_id UUID;
  update_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST 1: Guest Attack (Unauthenticated) ===';
  
  -- Get test link ID
  SELECT id INTO test_link_id FROM links WHERE username = 'test-user-a';
  
  -- Reset role to anon (unauthenticated)
  SET ROLE anon;
  SET request.jwt.claims TO '{}';
  
  -- Attempt 1: Try to update messages
  BEGIN
    UPDATE messages 
    SET content = 'HACKED BY GUEST' 
    WHERE link_id = test_link_id;
    
    GET DIAGNOSTICS update_count = ROW_COUNT;
    
    IF update_count > 0 THEN
      RAISE EXCEPTION 'SECURITY BREACH: Guest was able to update messages!';
    ELSE
      RAISE NOTICE '✓ Messages protected: Guest cannot update';
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE '✓ Messages protected: Insufficient privilege error';
  END;
  
  -- Attempt 2: Try to update games
  BEGIN
    UPDATE games 
    SET answer = 'HACKED' 
    WHERE link_id = test_link_id;
    
    GET DIAGNOSTICS update_count = ROW_COUNT;
    
    IF update_count > 0 THEN
      RAISE EXCEPTION 'SECURITY BREACH: Guest was able to update games!';
    ELSE
      RAISE NOTICE '✓ Games protected: Guest cannot update';
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE '✓ Games protected: Insufficient privilege error';
  END;
  
  -- Attempt 3: Try to delete from gallery
  BEGIN
    DELETE FROM gallery WHERE link_id = test_link_id;
    
    GET DIAGNOSTICS update_count = ROW_COUNT;
    
    IF update_count > 0 THEN
      RAISE EXCEPTION 'SECURITY BREACH: Guest was able to delete gallery!';
    ELSE
      RAISE NOTICE '✓ Gallery protected: Guest cannot delete';
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE '✓ Gallery protected: Insufficient privilege error';
  END;
  
  -- Reset role
  RESET ROLE;
  RESET request.jwt.claims;
  
  RAISE NOTICE 'TEST 1: PASSED - All guest attacks blocked';
END $$;

-- =====================================================
-- TEST 2: Cross-User Attack
-- =====================================================
-- Expected: FAIL (User B should not access User A data)
-- =====================================================

DO $$
DECLARE
  link_a_id UUID;
  link_b_id UUID;
  user_b_jwt JSON;
  update_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST 2: Cross-User Attack ===';
  
  -- Get link IDs
  SELECT id INTO link_a_id FROM links WHERE username = 'test-user-a';
  SELECT id INTO link_b_id FROM links WHERE username = 'test-user-b';
  
  -- Simulate User B authenticated (with valid link_id claim)
  user_b_jwt := json_build_object(
    'link_id', link_b_id::text,
    'role', 'owner'
  );
  
  SET ROLE authenticated;
  PERFORM set_config('request.jwt.claims', user_b_jwt::text, true);
  
  -- Attempt 1: User B tries to update User A's messages
  BEGIN
    UPDATE messages 
    SET content = 'HACKED BY USER B' 
    WHERE link_id = link_a_id;
    
    GET DIAGNOSTICS update_count = ROW_COUNT;
    
    IF update_count > 0 THEN
      RAISE EXCEPTION 'SECURITY BREACH: User B updated User A messages!';
    ELSE
      RAISE NOTICE '✓ Cross-user protection: User B cannot update User A messages';
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE '✓ Cross-user protection: Insufficient privilege';
  END;
  
  -- Attempt 2: User B tries to delete User A's games
  BEGIN
    DELETE FROM games WHERE link_id = link_a_id;
    
    GET DIAGNOSTICS update_count = ROW_COUNT;
    
    IF update_count > 0 THEN
      RAISE EXCEPTION 'SECURITY BREACH: User B deleted User A games!';
    ELSE
      RAISE NOTICE '✓ Cross-user protection: User B cannot delete User A games';
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE '✓ Cross-user protection: Insufficient privilege';
  END;
  
  -- Attempt 3: User B tries to read User A's link settings
  DECLARE
    leaked_data RECORD;
  BEGIN
    SELECT * INTO leaked_data FROM links WHERE id = link_a_id;
    
    IF FOUND THEN
      RAISE EXCEPTION 'SECURITY BREACH: User B can read User A link data!';
    ELSE
      RAISE NOTICE '✓ Cross-user protection: User B cannot read User A link';
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE '✓ Cross-user protection: Insufficient privilege';
  END;
  
  -- Reset role
  RESET ROLE;
  RESET request.jwt.claims;
  
  RAISE NOTICE 'TEST 2: PASSED - All cross-user attacks blocked';
END $$;

-- =====================================================
-- TEST 3: Valid Owner Update
-- =====================================================
-- Expected: SUCCEED (Owner should update their own data)
-- =====================================================

DO $$
DECLARE
  link_a_id UUID;
  owner_jwt JSON;
  update_count INTEGER;
  test_content TEXT;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST 3: Valid Owner Update ===';
  
  -- Get link ID
  SELECT id INTO link_a_id FROM links WHERE username = 'test-user-a';
  
  -- Simulate User A authenticated as owner
  owner_jwt := json_build_object(
    'link_id', link_a_id::text,
    'role', 'owner'
  );
  
  SET ROLE authenticated;
  PERFORM set_config('request.jwt.claims', owner_jwt::text, true);
  
  -- Attempt 1: Owner updates their own message
  UPDATE messages 
  SET content = 'Updated by legitimate owner' 
  WHERE link_id = link_a_id;
  
  GET DIAGNOSTICS update_count = ROW_COUNT;
  
  IF update_count > 0 THEN
    RAISE NOTICE '✓ Owner can update: % message(s) updated', update_count;
  ELSE
    RAISE EXCEPTION 'FAILURE: Owner cannot update their own messages!';
  END IF;
  
  -- Verify update
  SELECT content INTO test_content FROM messages WHERE link_id = link_a_id LIMIT 1;
  IF test_content = 'Updated by legitimate owner' THEN
    RAISE NOTICE '✓ Update verified: Content matches';
  ELSE
    RAISE EXCEPTION 'FAILURE: Content not updated correctly';
  END IF;
  
  -- Attempt 2: Owner inserts new game
  INSERT INTO games (link_id, question, answer)
  VALUES (link_a_id, 'New Question', 'New Answer');
  
  GET DIAGNOSTICS update_count = ROW_COUNT;
  
  IF update_count > 0 THEN
    RAISE NOTICE '✓ Owner can insert: % game(s) inserted', update_count;
  ELSE
    RAISE EXCEPTION 'FAILURE: Owner cannot insert games!';
  END IF;
  
  -- Attempt 3: Owner deletes gallery image
  DELETE FROM gallery WHERE link_id = link_a_id;
  
  GET DIAGNOSTICS update_count = ROW_COUNT;
  
  IF update_count > 0 THEN
    RAISE NOTICE '✓ Owner can delete: % image(s) deleted', update_count;
  ELSE
    RAISE EXCEPTION 'FAILURE: Owner cannot delete gallery!';
  END IF;
  
  -- Reset role
  RESET ROLE;
  RESET request.jwt.claims;
  
  RAISE NOTICE 'TEST 3: PASSED - All owner operations succeeded';
END $$;

-- =====================================================
-- Cleanup Test Data
-- =====================================================
DO $$
BEGIN
  DELETE FROM games WHERE link_id IN (
    SELECT id FROM links WHERE username IN ('test-user-a', 'test-user-b')
  );
  DELETE FROM messages WHERE link_id IN (
    SELECT id FROM links WHERE username IN ('test-user-a', 'test-user-b')
  );
  DELETE FROM gallery WHERE link_id IN (
    SELECT id FROM links WHERE username IN ('test-user-a', 'test-user-b')
  );
  DELETE FROM links WHERE username IN ('test-user-a', 'test-user-b');
  
  RAISE NOTICE '';
  RAISE NOTICE '=== Test cleanup completed ===';
END $$;

-- =====================================================
-- Summary
-- =====================================================
-- If all tests passed, your RLS policies are secure!
-- =====================================================
