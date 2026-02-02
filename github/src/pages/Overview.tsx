import { useState } from 'react';
import { format, subDays, subMonths, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scale, Dumbbell, Utensils, LayoutGrid, TrendingDown, TrendingUp, Minus, Clock, Bike } from 'lucide-react';
import { useWeightLogs } from '@/hooks/useWeightLogs';
import { useWorkoutLogs } from '@/hooks/useWorkouts';
import { useWeeklyMealPlans } from '@/hooks/useMealPlans';
import { useProfile } from '@/hooks/useProfile';
import { TimeFrameSelector } from '@/components/overview/TimeFrameSelector';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export default function Overview() {
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'custom'>('week');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const { data: profile } = useProfile();

  const getDateRange = () => {
    const today = new Date();
    if (timeFrame === 'week') {
      return { start: format(subDays(today, 7), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') };
    } else if (timeFrame === 'month') {
      return { start: format(subMonths(today, 1), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') };
    }
    return { start: customDates.start, end: customDates.end };
  };

  const dateRange = getDateRange();
  const { data: weightLogs = [] } = useWeightLogs(dateRange.start, dateRange.end);
  const { data: workoutLogs = [] } = useWorkoutLogs(dateRange.start, dateRange.end);

  // For meal plans, use the weekly meal plans hook
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const { dayPlans: mealPlans = [] } = useWeeklyMealPlans(weekStart);

  // Weight stats
  const latestWeight = weightLogs[weightLogs.length - 1];
  const firstWeight = weightLogs[0];
  const weightChange = latestWeight && firstWeight ? latestWeight.weight_kg - firstWeight.weight_kg : 0;

  // Workout stats
  const totalWorkouts = workoutLogs.length;
  const totalDuration = workoutLogs.reduce((sum, l) => sum + l.duration_minutes, 0);
  const cardioDistance = workoutLogs
    .filter((l) => l.workout_type?.category === 'cardio')
    .reduce((sum, l) => sum + (l.distance_km || 0), 0);

  // Workout by type chart data
  const workoutByType = workoutLogs.reduce((acc, log) => {
    const typeName = log.workout_type?.name || 'Unknown';
    acc[typeName] = (acc[typeName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const workoutChartData = Object.entries(workoutByType).map(([name, count]) => ({
    name,
    count,
  }));

  // Meal stats
  const totalKcal = mealPlans.reduce((sum, day) => sum + day.totalKcal, 0);
  const totalProtein = mealPlans.reduce((sum, day) => sum + day.totalProtein, 0);

  // Weight chart data
  const weightChartData = weightLogs.map((log) => ({
    date: format(parseISO(log.log_date), 'MMM d'),
    weight: log.weight_kg,
    fatPercent: log.fat_percent,
  }));

  // Distance by cardio type
  const distanceByType = workoutLogs
    .filter((l) => l.workout_type?.category === 'cardio')
    .reduce((acc, log) => {
      const typeName = log.workout_type?.name || 'Unknown';
      acc[typeName] = (acc[typeName] || 0) + (log.distance_km || 0);
      return acc;
    }, {} as Record<string, number>);

  const distanceChartData = Object.entries(distanceByType).map(([name, distance]) => ({
    name,
    distance: Number(distance.toFixed(1)),
  }));

  const barColors = ['hsl(var(--cardio))', 'hsl(var(--strength))', 'hsl(var(--workout-other))', 'hsl(var(--primary))'];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Overview</h1>
            <p className="text-muted-foreground">Your fitness dashboard at a glance</p>
          </div>
          <TimeFrameSelector
            timeFrame={timeFrame}
            onTimeFrameChange={setTimeFrame}
            customDates={customDates}
            onCustomDatesChange={setCustomDates}
          />
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">All</span>
            </TabsTrigger>
            <TabsTrigger value="weight" className="gap-2">
              <Scale className="h-4 w-4" />
              <span className="hidden sm:inline">Weight</span>
            </TabsTrigger>
            <TabsTrigger value="workouts" className="gap-2">
              <Dumbbell className="h-4 w-4" />
              <span className="hidden sm:inline">Workouts</span>
            </TabsTrigger>
            <TabsTrigger value="meals" className="gap-2">
              <Utensils className="h-4 w-4" />
              <span className="hidden sm:inline">Meals</span>
            </TabsTrigger>
          </TabsList>

          {/* All Overview */}
          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="stat-card">
                <CardContent className="pt-4 text-center">
                  <Scale className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{latestWeight?.weight_kg || '-'}</p>
                  <p className="text-xs text-muted-foreground">Current kg</p>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardContent className="pt-4 text-center">
                  <Dumbbell className="h-5 w-5 mx-auto mb-2 text-strength" />
                  <p className="text-2xl font-bold">{totalWorkouts}</p>
                  <p className="text-xs text-muted-foreground">Workouts</p>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardContent className="pt-4 text-center">
                  <div className="h-5 w-5 mx-auto mb-2 rounded-full bg-kcal flex items-center justify-center text-kcal-foreground text-xs font-bold">K</div>
                  <p className="text-2xl font-bold">{totalKcal.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">kcal this week</p>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardContent className="pt-4 text-center">
                  <div className="h-5 w-5 mx-auto mb-2 rounded-full bg-protein flex items-center justify-center text-protein-foreground text-xs font-bold">P</div>
                  <p className="text-2xl font-bold">{totalProtein.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">g protein this week</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-base">Weight Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  {weightChartData.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-muted-foreground">No weight data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={weightChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                        <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-base">Workouts by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  {workoutChartData.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-muted-foreground">No workout data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={workoutChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {workoutChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Weight Tab */}
          <TabsContent value="weight" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="stat-card">
                <CardContent className="pt-4 text-center">
                  <Scale className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{latestWeight?.weight_kg || '-'}</p>
                  <p className="text-xs text-muted-foreground">Current kg</p>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardContent className="pt-4 text-center">
                  {weightChange < 0 ? (
                    <TrendingDown className="h-5 w-5 mx-auto mb-2 text-success" />
                  ) : weightChange > 0 ? (
                    <TrendingUp className="h-5 w-5 mx-auto mb-2 text-destructive" />
                  ) : (
                    <Minus className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                  )}
                  <p className={`text-2xl font-bold ${weightChange < 0 ? 'text-success' : weightChange > 0 ? 'text-destructive' : ''}`}>
                    {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">kg change</p>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-accent">{latestWeight?.fat_percent || '-'}</p>
                  <p className="text-xs text-muted-foreground">Current fat %</p>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-muted-foreground">{profile?.goal_weight_kg || '-'}</p>
                  <p className="text-xs text-muted-foreground">Goal kg</p>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Weight & Body Fat Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {weightChartData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">No weight data</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weightChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis yAxisId="weight" orientation="left" domain={[80, 140]} className="text-xs" />
                      <YAxis yAxisId="fat" orientation="right" domain={[10, 35]} className="text-xs" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                      <Legend />
                      <Line yAxisId="weight" type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} name="Weight (kg)" />
                      <Line yAxisId="fat" type="monotone" dataKey="fatPercent" stroke="hsl(var(--accent))" strokeWidth={2} name="Fat %" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workouts Tab */}
          <TabsContent value="workouts" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="stat-card">
                <CardContent className="pt-4 text-center">
                  <Dumbbell className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{totalWorkouts}</p>
                  <p className="text-xs text-muted-foreground">Total Workouts</p>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardContent className="pt-4 text-center">
                  <Clock className="h-5 w-5 mx-auto mb-2 text-accent" />
                  <p className="text-2xl font-bold">{totalDuration}</p>
                  <p className="text-xs text-muted-foreground">Total Minutes</p>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardContent className="pt-4 text-center">
                  <Bike className="h-5 w-5 mx-auto mb-2 text-cardio" />
                  <p className="text-2xl font-bold">{cardioDistance.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">km Cardio</p>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardContent className="pt-4 text-center">
                  <Dumbbell className="h-5 w-5 mx-auto mb-2 text-strength" />
                  <p className="text-2xl font-bold">
                    {workoutLogs.filter((l) => l.workout_type?.category === 'strength').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Strength Sessions</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Workouts by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  {workoutChartData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">No workout data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={workoutChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {workoutChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Distance by Cardio Type</CardTitle>
                </CardHeader>
                <CardContent>
                  {distanceChartData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">No cardio data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={distanceChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" unit="km" />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                        <Bar dataKey="distance" fill="hsl(var(--cardio))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Meals Tab */}
          <TabsContent value="meals" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="stat-card">
                <CardContent className="pt-4 text-center">
                  <div className="h-5 w-5 mx-auto mb-2 rounded-full bg-kcal flex items-center justify-center text-kcal-foreground text-xs font-bold">K</div>
                  <p className="text-2xl font-bold">{totalKcal.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total kcal</p>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardContent className="pt-4 text-center">
                  <div className="h-5 w-5 mx-auto mb-2 rounded-full bg-protein flex items-center justify-center text-protein-foreground text-xs font-bold">P</div>
                  <p className="text-2xl font-bold">{totalProtein.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Total protein (g)</p>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-muted-foreground">{profile?.daily_kcal_goal ? (profile.daily_kcal_goal * 7).toLocaleString() : '-'}</p>
                  <p className="text-xs text-muted-foreground">Weekly kcal goal</p>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-muted-foreground">{profile?.daily_protein_goal ? (profile.daily_protein_goal * 7).toFixed(0) : '-'}</p>
                  <p className="text-xs text-muted-foreground">Weekly protein goal (g)</p>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Daily Nutrition This Week</CardTitle>
              </CardHeader>
              <CardContent>
                {mealPlans.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">No meal data</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mealPlans.map((day) => ({
                      date: format(parseISO(day.date), 'EEE'),
                      kcal: day.totalKcal,
                      protein: day.totalProtein,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis yAxisId="kcal" orientation="left" className="text-xs" />
                      <YAxis yAxisId="protein" orientation="right" className="text-xs" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                      <Legend />
                      <Bar yAxisId="kcal" dataKey="kcal" fill="hsl(var(--kcal))" radius={[4, 4, 0, 0]} name="Calories" />
                      <Bar yAxisId="protein" dataKey="protein" fill="hsl(var(--protein))" radius={[4, 4, 0, 0]} name="Protein (g)" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
