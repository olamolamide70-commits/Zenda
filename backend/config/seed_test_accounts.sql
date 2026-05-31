-- seed_test_accounts.sql
-- Run this in your Supabase SQL Editor to instantly create the requested test accounts.
-- Common password for all seeded accounts: Password123@

-- Enable extension pgcrypto/uuid-ossp in case they are not active
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
DECLARE
  -- Hashed password for 'Password123@' (using Supabase Auth default blowfish scheme)
  pass_hash TEXT := '$2a$10$W/hJ23aZtWbI3Zq8m7kL/Oa5c9Yj3wzH3lW9eT5cT.O1/6P2k3vG.';
  
  -- Local variable to generate unique IDs and avoid key collisions
  temp_id UUID;
BEGIN

  -- =========================================================================
  -- 1. SUPER_ADMIN ACCOUNTS (2)
  -- =========================================================================
  -- Super Admin 1: Olasubomi Makinde
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'makindeolasubomi5@gmail.com') THEN
    temp_id := gen_random_uuid();
    
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (temp_id, 'makindeolasubomi5@gmail.com', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Olasubomi Makinde"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (temp_id, 'Olasubomi Makinde', 'makindeolasubomi5@gmail.com', 'super_admin', TRUE);
  END IF;

  -- Super Admin 2: Olamide Admin
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'olamide@gmail.com') THEN
    temp_id := gen_random_uuid();

    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (temp_id, 'olamide@gmail.com', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Olamide Admin"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (temp_id, 'Olamide Admin', 'olamide@gmail.com', 'super_admin', TRUE);
  END IF;

  -- =========================================================================
  -- 2. ADMIN ACCOUNTS (3)
  -- =========================================================================
  -- Admin 1: Tunde Afolayan
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'tunde.admin@gadgetflex.com.ng') THEN
    temp_id := gen_random_uuid();

    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (temp_id, 'tunde.admin@gadgetflex.com.ng', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Tunde Afolayan"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (temp_id, 'Tunde Afolayan', 'tunde.admin@gadgetflex.com.ng', 'admin', TRUE);
  END IF;

  -- Admin 2: John Olamide
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'john.admin@zenda.co') THEN
    temp_id := gen_random_uuid();

    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (temp_id, 'john.admin@zenda.co', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"John Olamide"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (temp_id, 'John Olamide', 'john.admin@zenda.co', 'admin', TRUE);
  END IF;

  -- Admin 3: Grace Bello
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'grace.admin@zenda.co') THEN
    temp_id := gen_random_uuid();

    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (temp_id, 'grace.admin@zenda.co', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Grace Bello"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (temp_id, 'Grace Bello', 'grace.admin@zenda.co', 'admin', TRUE);
  END IF;

  -- =========================================================================
  -- 3. CUSTOMER_CARE ACCOUNTS (5)
  -- =========================================================================
  -- CS 1: Sarah Ifeanyi
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'sarah.cs@gadgetflex.com.ng') THEN
    temp_id := gen_random_uuid();

    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (temp_id, 'sarah.cs@gadgetflex.com.ng', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Sarah Ifeanyi"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (temp_id, 'Sarah Ifeanyi', 'sarah.cs@gadgetflex.com.ng', 'customer_care', TRUE);
  END IF;

  -- CS 2: Ahmed Lawal
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ahmed.cs@gadgetflex.com.ng') THEN
    temp_id := gen_random_uuid();

    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (temp_id, 'ahmed.cs@gadgetflex.com.ng', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Ahmed Lawal"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (temp_id, 'Ahmed Lawal', 'ahmed.cs@gadgetflex.com.ng', 'customer_care', TRUE);
  END IF;

  -- CS 3: Uche Okafor
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'uche.cs@gadgetflex.com.ng') THEN
    temp_id := gen_random_uuid();

    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (temp_id, 'uche.cs@gadgetflex.com.ng', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Uche Okafor"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (temp_id, 'Uche Okafor', 'uche.cs@gadgetflex.com.ng', 'customer_care', TRUE);
  END IF;

  -- CS 4: Tosin Balogun
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'tosin.cs@gadgetflex.com.ng') THEN
    temp_id := gen_random_uuid();

    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (temp_id, 'tosin.cs@gadgetflex.com.ng', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Tosin Balogun"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (temp_id, 'Tosin Balogun', 'tosin.cs@gadgetflex.com.ng', 'customer_care', TRUE);
  END IF;

  -- CS 5: Miracle Ebube
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'miracle.cs@gadgetflex.com.ng') THEN
    temp_id := gen_random_uuid();

    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (temp_id, 'miracle.cs@gadgetflex.com.ng', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Miracle Ebube"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (temp_id, 'Miracle Ebube', 'miracle.cs@gadgetflex.com.ng', 'customer_care', TRUE);
  END IF;

END $$;
