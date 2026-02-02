-- Create ingredients table with nutritional values
CREATE TABLE public.ingredients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    protein DECIMAL(10, 2) NOT NULL DEFAULT 0,
    kcal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unit_type TEXT NOT NULL DEFAULT 'per_100g' CHECK (unit_type IN ('per_100g', 'per_unit')),
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    is_custom BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recipes table
CREATE TABLE public.recipes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    servings INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recipe_ingredients junction table
CREATE TABLE public.recipe_ingredients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meal_plans table
CREATE TABLE public.meal_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    plan_date DATE NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    servings INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_ingredients_name ON public.ingredients(name);
CREATE INDEX idx_ingredients_favorite ON public.ingredients(is_favorite);
CREATE INDEX idx_recipes_name ON public.recipes(name);
CREATE INDEX idx_meal_plans_date ON public.meal_plans(plan_date);
CREATE INDEX idx_recipe_ingredients_recipe ON public.recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient ON public.recipe_ingredients(ingredient_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_ingredients_updated_at
    BEFORE UPDATE ON public.ingredients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON public.recipes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
    BEFORE UPDATE ON public.meal_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables (but allow public access for now - no auth required)
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required for MVP)
CREATE POLICY "Allow public read access to ingredients" ON public.ingredients FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to ingredients" ON public.ingredients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to ingredients" ON public.ingredients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to ingredients" ON public.ingredients FOR DELETE USING (true);

CREATE POLICY "Allow public read access to recipes" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to recipes" ON public.recipes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to recipes" ON public.recipes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to recipes" ON public.recipes FOR DELETE USING (true);

CREATE POLICY "Allow public read access to recipe_ingredients" ON public.recipe_ingredients FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to recipe_ingredients" ON public.recipe_ingredients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to recipe_ingredients" ON public.recipe_ingredients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to recipe_ingredients" ON public.recipe_ingredients FOR DELETE USING (true);

CREATE POLICY "Allow public read access to meal_plans" ON public.meal_plans FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to meal_plans" ON public.meal_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to meal_plans" ON public.meal_plans FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to meal_plans" ON public.meal_plans FOR DELETE USING (true);

-- Insert common ingredients with nutritional values
INSERT INTO public.ingredients (name, protein, kcal, unit_type) VALUES
('Chicken Breast', 31, 165, 'per_100g'),
('Salmon', 20, 208, 'per_100g'),
('Eggs', 6.5, 78, 'per_unit'),
('Rice (white)', 2.7, 130, 'per_100g'),
('Rice (brown)', 2.6, 112, 'per_100g'),
('Oats', 13.2, 389, 'per_100g'),
('Broccoli', 2.8, 34, 'per_100g'),
('Spinach', 2.9, 23, 'per_100g'),
('Sweet Potato', 1.6, 86, 'per_100g'),
('Potato', 2, 77, 'per_100g'),
('Banana', 1.1, 89, 'per_unit'),
('Apple', 0.3, 52, 'per_unit'),
('Avocado', 2, 160, 'per_unit'),
('Greek Yogurt', 10, 59, 'per_100g'),
('Milk (whole)', 3.2, 61, 'per_100g'),
('Cottage Cheese', 11, 98, 'per_100g'),
('Almonds', 21, 579, 'per_100g'),
('Peanut Butter', 25, 588, 'per_100g'),
('Olive Oil', 0, 884, 'per_100g'),
('Beef (ground)', 26, 250, 'per_100g'),
('Turkey Breast', 29, 135, 'per_100g'),
('Tuna (canned)', 26, 116, 'per_100g'),
('Tofu', 8, 76, 'per_100g'),
('Lentils (cooked)', 9, 116, 'per_100g'),
('Black Beans (cooked)', 8.9, 132, 'per_100g'),
('Quinoa (cooked)', 4.4, 120, 'per_100g'),
('Pasta (cooked)', 5, 131, 'per_100g'),
('Bread (whole wheat)', 4, 81, 'per_100g'),
('Cheese (cheddar)', 25, 403, 'per_100g'),
('Honey', 0.3, 304, 'per_100g');