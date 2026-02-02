export interface FoodCategory {
  id: string;
  name: string;
  is_default: boolean;
  created_at: string;
}

export interface Ingredient {
  id: string;
  name: string;
  protein_per_100g: number;
  kcal_per_100g: number;
  protein_per_unit: number;
  kcal_per_unit: number;
  grams_per_unit: number;
  default_unit: 'per_100g' | 'per_unit';
  is_favorite: boolean;
  is_custom: boolean;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  category?: FoodCategory;
}

export interface QuickFood {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  is_favorite: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string | null;
  servings: number;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  quantity: number;
  unit_used: 'per_100g' | 'per_unit';
  created_at: string;
  ingredient?: Ingredient;
}

export interface RecipeWithIngredients extends Recipe {
  recipe_ingredients: RecipeIngredient[];
  total_protein: number;
  total_kcal: number;
  protein_per_serving: number;
  kcal_per_serving: number;
}

export interface MealPlan {
  id: string;
  name: string;
  plan_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipe_id: string | null;
  quick_food_id: string | null;
  custom_kcal: number | null;
  custom_protein: number | null;
  servings: number;
  created_at: string;
  updated_at: string;
  recipe?: RecipeWithIngredients;
  quick_food?: QuickFood;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface DayMealPlan {
  date: string;
  meals: MealPlan[];
  totalProtein: number;
  totalKcal: number;
}

export interface RecurringMeal {
  id: string;
  day_of_week: number; // 0=Sunday, 1=Monday, etc.
  meal_type: MealType;
  recipe_id: string;
  servings: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  recipe?: RecipeWithIngredients;
}

export interface RecurringMealException {
  id: string;
  recurring_meal_id: string;
  exception_date: string;
  created_at: string;
}

export interface ProgressPhoto {
  id: string;
  weight_log_id: string;
  storage_path: string;
  notes: string | null;
  created_at: string;
}
