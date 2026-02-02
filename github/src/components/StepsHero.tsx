import { motion } from "framer-motion";
import { ProgressRing } from "./ProgressRing";
import { Footprints } from "lucide-react";

interface StepsHeroProps {
  steps: number;
  goal: number;
}

export const StepsHero = ({ steps, goal }: StepsHeroProps) => {
  const progress = Math.min((steps / goal) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center py-8"
    >
      <ProgressRing
        progress={progress}
        size={200}
        strokeWidth={14}
        color="hsl(var(--steps))"
      >
        <div className="flex flex-col items-center">
          <Footprints className="w-8 h-8 text-steps mb-2" />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-bold text-foreground tracking-tight"
          >
            {steps.toLocaleString()}
          </motion.span>
          <span className="text-sm text-muted-foreground">steps</span>
        </div>
      </ProgressRing>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6 text-center"
      >
        <p className="text-muted-foreground">
          <span className="text-steps font-semibold">
            {Math.round(progress)}%
          </span>{" "}
          of your {goal.toLocaleString()} step goal
        </p>
        {steps >= goal && (
          <motion.p
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-active font-semibold mt-2"
          >
            🎉 Goal achieved!
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
};
