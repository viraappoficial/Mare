"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/TopBar";
import { ProgressCard } from "@/components/ProgressCard";
import { MetricCard } from "@/components/MetricCard";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { TimelineItem } from "@/components/TimelineItem";
import { WeeklySummaryCard } from "@/components/WeeklySummaryCard";
import { FlameIcon, ProteinIcon, DropletIcon, DumbbellIcon } from "@/components/icons";
import { useProfileData } from "@/lib/profile-context";
import { supabase } from "@/lib/supabase";
import {
  getDailyLog,
  getDailyLogsInRange,
  getDefaultMeals,
  getMealLogsForDate,
  getMealLogsInRange,
  getWeightHistory,
  getWorkoutLogsInRange,
  type DailyLogRow,
  type GoalRow,
  type MealLogRow,
  type MealRow,
  type ProfileRow,
  type WeightLogRow,
  type WorkoutLogRow,
} from "@/lib/queries";
import { computeWeeklySummary } from "@/lib/weeklySummary";
import { currentWeekDates, todayISO } from "@/lib/date";
import { formatKg, formatLiters, formatNumber } from "@/lib/utils";

export default function DashboardPage() {
  const { profile, goal } = useProfileData();

  return (
    <AppShell>
      {profile && goal ? <DashboardBody profile={profile} goal={goal} /> : null}
    </AppShell>
  );
}

function DashboardBody({ profile, goal }: { profile: ProfileRow; goal: GoalRow }) {
  const [today, setToday] = useState<DailyLogRow | null>(null);
  const [meals, setMeals] = useState<MealRow[]>([]);
  const [weekLogs, setWeekLogs] = useState<DailyLogRow[]>([]);
  const [weekWorkouts, setWeekWorkouts] = useState<WorkoutLogRow[]>([]);
  const [weekWeights, setWeekWeights] = useState<WeightLogRow[]>([]);
  const [weekMealLogs, setWeekMealLogs] = useState<MealLogRow[]>([]);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [proteinConsumed, setProteinConsumed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    const date = todayISO();
    const weekDates = currentWeekDates(date);

    Promise.all([
      getDailyLog(supabase, profile.id, date),
      getDefaultMeals(supabase),
      getDailyLogsInRange(supabase, profile.id, weekDates),
      getWorkoutLogsInRange(supabase, profile.id, weekDates),
      getWeightHistory(supabase, profile.id, 30),
      getMealLogsForDate(supabase, profile.id, date),
      getMealLogsInRange(supabase, profile.id, weekDates),
    ]).then(([todayLog, mealsData, logs, workouts, weights, todayMealLogs, mealLogsWeek]) => {
      setToday(todayLog);
      setMeals(mealsData);
      setWeekLogs(logs);
      setWeekWorkouts(workouts);
      const weightsInWeek = weights.filter((w) => weekDates.includes(w.date));
      setWeekWeights(weightsInWeek);
      setWeekMealLogs(mealLogsWeek);
      setLatestWeight(weights.length > 0 ? weights[weights.length - 1].weight_kg : null);
      setCaloriesConsumed(
        todayMealLogs.reduce((sum, m) => sum + (m.calories ?? 0), 0)
      );
      setProteinConsumed(
        todayMealLogs.reduce((sum, m) => sum + (m.protein_g ?? 0), 0)
      );
      setLoading(false);
    });
  }, [profile.id]);

  if (loading) return null;

  const weekStart = currentWeekDates()[0];
  const weeklySummary = computeWeeklySummary(
    goal,
    weekStart,
    weekLogs,
    weekWorkouts,
    weekWeights,
    weekMealLogs
  );
  const currentWeight = latestWeight ?? goal.current_weight_kg;
  const waterMl = today?.water_ml ?? 0;
  const firstName = profile.name.split(" ")[0];

  return (
    <>
      <TopBar
        greeting={`Bom dia, ${firstName}`}
        subtitle="Vamos cuidar do seu progresso hoje?"
      />

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-3 lg:items-start lg:gap-6">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <ProgressCard
            currentWeightKg={currentWeight}
            startingWeightKg={goal.starting_weight_kg}
          />

          <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
            <MetricCard
              icon={<FlameIcon className="h-5 w-5 text-peach-dark" />}
              label="Calorias"
              valueLabel={formatNumber(caloriesConsumed)}
              targetLabel={`${formatNumber(goal.calorie_target)} kcal`}
              progressValue={caloriesConsumed}
              progressMax={goal.calorie_target}
              progressColorClassName="bg-peach-dark"
              info={{
                title: "Meta de calorias",
                description:
                  "É a quantidade de energia recomendada para o seu dia, calculada a partir do seu gasto diário estimado menos o déficit definido. Você não precisa bater esse número exatamente todo dia.",
                filledBy: "automatico",
              }}
            />
            <MetricCard
              icon={<ProteinIcon className="h-5 w-5 text-sage-dark" />}
              label="Proteína"
              valueLabel={`${formatNumber(proteinConsumed)} g`}
              targetLabel={`${formatNumber(goal.protein_target_g)} g`}
              progressValue={proteinConsumed}
              progressMax={goal.protein_target_g}
              progressColorClassName="bg-sage-dark"
              info={{
                title: "Meta de proteína",
                description:
                  "Ajuda a preservar massa muscular durante o emagrecimento. É calculada automaticamente a partir do seu peso. Registre o que comeu na tela Alimentação.",
                filledBy: "automatico",
              }}
            />
            <MetricCard
              icon={<DropletIcon className="h-5 w-5 text-sky-500" />}
              label="Água"
              valueLabel={formatLiters(waterMl)}
              targetLabel={formatLiters(goal.water_target_ml)}
              progressValue={waterMl}
              progressMax={goal.water_target_ml}
              progressColorClassName="bg-sky-400"
              info={{
                title: "Meta de água",
                description:
                  "Referência diária de hidratação. Em dias de treino a meta sobe um pouco, pois você perde mais líquido suando.",
                filledBy: "meta",
              }}
            />
            <MetricCard
              icon={<DumbbellIcon className="h-5 w-5 text-gold-dark" />}
              label="Treino"
              valueLabel={`${weeklySummary.workoutsCompleted}`}
              targetLabel={`${goal.weekly_workout_target} nesta semana`}
              progressValue={weeklySummary.workoutsCompleted}
              progressMax={goal.weekly_workout_target}
              progressColorClassName="bg-gold-dark"
              info={{
                title: "Meta de treinos",
                description:
                  "Quantos treinos você pretende fazer nessa semana. Não tem problema variar — o resumo semanal se adapta.",
                filledBy: "meta",
              }}
            />
          </div>

          <Card>
            <SectionHeader title="Seu dia" subtitle="Seu plano alimentar de hoje" />
            <div>
              {meals.map((meal, i) => (
                <TimelineItem
                  key={meal.id}
                  time={meal.time}
                  label={meal.title}
                  isLast={i === meals.length - 1}
                />
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <WeeklySummaryCard summary={weeklySummary} />
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-ink/40">
        Peso inicial: {formatKg(goal.starting_weight_kg)} · Números são
        estimativas de organização pessoal, não prescrição médica.
      </p>
    </>
  );
}
