import { useState } from 'react';
import { format, addWeeks, subWeeks, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, CalendarDays, Repeat } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MealPlanCard } from '@/components/meal-plans/MealPlanCard';
import { AddMealDialog } from '@/components/meal-plans/AddMealDialog';
import { RecurringMealsDialog } from '@/components/meal-plans/RecurringMealsDialog';
import { WeeklyOverview } from '@/components/meal-plans/WeeklyOverview';
import { Button } from '@/components/ui/button';
import { useWeeklyMealPlans, useCreateMealPlan, useDeleteMealPlan, useSkipRecurringMeal } from '@/hooks/useMealPlans';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function MealPlansPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { dayPlans, isLoading } = useWeeklyMealPlans(currentWeek);
  const createMutation = useCreateMealPlan();
  const deleteMutation = useDeleteMealPlan();
  const skipRecurringMutation = useSkipRecurringMeal();

  const handlePrevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const handleNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const handleToday = () => setCurrentWeek(new Date());

  const handleAddMeal = (date: Date) => {
    setSelectedDate(date);
    setDialogOpen(true);
  };

  const handleSubmit = (data: {
    recipe_id?: string | null;
    quick_food_id?: string | null;
    custom_kcal?: number | null;
    custom_protein?: number | null;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    servings: number;
    plan_date: string;
    name: string;
  }) => {
    createMutation.mutate({
      recipe_id: data.recipe_id || null,
      quick_food_id: data.quick_food_id || null,
      custom_kcal: data.custom_kcal || null,
      custom_protein: data.custom_protein || null,
      meal_type: data.meal_type,
      servings: data.servings,
      plan_date: data.plan_date,
      name: data.name,
    }, {
      onSuccess: () => setDialogOpen(false),
    });
  };

  const handleDeleteMeal = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleSkipRecurringMeal = (recurringMealId: string, date: string) => {
    skipRecurringMutation.mutate({ recurringMealId, date });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Meal Plans</h1>
            <p className="text-muted-foreground mt-1">
              Plan your daily and weekly meals
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setRecurringDialogOpen(true)}>
              <Repeat className="h-4 w-4 mr-2" />
              Standard Meals
            </Button>
            <Button variant="outline" size="icon" onClick={handlePrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Weekly Calendar */}
          <div className="lg:col-span-2 space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            ) : (
              dayPlans.map(day => {
                const date = parseISO(day.date);
                const today = isToday(date);

                return (
                  <div
                    key={day.date}
                    className={cn(
                      'rounded-xl border border-border/50 bg-card overflow-hidden animate-fade-in',
                      today && 'ring-2 ring-primary'
                    )}
                  >
                    <div className={cn(
                      'flex items-center justify-between p-4 border-b border-border/50',
                      today ? 'bg-primary/10' : 'bg-muted/30'
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-lg',
                          today ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        )}>
                          <CalendarDays className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{format(date, 'EEEE')}</p>
                          <p className="text-sm text-muted-foreground">{format(date, 'MMMM d, yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-medium text-protein">{day.totalProtein.toFixed(1)}g protein</p>
                          <p className="text-sm font-medium text-kcal">{day.totalKcal.toFixed(0)} kcal</p>
                        </div>
                        <Button size="sm" onClick={() => handleAddMeal(date)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>

                    <div className="p-4">
                      {day.meals.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          No meals planned for this day
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {day.meals.map(meal => (
                            <MealPlanCard
                              key={meal.id}
                              meal={meal}
                              onDelete={handleDeleteMeal}
                              onSkipRecurring={handleSkipRecurringMeal}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Mobile nutrition summary */}
                    {day.meals.length > 0 && (
                      <div className="sm:hidden border-t border-border/50 p-3 bg-muted/30 flex justify-center gap-4">
                        <span className="text-sm font-medium text-protein">{day.totalProtein.toFixed(1)}g protein</span>
                        <span className="text-sm font-medium text-kcal">{day.totalKcal.toFixed(0)} kcal</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Weekly Overview Sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {!isLoading && <WeeklyOverview dayPlans={dayPlans} />}
          </div>
        </div>
      </div>

      <AddMealDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        date={selectedDate}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />

      <RecurringMealsDialog
        open={recurringDialogOpen}
        onOpenChange={setRecurringDialogOpen}
      />
    </AppLayout>
  );
}
