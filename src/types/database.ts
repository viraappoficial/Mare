/**
 * Tipos gerados a partir do schema real do Supabase (projeto "Taverna",
 * usado como banco da Fernanda Fit). Gerado via
 * `mcp__Supabase__generate_typescript_types` — regenere sempre que o schema
 * mudar (nova migration em vez de editar este arquivo à mão).
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      daily_logs: {
        Row: {
          calories_consumed: number | null
          cardio_minutes: number
          created_at: string
          date: string
          id: string
          note: string | null
          profile_id: string
          trained: string | null
          water_ml: number
          weight_kg: number | null
          workout_focus: string | null
          workout_minutes: number | null
        }
        Insert: {
          calories_consumed?: number | null
          cardio_minutes?: number
          created_at?: string
          date: string
          id?: string
          note?: string | null
          profile_id: string
          trained?: string | null
          water_ml?: number
          weight_kg?: number | null
          workout_focus?: string | null
          workout_minutes?: number | null
        }
        Update: {
          calories_consumed?: number | null
          cardio_minutes?: number
          created_at?: string
          date?: string
          id?: string
          note?: string | null
          profile_id?: string
          trained?: string | null
          water_ml?: number
          weight_kg?: number | null
          workout_focus?: string | null
          workout_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      foods: {
        Row: {
          calories_per_100g: number
          carbs_per_100g: number | null
          category: string
          default_grams: number
          fat_per_100g: number | null
          id: string
          name: string
          profile_id: string | null
          protein_per_100g: number
        }
        Insert: {
          calories_per_100g: number
          carbs_per_100g?: number | null
          category: string
          default_grams?: number
          fat_per_100g?: number | null
          id?: string
          name: string
          profile_id?: string | null
          protein_per_100g: number
        }
        Update: {
          calories_per_100g?: number
          carbs_per_100g?: number | null
          category?: string
          default_grams?: number
          fat_per_100g?: number | null
          id?: string
          name?: string
          profile_id?: string | null
          protein_per_100g?: number
        }
        Relationships: [
          {
            foreignKeyName: "foods_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_logs: {
        Row: {
          calories: number | null
          created_at: string
          date: string
          description: string
          food_id: string | null
          id: string
          meal_id: string | null
          profile_id: string
          protein_g: number | null
          quantity: number
        }
        Insert: {
          calories?: number | null
          created_at?: string
          date: string
          description: string
          food_id?: string | null
          id?: string
          meal_id?: string | null
          profile_id: string
          protein_g?: number | null
          quantity?: number
        }
        Update: {
          calories?: number | null
          created_at?: string
          date?: string
          description?: string
          food_id?: string | null
          id?: string
          meal_id?: string | null
          profile_id?: string
          protein_g?: number | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_logs_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_logs_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          approx_calories: number | null
          approx_protein_g: number | null
          id: string
          items: string[]
          optional: boolean
          profile_id: string | null
          time: string
          title: string
        }
        Insert: {
          approx_calories?: number | null
          approx_protein_g?: number | null
          id?: string
          items?: string[]
          optional?: boolean
          profile_id?: string | null
          time: string
          title: string
        }
        Update: {
          approx_calories?: number | null
          approx_protein_g?: number | null
          id?: string
          items?: string[]
          optional?: boolean
          profile_id?: string | null
          time?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "meals_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      measurements: {
        Row: {
          arm_cm: number | null
          date: string
          hip_cm: number | null
          id: string
          profile_id: string
          thigh_cm: number | null
          waist_cm: number | null
        }
        Insert: {
          arm_cm?: number | null
          date: string
          hip_cm?: number | null
          id?: string
          profile_id: string
          thigh_cm?: number | null
          waist_cm?: number | null
        }
        Update: {
          arm_cm?: number | null
          date?: string
          hip_cm?: number | null
          id?: string
          profile_id?: string
          thigh_cm?: number | null
          waist_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "measurements_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number
          avatar_url: string | null
          created_at: string
          height_cm: number
          id: string
          name: string
          sex: string
        }
        Insert: {
          age: number
          avatar_url?: string | null
          created_at?: string
          height_cm: number
          id: string
          name: string
          sex: string
        }
        Update: {
          age?: number
          avatar_url?: string | null
          created_at?: string
          height_cm?: number
          id?: string
          name?: string
          sex?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          activity_multiplier: number
          calorie_target: number
          carb_target_g: number
          current_weight_kg: number
          deficit_percent: number
          fat_target_g: number
          id: string
          profile_id: string
          protein_target_g: number
          starting_weight_kg: number
          updated_at: string
          water_target_ml: number
          water_target_training_day_ml: number
          weekly_workout_target: number
        }
        Insert: {
          activity_multiplier: number
          calorie_target: number
          carb_target_g: number
          current_weight_kg: number
          deficit_percent: number
          fat_target_g: number
          id?: string
          profile_id: string
          protein_target_g: number
          starting_weight_kg: number
          updated_at?: string
          water_target_ml: number
          water_target_training_day_ml: number
          weekly_workout_target: number
        }
        Update: {
          activity_multiplier?: number
          calorie_target?: number
          carb_target_g?: number
          current_weight_kg?: number
          deficit_percent?: number
          fat_target_g?: number
          id?: string
          profile_id?: string
          protein_target_g?: number
          starting_weight_kg?: number
          updated_at?: string
          water_target_ml?: number
          water_target_training_day_ml?: number
          weekly_workout_target?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_goals_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_summaries: {
        Row: {
          actual_weight_change_kg: number | null
          adherence_percent: number
          avg_calories_logged: number | null
          avg_weight_kg: number | null
          days_logged: number
          estimated_deficit: number | null
          id: string
          profile_id: string
          theoretical_loss_kg: number | null
          week_start: string
          workouts_completed: number
          workouts_target: number
        }
        Insert: {
          actual_weight_change_kg?: number | null
          adherence_percent?: number
          avg_calories_logged?: number | null
          avg_weight_kg?: number | null
          days_logged?: number
          estimated_deficit?: number | null
          id?: string
          profile_id: string
          theoretical_loss_kg?: number | null
          week_start: string
          workouts_completed?: number
          workouts_target?: number
        }
        Update: {
          actual_weight_change_kg?: number | null
          adherence_percent?: number
          avg_calories_logged?: number | null
          avg_weight_kg?: number | null
          days_logged?: number
          estimated_deficit?: number | null
          id?: string
          profile_id?: string
          theoretical_loss_kg?: number | null
          week_start?: string
          workouts_completed?: number
          workouts_target?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_summaries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weight_logs: {
        Row: {
          date: string
          id: string
          label: string | null
          profile_id: string
          weight_kg: number
        }
        Insert: {
          date: string
          id?: string
          label?: string | null
          profile_id: string
          weight_kg: number
        }
        Update: {
          date?: string
          id?: string
          label?: string | null
          profile_id?: string
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "weight_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          date: string
          duration_minutes: number | null
          focus: string | null
          id: string
          profile_id: string
          status: string
          weekday: string
        }
        Insert: {
          date: string
          duration_minutes?: number | null
          focus?: string | null
          id?: string
          profile_id: string
          status: string
          weekday: string
        }
        Update: {
          date?: string
          duration_minutes?: number | null
          focus?: string | null
          id?: string
          profile_id?: string
          status?: string
          weekday?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          exercises: string[] | null
          focus: string
          id: string
          profile_id: string | null
          title: string
        }
        Insert: {
          exercises?: string[] | null
          focus: string
          id?: string
          profile_id?: string | null
          title: string
        }
        Update: {
          exercises?: string[] | null
          focus?: string
          id?: string
          profile_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
