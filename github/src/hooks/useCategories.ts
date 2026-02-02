import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FoodCategory } from '@/types';
import { toast } from 'sonner';

export function useCategories() {
  return useQuery({
    queryKey: ['food-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_categories')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name');
      
      if (error) throw error;
      return data as FoodCategory[];
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('food_categories')
        .insert({ name, is_default: false })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-categories'] });
      toast.success('Category added');
    },
    onError: (error) => {
      toast.error('Failed to add category: ' + error.message);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('food_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-categories'] });
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      toast.success('Category deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete category: ' + error.message);
    },
  });
}
