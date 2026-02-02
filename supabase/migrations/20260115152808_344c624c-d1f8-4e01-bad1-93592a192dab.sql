-- Create table to track exceptions (skipped dates) for recurring meals
CREATE TABLE public.recurring_meal_exceptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recurring_meal_id UUID NOT NULL REFERENCES public.recurring_meals(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(recurring_meal_id, exception_date)
);

-- Enable Row Level Security
ALTER TABLE public.recurring_meal_exceptions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (matching existing pattern)
CREATE POLICY "Anyone can read recurring_meal_exceptions" 
ON public.recurring_meal_exceptions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert recurring_meal_exceptions" 
ON public.recurring_meal_exceptions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can delete recurring_meal_exceptions" 
ON public.recurring_meal_exceptions 
FOR DELETE 
USING (true);