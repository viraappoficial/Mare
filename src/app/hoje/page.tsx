"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { InfoHelp } from "@/components/InfoHelp";
import { WaterTracker } from "@/components/WaterTracker";
import { cn, formatNumber } from "@/lib/utils";
import { useProfileData } from "@/lib/profile-context";
import { supabase } from "@/lib/supabase";
import {
  getDailyLog,
  getMealLogsForDate,
  insertWeightLog,
  upsertDailyLog,
  upsertWorkoutLog,
  type GoalRow,
  type ProfileRow,
} from "@/lib/queries";
import { todayISO, weekdayKeyOf } from "@/lib/date";
import type { TrainedStatus, WorkoutFocus } from "@/types";

const focusOptions: { value: WorkoutFocus; label: string }[] = [
  { value: "inferiores", label: "Inferiores" },
  { value: "superiores", label: "Superiores" },
  { value: "full_body", label: "Full body" },
  { value: "cardio", label: "Cardio/caminhada" },
  { value: "misto", label: "Misto" },
];

const todayDateLabel = new Date().toLocaleDateString("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});

export default function HojePage() {
  const { profile, goal } = useProfileData();

  return (
    <AppShell>
      {profile && goal ? <HojeBody profile={profile} goal={goal} /> : null}
    </AppShell>
  );
}

function HojeBody({ profile, goal }: { profile: ProfileRow; goal: GoalRow }) {
  const [trained, setTrained] = useState<TrainedStatus>(null);
  const [focus, setFocus] = useState<WorkoutFocus | null>(null);
  const [minutes, setMinutes] = useState("");
  const [waterMl, setWaterMl] = useState(0);
  const [weight, setWeight] = useState("");
  const [cardioMinutes, setCardioMinutes] = useState(0);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const date = todayISO();

  useEffect(() => {
    if (!supabase) return;
    Promise.all([
      getDailyLog(supabase, profile.id, date),
      getMealLogsForDate(supabase, profile.id, date),
    ]).then(([log, mealLogs]) => {
      if (log) {
        setTrained((log.trained as TrainedStatus) ?? null);
        setFocus((log.workout_focus as WorkoutFocus) ?? null);
        setMinutes(log.workout_minutes ? String(log.workout_minutes) : "");
        setWaterMl(log.water_ml);
        setWeight(log.weight_kg ? String(log.weight_kg) : "");
        setCardioMinutes(log.cardio_minutes);
      }
      setCaloriesConsumed(mealLogs.reduce((sum, m) => sum + (m.calories ?? 0), 0));
      setLoaded(true);
    });
  }, [profile.id, date]);

  async function handleSave() {
    if (!supabase) return;
    setSaving(true);
    try {
      await upsertDailyLog(supabase, profile.id, date, {
        trained,
        workout_focus: trained === "sim" ? focus : null,
        workout_minutes: trained === "sim" && minutes ? Number(minutes) : null,
        water_ml: waterMl,
        weight_kg: weight ? Number(weight) : null,
        cardio_minutes: cardioMinutes,
      });

      if (weight) {
        await insertWeightLog(supabase, profile.id, date, Number(weight));
      }

      if (trained) {
        const status =
          trained === "sim" ? "feito" : trained === "nao" ? "faltou" : "descanso";
        await upsertWorkoutLog(supabase, profile.id, date, {
          weekday: weekdayKeyOf(date),
          status,
          focus: trained === "sim" ? focus : null,
          duration_minutes: trained === "sim" && minutes ? Number(minutes) : null,
        });
      }

      setSaved(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <TopBar title="Hoje" />
      <p className="-mt-3 mb-5 text-sm capitalize text-ink/50">
        {todayDateLabel}
      </p>

      {saved && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl bg-sage/15 px-4 py-3 text-sm font-medium text-sage-dark">
          <span aria-hidden>💚</span> Dia registrado! Bom trabalho,{" "}
          {profile.name.split(" ")[0]}.
        </div>
      )}

      {!loaded ? null : (
        <div className="flex flex-col gap-5">
          <Card>
            <h2 className="mb-3 text-base font-semibold text-ink">
              Treinei hoje?
            </h2>
            <div className="grid grid-cols-3 gap-2.5">
              <ChoiceButton
                label="Sim"
                active={trained === "sim"}
                onClick={() => setTrained("sim")}
              />
              <ChoiceButton
                label="Não"
                active={trained === "nao"}
                onClick={() => {
                  setTrained("nao");
                  setFocus(null);
                }}
              />
              <ChoiceButton
                label="Descanso"
                active={trained === "descanso_planejado"}
                onClick={() => {
                  setTrained("descanso_planejado");
                  setFocus(null);
                }}
              />
            </div>

            {trained === "sim" && (
              <div className="mt-5 border-t border-mist/60 pt-5">
                <p className="mb-2.5 text-sm font-medium text-ink/70">
                  O que você treinou?
                </p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {focusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFocus(opt.value)}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                        focus === opt.value
                          ? "bg-sage text-white"
                          : "bg-cream text-ink/70 hover:bg-mist/40"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-ink/70">
                    Minutos de treino
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    placeholder="Ex: 55"
                    className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
                  />
                </label>
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-1 flex items-center gap-1.5">
              <h2 className="text-base font-semibold text-ink">Água</h2>
              <InfoHelp
                title="Meta de água"
                description="Referência diária de hidratação, calculada a partir do seu peso. Em dias de treino a meta sobe um pouco."
                filledBy="meta"
              />
            </div>
            <WaterTracker
              valueMl={waterMl}
              targetMl={goal.water_target_ml}
              onAdd={(amount) => setWaterMl((v) => v + amount)}
              onReset={() => setWaterMl(0)}
            />
          </Card>

          <Card>
            <div className="mb-1 flex items-center gap-1.5">
              <h2 className="text-base font-semibold text-ink">
                Cardio complementar
              </h2>
              <InfoHelp
                title="Cardio complementar"
                description="Caminhadas e outros cardios fora da academia também contam. Registre os minutos aproximados de hoje."
                filledBy="preenche"
              />
            </div>
            <div className="mb-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-ink">{cardioMinutes}</span>
              <span className="text-sm text-ink/50">min hoje</span>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCardioMinutes((m) => Math.max(m - 10, 0))}
                className="flex-1 rounded-2xl bg-cream py-3 text-sm font-semibold text-ink hover:bg-mist/40"
              >
                − 10 min
              </button>
              <button
                type="button"
                onClick={() => setCardioMinutes((m) => m + 10)}
                className="flex-1 rounded-2xl bg-cream py-3 text-sm font-semibold text-ink hover:bg-mist/40"
              >
                + 10 min
              </button>
            </div>
          </Card>

          <Card>
            <div className="mb-1 flex items-center gap-1.5">
              <h2 className="text-base font-semibold text-ink">Peso hoje</h2>
              <InfoHelp
                title="Peso hoje"
                description="Você não precisa se pesar todos os dias. Registre apenas quando quiser — o que importa é a tendência ao longo das semanas, não um único dia."
                filledBy="preenche"
              />
            </div>
            <p className="mb-3 text-sm text-ink/50">Campo opcional</p>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={`${goal.current_weight_kg}`}
                className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink/40">
                kg
              </span>
            </div>
          </Card>

          <Card>
            <div className="mb-1 flex items-center gap-1.5">
              <h2 className="text-base font-semibold text-ink">Alimentação</h2>
              <InfoHelp
                title="Calorias consumidas"
                description="Soma das refeições que você registrou hoje na tela Alimentação."
                filledBy="automatico"
              />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-ink">
                {formatNumber(caloriesConsumed)}
              </span>
              <span className="text-sm text-ink/50">
                / {formatNumber(goal.calorie_target)} kcal
              </span>
            </div>
            <Link
              href="/alimentacao"
              className="mt-2.5 inline-block text-sm font-medium text-sage-dark underline-offset-2 hover:underline"
            >
              Registrar o que comeu →
            </Link>
          </Card>

          <Button fullWidth onClick={handleSave} disabled={saving} className="mt-1">
            {saving ? "Salvando..." : "Salvar meu dia"}
          </Button>
        </div>
      )}
    </>
  );
}

function ChoiceButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-[52px] rounded-2xl text-sm font-semibold transition-colors",
        active ? "bg-sage text-white" : "bg-cream text-ink/70 hover:bg-mist/40"
      )}
    >
      {label}
    </button>
  );
}
