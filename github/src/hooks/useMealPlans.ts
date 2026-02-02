import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MealPlan, MealType, DayMealPlan, RecipeWithIngredients, Ingredient, RecipeIngredient, RecurringMeal, RecurringMealException } from '@/types';
import { toast } from 'sonner';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, getDay } from 'date-fns';

function calculateRecipeNutrition(
  recipeIngredients: (RecipeIngredient & { ingredient: Ingredient })[],
  servings: number
): { proteinPerServing: number; kcalPerServing: number } {
  let totalProtein = 0;
  let totalKcal = 0;

  recipeIngredients.forEach(ri => {
    const { ingredient, quantity, unit_used } = ri;
    if (unit_used === 'per_100g') {
      totalProtein += (ingredient.protein_per_100g * quantity) / 100;
      totalKcal += (ingredient.kcal_per_100g * quantity) / 100;
    } else {
      totalProtein += ingredient.protein_per_unit * quantity;
      totalKcal += ingredient.kcal_per_unit * quantity;
    }
  });

  return {
    proteinPerServing: totalProtein / servings,
    kcalPerServing: totalKcal / servings,
  };
}

export function useMealPlans(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: ['meal-plans', format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          recipe:recipes (
            *,
            recipe_ingredients (
              *,
              ingredient:ingredients (*)
            )
          ),
          quick_food:quick_foods (*)
        `)
        .gte('plan_date', format(startDate, 'yyyy-MM-dd'))
        .lte('plan_date', format(endDate, 'yyyy-MM-dd'))
        .order('plan_date')
        .order('meal_type');

      if (error) throw error;

      // Transform data with nutrition calculations
      return (data as any[]).map(mp => {
        if (mp.recipe) {
          const nutrition = calculateRecipeNutrition(
            mp.recipe.recipe_ingredients,
            mp.recipe.servings
          );
          mp.recipe = {
            ...mp.recipe,
            protein_per_serving: nutrition.proteinPerServing,
            kcal_per_serving: nutrition.kcalPerServing,
          };
        }
        return mp as MealPlan;
      });
    },
  });
}

// Recurring meals hooks
export function useRecurringMeals() {
  return useQuery({
    queryKey: ['recurring-meals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_meals')
        .select(`
          *,
          recipe:recipes (
            *,
            recipe_ingredients (
              *,
              ingredient:ingredients (*)
            )
          )
        `)
        .eq('is_active', true)
        .order('day_of_week')
        .order('meal_type');

      if (error) throw error;

      return (data as any[]).map(rm => {
        if (rm.recipe) {
          const nutrition = calculateRecipeNutrition(
            rm.recipe.recipe_ingredients,
            rm.recipe.servings
          );
          rm.recipe = {
            ...rm.recipe,
            protein_per_serving: nutrition.proteinPerServing,
            kcal_per_serving: nutrition.kcalPerServing,
          };
        }
        return rm as RecurringMeal;
      });
    },
  });
}

// Recurring meal exceptions hooks
export function useRecurringMealExceptions(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: ['recurring-meal-exceptions', format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_meal_exceptions')
        .select('*')
        .gte('exception_date', format(startDate, 'yyyy-MM-dd'))
        .lte('exception_date', format(endDate, 'yyyy-MM-dd'));

      if (error) throw error;
      return data as RecurringMealException[];
    },
  });
}

export function useWeeklyMealPlans(currentDate: Date) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const { data: mealPlans, ...mealPlansRest } = useMealPlans(weekStart, weekEnd);
  const { data: recurringMeals } = useRecurringMeals();
  const { data: exceptions } = useRecurringMealExceptions(weekStart, weekEnd);

  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const dayPlans: DayMealPlan[] = weekDays.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = getDay(date); // 0=Sunday, 1=Monday, etc.
    
    // Get explicitly planned meals for this day
    const plannedMeals = mealPlans?.filter(mp => mp.plan_date === dateStr) || [];
    
    // Get recurring meals for this day of week, but only if there's no planned meal for that slot
    const recurringForDay = recurringMeals?.filter(rm => rm.day_of_week === dayOfWeek) || [];
    
    // Combine: explicit meals take priority, recurring meals fill gaps
    const allMeals: MealPlan[] = [...plannedMeals];
    
    recurringForDay.forEach(rm => {
      const hasPlannedMeal = plannedMeals.some(pm => pm.meal_type === rm.meal_type);
      const isExcepted = exceptions?.some(
        ex => ex.recurring_meal_id === rm.id && ex.exception_date === dateStr
      );
      
      if (!hasPlannedMeal && !isExcepted && rm.recipe) {
        // Create a virtual meal plan from recurring meal
        allMeals.push({
          id: `recurring-${rm.id}-${dateStr}`,
          name: rm.recipe.name,
          plan_date: dateStr,
          meal_type: rm.meal_type as MealType,
          recipe_id: rm.recipe_id,
          quick_food_id: null,
          custom_kcal: null,
          custom_protein: null,
          servings: rm.servings,
          created_at: rm.created_at,
          updated_at: rm.updated_at,
          recipe: rm.recipe,
        });
      }
    });

    let totalProtein = 0;
    let totalKcal = 0;

    allMeals.forEach(meal => {
      if (meal.recipe) {
        totalProtein += (meal.recipe.protein_per_serving || 0) * meal.servings;
        totalKcal += (meal.recipe.kcal_per_serving || 0) * meal.servings;
      } else if (meal.quick_food) {
        totalProtein += meal.quick_food.protein * meal.servings;
        totalKcal += meal.quick_food.kcal * meal.servings;
      } else if (meal.custom_protein !== null && meal.custom_kcal !== null) {
        totalProtein += meal.custom_protein;
        totalKcal += meal.custom_kcal;
      }
    });

    return {
      date: dateStr,
      meals: allMeals,
      totalProtein,
      totalKcal,
    };
  });

  return { dayPlans, ...mealPlansRest };
}

export function useCreateMealPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mealPlan: Omit<MealPlan, 'id' | 'created_at' | 'updated_at' | 'recipe'>) => {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert(mealPlan)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast.success('Meal added to plan');
    },
    onError: (error) => {
      toast.error('Failed to add meal: ' + error.message);
    },
  });
}

export function useUpdateMealPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MealPlan> & { id: string }) => {
      const { error } = await supabase
        .from('meal_plans')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast.success('Meal plan updated');
    },
    onError: (error) => {
      toast.error('Failed to update meal plan: ' + error.message);
    },
  });
}

export function useDeleteMealPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast.success('Meal removed from plan');
    },
    onError: (error) => {
      toast.error('Failed to remove meal: ' + error.message);
    },
  });
}

// Recurring meals mutations
export function useCreateRecurringMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (meal: Omit<RecurringMeal, 'id' | 'created_at' | 'updated_at' | 'recipe'>) => {
      const { data, error } = await supabase
        .from('recurring_meals')
        .insert(meal)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-meals'] });
      toast.success('Standard meal added');
    },
    onError: (error) => {
      toast.error('Failed to add standard meal: ' + error.message);
    },
  });
}

export function useDeleteRecurringMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_meals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-meals'] });
      toast.success('Standard meal removed');
    },
    onError: (error) => {
      toast.error('Failed to remove standard meal: ' + error.message);
    },
  });
}

// Skip a recurring meal for a specific date (adds an exception)
export function useSkipRecurringMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recurringMealId, date }: { recurringMealId: string; date: string }) => {
      const { error } = await supabase
        .from('recurring_meal_exceptions')
        .insert({
          recurring_meal_id: recurringMealId,
          exception_date: date,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-meal-exceptions'] });
      toast.success('Meal skipped for this week');
    },
    onError: (error) => {
      toast.error('Failed to skip meal: ' + error.message);
    },
  });
}
