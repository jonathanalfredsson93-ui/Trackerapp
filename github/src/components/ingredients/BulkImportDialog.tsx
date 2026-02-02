import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useCategories } from '@/hooks/useCategories';

interface ParsedIngredient {
  name: string;
  kcal_per_100g: number;
  protein_per_100g: number;
}

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (ingredients: ParsedIngredient[], categoryId?: string | null) => void;
  isLoading?: boolean;
}

export function BulkImportDialog({
  open,
  onOpenChange,
  onImport,
  isLoading,
}: BulkImportDialogProps) {
  const [parsedData, setParsedData] = useState<ParsedIngredient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: categories = [] } = useCategories();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

        // Skip header row and parse data
        const ingredients: ParsedIngredient[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length < 3) continue;
          
          const name = String(row[0] || '').trim();
          const kcal = parseFloat(String(row[1] || '0'));
          const protein = parseFloat(String(row[2] || '0'));

          if (name && !isNaN(kcal) && !isNaN(protein)) {
            ingredients.push({
              name,
              kcal_per_100g: kcal,
              protein_per_100g: protein,
            });
          }
        }

        if (ingredients.length === 0) {
          setError('No valid ingredients found. Ensure columns are: Name, Kcal/100g, Protein/100g');
          return;
        }

        setParsedData(ingredients);
      } catch (err) {
        setError('Failed to parse file. Please ensure it is a valid Excel file.');
        setParsedData([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = () => {
    onImport(parsedData, selectedCategory || null);
    setParsedData([]);
    setFileName(null);
    setError(null);
    setSelectedCategory('');
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setParsedData([]);
      setFileName(null);
      setError(null);
      setSelectedCategory('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Import Ingredients
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file with columns: Name, Kcal/100g, Protein/100g
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div 
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {fileName ? (
                <span className="text-foreground font-medium">{fileName}</span>
              ) : (
                <>Click to upload or drag & drop</>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              .xlsx, .xls, or .csv files supported
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {parsedData.length > 0 && (
            <>
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <AlertDescription>
                  Found {parsedData.length} ingredients ready to import
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Category (optional)</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category for all items..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  All imported ingredients will be assigned to this category
                </p>
              </div>

              <ScrollArea className="h-48 rounded-md border">
                <div className="p-4 space-y-2">
                  {parsedData.map((ing, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0"
                    >
                      <span className="font-medium truncate flex-1">{ing.name}</span>
                      <div className="flex gap-3 text-muted-foreground text-xs">
                        <span>{ing.kcal_per_100g} kcal</span>
                        <span>{ing.protein_per_100g}g protein</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={parsedData.length === 0 || isLoading}
            >
              Import {parsedData.length} Ingredients
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
