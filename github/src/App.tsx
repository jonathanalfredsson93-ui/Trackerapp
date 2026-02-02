import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Ingredients from "./pages/Ingredients";
import Recipes from "./pages/Recipes";
import MealPlans from "./pages/MealPlans";
import QuickFoods from "./pages/QuickFoods";
import Profile from "./pages/Profile";
import WeightTracking from "./pages/WeightTracking";
import Workouts from "./pages/Workouts";
import Overview from "./pages/Overview";
import NotFound from "./pages/NotFound";
import Workoutsi from "./pages/Workoutsi";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/ingredients" element={<Ingredients />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/meal-plans" element={<MealPlans />} />
          <Route path="/quick-foods" element={<QuickFoods />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/weight" element={<WeightTracking />} />
          <Route path="/workouts" element={<Workoutsi />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
