-- 1. Create food_categories table
CREATE TABLE public.food_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.food_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for food_categories
CREATE POLICY "Anyone can read food_categories" ON public.food_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can insert food_categories" ON public.food_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update food_categories" ON public.food_categories FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete non-default categories" ON public.food_categories FOR DELETE USING (is_default = false);

-- Insert default categories
INSERT INTO public.food_categories (name, is_default) VALUES
  ('Meat', true),
  ('Vegetables', true),
  ('Fruits', true),
  ('Dairy & Egg', true),
  ('Fats & Oils', true),
  ('Nuts & Seeds', true);

-- 2. Add category_id to ingredients table
ALTER TABLE public.ingredients ADD COLUMN category_id UUID REFERENCES public.food_categories(id) ON DELETE SET NULL;

-- 3. Create quick_foods table (simple foods with just nutrition info)
CREATE TABLE public.quick_foods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  kcal NUMERIC NOT NULL DEFAULT 0,
  protein NUMERIC NOT NULL DEFAULT 0,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quick_foods ENABLE ROW LEVEL SECURITY;

-- RLS policies for quick_foods
CREATE POLICY "Anyone can read quick_foods" ON public.quick_foods FOR SELECT USING (true);
CREATE POLICY "Anyone can insert quick_foods" ON public.quick_foods FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update quick_foods" ON public.quick_foods FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete quick_foods" ON public.quick_foods FOR DELETE USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_quick_foods_updated_at
  BEFORE UPDATE ON public.quick_foods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Add quick_food_id to meal_plans (alternative to recipe_id)
ALTER TABLE public.meal_plans 
  ALTER COLUMN recipe_id DROP NOT NULL,
  ADD COLUMN quick_food_id UUID REFERENCES public.quick_foods(id) ON DELETE CASCADE,
  ADD COLUMN custom_kcal NUMERIC,
  ADD COLUMN custom_protein NUMERIC;

-- Add constraint: either recipe_id or quick_food_id must be set, or custom values
ALTER TABLE public.meal_plans ADD CONSTRAINT meal_plan_food_source_check 
  CHECK (recipe_id IS NOT NULL OR quick_food_id IS NOT NULL OR (custom_kcal IS NOT NULL AND custom_protein IS NOT NULL));

-- 5. Create progress_photos table (linked to weight_logs)
CREATE TABLE public.progress_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  weight_log_id UUID NOT NULL REFERENCES public.weight_logs(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

-- RLS policies for progress_photos
CREATE POLICY "Anyone can read progress_photos" ON public.progress_photos FOR SELECT USING (true);
CREATE POLICY "Anyone can insert progress_photos" ON public.progress_photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update progress_photos" ON public.progress_photos FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete progress_photos" ON public.progress_photos FOR DELETE USING (true);

-- 6. Create storage bucket for progress photos
INSERT INTO storage.buckets (id, name, public) VALUES ('progress-photos', 'progress-photos', true);

-- Storage policies
CREATE POLICY "Anyone can view progress photos" ON storage.objects FOR SELECT USING (bucket_id = 'progress-photos');
CREATE POLICY "Anyone can upload progress photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'progress-photos');
CREATE POLICY "Anyone can update progress photos" ON storage.objects FOR UPDATE USING (bucket_id = 'progress-photos');
CREATE POLICY "Anyone can delete progress photos" ON storage.objects FOR DELETE USING (bucket_id = 'progress-photos');