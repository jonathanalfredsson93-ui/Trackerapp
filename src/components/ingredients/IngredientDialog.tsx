import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Ingredient } from '@/types';
import { useCategories } from '@/hooks/useCategories';

const ingredientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  protein_per_100g: z.coerce.number().min(0, 'Must be positive'),
  kcal_per_100g: z.coerce.number().min(0, 'Must be positive'),
  grams_per_unit: z.coerce.number().min(0, 'Must be positive'),
  default_unit: z.enum(['per_100g', 'per_unit']),
  category_id: z.string().nullable().optional(),
});

type IngredientFormData = z.infer<typeof ingredientSchema>;

interface IngredientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredient?: Ingredient | null;
  onSubmit: (data: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>) => void;
  isLoading?: boolean;
  initialData?: { name: string; kcal_per_100g: number; protein_per_100g: number } | null;
}

export function IngredientDialog({
  open,
  onOpenChange,
  ingredient,
  onSubmit,
  isLoading,
  initialData,
}: IngredientDialogProps) {
  const { data: categories = [] } = useCategories();
  
  const form = useForm<IngredientFormData>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: '',
      protein_per_100g: 0,
      kcal_per_100g: 0,
      grams_per_unit: 0,
      default_unit: 'per_100g',
      category_id: null,
    },
  });

  // Watch values for auto-calculation
  const proteinPer100g = useWatch({ control: form.control, name: 'protein_per_100g' });
  const kcalPer100g = useWatch({ control: form.control, name: 'kcal_per_100g' });
  const gramsPerUnit = useWatch({ control: form.control, name: 'grams_per_unit' });

  // Calculate per-unit values
  const proteinPerUnit = gramsPerUnit > 0 ? (proteinPer100g * gramsPerUnit) / 100 : 0;
  const kcalPerUnit = gramsPerUnit > 0 ? (kcalPer100g * gramsPerUnit) / 100 : 0;

  useEffect(() => {
    if (ingredient) {
      form.reset({
        name: ingredient.name,
        protein_per_100g: ingredient.protein_per_100g,
        kcal_per_100g: ingredient.kcal_per_100g,
        grams_per_unit: ingredient.grams_per_unit,
        default_unit: ingredient.default_unit,
        category_id: ingredient.category_id,
      });
    } else if (initialData) {
      form.reset({
        name: initialData.name,
        protein_per_100g: initialData.protein_per_100g,
        kcal_per_100g: initialData.kcal_per_100g,
        grams_per_unit: 0,
        default_unit: 'per_100g',
        category_id: null,
      });
    } else {
      form.reset({
        name: '',
        protein_per_100g: 0,
        kcal_per_100g: 0,
        grams_per_unit: 0,
        default_unit: 'per_100g',
        category_id: null,
      });
    }
  }, [ingredient, initialData, form]);

  const handleSubmit = (data: IngredientFormData) => {
    // Calculate per-unit values based on grams_per_unit
    const protein_per_unit = data.grams_per_unit > 0 
      ? (data.protein_per_100g * data.grams_per_unit) / 100 
      : 0;
    const kcal_per_unit = data.grams_per_unit > 0 
      ? (data.kcal_per_100g * data.grams_per_unit) / 100 
      : 0;

    onSubmit({
      name: data.name,
      protein_per_100g: data.protein_per_100g,
      kcal_per_100g: data.kcal_per_100g,
      protein_per_unit,
      kcal_per_unit,
      grams_per_unit: data.grams_per_unit,
      default_unit: data.default_unit,
      is_custom: !ingredient,
      is_favorite: ingredient?.is_favorite ?? false,
      category_id: data.category_id ?? null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {ingredient ? 'Edit Ingredient' : 'Add Ingredient'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Chicken Breast" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value === 'none' ? null : value)} 
                    value={field.value ?? 'none'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No category</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Per 100g values */}
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
              <h4 className="text-sm font-medium text-foreground">Per 100g</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="protein_per_100g"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Protein (g)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kcal_per_100g"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Calories (kcal)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Per unit values - auto-calculated */}
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
              <h4 className="text-sm font-medium text-foreground">Per Unit</h4>
              <FormField
                control={form.control}
                name="grams_per_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">Grams per unit</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        placeholder="e.g., 60 for a medium egg"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Enter the weight of one unit (e.g., one egg = 60g)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {gramsPerUnit > 0 && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="rounded-md bg-protein/10 p-3 text-center">
                    <p className="text-lg font-semibold text-protein">
                      {proteinPerUnit.toFixed(1)}g
                    </p>
                    <p className="text-xs text-muted-foreground">protein/unit</p>
                  </div>
                  <div className="rounded-md bg-kcal/10 p-3 text-center">
                    <p className="text-lg font-semibold text-kcal">
                      {kcalPerUnit.toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">kcal/unit</p>
                  </div>
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="default_unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Measurement</FormLabel>
                  <FormDescription className="text-xs">
                    Used by default when adding to recipes
                  </FormDescription>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="per_100g">Per 100g</SelectItem>
                      <SelectItem value="per_unit">Per unit</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {ingredient ? 'Save Changes' : 'Add Ingredient'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}