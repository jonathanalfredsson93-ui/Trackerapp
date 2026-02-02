import { useState, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { Camera, Upload, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useProgressPhotos, useUploadProgressPhoto, useDeleteProgressPhoto } from '@/hooks/useProgressPhotos';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ProgressPhotosSectionProps {
  weightLogId: string;
  logDate: string;
}

export function ProgressPhotosSection({ weightLogId, logDate }: ProgressPhotosSectionProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: photos = [], isLoading } = useProgressPhotos(weightLogId);
  const uploadMutation = useUploadProgressPhoto();
  const deleteMutation = useDeleteProgressPhoto();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return;
    }

    uploadMutation.mutate({ weightLogId, file });
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (photoId: string, storagePath: string) => {
    deleteMutation.mutate({ id: photoId, storagePath });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <Camera className="h-3 w-3" />
          Progress Photos
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
        >
          <Upload className="h-3 w-3 mr-1" />
          {uploadMutation.isPending ? 'Uploading...' : 'Add'}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      {isLoading ? (
        <div className="flex gap-2">
          <Skeleton className="h-16 w-16 rounded-lg" />
          <Skeleton className="h-16 w-16 rounded-lg" />
        </div>
      ) : photos.length === 0 ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ImageIcon className="h-6 w-6" />
          <span className="text-xs">Add progress photo</span>
        </button>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <button
                onClick={() => setSelectedPhoto(photo.publicUrl || null)}
                className="h-16 w-16 rounded-lg overflow-hidden bg-secondary"
              >
                <img
                  src={photo.publicUrl}
                  alt="Progress"
                  className="h-full w-full object-cover"
                />
              </button>
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(photo.id, photo.storage_path)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="h-16 w-16 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <Camera className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Fullscreen Photo Viewer */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{format(parseISO(logDate), 'MMMM d, yyyy')}</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="p-4">
              <img
                src={selectedPhoto}
                alt="Progress photo"
                className="w-full rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
