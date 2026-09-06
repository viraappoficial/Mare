"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { InfoHelp } from "@/components/InfoHelp";
import { MealCard } from "@/components/MealCard";
import { cn, formatNumber } from "@/lib/utils";
import { foodSwaps } from "@/data/foodSwaps";
import { useProfileData } from "@/lib/profile-context";
import { supabase } from "@/lib/supabase";
import {
  getDefaultMeals,
  getMealLogsForDate,
  insertMealLog,
  toMeal,
  type GoalRow,
  type MealLogRow,
  type MealRow,
  type ProfileRow,
} from "@/lib/queries";
import { todayISO } from "@/lib/date";

type Tab = "resumo" | "plano" | "trocas";

const tabs: { value: Tab; label: string }[] = [
  { value: "resumo", label: "Resumo" },
  { value: "plano", label: "Plano do dia" },
  { value: "trocas", label: "Trocas" },
];

export default function AlimentacaoPage() {
  const { profile, goal } = useProfileData();

  return (
    <AppShell>
      {profile && goal ? <AlimentacaoBody profile={profile} goal={goal} /> : null}
    </AppShell>
  );
}

function AlimentacaoBody({ profile, goal }: { profile: ProfileRow; goal: GoalRow }) {
  const [tab, setTab] = useState<Tab>("resumo");
  const [defaultMeals, setDefaultMeals] = useState<MealRow[]>([]);
  const [todayLogs, setTodayLogs] = useState<MealLogRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  const date = todayISO();

  async function reloadLogs() {
    if (!supabase) return;
    const logs = await getMealLogsForDate(supabase, profile.id, date);
    setTodayLogs(logs);
  }

  useEffect(() => {
    if (!supabase) return;
    Promise.all([getDefaultMeals(supabase), getMealLogsForDate(supabase, profile.id, date)]).then(
      ([meals, logs]) => {
        setDefaultMeals(meals);
        setTodayLogs(logs);
        setLoaded(true);
      }
    );
  }, [profile.id, date]);

  if (!loaded) return null;

  const caloriesConsumed = todayLogs.reduce((sum, m) => sum + (m.calories ?? 0), 0);
  const proteinConsumed = todayLogs.reduce((sum, m) => sum + (m.protein_g ?? 0), 0);
  const loggedMealIds = new Set(todayLogs.map((l) => l.meal_id).filter(Boolean));

  async function handleLogDefaultMeal(meal: MealRow) {
    if (!supabase) return;
    await insertMealLog(supabase, profile.id, date, {
      mealId: meal.id,
      description: meal.title,
      calories: meal.approx_calories,
      proteinG: meal.approx_protein_g,
    });
    await reloadLogs();
  }

  return (
    <>
      <TopBar title="Alimentação" />

      <div className="mb-5 flex gap-1.5 rounded-2xl bg-mist/30 p-1.5">
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cn(
              "flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors",
              tab === t.value ? "bg-white text-ink shadow-sm" : "text-ink/50"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "resumo" && (
        <ResumoTab
          caloriesConsumed={caloriesConsumed}
          proteinConsumed={proteinConsumed}
          calorieTarget={goal.calorie_target}
          proteinTarget={goal.protein_target_g}
          carbTarget={goal.carb_target_g}
          fatTarget={goal.fat_target_g}
          onVerTrocas={() => setTab("trocas")}
          onLogged={reloadLogs}
        />
      )}
      {tab === "plano" && (
        <PlanoTab
          meals={defaultMeals}
          loggedMealIds={loggedMealIds}
          onSwap={() => setTab("trocas")}
          onLog={handleLogDefaultMeal}
        />
      )}
      {tab === "trocas" && <TrocasTab />}
    </>
  );
}

function ResumoTab({
  caloriesConsumed,
  proteinConsumed,
  calorieTarget,
  proteinTarget,
  carbTarget,
  fatTarget,
  onVerTrocas,
  onLogged,
}: {
  caloriesConsumed: number;
  proteinConsumed: number;
  calorieTarget: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  onVerTrocas: () => void;
  onLogged: () => void;
}) {
  const { profile } = useProfileData();
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState("");
  const [proteinG, setProteinG] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase || !profile || !description) return;
    setSaving(true);
    try {
      await insertMealLog(supabase, profile.id, todayISO(), {
        description,
        calories: calories ? Number(calories) : null,
        proteinG: proteinG ? Number(proteinG) : null,
      });
      setDescription("");
      setCalories("");
      setProteinG("");
      onLogged();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-4">
        <MacroRow
          label="Calorias"
          value={caloriesConsumed}
          target={calorieTarget}
          unit="kcal"
          colorClassName="bg-peach-dark"
          info="É a quantidade de energia recomendada para o seu dia. Calculada automaticamente a partir do seu gasto diário estimado e do déficit definido no seu perfil."
        />
        <MacroRow
          label="Proteína"
          value={proteinConsumed}
          target={proteinTarget}
          unit="g"
          colorClassName="bg-sage-dark"
          info="Ajuda a manter massa muscular durante o emagrecimento. Calculada automaticamente a partir do seu peso."
        />
        <MacroRow
          label="Carboidratos"
          target={carbTarget}
          unit="g"
          colorClassName="bg-gold-dark"
          info="Sua principal fonte de energia para os treinos. É uma meta de referência, calculada automaticamente."
        />
        <MacroRow
          label="Gorduras"
          target={fatTarget}
          unit="g"
          colorClassName="bg-ink/40"
          info="Importante para hormônios e saciedade. É uma meta de referência, calculada automaticamente."
        />
      </Card>

      <Card>
        <h3 className="mb-3 text-base font-semibold text-ink">
          Registro rápido
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="O que você comeu?"
            required
            className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              inputMode="numeric"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="kcal (opcional)"
              className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
            />
            <input
              type="number"
              inputMode="numeric"
              value={proteinG}
              onChange={(e) => setProteinG(e.target.value)}
              placeholder="proteína g (opcional)"
              className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
            />
          </div>
          <Button type="submit" fullWidth disabled={saving}>
            {saving ? "Salvando..." : "Adicionar"}
          </Button>
        </form>
      </Card>

      <Card className="bg-peach/40">
        <p className="text-sm leading-relaxed text-ink/80">
          Este é um guia, não uma lista obrigatória. Você não precisa comer
          exatamente isso — dá pra trocar qualquer item.
        </p>
        <button
          type="button"
          onClick={onVerTrocas}
          className="mt-2 text-sm font-semibold text-sage-dark underline-offset-2 hover:underline"
        >
          Ver trocas →
        </button>
      </Card>
    </div>
  );
}

function MacroRow({
  label,
  value,
  target,
  unit,
  colorClassName,
  info,
}: {
  label: string;
  value?: number;
  target: number;
  unit: string;
  colorClassName: string;
  info: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-ink/70">{label}</span>
          <InfoHelp
            title={label}
            description={info}
            filledBy={value !== undefined ? "automatico" : "meta"}
          />
        </div>
        <span className="text-sm font-semibold text-ink">
          {value !== undefined ? `${formatNumber(value)} / ` : ""}
          {formatNumber(target)} {unit}
        </span>
      </div>
      <ProgressBar
        value={value ?? target}
        max={target}
        colorClassName={value !== undefined ? colorClassName : "bg-mist"}
      />
    </div>
  );
}

function PlanoTab({
  meals,
  loggedMealIds,
  onSwap,
  onLog,
}: {
  meals: MealRow[];
  loggedMealIds: Set<string | null>;
  onSwap: () => void;
  onLog: (meal: MealRow) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-peach/40 py-3.5">
        <p className="text-sm leading-relaxed text-ink/80">
          Este é um guia, não uma lista obrigatória. Toque em &quot;Registrar&quot;
          quando comer algo da lista, ou registre livre no Resumo.
        </p>
      </Card>
      {meals.map((meal) => (
        <MealCard
          key={meal.id}
          meal={toMeal(meal)}
          onSwap={onSwap}
          onLog={() => onLog(meal)}
          logged={loggedMealIds.has(meal.id)}
        />
      ))}
    </div>
  );
}

function TrocasTab() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-ink/60">
        Troque qualquer proteína, carboidrato ou item da lista abaixo por
        outro do mesmo grupo — as porções já são equivalentes.
      </p>
      {foodSwaps.map((group) => (
        <Card key={group.id}>
          <h3 className="mb-3 text-base font-semibold text-ink">
            {group.label}
          </h3>
          <div className="flex flex-col gap-2">
            {group.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3"
              >
                <span className="text-sm font-medium text-ink">
                  {item.name}
                </span>
                <span className="text-sm text-ink/50">{item.portion}</span>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
