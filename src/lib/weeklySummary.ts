import { estimateTheoreticalLossKg } from "@/lib/calculations";
import type {
  DailyLogRow,
  GoalRow,
  MealLogRow,
  WeightLogRow,
  WorkoutLogRow,
} from "@/lib/queries";
import type { WeeklySummary } from "@/types";

/**
 * Calcula o resumo da semana ao vivo a partir dos registros brutos — não
 * depende da tabela `weekly_summaries` (reservada para snapshots futuros).
 */
export function computeWeeklySummary(
  goal: GoalRow,
  weekStart: string,
  weekDailyLogs: DailyLogRow[],
  weekWorkoutLogs: WorkoutLogRow[],
  weekWeightLogs: WeightLogRow[],
  weekMealLogs: MealLogRow[]
): WeeklySummary {
  const workoutsCompleted = weekWorkoutLogs.filter((w) => w.status === "feito").length;
  const daysLogged = weekDailyLogs.length;
  const adherencePercent = Math.round((daysLogged / 7) * 100);

  const caloriesByDay = new Map<string, number>();
  for (const log of weekMealLogs) {
    caloriesByDay.set(log.date, (caloriesByDay.get(log.date) ?? 0) + (log.calories ?? 0));
  }
  const dailyTotals = Array.from(caloriesByDay.values()).filter((v) => v > 0);
  const avgCaloriesLogged =
    dailyTotals.length > 0
      ? dailyTotals.reduce((a, b) => a + b, 0) / dailyTotals.length
      : 0;

  const tdee = goal.calorie_target / (1 - goal.deficit_percent / 100);
  const estimatedDeficit = avgCaloriesLogged > 0 ? tdee - avgCaloriesLogged : 0;
  const theoreticalLossKg = estimateTheoreticalLossKg(estimatedDeficit * 7);

  const weights = weekWeightLogs.map((w) => w.weight_kg);
  const avgWeightKg =
    weights.length > 0
      ? weights.reduce((a, b) => a + b, 0) / weights.length
      : goal.current_weight_kg;
  const actualWeightChangeKg =
    weights.length >= 2 ? weights[weights.length - 1] - weights[0] : 0;

  return {
    id: `live-${weekStart}`,
    profileId: goal.profile_id,
    weekStart,
    workoutsCompleted,
    workoutsTarget: goal.weekly_workout_target,
    daysLogged,
    adherencePercent,
    avgCaloriesLogged: Math.round(avgCaloriesLogged),
    estimatedDeficit: Math.round(estimatedDeficit),
    theoreticalLossKg,
    avgWeightKg,
    actualWeightChangeKg,
  };
}
