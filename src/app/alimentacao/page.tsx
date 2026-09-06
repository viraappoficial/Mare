"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { InfoHelp } from "@/components/InfoHelp";
import { cn, formatNumber } from "@/lib/utils";
import { useProfileData } from "@/lib/profile-context";
import { supabase } from "@/lib/supabase";
import {
  deleteMealLog,
  foodCategoryLabel,
  getFoods,
  getMealLogsForDate,
  insertMealLog,
  insertMealLogFromFood,
  type FoodRow,
  type GoalRow,
  type MealLogRow,
  type ProfileRow,
} from "@/lib/queries";
import { todayISO } from "@/lib/date";

type Tab = "resumo" | "cardapio";

const tabs: { value: Tab; label: string }[] = [
  { value: "resumo", label: "Resumo" },
  { value: "cardapio", label: "Meu cardápio" },
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
  const [foods, setFoods] = useState<FoodRow[]>([]);
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
    Promise.all([getFoods(supabase), getMealLogsForDate(supabase, profile.id, date)]).then(
      ([foodsData, logs]) => {
        setFoods(foodsData);
        setTodayLogs(logs);
        setLoaded(true);
      }
    );
  }, [profile.id, date]);

  if (!loaded) return null;

  const caloriesConsumed = todayLogs.reduce((sum, m) => sum + (m.calories ?? 0), 0);
  const proteinConsumed = todayLogs.reduce((sum, m) => sum + (m.protein_g ?? 0), 0);

  async function handleDelete(id: string) {
    if (!supabase) return;
    await deleteMealLog(supabase, id);
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
          onIrPraCardapio={() => setTab("cardapio")}
        />
      )}
      {tab === "cardapio" && (
        <CardapioTab
          profile={profile}
          goal={goal}
          foods={foods}
          todayLogs={todayLogs}
          caloriesConsumed={caloriesConsumed}
          proteinConsumed={proteinConsumed}
          onLogged={reloadLogs}
          onDelete={handleDelete}
        />
      )}
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
  onIrPraCardapio,
}: {
  caloriesConsumed: number;
  proteinConsumed: number;
  calorieTarget: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  onIrPraCardapio: () => void;
}) {
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

      <Card className="bg-peach/40">
        <p className="text-sm leading-relaxed text-ink/80">
          Este é o quanto você já comeu hoje comparado com sua meta. Pra
          registrar o que comeu, vá na aba &quot;Meu cardápio&quot;.
        </p>
        <button
          type="button"
          onClick={onIrPraCardapio}
          className="mt-2 text-sm font-semibold text-sage-dark underline-offset-2 hover:underline"
        >
          Ir pro meu cardápio →
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

function CardapioTab({
  profile,
  goal,
  foods,
  todayLogs,
  caloriesConsumed,
  proteinConsumed,
  onLogged,
  onDelete,
}: {
  profile: ProfileRow;
  goal: GoalRow;
  foods: FoodRow[];
  todayLogs: MealLogRow[];
  caloriesConsumed: number;
  proteinConsumed: number;
  onLogged: () => void;
  onDelete: (id: string) => void;
}) {
  const caloriesLeft = Math.max(goal.calorie_target - caloriesConsumed, 0);
  const proteinLeft = Math.max(goal.protein_target_g - proteinConsumed, 0);
  const overCalories = caloriesConsumed > goal.calorie_target;

  const groups = useMemo(() => {
    const byCategory = new Map<string, FoodRow[]>();
    for (const food of foods) {
      const list = byCategory.get(food.category) ?? [];
      list.push(food);
      byCategory.set(food.category, list);
    }
    return Array.from(byCategory.entries());
  }, [foods]);

  async function handleAddFood(food: FoodRow, quantity: number) {
    if (!supabase) return;
    await insertMealLogFromFood(supabase, profile.id, todayISO(), food, quantity);
    onLogged();
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className={overCalories ? "bg-peach/40" : "bg-sage/15"}>
        <p className="text-sm font-medium text-ink">
          {overCalories
            ? `Você passou ${formatNumber(caloriesConsumed - goal.calorie_target)} kcal da sua meta de hoje.`
            : `Faltam ~${formatNumber(caloriesLeft)} kcal e ~${formatNumber(proteinLeft)} g de proteína pra bater sua meta hoje.`}
        </p>
      </Card>

      <Card>
        <h3 className="mb-1 text-base font-semibold text-ink">
          Adicionar alimento
        </h3>
        <p className="mb-4 text-sm text-ink/50">
          Escolha a quantidade e toque em adicionar — as calorias somam
          automático.
        </p>
        <div className="flex flex-col gap-5">
          {groups.map(([category, items]) => (
            <div key={category}>
              <h4 className="mb-2 text-sm font-semibold text-ink/70">
                {foodCategoryLabel(category)}
              </h4>
              <div className="flex flex-col gap-2">
                {items.map((food) => (
                  <FoodRowPicker key={food.id} food={food} onAdd={handleAddFood} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <RegistroLivre profile={profile} onLogged={onLogged} />

      <Card>
        <h3 className="mb-3 text-base font-semibold text-ink">
          Seu cardápio de hoje
        </h3>
        {todayLogs.length === 0 ? (
          <p className="text-sm text-ink/50">Nada registrado ainda hoje.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {todayLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{log.description}</p>
                  <p className="text-xs text-ink/50">
                    {log.calories != null ? `${formatNumber(log.calories)} kcal` : ""}
                    {log.protein_g != null ? ` · ${formatNumber(log.protein_g)} g proteína` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(log.id)}
                  aria-label={`Remover ${log.description}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink/40 hover:bg-mist/40 hover:text-ink"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function FoodRowPicker({
  food,
  onAdd,
}: {
  food: FoodRow;
  onAdd: (food: FoodRow, quantity: number) => Promise<void>;
}) {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    setAdding(true);
    try {
      await onAdd(food, quantity);
      setQuantity(1);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{food.name}</p>
        <p className="text-xs text-ink/50">
          {food.portion_label} · {formatNumber(food.calories)} kcal ·{" "}
          {formatNumber(food.protein_g)} g proteína
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(q - 0.5, 0.5))}
          aria-label="Diminuir quantidade"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink/60 hover:text-ink"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-semibold text-ink">
          {quantity}×
        </span>
        <button
          type="button"
          onClick={() => setQuantity((q) => q + 0.5)}
          aria-label="Aumentar quantidade"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink/60 hover:text-ink"
        >
          +
        </button>
        <Button
          onClick={handleAdd}
          disabled={adding}
          className="min-h-0 px-3 py-2 text-sm"
        >
          Add
        </Button>
      </div>
    </div>
  );
}

function RegistroLivre({
  profile,
  onLogged,
}: {
  profile: ProfileRow;
  onLogged: () => void;
}) {
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState("");
  const [proteinG, setProteinG] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase || !description) return;
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
    <Card>
      <h3 className="mb-1 text-base font-semibold text-ink">
        Não achou na lista?
      </h3>
      <p className="mb-3 text-sm text-ink/50">
        Registre livre, com as calorias que você souber.
      </p>
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
  );
}
