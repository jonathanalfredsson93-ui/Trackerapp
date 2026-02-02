import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Ingredient, FoodCategory } from '@/types';
import { toast } from 'sonner';

export function useIngredients() {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*, category:food_categories(*)')
        .order('is_favorite', { ascending: false })
        .order('name');
      
      if (error) throw error;
      return data as (Ingredient & { category: FoodCategory | null })[];
    },
  });
}

export function useCreateIngredient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ingredient: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('ingredients')
        .insert(ingredient)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      toast.success('Ingredient added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add ingredient: ' + error.message);
    },
  });
}

export function useBulkCreateIngredients() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      ingredients: { name: string; kcal_per_100g: number; protein_per_100g: number }[];
      category_id?: string | null;
    }) => {
      const toInsert = data.ingredients.map(ing => ({
        name: ing.name,
        kcal_per_100g: ing.kcal_per_100g,
        protein_per_100g: ing.protein_per_100g,
        kcal_per_unit: 0,
        protein_per_unit: 0,
        grams_per_unit: 0,
        default_unit: 'per_100g' as const,
        is_custom: true,
        is_favorite: false,
        category_id: data.category_id || null,
      }));
      
      const { data: result, error } = await supabase
        .from('ingredients')
        .insert(toInsert)
        .select();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      toast.success(`${data.length} ingredients imported successfully`);
    },
    onError: (error) => {
      toast.error('Failed to import ingredients: ' + error.message);
    },
  });
}

export function useUpdateIngredient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Ingredient> & { id: string }) => {
      const { data, error } = await supabase
        .from('ingredients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast.success('Ingredient updated');
    },
    onError: (error) => {
      toast.error('Failed to update ingredient: ' + error.message);
    },
  });
}

export function useDeleteIngredient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      toast.success('Ingredient deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete ingredient: ' + error.message);
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, is_favorite }: { id: string; is_favorite: boolean }) => {
      const { error } = await supabase
        .from('ingredients')
        .update({ is_favorite })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
}
