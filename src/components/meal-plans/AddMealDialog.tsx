import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChefHat, Check, ChevronsUpDown, Zap, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRecipes } from '@/hooks/useRecipes';
import { useQuickFoods } from '@/hooks/useQuickFoods';
import { MealType } from '@/types';
import { format } from 'date-fns';

const recipeMealSchema = z.object({
  recipe_id: z.string().min(1, 'Please select a recipe'),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  servings: z.coerce.number().min(1, 'At least 1 serving'),
});

const quickFoodMealSchema = z.object({
  quick_food_id: z.string().min(1, 'Please select a quick food'),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  servings: z.coerce.number().min(1, 'At least 1 serving'),
});

const customMealSchema = z.object({
  name: z.string().min(1, 'Please enter a name'),
  custom_kcal: z.coerce.number().min(0, 'Must be positive'),
  custom_protein: z.coerce.number().min(0, 'Must be positive'),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
});

interface AddMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  onSubmit: (data: {
    recipe_id?: string | null;
    quick_food_id?: string | null;
    custom_kcal?: number | null;
    custom_protein?: number | null;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    servings: number;
    plan_date: string;
    name: string;
  }) => void;
  isLoading?: boolean;
}

const mealTypes: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

export function AddMealDialog({
  open,
  onOpenChange,
  date,
  onSubmit,
  isLoading,
}: AddMealDialogProps) {
  const { data: recipes = [] } = useRecipes();
  const { data: quickFoods = [] } = useQuickFoods();
  const [recipePopoverOpen, setRecipePopoverOpen] = useState(false);
  const [quickFoodPopoverOpen, setQuickFoodPopoverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'recipe' | 'quick' | 'custom'>('recipe');

  const recipeForm = useForm<z.infer<typeof recipeMealSchema>>({
    resolver: zodResolver(recipeMealSchema),
    defaultValues: {
      recipe_id: '',
      meal_type: 'lunch',
      servings: 1,
    },
  });

  const quickFoodForm = useForm<z.infer<typeof quickFoodMealSchema>>({
    resolver: zodResolver(quickFoodMealSchema),
    defaultValues: {
      quick_food_id: '',
      meal_type: 'lunch',
      servings: 1,
    },
  });

  const customForm = useForm<z.infer<typeof customMealSchema>>({
    resolver: zodResolver(customMealSchema),
    defaultValues: {
      name: '',
      custom_kcal: 0,
      custom_protein: 0,
      meal_type: 'lunch',
    },
  });

  const selectedRecipe = recipes.find(r => r.id === recipeForm.watch('recipe_id'));
  const selectedQuickFood = quickFoods.find(q => q.id === quickFoodForm.watch('quick_food_id'));

  const handleRecipeSubmit = (data: z.infer<typeof recipeMealSchema>) => {
    const recipe = recipes.find(r => r.id === data.recipe_id);
    onSubmit({
      recipe_id: data.recipe_id,
      quick_food_id: null,
      custom_kcal: null,
      custom_protein: null,
      meal_type: data.meal_type,
      servings: data.servings,
      plan_date: format(date, 'yyyy-MM-dd'),
      name: recipe?.name || 'Meal',
    });
    recipeForm.reset();
  };

  const handleQuickFoodSubmit = (data: z.infer<typeof quickFoodMealSchema>) => {
    const quickFood = quickFoods.find(q => q.id === data.quick_food_id);
    onSubmit({
      recipe_id: null,
      quick_food_id: data.quick_food_id,
      custom_kcal: null,
      custom_protein: null,
      meal_type: data.meal_type,
      servings: data.servings,
      plan_date: format(date, 'yyyy-MM-dd'),
      name: quickFood?.name || 'Quick Meal',
    });
    quickFoodForm.reset();
  };

  const handleCustomSubmit = (data: z.infer<typeof customMealSchema>) => {
    onSubmit({
      recipe_id: null,
      quick_food_id: null,
      custom_kcal: data.custom_kcal,
      custom_protein: data.custom_protein,
      meal_type: data.meal_type,
      servings: 1,
      plan_date: format(date, 'yyyy-MM-dd'),
      name: data.name,
    });
    customForm.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Add Meal for {format(date, 'EEEE, MMM d')}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recipe" className="gap-1">
              <ChefHat className="h-3 w-3" />
              Recipe
            </TabsTrigger>
            <TabsTrigger value="quick" className="gap-1">
              <Zap className="h-3 w-3" />
              Quick Food
            </TabsTrigger>
            <TabsTrigger value="custom" className="gap-1">
              <Edit2 className="h-3 w-3" />
              Custom
            </TabsTrigger>
          </TabsList>

          {/* Recipe Tab */}
          <TabsContent value="recipe">
            <Form {...recipeForm}>
              <form onSubmit={recipeForm.handleSubmit(handleRecipeSubmit)} className="space-y-4">
                <FormField
                  control={recipeForm.control}
                  name="recipe_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Recipe</FormLabel>
                      <Popover open={recipePopoverOpen} onOpenChange={setRecipePopoverOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                'w-full justify-between',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {selectedRecipe ? (
                                <span className="flex items-center gap-2">
                                  <ChefHat className="h-4 w-4" />
                                  {selectedRecipe.name}
                                </span>
                              ) : (
                                'Select a recipe'
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search recipes..." />
                            <CommandList>
                              <CommandEmpty>No recipes found. Create one first!</CommandEmpty>
                              <CommandGroup>
                                {recipes.map(recipe => (
                                  <CommandItem
                                    key={recipe.id}
                                    value={recipe.name}
                                    onSelect={() => {
                                      field.onChange(recipe.id);
                                      setRecipePopoverOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        recipe.id === field.value ? 'opacity-100' : 'opacity-0'
                                      )}
                                    />
                                    <div className="flex-1">
                                      <p className="font-medium">{recipe.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {recipe.protein_per_serving?.toFixed(1)}g protein • {recipe.kcal_per_serving?.toFixed(0)} kcal
                                      </p>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={recipeForm.control}
                    name="meal_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meal Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mealTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={recipeForm.control}
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

                {selectedRecipe && (
                  <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      Nutrition for {recipeForm.watch('servings')} serving(s)
                    </p>
                    <div className="flex gap-4">
                      <span className="text-sm font-medium text-protein">
                        {((selectedRecipe.protein_per_serving || 0) * recipeForm.watch('servings')).toFixed(1)}g protein
                      </span>
                      <span className="text-sm font-medium text-kcal">
                        {((selectedRecipe.kcal_per_serving || 0) * recipeForm.watch('servings')).toFixed(0)} kcal
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || recipes.length === 0}>
                    Add to Plan
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* Quick Food Tab */}
          <TabsContent value="quick">
            <Form {...quickFoodForm}>
              <form onSubmit={quickFoodForm.handleSubmit(handleQuickFoodSubmit)} className="space-y-4">
                <FormField
                  control={quickFoodForm.control}
                  name="quick_food_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Quick Food</FormLabel>
                      <Popover open={quickFoodPopoverOpen} onOpenChange={setQuickFoodPopoverOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                'w-full justify-between',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {selectedQuickFood ? (
                                <span className="flex items-center gap-2">
                                  <Zap className="h-4 w-4" />
                                  {selectedQuickFood.name}
                                </span>
                              ) : (
                                'Select a quick food'
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search quick foods..." />
                            <CommandList>
                              <CommandEmpty>No quick foods found. Create one first!</CommandEmpty>
                              <CommandGroup>
                                {quickFoods.map(food => (
                                  <CommandItem
                                    key={food.id}
                                    value={food.name}
                                    onSelect={() => {
                                      field.onChange(food.id);
                                      setQuickFoodPopoverOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        food.id === field.value ? 'opacity-100' : 'opacity-0'
                                      )}
                                    />
                                    <div className="flex-1">
                                      <p className="font-medium">{food.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {food.protein}g protein • {food.kcal} kcal
                                      </p>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={quickFoodForm.control}
                    name="meal_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meal Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mealTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={quickFoodForm.control}
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

                {selectedQuickFood && (
                  <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      Nutrition for {quickFoodForm.watch('servings')} serving(s)
                    </p>
                    <div className="flex gap-4">
                      <span className="text-sm font-medium text-protein">
                        {(selectedQuickFood.protein * quickFoodForm.watch('servings')).toFixed(1)}g protein
                      </span>
                      <span className="text-sm font-medium text-kcal">
                        {(selectedQuickFood.kcal * quickFoodForm.watch('servings')).toFixed(0)} kcal
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || quickFoods.length === 0}>
                    Add to Plan
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* Custom Tab */}
          <TabsContent value="custom">
            <Form {...customForm}>
              <form onSubmit={customForm.handleSubmit(handleCustomSubmit)} className="space-y-4">
                <FormField
                  control={customForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Pizza from Joe's" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={customForm.control}
                    name="custom_kcal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calories (kcal)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={customForm.control}
                    name="custom_protein"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Protein (g)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={customForm.control}
                  name="meal_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mealTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <p className="text-xs text-muted-foreground">
                  Use this for one-time meals where you want to quickly log nutrition values without creating a recipe.
                </p>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    Add to Plan
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
