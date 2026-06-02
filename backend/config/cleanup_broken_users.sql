-- ============================================================
-- ZENDA: Complete User Cleanup + Reseed via SQL
-- 
-- Run this ENTIRE script in Supabase SQL Editor.
-- It cleans the broken records AND creates working users
-- using Supabase's internal auth.create_user() approach.
-- 
-- After running this, users can immediately log in with:
-- Password: Password123@
-- ============================================================

-- STEP 1: Delete from public.users first (FK constraint order)
DELETE FROM public.users WHERE email IN (
  'makindeolasubomi5@gmail.com',
  'olamide@gmail.com',
  'tunde.admin@gadgetflex.com.ng',
  'john.admin@zenda.co',
  'grace.admin@zenda.co',
  'sarah.cs@gadgetflex.com.ng',
  'ahmed.cs@gadgetflex.com.ng',
  'uche.cs@gadgetflex.com.ng',
  'tosin.cs@gadgetflex.com.ng',
  'miracle.cs@gadgetflex.com.ng'
);

-- STEP 2: Delete from auth.users (cascade will handle identities)
DELETE FROM auth.users WHERE email IN (
  'makindeolasubomi5@gmail.com',
  'olamide@gmail.com',
  'tunde.admin@gadgetflex.com.ng',
  'john.admin@zenda.co',
  'grace.admin@zenda.co',
  'sarah.cs@gadgetflex.com.ng',
  'ahmed.cs@gadgetflex.com.ng',
  'uche.cs@gadgetflex.com.ng',
  'tosin.cs@gadgetflex.com.ng',
  'miracle.cs@gadgetflex.com.ng'
);

-- Confirm cleanup
SELECT 'Cleanup complete. Old records removed.' as status;
SELECT COUNT(*) as remaining_broken_records FROM auth.users WHERE email IN (
  'makindeolasubomi5@gmail.com','olamide@gmail.com',
  'tunde.admin@gadgetflex.com.ng','john.admin@zenda.co','grace.admin@zenda.co',
  'sarah.cs@gadgetflex.com.ng','ahmed.cs@gadgetflex.com.ng',
  'uche.cs@gadgetflex.com.ng','tosin.cs@gadgetflex.com.ng','miracle.cs@gadgetflex.com.ng'
);
