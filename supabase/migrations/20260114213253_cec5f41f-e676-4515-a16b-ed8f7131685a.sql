-- Add grams_per_unit column to ingredients table
ALTER TABLE public.ingredients 
ADD COLUMN grams_per_unit numeric NOT NULL DEFAULT 0;