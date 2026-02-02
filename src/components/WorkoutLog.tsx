import { motion } from "framer-motion";
import { Dumbbell, Bike, PersonStanding, Waves, Heart, Timer } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Workout, WorkoutType } from "@/services/healthConnect";

interface WorkoutLogProps {
  workouts: Workout[];
}

const workoutIcons: Record<WorkoutType, React.ElementType> = {
  gym: Dumbbell,
  cycling: Bike,
  running: PersonStanding,
  swimming: Waves,
  cardio: Heart,
};

const workoutColors: Record<WorkoutType, string> = {
  gym: "hsl(var(--steps))",
  cycling: "hsl(var(--calories))",
  running: "hsl(var(--heart))",
  swimming: "hsl(var(--distance))",
  cardio: "hsl(var(--sleep))",
};

const formatDuration = (minutes: number) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export const WorkoutLog = ({ workouts }: WorkoutLogProps) => {
  const workoutTypes = [...new Set(workouts.map((w) => w.type))];
  
  const groupedWorkouts = workoutTypes.reduce((acc, type) => {
    acc[type] = workouts.filter((w) => w.type === type);
    return acc;
  }, {} as Record<WorkoutType, Workout[]>);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mt-6"
    >
      <h2 className="text-lg font-semibold text-foreground mb-4">Workout Log</h2>
      
      <Tabs defaultValue={workoutTypes[0]} className="w-full">
        <TabsList className="w-full bg-card border border-border/50 p-1 h-auto flex-wrap">
          {workoutTypes.map((type) => {
            const Icon = workoutIcons[type];
            return (
              <TabsTrigger
                key={type}
                value={type}
                className="flex-1 min-w-[80px] gap-1.5 capitalize data-[state=active]:bg-muted"
              >
                <Icon size={14} style={{ color: workoutColors[type] }} />
                <span className="text-xs">{type}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {workoutTypes.map((type) => (
          <TabsContent key={type} value={type} className="mt-4 space-y-3">
            {groupedWorkouts[type].map((workout, index) => {
              const Icon = workoutIcons[type];
              return (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-card border border-border/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${workoutColors[type]}20` }}
                      >
                        <Icon size={20} style={{ color: workoutColors[type] }} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{workout.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(workout.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Timer size={14} />
                        <span className="text-sm font-medium">
                          {formatDuration(workout.duration)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {workout.calories} kcal
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {groupedWorkouts[type].length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No {type} workouts logged yet
              </p>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  );
};
