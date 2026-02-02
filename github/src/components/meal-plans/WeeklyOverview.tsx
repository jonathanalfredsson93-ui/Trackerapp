import { DayMealPlan } from '@/types';
import { format, isToday, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { TrendingUp, Flame } from 'lucide-react';

interface WeeklyOverviewProps {
  dayPlans: DayMealPlan[];
}

export function WeeklyOverview({ dayPlans }: WeeklyOverviewProps) {
  const totalWeeklyProtein = dayPlans.reduce((sum, day) => sum + day.totalProtein, 0);
  const totalWeeklyKcal = dayPlans.reduce((sum, day) => sum + day.totalKcal, 0);
  const avgDailyProtein = totalWeeklyProtein / 7;
  const avgDailyKcal = totalWeeklyKcal / 7;

  return (
    <div className="rounded-xl border border-border/50 bg-card p-6 animate-fade-in">
      <h3 className="font-display text-lg font-semibold mb-4">Weekly Overview</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-protein" />
            <span className="text-sm text-muted-foreground">Total Protein</span>
          </div>
          <p className="text-2xl font-bold text-protein">{totalWeeklyProtein.toFixed(0)}g</p>
          <p className="text-xs text-muted-foreground mt-1">~{avgDailyProtein.toFixed(0)}g/day avg</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-4 w-4 text-kcal" />
            <span className="text-sm text-muted-foreground">Total Calories</span>
          </div>
          <p className="text-2xl font-bold text-kcal">{totalWeeklyKcal.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground mt-1">~{avgDailyKcal.toFixed(0)} kcal/day avg</p>
        </div>
      </div>

      <div className="space-y-2">
        {dayPlans.map(day => {
          const date = parseISO(day.date);
          const hasData = day.meals.length > 0;
          
          return (
            <div
              key={day.date}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg transition-colors',
                isToday(date) ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'
              )}
            >
              <div className="w-16 shrink-0">
                <p className={cn(
                  'text-sm font-medium',
                  isToday(date) && 'text-primary'
                )}>
                  {format(date, 'EEE')}
                </p>
                <p className="text-xs text-muted-foreground">{format(date, 'MMM d')}</p>
              </div>
              
              <div className="flex-1 min-w-0">
                {hasData ? (
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-protein rounded-full transition-all"
                          style={{ width: `${Math.min((day.totalProtein / 150) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-protein mt-1">{day.totalProtein.toFixed(0)}g</p>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-kcal rounded-full transition-all"
                          style={{ width: `${Math.min((day.totalKcal / 2500) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-kcal mt-1">{day.totalKcal.toFixed(0)} kcal</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No meals planned</p>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground">
                {day.meals.length} meal{day.meals.length !== 1 ? 's' : ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
