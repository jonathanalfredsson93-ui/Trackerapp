import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RecipeWithIngredients, Ingredient } from '@/types';
import { useIngredients } from '@/hooks/useIngredients';

const recipeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  servings: z.coerce.number().min(1, 'At least 1 serving'),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

interface RecipeIngredientItem {
  ingredient_id: string;
  ingredient: Ingredient;
  quantity: number;
  unit_used: 'per_100g' | 'per_unit';
}

interface RecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe?: RecipeWithIngredients | null;
  onSubmit: (
    data: RecipeFormData,
    ingredients: { ingredient_id: string; quantity: number; unit_used: 'per_100g' | 'per_unit' }[]
  ) => void;
  isLoading?: boolean;
}

export function RecipeDialog({
  open,
  onOpenChange,
  recipe,
  onSubmit,
  isLoading,
}: RecipeDialogProps) {
  const { data: allIngredients = [] } = useIngredients();
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredientItem[]>([]);
  const [ingredientPopoverOpen, setIngredientPopoverOpen] = useState(false);

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: '',
      description: '',
      servings: 1,
    },
  });

  useEffect(() => {
    if (recipe) {
      form.reset({
        name: recipe.name,
        description: recipe.description || '',
        servings: recipe.servings,
      });
      setRecipeIngredients(
        recipe.recipe_ingredients?.map(ri => ({
          ingredient_id: ri.ingredient_id,
          ingredient: ri.ingredient!,
          quantity: ri.quantity,
          unit_used: ri.unit_used || 'per_100g',
        })) || []
      );
    } else {
      form.reset({
        name: '',
        description: '',
        servings: 1,
      });
      setRecipeIngredients([]);
    }
  }, [recipe, form, open]);

  const addIngredient = (ingredient: Ingredient) => {
    if (!recipeIngredients.find(ri => ri.ingredient_id === ingredient.id)) {
      setRecipeIngredients([
        ...recipeIngredients,
        {
          ingredient_id: ingredient.id,
          ingredient,
          quantity: ingredient.default_unit === 'per_100g' ? 100 : 1,
          unit_used: ingredient.default_unit,
        },
      ]);
    }
    setIngredientPopoverOpen(false);
  };

  const updateQuantity = (ingredientId: string, quantity: number) => {
    setRecipeIngredients(
      recipeIngredients.map(ri =>
        ri.ingredient_id === ingredientId ? { ...ri, quantity } : ri
      )
    );
  };

  const updateUnitUsed = (ingredientId: string, unit_used: 'per_100g' | 'per_unit') => {
    setRecipeIngredients(
      recipeIngredients.map(ri =>
        ri.ingredient_id === ingredientId
          ? { ...ri, unit_used, quantity: unit_used === 'per_100g' ? 100 : 1 }
          : ri
      )
    );
  };

  const removeIngredient = (ingredientId: string) => {
    setRecipeIngredients(recipeIngredients.filter(ri => ri.ingredient_id !== ingredientId));
  };

  const calculateIngredientNutrition = (ri: RecipeIngredientItem) => {
    const { ingredient, quantity, unit_used } = ri;
    if (unit_used === 'per_100g') {
      return {
        protein: (ingredient.protein_per_100g * quantity) / 100,
        kcal: (ingredient.kcal_per_100g * quantity) / 100,
      };
    } else {
      return {
        protein: ingredient.protein_per_unit * quantity,
        kcal: ingredient.kcal_per_unit * quantity,
      };
    }
  };

  const calculateTotals = () => {
    let protein = 0;
    let kcal = 0;

    recipeIngredients.forEach(ri => {
      const nutrition = calculateIngredientNutrition(ri);
      protein += nutrition.protein;
      kcal += nutrition.kcal;
    });

    const servings = form.watch('servings') || 1;
    return {
      totalProtein: protein,
      totalKcal: kcal,
      proteinPerServing: protein / servings,
      kcalPerServing: kcal / servings,
    };
  };

  const handleSubmit = (data: RecipeFormData) => {
    onSubmit(
      data,
      recipeIngredients.map(ri => ({
        ingredient_id: ri.ingredient_id,
        quantity: ri.quantity,
        unit_used: ri.unit_used,
      }))
    );
  };

  const totals = calculateTotals();
  const availableIngredients = allIngredients.filter(
    ing => !recipeIngredients.find(ri => ri.ingredient_id === ing.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {recipe ? 'Edit Recipe' : 'Create Recipe'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipe Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Grilled Chicken Salad" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="servings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Servings</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of your recipe..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ingredients Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel>Ingredients</FormLabel>
                  <Popover open={ingredientPopoverOpen} onOpenChange={setIngredientPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Ingredient
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="end">
                      <Command>
                        <CommandInput placeholder="Search ingredients..." />
                        <CommandList>
                          <CommandEmpty>No ingredients found.</CommandEmpty>
                          <CommandGroup>
                            {availableIngredients.map(ing => (
                              <CommandItem
                                key={ing.id}
                                value={ing.name}
                                onSelect={() => addIngredient(ing)}
                              >
                                <div className="flex flex-col flex-1">
                                  <span>{ing.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    100g: {ing.protein_per_100g}g P / {ing.kcal_per_100g} kcal
                                    {ing.protein_per_unit > 0 && (
                                      <> • Unit: {ing.protein_per_unit}g P / {ing.kcal_per_unit} kcal</>
                                    )}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {recipeIngredients.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground">
                    <p>No ingredients added yet.</p>
                    <p className="text-sm">Click "Add Ingredient" to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recipeIngredients.map(ri => {
                      const nutrition = calculateIngredientNutrition(ri);
                      const hasUnitValues = ri.ingredient.protein_per_unit > 0 || ri.ingredient.kcal_per_unit > 0;
                      
                      return (
                        <div
                          key={ri.ingredient_id}
                          className="rounded-lg border border-border/50 bg-muted/30 p-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{ri.ingredient.name}</p>
                              {/* Per-ingredient nutrition display */}
                              <div className="flex gap-3 mt-1">
                                <span className="text-xs font-medium text-protein">
                                  +{nutrition.protein.toFixed(1)}g protein
                                </span>
                                <span className="text-xs font-medium text-kcal">
                                  +{nutrition.kcal.toFixed(0)} kcal
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {hasUnitValues && (
                                <Select
                                  value={ri.unit_used}
                                  onValueChange={(value: 'per_100g' | 'per_unit') => 
                                    updateUnitUsed(ri.ingredient_id, value)
                                  }
                                >
                                  <SelectTrigger className="w-24 h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="per_100g">grams</SelectItem>
                                    <SelectItem value="per_unit">units</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                              <Input
                                type="number"
                                min="0"
                                step={ri.unit_used === 'per_100g' ? '1' : '0.5'}
                                value={ri.quantity}
                                onChange={e => updateQuantity(ri.ingredient_id, Number(e.target.value))}
                                className="w-20 h-8"
                              />
                              <span className="text-xs text-muted-foreground w-6">
                                {ri.unit_used === 'per_100g' ? 'g' : 'pcs'}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => removeIngredient(ri.ingredient_id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Nutrition Summary */}
              {recipeIngredients.length > 0 && (
                <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                  <h4 className="text-sm font-medium mb-3">Recipe Totals</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="stat-card">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-sm font-semibold text-protein">{totals.totalProtein.toFixed(1)}g protein</p>
                      <p className="text-sm font-semibold text-kcal">{totals.totalKcal.toFixed(0)} kcal</p>
                    </div>
                    <div className="stat-card">
                      <p className="text-xs text-muted-foreground">Per Serving</p>
                      <p className="text-sm font-semibold text-protein">{totals.proteinPerServing.toFixed(1)}g protein</p>
                      <p className="text-sm font-semibold text-kcal">{totals.kcalPerServing.toFixed(0)} kcal</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {recipe ? 'Save Changes' : 'Create Recipe'}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
