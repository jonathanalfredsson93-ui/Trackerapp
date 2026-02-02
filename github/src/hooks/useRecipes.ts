import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Recipe, RecipeIngredient, RecipeWithIngredients, Ingredient } from '@/types';
import { toast } from 'sonner';

function calculateRecipeNutrition(
  recipeIngredients: (RecipeIngredient & { ingredient: Ingredient })[],
  servings: number
): { totalProtein: number; totalKcal: number; proteinPerServing: number; kcalPerServing: number } {
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
    totalProtein,
    totalKcal,
    proteinPerServing: totalProtein / servings,
    kcalPerServing: totalKcal / servings,
  };
}

export function useRecipes() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (
            *,
            ingredient:ingredients (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (recipes as any[]).map(recipe => {
        const nutrition = calculateRecipeNutrition(recipe.recipe_ingredients, recipe.servings);
        return {
          ...recipe,
          total_protein: nutrition.totalProtein,
          total_kcal: nutrition.totalKcal,
          protein_per_serving: nutrition.proteinPerServing,
          kcal_per_serving: nutrition.kcalPerServing,
        } as RecipeWithIngredients;
      });
    },
  });
}

export function useRecipe(id: string | null) {
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data: recipe, error } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (
            *,
            ingredient:ingredients (*)
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!recipe) return null;

      const nutrition = calculateRecipeNutrition((recipe as any).recipe_ingredients, recipe.servings);
      return {
        ...recipe,
        total_protein: nutrition.totalProtein,
        total_kcal: nutrition.totalKcal,
        protein_per_serving: nutrition.proteinPerServing,
        kcal_per_serving: nutrition.kcalPerServing,
      } as RecipeWithIngredients;
    },
    enabled: !!id,
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipe,
      ingredients,
    }: {
      recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>;
      ingredients: { ingredient_id: string; quantity: number; unit_used?: 'per_100g' | 'per_unit' }[];
    }) => {
      const { data: newRecipe, error: recipeError } = await supabase
        .from('recipes')
        .insert(recipe)
        .select()
        .single();

      if (recipeError) throw recipeError;

      if (ingredients.length > 0) {
        const recipeIngredients = ingredients.map(ing => ({
          recipe_id: newRecipe.id,
          ingredient_id: ing.ingredient_id,
          quantity: ing.quantity,
          unit_used: ing.unit_used || 'per_100g',
        }));

        const { error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .insert(recipeIngredients);

        if (ingredientsError) throw ingredientsError;
      }

      return newRecipe;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast.success('Recipe created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create recipe: ' + error.message);
    },
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      recipe,
      ingredients,
    }: {
      id: string;
      recipe: Partial<Omit<Recipe, 'id' | 'created_at' | 'updated_at'>>;
      ingredients: { ingredient_id: string; quantity: number; unit_used?: 'per_100g' | 'per_unit' }[];
    }) => {
      const { error: recipeError } = await supabase
        .from('recipes')
        .update(recipe)
        .eq('id', id);

      if (recipeError) throw recipeError;

      // Delete existing ingredients and insert new ones
      const { error: deleteError } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', id);

      if (deleteError) throw deleteError;

      if (ingredients.length > 0) {
        const recipeIngredients = ingredients.map(ing => ({
          recipe_id: id,
          ingredient_id: ing.ingredient_id,
          quantity: ing.quantity,
          unit_used: ing.unit_used || 'per_100g',
        }));

        const { error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .insert(recipeIngredients);

        if (ingredientsError) throw ingredientsError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipe'] });
      toast.success('Recipe updated');
    },
    onError: (error) => {
      toast.error('Failed to update recipe: ' + error.message);
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast.success('Recipe deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete recipe: ' + error.message);
    },
  });
}
