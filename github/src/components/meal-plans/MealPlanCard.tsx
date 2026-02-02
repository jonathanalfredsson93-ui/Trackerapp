import { ChefHat, Trash2, Users, Repeat, X, Zap, Edit2 } from 'lucide-react';
import { MealPlan, MealType } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MealPlanCardProps {
  meal: MealPlan;
  onDelete: (id: string) => void;
  onSkipRecurring?: (recurringMealId: string, date: string) => void;
}

const mealTypeColors: Record<MealType, string> = {
  breakfast: 'bg-amber-100 text-amber-700 border-amber-200',
  lunch: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  dinner: 'bg-violet-100 text-violet-700 border-violet-200',
  snack: 'bg-rose-100 text-rose-700 border-rose-200',
};

export function MealPlanCard({ meal, onDelete, onSkipRecurring }: MealPlanCardProps) {
  // Calculate nutrition based on source (recipe, quick food, or custom)
  let protein = 0;
  let kcal = 0;
  let mealName = meal.name;
  let isQuickFood = false;
  let isCustomEntry = false;

  if (meal.recipe) {
    protein = (meal.recipe.protein_per_serving || 0) * meal.servings;
    kcal = (meal.recipe.kcal_per_serving || 0) * meal.servings;
    mealName = meal.recipe.name;
  } else if (meal.quick_food) {
    protein = meal.quick_food.protein * meal.servings;
    kcal = meal.quick_food.kcal * meal.servings;
    mealName = meal.quick_food.name;
    isQuickFood = true;
  } else if (meal.custom_protein !== null && meal.custom_kcal !== null) {
    protein = meal.custom_protein;
    kcal = meal.custom_kcal;
    isCustomEntry = true;
  }

  const isRecurring = meal.id.startsWith('recurring-');
  
  // Extract recurring meal id and date from the virtual id
  const handleSkip = () => {
    if (isRecurring && onSkipRecurring) {
      const parts = meal.id.split('-');
      // Format: recurring-{uuid}-{date}
      // UUID has 5 parts with dashes, so we need to reconstruct it
      const recurringMealId = parts.slice(1, 6).join('-');
      const date = parts.slice(6).join('-');
      onSkipRecurring(recurringMealId, date);
    }
  };

  const getIcon = () => {
    if (isRecurring) return <Repeat className="h-4 w-4" />;
    if (isQuickFood) return <Zap className="h-4 w-4" />;
    if (isCustomEntry) return <Edit2 className="h-4 w-4" />;
    return <ChefHat className="h-4 w-4" />;
  };

  const getIconBg = () => {
    if (isRecurring) return "bg-accent/10 text-accent";
    if (isQuickFood) return "bg-amber-500/10 text-amber-600";
    if (isCustomEntry) return "bg-purple-500/10 text-purple-600";
    return "bg-primary/10 text-primary";
  };

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3 transition-all hover:shadow-md animate-scale-in">
      <div className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
        getIconBg()
      )}>
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full border capitalize',
            mealTypeColors[meal.meal_type]
          )}>
            {meal.meal_type}
          </span>
          {isRecurring && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
              Weekly
            </span>
          )}
          {isQuickFood && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
              Quick
            </span>
          )}
          {isCustomEntry && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600">
              Custom
            </span>
          )}
          {!isCustomEntry && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{meal.servings}</span>
            </div>
          )}
        </div>
        <p className="font-medium text-sm mt-1 truncate">{mealName}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-protein font-medium">{protein.toFixed(1)}g protein</span>
          <span className="text-xs text-kcal font-medium">{kcal.toFixed(0)} kcal</span>
        </div>
      </div>

      {isRecurring ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={handleSkip}
          title="Skip this week"
        >
          <X className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
          onClick={() => onDelete(meal.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
