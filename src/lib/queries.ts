/**
 * Camada de dados: funções tipadas por tabela, usadas pelas páginas para ler
 * e escrever no Supabase. Cada função assume que `supabase` já foi checado
 * como não-nulo pelo chamador.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { calculateBMR, calculateTDEE, calculateCalorieTarget, calculateProteinTarget, calculateFatTarget, calculateCarbTarget, calculateWaterTarget, calculateWaterTargetTrainingDay } from "@/lib/calculations";
import type { ActivityLevel, Sex, WeightEntry } from "@/types";

type TypedClient = SupabaseClient<Database>;

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type GoalRow = Database["public"]["Tables"]["user_goals"]["Row"];
export type DailyLogRow = Database["public"]["Tables"]["daily_logs"]["Row"];
export type WeightLogRow = Database["public"]["Tables"]["weight_logs"]["Row"];
export type MeasurementRow = Database["public"]["Tables"]["measurements"]["Row"];
export type MealRow = Database["public"]["Tables"]["meals"]["Row"];
export type MealLogRow = Database["public"]["Tables"]["meal_logs"]["Row"];
export type WorkoutLogRow = Database["public"]["Tables"]["workout_logs"]["Row"];
export type FoodRow = Database["public"]["Tables"]["foods"]["Row"];

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.45,
  ativo: 1.55,
  muito_ativo: 1.725,
};

/** Encontra o nível de atividade cujo multiplicador mais se aproxima do valor salvo */
export function activityLevelFromMultiplier(multiplier: number): ActivityLevel {
  let closest: ActivityLevel = "moderado";
  let smallestDiff = Infinity;
  for (const [level, value] of Object.entries(ACTIVITY_MULTIPLIERS) as [ActivityLevel, number][]) {
    const diff = Math.abs(value - multiplier);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closest = level;
    }
  }
  return closest;
}

export async function getProfile(db: TypedClient, userId: string) {
  const { data, error } = await db
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getGoal(db: TypedClient, profileId: string) {
  const { data, error } = await db
    .from("user_goals")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

interface OnboardingInput {
  userId: string;
  name: string;
  age: number;
  heightCm: number;
  sex: Sex;
  weightKg: number;
  activityLevel: ActivityLevel;
  deficitPercent: number;
  weeklyWorkoutTarget: number;
}

/** Calcula as metas a partir dos dados iniciais e cria profile + user_goals */
export async function createProfileAndGoal(db: TypedClient, input: OnboardingInput) {
  const activityMultiplier = ACTIVITY_MULTIPLIERS[input.activityLevel];
  const bmr = calculateBMR(input.weightKg, input.heightCm, input.age, input.sex);
  const tdee = calculateTDEE(bmr, activityMultiplier);
  const calorieTarget = calculateCalorieTarget(tdee, input.deficitPercent);
  const proteinTargetG = calculateProteinTarget(input.weightKg);
  const fatTargetG = calculateFatTarget(input.weightKg);
  const carbTargetG = calculateCarbTarget(calorieTarget, proteinTargetG, fatTargetG);
  const waterTargetMl = calculateWaterTarget(input.weightKg);
  const waterTargetTrainingDayMl = calculateWaterTargetTrainingDay(waterTargetMl);

  const { error: profileError } = await db.from("profiles").insert({
    id: input.userId,
    name: input.name,
    age: input.age,
    height_cm: input.heightCm,
    sex: input.sex,
  });
  if (profileError) throw profileError;

  const { error: goalError } = await db.from("user_goals").insert({
    profile_id: input.userId,
    starting_weight_kg: input.weightKg,
    current_weight_kg: input.weightKg,
    activity_multiplier: activityMultiplier,
    deficit_percent: input.deficitPercent,
    weekly_workout_target: input.weeklyWorkoutTarget,
    calorie_target: Math.round(calorieTarget),
    protein_target_g: proteinTargetG,
    fat_target_g: fatTargetG,
    carb_target_g: carbTargetG,
    water_target_ml: waterTargetMl,
    water_target_training_day_ml: waterTargetTrainingDayMl,
  });
  if (goalError) throw goalError;
}

export async function updateProfile(
  db: TypedClient,
  userId: string,
  patch: Partial<Pick<ProfileRow, "name" | "age" | "height_cm" | "sex">>
) {
  const { error } = await db.from("profiles").update(patch).eq("id", userId);
  if (error) throw error;
}

export async function updateGoal(
  db: TypedClient,
  profileId: string,
  patch: Partial<
    Pick<
      GoalRow,
      | "current_weight_kg"
      | "activity_multiplier"
      | "deficit_percent"
      | "weekly_workout_target"
      | "calorie_target"
      | "protein_target_g"
      | "fat_target_g"
      | "carb_target_g"
      | "water_target_ml"
      | "water_target_training_day_ml"
    >
  >
) {
  const { error } = await db
    .from("user_goals")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("profile_id", profileId);
  if (error) throw error;
}

export async function getDailyLog(db: TypedClient, profileId: string, date: string) {
  const { data, error } = await db
    .from("daily_logs")
    .select("*")
    .eq("profile_id", profileId)
    .eq("date", date)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getDailyLogsInRange(
  db: TypedClient,
  profileId: string,
  dates: string[]
) {
  const { data, error } = await db
    .from("daily_logs")
    .select("*")
    .eq("profile_id", profileId)
    .in("date", dates);
  if (error) throw error;
  return data;
}

export async function upsertDailyLog(
  db: TypedClient,
  profileId: string,
  date: string,
  patch: Partial<
    Pick<
      DailyLogRow,
      | "trained"
      | "workout_focus"
      | "workout_minutes"
      | "water_ml"
      | "weight_kg"
      | "calories_consumed"
      | "cardio_minutes"
      | "note"
    >
  >
) {
  const { data, error } = await db
    .from("daily_logs")
    .upsert(
      { profile_id: profileId, date, ...patch },
      { onConflict: "profile_id,date" }
    )
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function getWeightHistory(db: TypedClient, profileId: string, limit = 12) {
  const { data, error } = await db
    .from("weight_logs")
    .select("*")
    .eq("profile_id", profileId)
    .order("date", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data;
}

export function toWeightEntry(row: WeightLogRow): WeightEntry {
  return {
    id: row.id,
    profileId: row.profile_id,
    date: row.date,
    weightKg: row.weight_kg,
    label: row.label ?? undefined,
  };
}

export async function insertWeightLog(
  db: TypedClient,
  profileId: string,
  date: string,
  weightKg: number,
  label?: string
) {
  const { error } = await db
    .from("weight_logs")
    .upsert(
      { profile_id: profileId, date, weight_kg: weightKg, label },
      { onConflict: "profile_id,date" }
    );
  if (error) throw error;
}

export async function getMeasurementHistory(db: TypedClient, profileId: string) {
  const { data, error } = await db
    .from("measurements")
    .select("*")
    .eq("profile_id", profileId)
    .order("date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function insertMeasurement(
  db: TypedClient,
  profileId: string,
  date: string,
  patch: Partial<Pick<MeasurementRow, "waist_cm" | "hip_cm" | "thigh_cm" | "arm_cm">>
) {
  const { error } = await db
    .from("measurements")
    .insert({ profile_id: profileId, date, ...patch });
  if (error) throw error;
}

export async function getDefaultMeals(db: TypedClient) {
  const { data, error } = await db
    .from("meals")
    .select("*")
    .is("profile_id", null)
    .order("time", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getMealLogsForDate(db: TypedClient, profileId: string, date: string) {
  const { data, error } = await db
    .from("meal_logs")
    .select("*")
    .eq("profile_id", profileId)
    .eq("date", date)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getMealLogsInRange(
  db: TypedClient,
  profileId: string,
  dates: string[]
) {
  const { data, error } = await db
    .from("meal_logs")
    .select("*")
    .eq("profile_id", profileId)
    .in("date", dates);
  if (error) throw error;
  return data;
}

export async function insertMealLog(
  db: TypedClient,
  profileId: string,
  date: string,
  entry: { mealId?: string | null; description: string; calories?: number | null; proteinG?: number | null }
) {
  const { error } = await db.from("meal_logs").insert({
    profile_id: profileId,
    date,
    meal_id: entry.mealId ?? null,
    description: entry.description,
    calories: entry.calories ?? null,
    protein_g: entry.proteinG ?? null,
  });
  if (error) throw error;
}

export async function deleteMealLog(db: TypedClient, id: string) {
  const { error } = await db.from("meal_logs").delete().eq("id", id);
  if (error) throw error;
}

/** Banco de alimentos (padrão + próprios) usado pra montar o cardápio do dia */
export async function getFoods(db: TypedClient) {
  const { data, error } = await db
    .from("foods")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return data;
}

const foodCategoryLabels: Record<string, string> = {
  proteina: "Proteínas",
  carboidrato: "Carboidratos",
  outro: "Outros",
};

export function foodCategoryLabel(category: string) {
  return foodCategoryLabels[category] ?? category;
}

/** Calculadora: a partir do valor por 100g do alimento, calcula pra quantidade em gramas informada */
export function computeFoodNutrition(food: FoodRow, grams: number) {
  const factor = grams / 100;
  return {
    calories: Math.round(food.calories_per_100g * factor),
    proteinG: Math.round(food.protein_per_100g * factor * 10) / 10,
    carbsG: food.carbs_per_100g != null ? Math.round(food.carbs_per_100g * factor * 10) / 10 : null,
    fatG: food.fat_per_100g != null ? Math.round(food.fat_per_100g * factor * 10) / 10 : null,
  };
}

/** Registra um alimento do banco no cardápio de hoje, calculando as calorias pelos gramas informados */
export async function insertMealLogFromFood(
  db: TypedClient,
  profileId: string,
  date: string,
  food: FoodRow,
  grams: number
) {
  const { calories, proteinG } = computeFoodNutrition(food, grams);
  const { error } = await db.from("meal_logs").insert({
    profile_id: profileId,
    date,
    food_id: food.id,
    quantity: grams,
    description: `${food.name} (${grams} g)`,
    calories,
    protein_g: proteinG,
  });
  if (error) throw error;
}

/** Cria um alimento próprio (visível só pra quem criou) no banco de alimentos */
export async function insertCustomFood(
  db: TypedClient,
  profileId: string,
  input: {
    name: string;
    category: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g?: number | null;
    fatPer100g?: number | null;
    defaultGrams?: number;
  }
) {
  const { data, error } = await db
    .from("foods")
    .insert({
      profile_id: profileId,
      name: input.name,
      category: input.category,
      calories_per_100g: input.caloriesPer100g,
      protein_per_100g: input.proteinPer100g,
      carbs_per_100g: input.carbsPer100g ?? null,
      fat_per_100g: input.fatPer100g ?? null,
      default_grams: input.defaultGrams ?? 100,
      featured: true,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function getWorkoutLogsInRange(
  db: TypedClient,
  profileId: string,
  dates: string[]
) {
  const { data, error } = await db
    .from("workout_logs")
    .select("*")
    .eq("profile_id", profileId)
    .in("date", dates);
  if (error) throw error;
  return data;
}

export async function upsertWorkoutLog(
  db: TypedClient,
  profileId: string,
  date: string,
  patch: Pick<WorkoutLogRow, "weekday" | "status"> &
    Partial<Pick<WorkoutLogRow, "focus" | "duration_minutes">>
) {
  const { error } = await db
    .from("workout_logs")
    .upsert(
      { profile_id: profileId, date, ...patch },
      { onConflict: "profile_id,date" }
    );
  if (error) throw error;
}
