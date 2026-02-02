export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      food_categories: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
        }
        Relationships: []
      }
      ingredients: {
        Row: {
          category_id: string | null
          created_at: string
          default_unit: string
          grams_per_unit: number
          id: string
          is_custom: boolean
          is_favorite: boolean
          kcal_per_100g: number
          kcal_per_unit: number
          name: string
          protein_per_100g: number
          protein_per_unit: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          default_unit?: string
          grams_per_unit?: number
          id?: string
          is_custom?: boolean
          is_favorite?: boolean
          kcal_per_100g?: number
          kcal_per_unit?: number
          name: string
          protein_per_100g?: number
          protein_per_unit?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          default_unit?: string
          grams_per_unit?: number
          id?: string
          is_custom?: boolean
          is_favorite?: boolean
          kcal_per_100g?: number
          kcal_per_unit?: number
          name?: string
          protein_per_100g?: number
          protein_per_unit?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "food_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string
          custom_kcal: number | null
          custom_protein: number | null
          id: string
          meal_type: string
          name: string
          plan_date: string
          quick_food_id: string | null
          recipe_id: string | null
          servings: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          custom_kcal?: number | null
          custom_protein?: number | null
          id?: string
          meal_type: string
          name: string
          plan_date: string
          quick_food_id?: string | null
          recipe_id?: string | null
          servings?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          custom_kcal?: number | null
          custom_protein?: number | null
          id?: string
          meal_type?: string
          name?: string
          plan_date?: string
          quick_food_id?: string | null
          recipe_id?: string | null
          servings?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_quick_food_id_fkey"
            columns: ["quick_food_id"]
            isOneToOne: false
            referencedRelation: "quick_foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plans_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_photos: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          storage_path: string
          weight_log_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          storage_path: string
          weight_log_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          storage_path?: string
          weight_log_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_photos_weight_log_id_fkey"
            columns: ["weight_log_id"]
            isOneToOne: false
            referencedRelation: "weight_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      quick_foods: {
        Row: {
          created_at: string
          id: string
          is_favorite: boolean
          kcal: number
          name: string
          protein: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_favorite?: boolean
          kcal?: number
          name: string
          protein?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_favorite?: boolean
          kcal?: number
          name?: string
          protein?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          created_at: string
          id: string
          ingredient_id: string
          quantity: number
          recipe_id: string
          unit_used: string
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_id: string
          quantity?: number
          recipe_id: string
          unit_used?: string
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_id?: string
          quantity?: number
          recipe_id?: string
          unit_used?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          servings: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          servings?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          servings?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      recurring_meal_exceptions: {
        Row: {
          created_at: string
          exception_date: string
          id: string
          recurring_meal_id: string
        }
        Insert: {
          created_at?: string
          exception_date: string
          id?: string
          recurring_meal_id: string
        }
        Update: {
          created_at?: string
          exception_date?: string
          id?: string
          recurring_meal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_meal_exceptions_recurring_meal_id_fkey"
            columns: ["recurring_meal_id"]
            isOneToOne: false
            referencedRelation: "recurring_meals"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_meals: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          is_active: boolean
          meal_type: string
          recipe_id: string
          servings: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          is_active?: boolean
          meal_type: string
          recipe_id: string
          servings?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          is_active?: boolean
          meal_type?: string
          recipe_id?: string
          servings?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_meals_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          age: number | null
          created_at: string
          daily_kcal_goal: number | null
          daily_protein_goal: number | null
          gender: string | null
          goal_fat_percent: number | null
          goal_weight_kg: number | null
          height_cm: number | null
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          created_at?: string
          daily_kcal_goal?: number | null
          daily_protein_goal?: number | null
          gender?: string | null
          goal_fat_percent?: number | null
          goal_weight_kg?: number | null
          height_cm?: number | null
          id?: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          created_at?: string
          daily_kcal_goal?: number | null
          daily_protein_goal?: number | null
          gender?: string | null
          goal_fat_percent?: number | null
          goal_weight_kg?: number | null
          height_cm?: number | null
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          created_at: string
          fat_percent: number | null
          hip_cm: number | null
          id: string
          log_date: string
          neck_cm: number | null
          waist_cm: number | null
          weight_kg: number
        }
        Insert: {
          created_at?: string
          fat_percent?: number | null
          hip_cm?: number | null
          id?: string
          log_date?: string
          neck_cm?: number | null
          waist_cm?: number | null
          weight_kg: number
        }
        Update: {
          created_at?: string
          fat_percent?: number | null
          hip_cm?: number | null
          id?: string
          log_date?: string
          neck_cm?: number | null
          waist_cm?: number | null
          weight_kg?: number
        }
        Relationships: []
      }
      workout_logs: {
        Row: {
          created_at: string
          distance_km: number | null
          duration_minutes: number
          id: string
          notes: string | null
          workout_date: string
          workout_preset_id: string | null
          workout_type_id: string
        }
        Insert: {
          created_at?: string
          distance_km?: number | null
          duration_minutes: number
          id?: string
          notes?: string | null
          workout_date?: string
          workout_preset_id?: string | null
          workout_type_id: string
        }
        Update: {
          created_at?: string
          distance_km?: number | null
          duration_minutes?: number
          id?: string
          notes?: string | null
          workout_date?: string
          workout_preset_id?: string | null
          workout_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_workout_preset_id_fkey"
            columns: ["workout_preset_id"]
            isOneToOne: false
            referencedRelation: "workout_presets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_workout_type_id_fkey"
            columns: ["workout_type_id"]
            isOneToOne: false
            referencedRelation: "workout_types"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_presets: {
        Row: {
          created_at: string
          distance_km: number | null
          duration_minutes: number | null
          id: string
          name: string
          workout_type_id: string
        }
        Insert: {
          created_at?: string
          distance_km?: number | null
          duration_minutes?: number | null
          id?: string
          name: string
          workout_type_id: string
        }
        Update: {
          created_at?: string
          distance_km?: number | null
          duration_minutes?: number | null
          id?: string
          name?: string
          workout_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_presets_workout_type_id_fkey"
            columns: ["workout_type_id"]
            isOneToOne: false
            referencedRelation: "workout_types"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_types: {
        Row: {
          category: string
          created_at: string
          id: string
          is_default: boolean
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
