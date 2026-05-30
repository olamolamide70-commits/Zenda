-- ====================================================================
-- Zenda B2B E-Commerce & Merchant API Database Schema Upgrade Script
-- Deploy this script directly inside the Supabase SQL Editor.
-- ====================================================================

-- 1. Create B2B Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tin TEXT UNIQUE NOT NULL,                       -- Tax Identification Number
  cac_number TEXT UNIQUE NOT NULL,                -- Corporate Registration Number
  cac_url TEXT,                                   -- CAC Filing Document URL
  credit_limit NUMERIC DEFAULT 10000000.00,       -- 10 million Naira corporate line base limit
  outstanding_balance NUMERIC DEFAULT 0.00,
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add Organization Columns to Users Table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company_role TEXT CHECK (company_role IN ('company_admin', 'company_buyer'));

-- 3. Modify Orders Table to support B2B Purchase Orders (POs) and Approval Routing
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS approved_by_admin BOOLEAN DEFAULT true;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS po_number TEXT; -- Purchase Order Reference

-- 4. Create Merchant Webhooks Logs Table for API Audits
CREATE TABLE IF NOT EXISTS public.merchant_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  attempt_number INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable Row Level Security (RLS) on newly created tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_webhook_logs ENABLE ROW LEVEL SECURITY;

-- 6. Basic Policies
DROP POLICY IF EXISTS "Users can select their own organization details" ON public.organizations;
CREATE POLICY "Users can select their own organization details" 
  ON public.organizations 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE public.users.id = auth.uid() 
    AND public.users.organization_id = public.organizations.id
  ));

DROP POLICY IF EXISTS "Merchants can inspect their own webhook logs" ON public.merchant_webhook_logs;
CREATE POLICY "Merchants can inspect their own webhook logs" 
  ON public.merchant_webhook_logs 
  FOR SELECT 
  USING (auth.uid() = merchant_id);

-- 7. Add automated updated_at trigger for organizations
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON organizations 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

