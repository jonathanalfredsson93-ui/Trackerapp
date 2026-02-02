import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  variant: "steps" | "calories" | "heart" | "distance";
  subtitle?: string;
  delay?: number;
}

export const MetricCard = ({
  title,
  value,
  unit,
  icon: Icon,
  variant,
  subtitle,
  delay = 0,
}: MetricCardProps) => {
  const variantStyles = {
    steps: "metric-card-steps text-steps",
    calories: "metric-card-calories text-calories",
    heart: "metric-card-heart text-heart",
    distance: "metric-card-distance text-distance",
  };

  const iconColors = {
    steps: "hsl(var(--steps))",
    calories: "hsl(var(--calories))",
    heart: "hsl(var(--heart))",
    distance: "hsl(var(--distance))",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`metric-card ${variantStyles[variant].split(" ")[0]}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={20} style={{ color: iconColors[variant] }} />
          <span className="text-sm text-muted-foreground font-medium">
            {title}
          </span>
        </div>
      </div>

      <div className="flex items-baseline gap-1">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
          className={`text-3xl font-bold tracking-tight ${variantStyles[variant].split(" ")[1]}`}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </motion.span>
        {unit && (
          <span className="text-sm text-muted-foreground font-medium">
            {unit}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
      )}
    </motion.div>
  );
};
