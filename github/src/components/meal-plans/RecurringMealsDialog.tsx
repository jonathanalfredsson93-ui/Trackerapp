import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Repeat, Trash2 } from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRecipes } from '@/hooks/useRecipes';
import { useRecurringMeals, useCreateRecurringMeal, useDeleteRecurringMeal } from '@/hooks/useMealPlans';
import { MealType, RecurringMeal } from '@/types';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

const recurringMealSchema = z.object({
  day_of_week: z.coerce.number().min(0).max(6),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  recipe_id: z.string().min(1, 'Please select a recipe'),
  servings: z.coerce.number().min(1),
});

type RecurringMealFormData = z.infer<typeof recurringMealSchema>;

interface RecurringMealsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecurringMealsDialog({ open, onOpenChange }: RecurringMealsDialogProps) {
  const { data: recipes = [] } = useRecipes();
  const { data: recurringMeals = [] } = useRecurringMeals();
  const createMutation = useCreateRecurringMeal();
  const deleteMutation = useDeleteRecurringMeal();

  const form = useForm<RecurringMealFormData>({
    resolver: zodResolver(recurringMealSchema),
    defaultValues: {
      day_of_week: 1,
      meal_type: 'breakfast',
      recipe_id: '',
      servings: 1,
    },
  });

  const handleSubmit = (data: RecurringMealFormData) => {
    createMutation.mutate(
      {
        day_of_week: data.day_of_week,
        meal_type: data.meal_type as MealType,
        recipe_id: data.recipe_id,
        servings: data.servings,
        is_active: true,
      },
      {
        onSuccess: () => {
          form.reset();
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  // Group recurring meals by day
  const mealsByDay = DAYS_OF_WEEK.map(day => ({
    ...day,
    meals: recurringMeals.filter(rm => rm.day_of_week === day.value),
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Standard Weekly Meals
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Add new recurring meal form */}
            <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
              <h4 className="text-sm font-medium mb-4">Add Standard Meal</h4>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="day_of_week"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Day</FormLabel>
                          <Select
                            onValueChange={(v) => field.onChange(Number(v))}
                            value={String(field.value)}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select day" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DAYS_OF_WEEK.map(day => (
                                <SelectItem key={day.value} value={String(day.value)}>
                                  {day.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="meal_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meal Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {MEAL_TYPES.map(type => (
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
                  </div>

                  <FormField
                    control={form.control}
                    name="recipe_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipe</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a recipe" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {recipes.map(recipe => (
                              <SelectItem key={recipe.id} value={recipe.id}>
                                {recipe.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

                  <Button type="submit" disabled={createMutation.isPending} className="w-full">
                    Add Standard Meal
                  </Button>
                </form>
              </Form>
            </div>

            {/* List of existing recurring meals */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Current Standard Meals</h4>
              {recurringMeals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Repeat className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No standard meals set up yet.</p>
                  <p className="text-sm">Add meals above to automatically include them each week.</p>
                </div>
              ) : (
                mealsByDay
                  .filter(day => day.meals.length > 0)
                  .map(day => (
                    <div key={day.value} className="rounded-lg border border-border/50 overflow-hidden">
                      <div className="bg-muted/30 px-4 py-2 border-b border-border/50">
                        <h5 className="font-medium text-sm">{day.label}</h5>
                      </div>
                      <div className="divide-y divide-border/50">
                        {day.meals.map(meal => (
                          <div
                            key={meal.id}
                            className="flex items-center justify-between p-3 hover:bg-muted/20"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                                  {meal.meal_type}
                                </span>
                                <span className="font-medium text-sm truncate">
                                  {meal.recipe?.name || 'Unknown Recipe'}
                                </span>
                              </div>
                              {meal.recipe && (
                                <div className="flex gap-2 mt-1 text-xs">
                                  <span className="text-protein">
                                    {((meal.recipe.protein_per_serving || 0) * meal.servings).toFixed(1)}g protein
                                  </span>
                                  <span className="text-kcal">
                                    {((meal.recipe.kcal_per_serving || 0) * meal.servings).toFixed(0)} kcal
                                  </span>
                                  <span className="text-muted-foreground">
                                    ({meal.servings} serving{meal.servings > 1 ? 's' : ''})
                                  </span>
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(meal.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
