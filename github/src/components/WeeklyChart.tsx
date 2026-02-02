import { motion } from "framer-motion";

interface DayData {
  day: string;
  steps: number;
}

interface WeeklyChartProps {
  data: DayData[];
  goal: number;
}

export const WeeklyChart = ({ data, goal }: WeeklyChartProps) => {
  const maxSteps = Math.max(...data.map((d) => d.steps), goal);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="metric-card metric-card-steps"
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        This Week
      </h3>

      <div className="flex items-end justify-between gap-2 h-32">
        {data.map((day, index) => {
          const height = (day.steps / maxSteps) * 100;
          const isToday = index === data.length - 1;
          const reachedGoal = day.steps >= goal;

          return (
            <div
              key={day.day}
              className="flex flex-col items-center gap-2 flex-1"
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.8, delay: 0.1 * index }}
                className={`w-full rounded-t-lg min-h-[4px] ${
                  isToday
                    ? "bg-gradient-steps"
                    : reachedGoal
                    ? "bg-steps/70"
                    : "bg-steps/30"
                }`}
                style={{ maxWidth: "32px" }}
              />
              <span
                className={`text-xs ${
                  isToday ? "text-steps font-semibold" : "text-muted-foreground"
                }`}
              >
                {day.day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Goal line indicator */}
      <div className="relative mt-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-4 h-[2px] bg-steps/50" />
          <span>Goal: {goal.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
};
