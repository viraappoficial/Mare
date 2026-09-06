"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { InfoHelp } from "@/components/InfoHelp";
import { SectionHeader } from "@/components/SectionHeader";
import { WeightChart } from "@/components/WeightChart";
import { WeeklySummaryCard } from "@/components/WeeklySummaryCard";
import { RulerIcon, TrendingUpIcon } from "@/components/icons";
import { formatKg } from "@/lib/utils";
import { useProfileData } from "@/lib/profile-context";
import { supabase } from "@/lib/supabase";
import {
  getDailyLogsInRange,
  getMealLogsInRange,
  getMeasurementHistory,
  getWeightHistory,
  getWorkoutLogsInRange,
  insertMeasurement,
  toWeightEntry,
  type GoalRow,
  type MeasurementRow,
  type ProfileRow,
  type WeightLogRow,
} from "@/lib/queries";
import { computeWeeklySummary } from "@/lib/weeklySummary";
import { currentWeekDates, todayISO } from "@/lib/date";
import type { WeeklySummary } from "@/types";

const measurementFields: { key: keyof MeasurementRow; label: string }[] = [
  { key: "waist_cm", label: "Cintura" },
  { key: "hip_cm", label: "Quadril" },
  { key: "thigh_cm", label: "Coxa" },
  { key: "arm_cm", label: "Braço" },
];

export default function EvolucaoPage() {
  const { profile, goal } = useProfileData();

  return (
    <AppShell>
      {profile && goal ? <EvolucaoBody profile={profile} goal={goal} /> : null}
    </AppShell>
  );
}

function EvolucaoBody({ profile, goal }: { profile: ProfileRow; goal: GoalRow }) {
  const [weightHistory, setWeightHistory] = useState<WeightLogRow[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementRow[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ waist: "", hip: "", thigh: "", arm: "" });

  async function reload() {
    if (!supabase) return;
    const weekDates = currentWeekDates();
    const [weights, measurementsData, dailyLogs, workoutLogs, mealLogs] = await Promise.all([
      getWeightHistory(supabase, profile.id, 20),
      getMeasurementHistory(supabase, profile.id),
      getDailyLogsInRange(supabase, profile.id, weekDates),
      getWorkoutLogsInRange(supabase, profile.id, weekDates),
      getMealLogsInRange(supabase, profile.id, weekDates),
    ]);
    setWeightHistory(weights);
    setMeasurements(measurementsData);
    const weightsInWeek = weights.filter((w) => weekDates.includes(w.date));
    setWeeklySummary(
      computeWeeklySummary(goal, weekDates[0], dailyLogs, workoutLogs, weightsInWeek, mealLogs)
    );
    setLoaded(true);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id]);

  if (!loaded || !weeklySummary) return null;

  const currentWeight =
    weightHistory.length > 0
      ? weightHistory[weightHistory.length - 1].weight_kg
      : goal.current_weight_kg;
  const diff = currentWeight - goal.starting_weight_kg;
  const latestMeasurement = measurements[measurements.length - 1] ?? null;

  const chartData = weightHistory.map((row) => {
    const entry = toWeightEntry(row);
    const [, month, day] = entry.date.split("-");
    return { ...entry, label: `${day}/${month}` };
  });

  async function handleSaveMeasurements() {
    if (!supabase) return;
    await insertMeasurement(supabase, profile.id, todayISO(), {
      waist_cm: form.waist ? Number(form.waist) : null,
      hip_cm: form.hip ? Number(form.hip) : null,
      thigh_cm: form.thigh ? Number(form.thigh) : null,
      arm_cm: form.arm ? Number(form.arm) : null,
    });
    setShowForm(false);
    setSaved(true);
    await reload();
  }

  return (
    <>
      <TopBar title="Evolução" />

      <div className="flex flex-col gap-5">
        <Card>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-ink/50">Inicial</p>
              <p className="text-lg font-bold text-ink">
                {formatKg(goal.starting_weight_kg)}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink/50">Atual</p>
              <p className="text-lg font-bold text-sage-dark">
                {formatKg(currentWeight)}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink/50">Diferença</p>
              <p className="text-lg font-bold text-ink">
                {diff > 0 ? "+" : "-"}
                {formatKg(Math.abs(diff))}
              </p>
            </div>
          </div>
        </Card>

        {chartData.length > 0 && (
          <Card>
            <SectionHeader
              title="Peso ao longo do tempo"
              subtitle="Olhe para a tendência, não para um único dia"
            />
            <WeightChart data={chartData} />
            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-cream p-3.5">
              <TrendingUpIcon className="mt-0.5 h-4 w-4 shrink-0 text-sage-dark" />
              <p className="text-sm leading-relaxed text-ink/70">
                Seu peso pode variar por água, ciclo menstrual, alimentação,
                sal, sono e até o horário da pesagem. Tendência importa mais
                que peso de um único dia.
              </p>
            </div>
          </Card>
        )}

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <RulerIcon className="h-5 w-5 text-sage-dark" />
              <h2 className="text-base font-semibold text-ink">Medidas</h2>
              <InfoHelp
                title="Medidas corporais"
                description="Medidas complementam o peso na balança: mostram mudanças na composição do corpo (como perda de barriga ou ganho de glúteo) que o peso sozinho não conta."
                filledBy="preenche"
              />
            </div>
          </div>

          {latestMeasurement ? (
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {measurementFields.map((f) => (
                <div key={f.key} className="rounded-2xl bg-cream p-3.5">
                  <p className="text-xs text-ink/50">{f.label}</p>
                  <p className="text-lg font-bold text-ink">
                    {latestMeasurement[f.key] ?? "—"} cm
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mb-4 text-sm text-ink/50">
              Nenhuma medida registrada ainda.
            </p>
          )}

          {saved && (
            <p className="mb-3 rounded-2xl bg-sage/15 px-4 py-2.5 text-sm font-medium text-sage-dark">
              Medidas atualizadas 💚
            </p>
          )}

          {!showForm ? (
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setShowForm(true);
                setSaved(false);
              }}
            >
              Registrar medidas
            </Button>
          ) : (
            <div className="flex flex-col gap-3">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink/70">
                  Cintura (cm)
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  value={form.waist}
                  onChange={(e) => setForm({ ...form, waist: e.target.value })}
                  className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink/70">
                  Quadril (cm)
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  value={form.hip}
                  onChange={(e) => setForm({ ...form, hip: e.target.value })}
                  className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink/70">
                  Coxa (cm)
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  value={form.thigh}
                  onChange={(e) => setForm({ ...form, thigh: e.target.value })}
                  className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink/70">
                  Braço (cm)
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  value={form.arm}
                  onChange={(e) => setForm({ ...form, arm: e.target.value })}
                  className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
                />
              </label>
              <Button fullWidth onClick={handleSaveMeasurements}>
                Salvar medidas
              </Button>
            </div>
          )}
        </Card>

        <div>
          <SectionHeader title="Resumo da semana" />
          <WeeklySummaryCard summary={weeklySummary} compact />
        </div>
      </div>
    </>
  );
}
