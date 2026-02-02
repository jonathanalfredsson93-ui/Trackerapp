import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Heart, MapPin, Clock, Moon } from "lucide-react";
import { StepsHero } from "@/components/StepsHero";
import { MetricCard } from "@/components/MetricCard";
import { WeeklyChart } from "@/components/WeeklyChart";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { WorkoutLog } from "@/components/WorkoutLog";
import {
  healthConnectService,
  HealthData,
  WeeklySteps,
  Workout,
} from "@/services/healthConnect";

const STEP_GOAL = 10000;

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [weeklySteps, setWeeklySteps] = useState<WeeklySteps[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeHealthConnect();
  }, []);

  const initializeHealthConnect = async () => {
    setIsLoading(true);

    const available = await healthConnectService.checkAvailability();

    if (available) {
      const hasPermission = await healthConnectService.requestPermissions();
      setIsConnected(hasPermission);
    } else {
      // Running in web mode - still load mock data
      setIsConnected(false);
    }

    await fetchHealthData();
    setIsLoading(false);
  };

  const fetchHealthData = async () => {
    const [data, weekly, workoutData] = await Promise.all([
      healthConnectService.getTodayData(),
      healthConnectService.getWeeklySteps(),
      healthConnectService.getWorkouts(),
    ]);

    setHealthData(data);
    setWeeklySteps(weekly);
    setWorkouts(workoutData);
  };

  const handleConnect = async () => {
    const hasPermission = await healthConnectService.requestPermissions();
    setIsConnected(hasPermission);

    if (hasPermission) {
      await fetchHealthData();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center safe-area-inset">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-steps border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading health data...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-area-inset">
      <div className="container max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-foreground">Health Tracker</h1>
          <p className="text-muted-foreground text-sm">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </motion.header>

        {/* Connection Status */}
        <div className="mb-6">
          <ConnectionStatus
            isConnected={isConnected || !healthConnectService.isRunningNatively()}
            onConnect={handleConnect}
          />
          {!healthConnectService.isRunningNatively() && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              📱 Running in preview mode with sample data
            </p>
          )}
        </div>

        {healthData && (
          <>
            {/* Steps Hero */}
            <StepsHero steps={healthData.steps} goal={STEP_GOAL} />

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <MetricCard
                title="Calories"
                value={healthData.calories}
                unit="kcal"
                icon={Flame}
                variant="calories"
                delay={0.1}
              />
              <MetricCard
                title="Heart Rate"
                value={healthData.heartRate}
                unit="bpm"
                icon={Heart}
                variant="heart"
                subtitle="Resting"
                delay={0.2}
              />
              <MetricCard
                title="Distance"
                value={healthData.distance.toFixed(1)}
                unit="km"
                icon={MapPin}
                variant="distance"
                delay={0.3}
              />
              <MetricCard
                title="Active Time"
                value={healthData.activeMinutes}
                unit="min"
                icon={Clock}
                variant="steps"
                delay={0.4}
              />
            </div>

            {/* Weekly Chart */}
            <WeeklyChart data={weeklySteps} goal={STEP_GOAL} />

            {/* Sleep Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 p-5 rounded-2xl bg-card border border-sleep/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-sleep/20">
                    <Moon className="w-5 h-5 text-sleep" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Night</p>
                    <p className="text-2xl font-bold text-sleep">
                      {healthData.sleepHours}h
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Quality</p>
                  <p className="text-sm text-sleep font-medium">Good</p>
                </div>
              </div>
            </motion.div>

            {/* Workout Log */}
            <WorkoutLog workouts={workouts} />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;