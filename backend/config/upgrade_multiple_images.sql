-- upgrade_multiple_images.sql
-- Add support for up to 10 product pictures

-- 1. Add images array column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- 2. Backfill existing single image_url to the new images array
UPDATE public.products 
SET images = ARRAY[image_url] 
WHERE image_url IS NOT NULL 
  AND (images IS NULL OR array_length(images, 1) IS NULL);
