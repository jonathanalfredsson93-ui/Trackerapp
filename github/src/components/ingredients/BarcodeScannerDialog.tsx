import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Search, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BarcodeScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductFound: (data: { name: string; kcal_per_100g: number; protein_per_100g: number }) => void;
}

export function BarcodeScannerDialog({
  open,
  onOpenChange,
  onProductFound,
}: BarcodeScannerDialogProps) {
  const { toast } = useToast();
  const [barcode, setBarcode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  useEffect(() => {
    if (!open) {
      stopCamera();
    }
  }, [open]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (error) {
      setCameraError('Could not access camera. Please enter barcode manually.');
      console.error('Camera error:', error);
    }
  };

  const lookupBarcode = async (code: string) => {
    if (!code.trim()) {
      toast({ title: 'Please enter a barcode', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('barcode-lookup', {
        body: { barcode: code.trim() }
      });

      if (error) throw error;

      if (data.found) {
        onProductFound({
          name: data.name,
          kcal_per_100g: data.kcal_per_100g,
          protein_per_100g: data.protein_per_100g,
        });
        toast({ title: `Found: ${data.name}` });
        onOpenChange(false);
      } else {
        toast({ title: 'Product not found', description: 'Try entering details manually', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Barcode lookup error:', error);
      toast({ title: 'Failed to lookup barcode', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Scan Barcode</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isCameraActive ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black aspect-video"
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute top-2 right-2"
                onClick={stopCamera}
              >
                <X className="h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Point camera at barcode, then enter the number below
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              {cameraError ? (
                <p className="text-sm text-destructive text-center">{cameraError}</p>
              ) : (
                <Button onClick={startCamera} variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  Open Camera
                </Button>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Barcode Number</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter barcode (e.g., 5901234123457)"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && lookupBarcode(barcode)}
              />
              <Button onClick={() => lookupBarcode(barcode)} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Using Open Food Facts database. Enter the barcode number from the product packaging.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
