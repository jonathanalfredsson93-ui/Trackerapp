import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QuickFood } from '@/types';
import { toast } from 'sonner';

export function useQuickFoods() {
  return useQuery({
    queryKey: ['quick-foods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quick_foods')
        .select('*')
        .order('is_favorite', { ascending: false })
        .order('name');
      
      if (error) throw error;
      return data as QuickFood[];
    },
  });
}

export function useCreateQuickFood() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (food: Omit<QuickFood, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data, error } = await supabase
        .from('quick_foods')
        .insert(food)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-foods'] });
      toast.success('Quick food added');
    },
    onError: (error) => {
      toast.error('Failed to add quick food: ' + error.message);
    },
  });
}

export function useUpdateQuickFood() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<QuickFood> & { id: string }) => {
      const { data, error } = await supabase
        .from('quick_foods')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-foods'] });
      toast.success('Quick food updated');
    },
    onError: (error) => {
      toast.error('Failed to update quick food: ' + error.message);
    },
  });
}

export function useDeleteQuickFood() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quick_foods')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-foods'] });
      toast.success('Quick food deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete quick food: ' + error.message);
    },
  });
}

export function useToggleQuickFoodFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, is_favorite }: { id: string; is_favorite: boolean }) => {
      const { error } = await supabase
        .from('quick_foods')
        .update({ is_favorite })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-foods'] });
    },
  });
}
