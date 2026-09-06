"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { InfoHelp } from "@/components/InfoHelp";
import { WorkoutDay } from "@/components/WorkoutDay";
import { SectionHeader } from "@/components/SectionHeader";
import { useProfileData } from "@/lib/profile-context";
import { supabase } from "@/lib/supabase";
import {
  getDailyLogsInRange,
  getWorkoutLogsInRange,
  upsertDailyLog,
  type DailyLogRow,
  type GoalRow,
  type ProfileRow,
  type WorkoutLogRow,
} from "@/lib/queries";
import { currentWeekDates, todayISO, weekdayKeyOf } from "@/lib/date";
import type { WorkoutDayStatus, WorkoutFocus } from "@/types";

export default function TreinosPage() {
  const { profile, goal } = useProfileData();

  return (
    <AppShell>
      {profile && goal ? <TreinosBody profile={profile} goal={goal} /> : null}
    </AppShell>
  );
}

function TreinosBody({ profile, goal }: { profile: ProfileRow; goal: GoalRow }) {
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogRow[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLogRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  const weekDates = currentWeekDates();
  const date = todayISO();

  async function reload() {
    if (!supabase) return;
    const [workouts, logs] = await Promise.all([
      getWorkoutLogsInRange(supabase, profile.id, weekDates),
      getDailyLogsInRange(supabase, profile.id, weekDates),
    ]);
    setWorkoutLogs(workouts);
    setDailyLogs(logs);
    setLoaded(true);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id]);

  if (!loaded) return null;

  const completed = workoutLogs.filter((w) => w.status === "feito").length;
  const cardioMinutesWeek = dailyLogs.reduce((sum, d) => sum + d.cardio_minutes, 0);
  const todayLog = dailyLogs.find((d) => d.date === date);
  const todayCardioMinutes = todayLog?.cardio_minutes ?? 0;

  const weekByDate = new Map(workoutLogs.map((w) => [w.date, w]));

  async function adjustTodayCardio(delta: number) {
    if (!supabase) return;
    const next = Math.max(todayCardioMinutes + delta, 0);
    await upsertDailyLog(supabase, profile.id, date, { cardio_minutes: next });
    await reload();
  }

  return (
    <>
      <TopBar title="Treinos" />

      <div className="flex flex-col gap-5">
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-ink/70">
                Meta semanal
              </span>
              <InfoHelp
                title="Meta semanal de treinos"
                description="Quantos treinos você pretende fazer por semana. Pode variar — o resumo semanal se adapta ao que aconteceu de verdade."
                filledBy="meta"
              />
            </div>
            <span className="text-sm font-semibold text-ink">
              {completed} de {goal.weekly_workout_target}
            </span>
          </div>
          <ProgressBar
            value={completed}
            max={goal.weekly_workout_target}
            colorClassName="bg-gold-dark"
          />
        </Card>

        <Card>
          <SectionHeader title="Sua semana" />
          <div className="grid grid-cols-7 gap-1.5 overflow-x-auto sm:gap-2">
            {weekDates.map((d) => {
              const log = weekByDate.get(d);
              const status: WorkoutDayStatus =
                (log?.status as WorkoutDayStatus) ?? "pendente";
              return (
                <WorkoutDay
                  key={d}
                  weekday={weekdayKeyOf(d)}
                  status={status}
                  focus={(log?.focus as WorkoutFocus) ?? undefined}
                />
              );
            })}
          </div>
          <p className="mt-5 rounded-2xl bg-cream p-3.5 text-sm leading-relaxed text-ink/70">
            Não conseguiu treinar? Tudo bem. O resumo semanal se adapta — o
            que importa é a constância ao longo do tempo, não um dia isolado.
          </p>
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-1.5">
            <h2 className="text-base font-semibold text-ink">
              Cardio complementar
            </h2>
            <InfoHelp
              title="Cardio complementar"
              description="Caminhadas e outros cardios fora da academia também contam. Os botões abaixo ajustam os minutos de hoje; o número grande é o total da semana."
              filledBy="preenche"
            />
          </div>
          <div className="mb-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-ink">
              {cardioMinutesWeek}
            </span>
            <span className="text-sm text-ink/50">min esta semana</span>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => adjustTodayCardio(-10)}
              className="flex-1 rounded-2xl bg-cream py-3 text-sm font-semibold text-ink hover:bg-mist/40"
            >
              − 10 min hoje
            </button>
            <button
              type="button"
              onClick={() => adjustTodayCardio(10)}
              className="flex-1 rounded-2xl bg-cream py-3 text-sm font-semibold text-ink hover:bg-mist/40"
            >
              + 10 min hoje
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}
