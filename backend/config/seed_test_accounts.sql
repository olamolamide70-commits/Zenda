-- seed_test_accounts.sql
-- Run this in your Supabase SQL Editor to instantly create test accounts with the password: Password123@

-- Enable extension pgcrypto in case it is not active
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Declare variables and insert into auth.users and public.users

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
  -- SUPER_ADMIN ACCOUNTS
  -- =========================================================================
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'master.super@zenda.co') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (super_id, 'master.super@zenda.co', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Zenda Master"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (super_id, 'Zenda Master', 'master.super@zenda.co', 'super_admin', TRUE);
  END IF;

  -- =========================================================================
  -- ADMIN ACCOUNTS (3)
  -- =========================================================================
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'john.admin@zenda.co') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (admin1_id, 'john.admin@zenda.co', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"John Olamide"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (admin1_id, 'John Olamide', 'john.admin@zenda.co', 'admin', TRUE);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'grace.admin@zenda.co') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (admin2_id, 'grace.admin@zenda.co', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Grace Bello"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (admin2_id, 'Grace Bello', 'grace.admin@zenda.co', 'admin', TRUE);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'efe.admin@zenda.co') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (admin3_id, 'efe.admin@zenda.co', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Efe Chidi"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (admin3_id, 'Efe Chidi', 'efe.admin@zenda.co', 'admin', TRUE);
  END IF;

  -- =========================================================================
  -- CUSTOMER_CARE ACCOUNTS (5)
  -- =========================================================================
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'tunde.care@zenda.co') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (care1_id, 'tunde.care@zenda.co', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Tunde Samuel"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (care1_id, 'Tunde Samuel', 'tunde.care@zenda.co', 'customer_care', TRUE);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'amina.care@zenda.co') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (care2_id, 'amina.care@zenda.co', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Amina Ibrahim"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (care2_id, 'Amina Ibrahim', 'amina.care@zenda.co', 'customer_care', TRUE);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'nneka.care@zenda.co') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (care3_id, 'nneka.care@zenda.co', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Nneka Paul"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (care3_id, 'Nneka Paul', 'nneka.care@zenda.co', 'customer_care', TRUE);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'chioma.care@zenda.co') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (care4_id, 'chioma.care@zenda.co', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Chioma Eze"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (care4_id, 'Chioma Eze', 'chioma.care@zenda.co', 'customer_care', TRUE);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'segun.care@zenda.co') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
    VALUES (care5_id, 'segun.care@zenda.co', pass_hash, now(), '{"provider":"email","providers":["email"]}', '{"name":"Segun Ade"}', now(), now(), 'authenticated', 'authenticated');

    INSERT INTO public.users (id, name, email, role, is_verified)
    VALUES (care5_id, 'Segun Ade', 'segun.care@zenda.co', 'customer_care', TRUE);
  END IF;

END $$;
