import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChefHat,
  CalendarDays,
  Leaf,
  LayoutGrid,
  Dumbbell,
  User,
  Utensils,
  Ruler,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import nutrify from "@/assets/nutrify-logo.png";

interface AppLayoutProps {
  children: ReactNode;
}

const mealsSubItems = [
  { href: "/meal-plans", label: "Planner", icon: CalendarDays },
  { href: "/recipes", label: "Recipes", icon: ChefHat },
  { href: "/ingredients", label: "Ingredients", icon: Leaf },
  { href: "/quick-foods", label: "Quick Foods", icon: Zap },
];

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const NAV_HEIGHT = 64; // px
  // Some mobile browsers report safe-area-inset-bottom as 0 even with a home indicator.
  // Provide a fallback to keep labels from being clipped.
  const BOTTOM_INSET = "max(env(safe-area-inset-bottom), 28px)";

  const [showMealsSubmenu, setShowMealsSubmenu] = useState(false);

  const isMealsArea = ["/meal-plans", "/recipes", "/ingredients", "/quick-foods"].includes(
    location.pathname
  );
  const isOverviewActive = location.pathname === "/";
  const isWorkoutsActive = location.pathname === "/workouts";
  const isMeasurementsActive = location.pathname === "/weight";

  // Keep submenu open while in meals area
  useEffect(() => {
    setShowMealsSubmenu(isMealsArea);
  }, [isMealsArea]);

  const handleMealsClick = () => {
    navigate("/meal-plans");
    setShowMealsSubmenu(true);
  };

  return (
    <div className="min-h-screen h-[100dvh] bg-background flex flex-col">
      {/* Scroll container (prevents mobile browser chrome from nudging fixed UI) */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{
          paddingBottom: showMealsSubmenu
            ? `calc(${NAV_HEIGHT + 56}px + ${BOTTOM_INSET})`
            : `calc(${NAV_HEIGHT}px + ${BOTTOM_INSET})`,
        }}
      >
        {/* Header with safe area for notch */}
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background pt-[env(safe-area-inset-top)]">
          <div className="container flex h-14 items-center justify-between px-4">
            <Link to="/" className="flex items-center">
              <img
                src={nutrify}
                alt="Nutrify"
                className="h-10 w-10 rounded-full object-cover"
              />
            </Link>
            <Link
              to="/profile"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                location.pathname === "/profile"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              )}
            >
              <User className="h-5 w-5" />
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="container py-6">{children}</main>
      </div>

      {/* Meals Submenu (pinned above bottom nav) */}
      {showMealsSubmenu && (
        <div className="shrink-0 border-t border-border bg-background">
          <div className="container flex h-14 items-center justify-around">
            {mealsSubItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                  location.pathname === item.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Navigation (fully pinned; never scrolls) */}
      <nav
        className="shrink-0 border-t border-border bg-background"
        style={{
          height: `calc(${NAV_HEIGHT}px + ${BOTTOM_INSET})`,
          paddingBottom: BOTTOM_INSET,
        }}
      >
        <div
          className="container flex items-center justify-around"
          style={{ height: NAV_HEIGHT }}
        >
          {/* Meals */}
          <button
            onClick={handleMealsClick}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[72px]",
              isMealsArea
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Utensils className="h-5 w-5" />
            <span className="text-xs font-medium">Meals</span>
          </button>

          {/* Workout */}
          <Link
            to="/workouts"
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[72px]",
              isWorkoutsActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Dumbbell className="h-5 w-5" />
            <span className="text-xs font-medium">Workout</span>
          </Link>

          {/* Measurements */}
          <Link
            to="/weight"
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[72px]",
              isMeasurementsActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Ruler className="h-5 w-5" />
            <span className="text-xs font-medium">Measurements</span>
          </Link>

          {/* Overview */}
          <Link
            to="/"
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[72px]",
              isOverviewActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-5 w-5" />
            <span className="text-xs font-medium">Overview</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
