// Health Connect Service for Capacitor
// This service interfaces with Google Health Connect via a Capacitor plugin

export interface HealthData {
  steps: number;
  calories: number;
  distance: number; // in meters
  heartRate: number;
  activeMinutes: number;
  sleepHours: number;
}

export interface WeeklySteps {
  day: string;
  steps: number;
}

export type WorkoutType = "gym" | "cycling" | "running" | "swimming" | "cardio";

export interface Workout {
  id: string;
  type: WorkoutType;
  name: string;
  date: string;
  duration: number; // in minutes
  calories: number;
}

// Mock data for development/preview mode
const mockHealthData: HealthData = {
  steps: 8432,
  calories: 1847,
  distance: 6.2,
  heartRate: 72,
  activeMinutes: 45,
  sleepHours: 7.5,
};

const mockWeeklySteps: WeeklySteps[] = [
  { day: "Mon", steps: 6500 },
  { day: "Tue", steps: 8200 },
  { day: "Wed", steps: 4800 },
  { day: "Thu", steps: 9100 },
  { day: "Fri", steps: 7600 },
  { day: "Sat", steps: 11200 },
  { day: "Sun", steps: 8432 },
];

const mockWorkouts: Workout[] = [
  { id: "1", type: "gym", name: "Upper Body Strength", date: "2026-02-01", duration: 55, calories: 320 },
  { id: "2", type: "gym", name: "Leg Day", date: "2026-01-30", duration: 60, calories: 380 },
  { id: "3", type: "gym", name: "Full Body HIIT", date: "2026-01-28", duration: 45, calories: 420 },
  { id: "4", type: "cycling", name: "Morning Commute", date: "2026-02-02", duration: 25, calories: 180 },
  { id: "5", type: "cycling", name: "Weekend Ride", date: "2026-02-01", duration: 90, calories: 650 },
  { id: "6", type: "cycling", name: "Evening Spin", date: "2026-01-29", duration: 40, calories: 280 },
  { id: "7", type: "running", name: "5K Run", date: "2026-02-02", duration: 28, calories: 310 },
  { id: "8", type: "running", name: "Interval Training", date: "2026-01-31", duration: 35, calories: 390 },
  { id: "9", type: "swimming", name: "Lap Swimming", date: "2026-01-30", duration: 45, calories: 400 },
  { id: "10", type: "cardio", name: "Jump Rope Session", date: "2026-02-01", duration: 20, calories: 220 },
  { id: "11", type: "cardio", name: "Stair Climber", date: "2026-01-29", duration: 30, calories: 280 },
];

class HealthConnectService {
  private isNative: boolean = false;

  constructor() {
    // Check if running in Capacitor native environment
    this.isNative = typeof (window as any).Capacitor !== "undefined";
  }

  async checkAvailability(): Promise<boolean> {
    if (!this.isNative) {
      console.log("Running in web mode - using mock data");
      return false;
    }

    try {
      // In a real implementation, this would check Health Connect availability
      // const result = await HealthConnect.checkAvailability();
      return true;
    } catch (error) {
      console.error("Health Connect not available:", error);
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (!this.isNative) {
      console.log("Simulating permission grant in web mode");
      return true;
    }

    try {
      // In a real implementation, this would request Health Connect permissions
      // await HealthConnect.requestPermissions({
      //   read: ['Steps', 'HeartRate', 'Calories', 'Distance', 'SleepSession'],
      // });
      return true;
    } catch (error) {
      console.error("Failed to request permissions:", error);
      return false;
    }
  }

  async getTodayData(): Promise<HealthData> {
    if (!this.isNative) {
      // Return mock data with slight randomization for demo purposes
      return {
        ...mockHealthData,
        steps: mockHealthData.steps + Math.floor(Math.random() * 100),
        heartRate: mockHealthData.heartRate + Math.floor(Math.random() * 5) - 2,
      };
    }

    try {
      // In a real implementation, this would fetch from Health Connect
      // const steps = await HealthConnect.readSteps({ startDate, endDate });
      // const calories = await HealthConnect.readCalories({ startDate, endDate });
      // etc.
      return mockHealthData;
    } catch (error) {
      console.error("Failed to fetch health data:", error);
      return mockHealthData;
    }
  }

  async getWeeklySteps(): Promise<WeeklySteps[]> {
    if (!this.isNative) {
      return mockWeeklySteps;
    }

    try {
      // In a real implementation, this would aggregate weekly step data
      return mockWeeklySteps;
    } catch (error) {
      console.error("Failed to fetch weekly steps:", error);
      return mockWeeklySteps;
    }
  }

  async getWorkouts(): Promise<Workout[]> {
    if (!this.isNative) {
      return mockWorkouts;
    }

    try {
      // In a real implementation, this would fetch workouts from Health Connect
      return mockWorkouts;
    } catch (error) {
      console.error("Failed to fetch workouts:", error);
      return mockWorkouts;
    }
  }

  isRunningNatively(): boolean {
    return this.isNative;
  }
}

export const healthConnectService = new HealthConnectService();