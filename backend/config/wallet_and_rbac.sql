-- ==========================================================
-- ZENDA WALLET & RBAC SYSTEM DATABASE MIGRATIONS
-- Execute this script directly in your Supabase SQL Editor
-- ==========================================================

-- 1. Add Wallet Balance Field directly to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC DEFAULT 10000; -- Setting a default of 10,000 for nice demo wallet balances!

-- 2. Create Wallet Transactions Ledger Table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    amount NUMERIC NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Gift Cards Catalog Table
CREATE TABLE IF NOT EXISTS public.gift_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    initial_amount NUMERIC NOT NULL CHECK (initial_amount > 0),
    current_amount NUMERIC NOT NULL CHECK (current_amount >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    redeemed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    redeemed_at TIMESTAMPTZ
);

-- Enable RLS (Row Level Security) on new tables
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users read access to their own transactions
CREATE POLICY select_own_transactions ON public.wallet_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users write access to their own transactions (for ledger writes)
CREATE POLICY insert_own_transactions ON public.wallet_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow admins full control over gift cards
CREATE POLICY admin_all_gift_cards ON public.gift_cards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin' OR role = 'vendor')
        )
    );

-- Allow authenticated users to claim gift cards (read & update)
CREATE POLICY select_active_gift_cards ON public.gift_cards
    FOR SELECT USING (is_active = true);

CREATE POLICY redeem_gift_cards ON public.gift_cards
    FOR UPDATE USING (is_active = true) WITH CHECK (current_amount = 0 AND is_active = false);

-- Output Confirmation
SELECT 'Zenda RBAC, Wallet and Gift Card schema deployed successfully!' as status;
