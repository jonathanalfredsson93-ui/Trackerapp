import { useState } from 'react';
import { format, subDays, subMonths, parseISO } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scale, Plus, Trash2, Camera, ChevronDown, ChevronUp } from 'lucide-react';
import { useWeightLogs, useCreateWeightLog, useDeleteWeightLog } from '@/hooks/useWeightLogs';
import { useProfile } from '@/hooks/useProfile';
import { calculateBodyFatPercent } from '@/types/fitness';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TimeFrameSelector } from '@/components/overview/TimeFrameSelector';
import { ProgressPhotosSection } from '@/components/weight/ProgressPhotosSection';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function WeightTracking() {
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'custom'>('month');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

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
  const { data: logs = [], isLoading } = useWeightLogs(dateRange.start, dateRange.end);
  const createLog = useCreateWeightLog();
  const deleteLog = useDeleteWeightLog();

  const [formData, setFormData] = useState({
    log_date: format(new Date(), 'yyyy-MM-dd'),
    weight_kg: '',
    waist_cm: '',
    neck_cm: '',
    hip_cm: '',
  });

  const handleAddLog = async () => {
    if (!formData.weight_kg) {
      toast({ title: 'Please enter weight', variant: 'destructive' });
      return;
    }

    let fatPercent: number | null = null;
    if (profile?.gender && profile?.height_cm && formData.waist_cm && formData.neck_cm) {
      if (profile.gender === 'female' && !formData.hip_cm) {
        toast({ title: 'Hip measurement required for female body fat calculation', variant: 'destructive' });
        return;
      }
      fatPercent = calculateBodyFatPercent(
        profile.gender,
        parseFloat(formData.waist_cm),
        parseFloat(formData.neck_cm),
        profile.height_cm,
        formData.hip_cm ? parseFloat(formData.hip_cm) : undefined
      );
    }

    try {
      await createLog.mutateAsync({
        log_date: formData.log_date,
        weight_kg: parseFloat(formData.weight_kg),
        waist_cm: formData.waist_cm ? parseFloat(formData.waist_cm) : null,
        neck_cm: formData.neck_cm ? parseFloat(formData.neck_cm) : null,
        hip_cm: formData.hip_cm ? parseFloat(formData.hip_cm) : null,
        fat_percent: fatPercent,
      });
      toast({ title: 'Weight log added!' });
      setFormData({
        log_date: format(new Date(), 'yyyy-MM-dd'),
        weight_kg: '',
        waist_cm: '',
        neck_cm: '',
        hip_cm: '',
      });
      setDialogOpen(false);
    } catch (error) {
      toast({ title: 'Failed to add log', variant: 'destructive' });
    }
  };

  const chartData = logs.map((log) => ({
    date: format(parseISO(log.log_date), 'MMM d'),
    weight: log.weight_kg,
    fatPercent: log.fat_percent,
    waist: log.waist_cm,
  }));

  const latestLog = logs[logs.length - 1];
  const firstLog = logs[0];
  const weightChange = latestLog && firstLog ? latestLog.weight_kg - firstLog.weight_kg : 0;
  const fatChange = latestLog?.fat_percent && firstLog?.fat_percent 
    ? latestLog.fat_percent - firstLog.fat_percent 
    : null;
  const waistChange = latestLog?.waist_cm && firstLog?.waist_cm
    ? latestLog.waist_cm - firstLog.waist_cm
    : null;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Weight & Body Fat</h1>
            <p className="text-muted-foreground">Track your progress over time</p>
          </div>
          <div className="flex items-center gap-3">
            <TimeFrameSelector
              timeFrame={timeFrame}
              onTimeFrameChange={setTimeFrame}
              customDates={customDates}
              onCustomDatesChange={setCustomDates}
            />
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Weight & Measurements</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={formData.log_date}
                      onChange={(e) => setFormData({ ...formData, log_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Weight (kg) *</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 75.5"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    For body fat calculation (optional):
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Waist (cm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="cm"
                        value={formData.waist_cm}
                        onChange={(e) => setFormData({ ...formData, waist_cm: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Neck (cm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="cm"
                        value={formData.neck_cm}
                        onChange={(e) => setFormData({ ...formData, neck_cm: e.target.value })}
                      />
                    </div>
                  </div>
                  {profile?.gender === 'female' && (
                    <div className="space-y-2">
                      <Label>Hip (cm) *required for female</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="cm"
                        value={formData.hip_cm}
                        onChange={(e) => setFormData({ ...formData, hip_cm: e.target.value })}
                      />
                    </div>
                  )}
                  <Button onClick={handleAddLog} disabled={createLog.isPending} className="w-full">
                    {createLog.isPending ? 'Adding...' : 'Add Log'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="stat-card">
            <CardContent className="pt-4 text-center">
              <Scale className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{latestLog?.weight_kg || '-'}</p>
              <p className="text-xs text-muted-foreground">Current kg</p>
              {weightChange !== 0 && (
                <p className={`text-xs mt-1 ${weightChange < 0 ? 'text-success' : 'text-destructive'}`}>
                  {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-accent">{latestLog?.fat_percent || '-'}</p>
              <p className="text-xs text-muted-foreground">Current fat %</p>
              {fatChange !== null && (
                <p className={`text-xs mt-1 ${fatChange < 0 ? 'text-success' : 'text-destructive'}`}>
                  {fatChange > 0 ? '+' : ''}{fatChange.toFixed(1)}%
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-chart-3">{latestLog?.waist_cm || '-'}</p>
              <p className="text-xs text-muted-foreground">Waist cm</p>
              {waistChange !== null && (
                <p className={`text-xs mt-1 ${waistChange < 0 ? 'text-success' : 'text-destructive'}`}>
                  {waistChange > 0 ? '+' : ''}{waistChange.toFixed(1)} cm
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Progress Chart</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">Loading...</div>
            ) : chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis yAxisId="weight" orientation="left" domain={[80, 140]} className="text-xs" label={{ value: 'kg / cm', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="fat" orientation="right" domain={[10, 35]} className="text-xs" label={{ value: '%', angle: 90, position: 'insideRight' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Legend />
                  <Line yAxisId="weight" type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} name="Weight (kg)" dot={{ fill: 'hsl(var(--primary))' }} />
                  <Line yAxisId="fat" type="monotone" dataKey="fatPercent" stroke="hsl(var(--accent))" strokeWidth={2} name="Fat %" dot={{ fill: 'hsl(var(--accent))' }} />
                  <Line yAxisId="weight" type="monotone" dataKey="waist" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Waist (cm)" dot={{ fill: 'hsl(var(--chart-3))' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Log List */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No entries yet. Add your first one!</p>
            ) : (
              <div className="space-y-2">
                {[...logs].reverse().map((log) => (
                  <Collapsible
                    key={log.id}
                    open={expandedLogId === log.id}
                    onOpenChange={(open) => setExpandedLogId(open ? log.id : null)}
                  >
                    <div className="rounded-lg bg-secondary/50 overflow-hidden">
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="text-sm text-muted-foreground">{format(parseISO(log.log_date), 'MMM d, yyyy')}</span>
                          <span className="font-medium">{log.weight_kg} kg</span>
                          {log.waist_cm && <span className="text-chart-3">{log.waist_cm} cm</span>}
                          {log.fat_percent && <span className="text-accent">{log.fat_percent}%</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon">
                              {expandedLogId === log.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <Camera className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteLog.mutate(log.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <CollapsibleContent>
                        <div className="px-3 pb-3 border-t border-border/50 pt-3">
                          <ProgressPhotosSection
                            weightLogId={log.id}
                            logDate={log.log_date}
                          />
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
