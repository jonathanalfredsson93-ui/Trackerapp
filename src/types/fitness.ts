export interface UserProfile {
  id: string;
  name: string | null;
  gender: 'male' | 'female' | null;
  age: number | null;
  height_cm: number | null;
  goal_weight_kg: number | null;
  goal_fat_percent: number | null;
  daily_kcal_goal: number | null;
  daily_protein_goal: number | null;
  created_at: string;
  updated_at: string;
}

export interface WeightLog {
  id: string;
  log_date: string;
  weight_kg: number;
  waist_cm: number | null;
  neck_cm: number | null;
  hip_cm: number | null;
  fat_percent: number | null;
  created_at: string;
}

export type WorkoutCategory = 'cardio' | 'strength' | 'other';

export interface WorkoutType {
  id: string;
  name: string;
  category: WorkoutCategory;
  is_default: boolean;
  created_at: string;
}

export interface WorkoutPreset {
  id: string;
  workout_type_id: string;
  name: string;
  distance_km: number | null;
  duration_minutes: number | null;
  created_at: string;
  workout_type?: WorkoutType;
}

export interface WorkoutLog {
  id: string;
  workout_date: string;
  workout_type_id: string;
  workout_preset_id: string | null;
  distance_km: number | null;
  duration_minutes: number;
  notes: string | null;
  created_at: string;
  workout_type?: WorkoutType;
  workout_preset?: WorkoutPreset;
}

// US Navy body fat calculation
export function calculateBodyFatPercent(
  gender: 'male' | 'female',
  waistCm: number,
  neckCm: number,
  heightCm: number,
  hipCm?: number
): number {
  // Convert cm to inches for the US Navy formula
  const waist = waistCm / 2.54;
  const neck = neckCm / 2.54;
  const height = heightCm / 2.54;
  
  if (gender === 'male') {
    // Male formula: 86.010 × log10(waist - neck) - 70.041 × log10(height) + 36.76
    const bodyFat = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
    return Math.round(bodyFat * 10) / 10;
  } else {
    // Female formula: 163.205 × log10(waist + hip - neck) - 97.684 × log10(height) - 78.387
    if (!hipCm) return 0;
    const hip = hipCm / 2.54;
    const bodyFat = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
    return Math.round(bodyFat * 10) / 10;
  }
}
