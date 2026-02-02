-- Drop existing restrictive policies on ingredients
DROP POLICY IF EXISTS "Admins can manage all ingredients" ON public.ingredients;
DROP POLICY IF EXISTS "Anyone can read ingredients" ON public.ingredients;
DROP POLICY IF EXISTS "Users can manage own custom ingredients" ON public.ingredients;

-- Create permissive policies for public access
CREATE POLICY "Anyone can read ingredients" ON public.ingredients FOR SELECT USING (true);
CREATE POLICY "Anyone can insert ingredients" ON public.ingredients FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update ingredients" ON public.ingredients FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete ingredients" ON public.ingredients FOR DELETE USING (true);

-- Drop existing restrictive policies on recipes
DROP POLICY IF EXISTS "Users can manage own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can read own recipes" ON public.recipes;

-- Create permissive policies for public access
CREATE POLICY "Anyone can read recipes" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert recipes" ON public.recipes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update recipes" ON public.recipes FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete recipes" ON public.recipes FOR DELETE USING (true);

-- Drop existing restrictive policies on recipe_ingredients
DROP POLICY IF EXISTS "Users can manage own recipe ingredients" ON public.recipe_ingredients;
DROP POLICY IF EXISTS "Users can read own recipe ingredients" ON public.recipe_ingredients;

-- Create permissive policies for public access
CREATE POLICY "Anyone can read recipe_ingredients" ON public.recipe_ingredients FOR SELECT USING (true);
CREATE POLICY "Anyone can insert recipe_ingredients" ON public.recipe_ingredients FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update recipe_ingredients" ON public.recipe_ingredients FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete recipe_ingredients" ON public.recipe_ingredients FOR DELETE USING (true);

-- Drop existing restrictive policies on meal_plans
DROP POLICY IF EXISTS "Users can manage own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can read own meal plans" ON public.meal_plans;

-- Create permissive policies for public access
CREATE POLICY "Anyone can read meal_plans" ON public.meal_plans FOR SELECT USING (true);
CREATE POLICY "Anyone can insert meal_plans" ON public.meal_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update meal_plans" ON public.meal_plans FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete meal_plans" ON public.meal_plans FOR DELETE USING (true);