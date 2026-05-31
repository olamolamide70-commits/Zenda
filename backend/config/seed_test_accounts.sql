-- seed_test_accounts.sql
-- Run this in your Supabase SQL Editor to instantly create the requested test accounts.
-- Common password for all seeded accounts: Password123@

-- Enable extension pgcrypto in case it is not active
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  -- Hashed password for 'Password123@' (using Supabase Auth default blowfish scheme)
  pass_hash TEXT := '$2a$10$W/hJ23aZtWbI3Zq8m7kL/Oa5c9Yj3wzH3lW9eT5cT.O1/6P2k3vG.';
  
  -- UUIDs for our test users
  super_id UUID := '00000000-0000-0000-0000-000000000001';
  
  admin1_id UUID := '00000000-0000-0000-0000-000000000002';
  admin2_id UUID := '00000000-0000-0000-0000-000000000003';
  admin3_id UUID := '00000000-0000-0000-0000-000000000004';
  
  care1_id UUID := '00000000-0000-0000-0000-000000000005';
  care2_id UUID := '00000000-0000-0000-0000-000000000006';
  care3_id UUID := '00000000-0000-0000-0000-000000000007';
  care4_id UUID := '00000000-0000-0000-0000-000000000008';
  care5_id UUID := '00000000-0000-0000-0000-000000000009';
BEGIN

  -- =========================================================================
  -- 1. SUPER_ADMIN ACCOUNT (1)
  -- =========================================================================
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'makindeolasubomi5@gmail.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (super_id, 'makindeolasubomi5@gmail.com', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Olasubomi Makinde"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (super_id, 'Olasubomi Makinde', 'makindeolasubomi5@gmail.com', 'super_admin', TRUE);
  END IF;

  -- =========================================================================
  -- 2. ADMIN ACCOUNTS (3)
  -- =========================================================================
  -- Admin 1: Tunde Afolayan
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'tunde.admin@gadgetflex.com.ng') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (admin1_id, 'tunde.admin@gadgetflex.com.ng', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Tunde Afolayan"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (admin1_id, 'Tunde Afolayan', 'tunde.admin@gadgetflex.com.ng', 'admin', TRUE);
  END IF;

  -- Admin 2: John Olamide
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'john.admin@zenda.co') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (admin2_id, 'john.admin@zenda.co', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"John Olamide"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (admin2_id, 'John Olamide', 'john.admin@zenda.co', 'admin', TRUE);
  END IF;

  -- Admin 3: Grace Bello
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'grace.admin@zenda.co') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (admin3_id, 'grace.admin@zenda.co', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Grace Bello"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (admin3_id, 'Grace Bello', 'grace.admin@zenda.co', 'admin', TRUE);
  END IF;

  -- =========================================================================
  -- 3. CUSTOMER_CARE ACCOUNTS (5)
  -- =========================================================================
  -- CS 1: Sarah Ifeanyi
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'sarah.cs@gadgetflex.com.ng') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (care1_id, 'sarah.cs@gadgetflex.com.ng', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Sarah Ifeanyi"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (care1_id, 'Sarah Ifeanyi', 'sarah.cs@gadgetflex.com.ng', 'customer_care', TRUE);
  END IF;

  -- CS 2: Ahmed Lawal
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ahmed.cs@gadgetflex.com.ng') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (care2_id, 'ahmed.cs@gadgetflex.com.ng', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Ahmed Lawal"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (care2_id, 'Ahmed Lawal', 'ahmed.cs@gadgetflex.com.ng', 'customer_care', TRUE);
  END IF;

  -- CS 3: Uche Okafor
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'uche.cs@gadgetflex.com.ng') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (care3_id, 'uche.cs@gadgetflex.com.ng', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Uche Okafor"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (care3_id, 'Uche Okafor', 'uche.cs@gadgetflex.com.ng', 'customer_care', TRUE);
  END IF;

  -- CS 4: Tosin Balogun
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'tosin.cs@gadgetflex.com.ng') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (care4_id, 'tosin.cs@gadgetflex.com.ng', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Tosin Balogun"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (care4_id, 'Tosin Balogun', 'tosin.cs@gadgetflex.com.ng', 'customer_care', TRUE);
  END IF;

  -- CS 5: Miracle Ebube
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'miracle.cs@gadgetflex.com.ng') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (care5_id, 'miracle.cs@gadgetflex.com.ng', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Miracle Ebube"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (care5_id, 'Miracle Ebube', 'miracle.cs@gadgetflex.com.ng', 'customer_care', TRUE);
  END IF;

END $$;
