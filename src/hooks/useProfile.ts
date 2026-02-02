import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { UserProfile } from '@/types/fitness';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as UserProfile | null;
    },
  });
}

export function useCreateOrUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Partial<UserProfile> & { id?: string }) => {
      if (profile.id) {
        const { data, error } = await supabase
          .from('user_profiles')
          .update({
            name: profile.name,
            gender: profile.gender,
            age: profile.age,
            height_cm: profile.height_cm,
            goal_weight_kg: profile.goal_weight_kg,
            goal_fat_percent: profile.goal_fat_percent,
            daily_kcal_goal: profile.daily_kcal_goal,
            daily_protein_goal: profile.daily_protein_goal,
          })
          .eq('id', profile.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('user_profiles')
          .insert({
            name: profile.name,
            gender: profile.gender,
            age: profile.age,
            height_cm: profile.height_cm,
            goal_weight_kg: profile.goal_weight_kg,
            goal_fat_percent: profile.goal_fat_percent,
            daily_kcal_goal: profile.daily_kcal_goal,
            daily_protein_goal: profile.daily_protein_goal,
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
