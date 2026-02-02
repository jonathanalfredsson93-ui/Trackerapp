import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProgressPhoto } from '@/types';
import { toast } from 'sonner';

export function useProgressPhotos(weightLogId?: string) {
  return useQuery({
    queryKey: ['progress-photos', weightLogId],
    queryFn: async () => {
      let query = supabase
        .from('progress_photos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (weightLogId) {
        query = query.eq('weight_log_id', weightLogId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Add public URLs to each photo
      return (data as ProgressPhoto[]).map(photo => ({
        ...photo,
        publicUrl: getProgressPhotoUrl(photo.storage_path),
      }));
    },
    enabled: weightLogId !== undefined || true,
  });
}

export function useAllProgressPhotos() {
  return useQuery({
    queryKey: ['progress-photos', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*, weight_logs!inner(log_date, weight_kg)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useUploadProgressPhoto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      weightLogId, 
      file, 
      notes 
    }: { 
      weightLogId: string; 
      file: File; 
      notes?: string;
    }) => {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${weightLogId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Create database record
      const { data, error } = await supabase
        .from('progress_photos')
        .insert({
          weight_log_id: weightLogId,
          storage_path: fileName,
          notes: notes || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-photos'] });
      toast.success('Progress photo uploaded');
    },
    onError: (error) => {
      toast.error('Failed to upload photo: ' + error.message);
    },
  });
}

export function useDeleteProgressPhoto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, storagePath }: { id: string; storagePath: string }) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('progress-photos')
        .remove([storagePath]);
      
      if (storageError) throw storageError;
      
      // Delete from database
      const { error } = await supabase
        .from('progress_photos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-photos'] });
      toast.success('Progress photo deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete photo: ' + error.message);
    },
  });
}

export function getProgressPhotoUrl(storagePath: string) {
  const { data } = supabase.storage
    .from('progress-photos')
    .getPublicUrl(storagePath);
  return data.publicUrl;
}
