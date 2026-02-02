-- Create user_profiles table for personal info and goals
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  age INTEGER,
  height_cm NUMERIC,
  goal_weight_kg NUMERIC,
  goal_fat_percent NUMERIC,
  daily_kcal_goal NUMERIC,
  daily_protein_goal NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for public access
CREATE POLICY "Anyone can read user_profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can insert user_profiles" ON public.user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update user_profiles" ON public.user_profiles FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete user_profiles" ON public.user_profiles FOR DELETE USING (true);

-- Create weight_logs table for tracking weight and body measurements
CREATE TABLE public.weight_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg NUMERIC NOT NULL,
  waist_cm NUMERIC,
  neck_cm NUMERIC,
  hip_cm NUMERIC,
  fat_percent NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for public access
CREATE POLICY "Anyone can read weight_logs" ON public.weight_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert weight_logs" ON public.weight_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update weight_logs" ON public.weight_logs FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete weight_logs" ON public.weight_logs FOR DELETE USING (true);

-- Create workout_types table for categorizing workouts
CREATE TABLE public.workout_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('cardio', 'strength', 'other')),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workout_types ENABLE ROW LEVEL SECURITY;

-- RLS policies for public access
CREATE POLICY "Anyone can read workout_types" ON public.workout_types FOR SELECT USING (true);
CREATE POLICY "Anyone can insert workout_types" ON public.workout_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update workout_types" ON public.workout_types FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete workout_types" ON public.workout_types FOR DELETE USING (true);

-- Insert default workout types
INSERT INTO public.workout_types (name, category, is_default) VALUES
  ('Cycling', 'cardio', true),
  ('Swimming', 'cardio', true),
  ('Gym', 'strength', true);

-- Create workout_presets table for preset distances/durations
CREATE TABLE public.workout_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_type_id UUID NOT NULL REFERENCES public.workout_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  distance_km NUMERIC,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workout_presets ENABLE ROW LEVEL SECURITY;

-- RLS policies for public access
CREATE POLICY "Anyone can read workout_presets" ON public.workout_presets FOR SELECT USING (true);
CREATE POLICY "Anyone can insert workout_presets" ON public.workout_presets FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update workout_presets" ON public.workout_presets FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete workout_presets" ON public.workout_presets FOR DELETE USING (true);

-- Create workout_logs table for tracking individual workouts
CREATE TABLE public.workout_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
  workout_type_id UUID NOT NULL REFERENCES public.workout_types(id) ON DELETE CASCADE,
  workout_preset_id UUID REFERENCES public.workout_presets(id) ON DELETE SET NULL,
  distance_km NUMERIC,
  duration_minutes INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for public access
CREATE POLICY "Anyone can read workout_logs" ON public.workout_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert workout_logs" ON public.workout_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update workout_logs" ON public.workout_logs FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete workout_logs" ON public.workout_logs FOR DELETE USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();