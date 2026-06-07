-- ============================================================
-- Zenda Platform: New Tables Schema Update
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Product Reviews Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating      int  NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- One review per user per product
CREATE UNIQUE INDEX IF NOT EXISTS product_reviews_user_product_uix
  ON public.product_reviews (product_id, user_id);

-- Index for fast lookup by product
CREATE INDEX IF NOT EXISTS product_reviews_product_id_idx
  ON public.product_reviews (product_id);

-- RLS: Anyone can read reviews
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product reviews"
  ON public.product_reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can submit reviews"
  ON public.product_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.product_reviews FOR UPDATE
  USING (auth.uid() = user_id);


-- 2. Avatar URL column on users table
-- (in case your users table doesn't have this yet)
-- ============================================================
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS avatar_url text;


-- 3. Wishlist Table
-- (in case you're storing wishlists server-side)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wishlists (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS wishlists_user_product_uix
  ON public.wishlists (user_id, product_id);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist"
  ON public.wishlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to wishlist"
  ON public.wishlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from wishlist"
  ON public.wishlists FOR DELETE
  USING (auth.uid() = user_id);


-- 4. Cart Table
-- (persistent cart stored server-side)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.carts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity    int  NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS carts_user_product_uix
  ON public.carts (user_id, product_id);

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cart"
  ON public.carts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their cart"
  ON public.carts FOR ALL
  USING (auth.uid() = user_id);


-- Done! ✅
-- ============================================================
