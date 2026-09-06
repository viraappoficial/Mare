/**
 * Tipos do domínio do app.
 *
 * Cada interface aqui corresponde a uma futura tabela no Supabase (Postgres).
 * Nesta etapa (mockup, sem backend) esses tipos são usados apenas para tipar
 * os dados mockados em `src/data/mockFernanda.ts`. Quando o Supabase entrar,
 * o formato de cada linha retornada pelas queries deve bater com estes tipos
 * (idealmente gerados via `supabase gen types typescript`).
 *
 * Mapeamento tipo -> tabela futura:
 *   Profile        -> profiles
 *   Goal           -> user_goals
 *   DailyLog       -> daily_logs
 *   Meal           -> meals
 *   MealLog        -> meal_logs
 *   Workout        -> workouts
 *   WorkoutLog     -> workout_logs
 *   Measurement    -> measurements
 *   WeightEntry    -> weight_logs
 *   WeeklySummary  -> weekly_summaries
 */

export type Sex = "feminino" | "masculino" | "outro";

export type ActivityLevel =
  | "sedentario"
  | "leve"
  | "moderado"
  | "ativo"
  | "muito_ativo";

/** Futura tabela: profiles (1:1 com auth.users) */
export interface Profile {
  id: string;
  name: string;
  age: number;
  heightCm: number;
  sex: Sex;
  avatarUrl?: string;
  createdAt: string;
}

/** Futura tabela: user_goals */
export interface Goal {
  id: string;
  profileId: string;
  startingWeightKg: number;
  currentWeightKg: number;
  activityMultiplier: number;
  deficitPercent: number;
  weeklyWorkoutTarget: number;
  calorieTarget: number;
  proteinTargetG: number;
  fatTargetG: number;
  carbTargetG: number;
  waterTargetMl: number;
  waterTargetTrainingDayMl: number;
  updatedAt: string;
}

export type TrainedStatus = "sim" | "nao" | "descanso_planejado" | null;

export type WorkoutFocus =
  | "inferiores"
  | "superiores"
  | "full_body"
  | "cardio"
  | "misto";

/** Futura tabela: daily_logs (registro rápido do dia, tela "Hoje") */
export interface DailyLog {
  id: string;
  profileId: string;
  date: string; // YYYY-MM-DD
  trained: TrainedStatus;
  workoutFocus?: WorkoutFocus;
  workoutMinutes?: number;
  waterMl: number;
  weightKg?: number;
  caloriesConsumed?: number;
  note?: string;
  createdAt: string;
}

/** Futura tabela: meals (itens do plano alimentar sugerido) */
export interface Meal {
  id: string;
  time: string; // HH:mm
  title: string;
  items: string[];
  approxCalories?: number;
  approxProteinG?: number;
  optional?: boolean;
}

/** Futura tabela: meal_logs (o que a Fernanda de fato registrou comendo) */
export interface MealLog {
  id: string;
  profileId: string;
  date: string;
  mealId?: string;
  description: string;
  calories?: number;
  proteinG?: number;
  createdAt: string;
}

export type WorkoutDayStatus = "feito" | "faltou" | "descanso" | "pendente";

/** Futura tabela: workouts (plano/catálogo de treinos) */
export interface Workout {
  id: string;
  focus: WorkoutFocus;
  title: string;
  exercises?: string[];
}

/** Futura tabela: workout_logs (histórico real por dia da semana) */
export interface WorkoutLog {
  id: string;
  profileId: string;
  date: string;
  weekday: "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";
  status: WorkoutDayStatus;
  focus?: WorkoutFocus;
  durationMinutes?: number;
}

/** Futura tabela: measurements (medidas corporais) */
export interface Measurement {
  id: string;
  profileId: string;
  date: string;
  waistCm?: number;
  hipCm?: number;
  thighCm?: number;
  armCm?: number;
}

/** Futura tabela: weight_logs */
export interface WeightEntry {
  id: string;
  profileId: string;
  date: string;
  weightKg: number;
  label?: string;
}

/** Futura tabela: weekly_summaries (agregado calculado, hoje mockado) */
export interface WeeklySummary {
  id: string;
  profileId: string;
  weekStart: string;
  workoutsCompleted: number;
  workoutsTarget: number;
  daysLogged: number;
  adherencePercent: number;
  avgCaloriesLogged: number;
  estimatedDeficit: number;
  theoreticalLossKg: number;
  avgWeightKg: number;
  actualWeightChangeKg: number;
}

/** Alimento usado no banco de trocas da tela Alimentação */
export interface FoodSwapItem {
  id: string;
  name: string;
  portion: string;
}

export interface FoodSwapGroup {
  id: string;
  label: string;
  items: FoodSwapItem[];
}

/** Ponto de dado calculado exibido no card de progresso / gráfico */
export interface CalculatedMetrics {
  bmi: number;
  bmr: number;
  tdee: number;
  calorieTarget: number;
  proteinTargetG: number;
  fatTargetG: number;
  carbTargetG: number;
  waterTargetMl: number;
  waterTargetTrainingDayMl: number;
}
