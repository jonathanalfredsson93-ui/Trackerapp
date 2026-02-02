import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { WeightLog } from '@/types/fitness';

export function useWeightLogs(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['weight-logs', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('weight_logs')
        .select('*')
        .order('log_date', { ascending: true });

      if (startDate) {
        query = query.gte('log_date', startDate);
      }
      if (endDate) {
        query = query.lte('log_date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as WeightLog[];
    },
  });
}

export function useCreateWeightLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: Omit<WeightLog, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('weight_logs')
        .insert(log)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weight-logs'] });
    },
  });
}

export function useDeleteWeightLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('weight_logs')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weight-logs'] });
    },
  });
}
