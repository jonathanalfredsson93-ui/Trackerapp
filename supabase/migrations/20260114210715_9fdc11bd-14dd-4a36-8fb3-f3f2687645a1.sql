-- 1. Update ingredients table to support both per_100g AND per_unit values
-- Add new columns for dual measurement support
ALTER TABLE public.ingredients 
ADD COLUMN protein_per_100g numeric NOT NULL DEFAULT 0,
ADD COLUMN kcal_per_100g numeric NOT NULL DEFAULT 0,
ADD COLUMN protein_per_unit numeric NOT NULL DEFAULT 0,
ADD COLUMN kcal_per_unit numeric NOT NULL DEFAULT 0;

-- Migrate existing data based on current unit_type
UPDATE public.ingredients 
SET protein_per_100g = protein, kcal_per_100g = kcal
WHERE unit_type = 'per_100g';

UPDATE public.ingredients 
SET protein_per_unit = protein, kcal_per_unit = kcal
WHERE unit_type = 'per_unit';

-- Drop old columns (keeping unit_type as default preference)
ALTER TABLE public.ingredients DROP COLUMN protein;
ALTER TABLE public.ingredients DROP COLUMN kcal;

-- Rename unit_type to default_unit for clarity
ALTER TABLE public.ingredients RENAME COLUMN unit_type TO default_unit;

-- 2. Create recurring_meals table for standard weekly meals
CREATE TABLE public.recurring_meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 1=Monday, etc.
  meal_type TEXT NOT NULL,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  servings INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recurring_meals ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for public access
CREATE POLICY "Anyone can read recurring_meals" ON public.recurring_meals FOR SELECT USING (true);
CREATE POLICY "Anyone can insert recurring_meals" ON public.recurring_meals FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update recurring_meals" ON public.recurring_meals FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete recurring_meals" ON public.recurring_meals FOR DELETE USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_recurring_meals_updated_at
BEFORE UPDATE ON public.recurring_meals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Update recipe_ingredients to track which unit was used
ALTER TABLE public.recipe_ingredients 
ADD COLUMN unit_used TEXT NOT NULL DEFAULT 'per_100g';