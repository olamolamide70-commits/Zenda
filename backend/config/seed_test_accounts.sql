-- seed_test_accounts.sql
-- Run this in your Supabase SQL Editor to instantly create the requested test accounts.
-- Common password for all seeded accounts: Password123@

-- Enable extension pgcrypto/uuid-ossp in case they are not active
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- CLEANUP STEP: Delete existing test profiles to prevent email key collisions
-- =========================================================================
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

DO $$
DECLARE
  -- Hashed password for 'Password123@' (using Supabase Auth default blowfish scheme)
  pass_hash TEXT := '$2a$10$W/hJ23aZtWbI3Zq8m7kL/Oa5c9Yj3wzH3lW9eT5cT.O1/6P2k3vG.';
  
  -- Local variable to generate unique IDs dynamically and avoid key collisions
  temp_id UUID;
BEGIN

  -- =========================================================================
  -- 1. SUPER_ADMIN ACCOUNTS (2)
  -- =========================================================================
  -- Super Admin 1: Olasubomi Makinde
  temp_id := gen_random_uuid();
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
  VALUES (temp_id, 'makindeolasubomi5@gmail.com', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Olasubomi Makinde"}', now(), now(), 'authenticated', 'authenticated');

  INSERT INTO public.users (id, name, email, role, is_verified)
  VALUES (temp_id, 'Olasubomi Makinde', 'makindeolasubomi5@gmail.com', 'super_admin', TRUE);

  -- Super Admin 2: Olamide Admin
  temp_id := gen_random_uuid();
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
  VALUES (temp_id, 'olamide@gmail.com', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Olamide Admin"}', now(), now(), 'authenticated', 'authenticated');

  INSERT INTO public.users (id, name, email, role, is_verified)
  VALUES (temp_id, 'Olamide Admin', 'olamide@gmail.com', 'super_admin', TRUE);

  -- =========================================================================
  -- 2. ADMIN ACCOUNTS (3)
  -- =========================================================================
  -- Admin 1: Tunde Afolayan
  temp_id := gen_random_uuid();
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
  VALUES (temp_id, 'tunde.admin@gadgetflex.com.ng', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Tunde Afolayan"}', now(), now(), 'authenticated', 'authenticated');

  INSERT INTO public.users (id, name, email, role, is_verified)
  VALUES (temp_id, 'Tunde Afolayan', 'tunde.admin@gadgetflex.com.ng', 'admin', TRUE);

  -- Admin 2: John Olamide
  temp_id := gen_random_uuid();
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
  VALUES (temp_id, 'john.admin@zenda.co', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"John Olamide"}', now(), now(), 'authenticated', 'authenticated');

  INSERT INTO public.users (id, name, email, role, is_verified)
  VALUES (temp_id, 'John Olamide', 'john.admin@zenda.co', 'admin', TRUE);

  -- Admin 3: Grace Bello
  temp_id := gen_random_uuid();
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
  VALUES (temp_id, 'grace.admin@zenda.co', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Grace Bello"}', now(), now(), 'authenticated', 'authenticated');

  INSERT INTO public.users (id, name, email, role, is_verified)
  VALUES (temp_id, 'Grace Bello', 'grace.admin@zenda.co', 'admin', TRUE);

  -- =========================================================================
  -- 3. CUSTOMER_CARE ACCOUNTS (5)
  -- =========================================================================
  -- CS 1: Sarah Ifeanyi
  temp_id := gen_random_uuid();
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
  VALUES (temp_id, 'sarah.cs@gadgetflex.com.ng', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Sarah Ifeanyi"}', now(), now(), 'authenticated', 'authenticated');

  INSERT INTO public.users (id, name, email, role, is_verified)
  VALUES (temp_id, 'Sarah Ifeanyi', 'sarah.cs@gadgetflex.com.ng', 'customer_care', TRUE);

  -- CS 2: Ahmed Lawal
  temp_id := gen_random_uuid();
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
  VALUES (temp_id, 'ahmed.cs@gadgetflex.com.ng', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Ahmed Lawal"}', now(), now(), 'authenticated', 'authenticated');

  INSERT INTO public.users (id, name, email, role, is_verified)
  VALUES (temp_id, 'Ahmed Lawal', 'ahmed.cs@gadgetflex.com.ng', 'customer_care', TRUE);

  -- CS 3: Uche Okafor
  temp_id := gen_random_uuid();
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
  VALUES (temp_id, 'uche.cs@gadgetflex.com.ng', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Uche Okafor"}', now(), now(), 'authenticated', 'authenticated');

  INSERT INTO public.users (id, name, email, role, is_verified)
  VALUES (temp_id, 'Uche Okafor', 'uche.cs@gadgetflex.com.ng', 'customer_care', TRUE);

  -- CS 4: Tosin Balogun
  temp_id := gen_random_uuid();
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
  VALUES (temp_id, 'tosin.cs@gadgetflex.com.ng', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Tosin Balogun"}', now(), now(), 'authenticated', 'authenticated');

  INSERT INTO public.users (id, name, email, role, is_verified)
  VALUES (temp_id, 'Tosin Balogun', 'tosin.cs@gadgetflex.com.ng', 'customer_care', TRUE);

  -- CS 5: Miracle Ebube
  temp_id := gen_random_uuid();
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
  VALUES (temp_id, 'miracle.cs@gadgetflex.com.ng', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Miracle Ebube"}', now(), now(), 'authenticated', 'authenticated');

  INSERT INTO public.users (id, name, email, role, is_verified)
  VALUES (temp_id, 'Miracle Ebube', 'miracle.cs@gadgetflex.com.ng', 'customer_care', TRUE);

END $$;
