import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { WorkoutType, WorkoutPreset, WorkoutLog, WorkoutCategory } from '@/types/fitness';

// Workout Types
export function useWorkoutTypes() {
  return useQuery({
    queryKey: ['workout-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_types')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name');
      if (error) throw error;
      return data as WorkoutType[];
    },
  });
}

export function useCreateWorkoutType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (type: { name: string; category: WorkoutCategory }) => {
      const { data, error } = await supabase
        .from('workout_types')
        .insert({ name: type.name, category: type.category, is_default: false })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-types'] });
    },
  });
}

export function useDeleteWorkoutType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workout_types')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-types'] });
    },
  });
}

// Workout Presets
export function useWorkoutPresets(workoutTypeId?: string) {
  return useQuery({
    queryKey: ['workout-presets', workoutTypeId],
    queryFn: async () => {
      let query = supabase
        .from('workout_presets')
        .select('*, workout_type:workout_types(*)');

      if (workoutTypeId) {
        query = query.eq('workout_type_id', workoutTypeId);
      }

      const { data, error } = await query.order('name');
      if (error) throw error;
      return data as (WorkoutPreset & { workout_type: WorkoutType })[];
    },
  });
}

export function useCreateWorkoutPreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preset: Omit<WorkoutPreset, 'id' | 'created_at' | 'workout_type'>) => {
      const { data, error } = await supabase
        .from('workout_presets')
        .insert(preset)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-presets'] });
    },
  });
}

export function useDeleteWorkoutPreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workout_presets')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-presets'] });
    },
  });
}

// Workout Logs
export function useWorkoutLogs(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['workout-logs', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('workout_logs')
        .select('*, workout_type:workout_types(*), workout_preset:workout_presets(*)')
        .order('workout_date', { ascending: false });

      if (startDate) {
        query = query.gte('workout_date', startDate);
      }
      if (endDate) {
        query = query.lte('workout_date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (WorkoutLog & { workout_type: WorkoutType; workout_preset: WorkoutPreset | null })[];
    },
  });
}

export function useCreateWorkoutLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: Omit<WorkoutLog, 'id' | 'created_at' | 'workout_type' | 'workout_preset'>) => {
      const { data, error } = await supabase
        .from('workout_logs')
        .insert(log)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-logs'] });
    },
  });
}

export function useDeleteWorkoutLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workout_logs')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-logs'] });
    },
  });
}
