import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Target, Utensils, Save } from 'lucide-react';
import { useProfile, useCreateOrUpdateProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useCreateOrUpdateProfile();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    gender: '' as 'male' | 'female' | '',
    age: '',
    height_cm: '',
    goal_weight_kg: '',
    goal_fat_percent: '',
    daily_kcal_goal: '',
    daily_protein_goal: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        gender: profile.gender || '',
        age: profile.age?.toString() || '',
        height_cm: profile.height_cm?.toString() || '',
        goal_weight_kg: profile.goal_weight_kg?.toString() || '',
        goal_fat_percent: profile.goal_fat_percent?.toString() || '',
        daily_kcal_goal: profile.daily_kcal_goal?.toString() || '',
        daily_protein_goal: profile.daily_protein_goal?.toString() || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        id: profile?.id,
        name: formData.name || null,
        gender: formData.gender || null,
        age: formData.age ? parseInt(formData.age) : null,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        goal_weight_kg: formData.goal_weight_kg ? parseFloat(formData.goal_weight_kg) : null,
        goal_fat_percent: formData.goal_fat_percent ? parseFloat(formData.goal_fat_percent) : null,
        daily_kcal_goal: formData.daily_kcal_goal ? parseFloat(formData.daily_kcal_goal) : null,
        daily_protein_goal: formData.daily_protein_goal ? parseFloat(formData.daily_protein_goal) : null,
      });
      toast({ title: 'Profile saved successfully!' });
    } catch (error) {
      toast({ title: 'Failed to save profile', variant: 'destructive' });
    }
  };

  const weeklyKcal = formData.daily_kcal_goal ? parseFloat(formData.daily_kcal_goal) * 7 : 0;
  const weeklyProtein = formData.daily_protein_goal ? parseFloat(formData.daily_protein_goal) * 7 : 0;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading profile...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl font-bold text-foreground">Your Profile</h1>
          <p className="text-muted-foreground">Set up your personal info, goals, and targets</p>
        </div>

        {/* Personal Info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
            <CardDescription>Basic info used for body fat calculations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value: 'male' | 'female') => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Years"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="cm"
                  value={formData.height_cm}
                  onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              Body Goals
            </CardTitle>
            <CardDescription>Track progress toward your target weight and body fat</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goalWeight">Goal Weight (kg)</Label>
                <Input
                  id="goalWeight"
                  type="number"
                  step="0.1"
                  placeholder="kg"
                  value={formData.goal_weight_kg}
                  onChange={(e) => setFormData({ ...formData, goal_weight_kg: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goalFat">Goal Body Fat (%)</Label>
                <Input
                  id="goalFat"
                  type="number"
                  step="0.1"
                  placeholder="%"
                  value={formData.goal_fat_percent}
                  onChange={(e) => setFormData({ ...formData, goal_fat_percent: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Goals */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-kcal" />
              Nutrition Goals
            </CardTitle>
            <CardDescription>Daily targets (weekly goals calculated automatically)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dailyKcal">Daily Calories (kcal)</Label>
                <Input
                  id="dailyKcal"
                  type="number"
                  placeholder="kcal"
                  value={formData.daily_kcal_goal}
                  onChange={(e) => setFormData({ ...formData, daily_kcal_goal: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dailyProtein">Daily Protein (g)</Label>
                <Input
                  id="dailyProtein"
                  type="number"
                  placeholder="g"
                  value={formData.daily_protein_goal}
                  onChange={(e) => setFormData({ ...formData, daily_protein_goal: e.target.value })}
                />
              </div>
            </div>
            {(weeklyKcal > 0 || weeklyProtein > 0) && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Weekly Goals (calculated)</p>
                <div className="flex gap-4">
                  <div className="stat-card flex-1 text-center">
                    <p className="text-2xl font-bold text-kcal">{weeklyKcal.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">kcal/week</p>
                  </div>
                  <div className="stat-card flex-1 text-center">
                    <p className="text-2xl font-bold text-protein">{weeklyProtein.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">g protein/week</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={updateProfile.isPending} className="w-full" size="lg">
          <Save className="h-4 w-4 mr-2" />
          {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </AppLayout>
  );
}
