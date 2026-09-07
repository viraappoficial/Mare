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
  computeFoodNutrition,
  deleteMealLog,
  foodCategoryLabel,
  getFoods,
  getMealLogsForDate,
  insertCustomFood,
  insertMealLog,
  insertMealLogFromFood,
  updateFood,
  type CustomFoodInput,
  type FoodRow,
  type GoalRow,
  type MealLogRow,
  type ProfileRow,
} from "@/lib/queries";
import { todayISO } from "@/lib/date";
import type { FoodCategory } from "@/types";

const foodCategories: { value: FoodCategory; label: string }[] = [
  { value: "proteina", label: "Proteínas" },
  { value: "carboidrato", label: "Carboidratos" },
  { value: "outro", label: "Outros" },
];

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

  function handleFoodSaved(food: FoodRow) {
    setFoods((prev) => {
      const exists = prev.some((f) => f.id === food.id);
      return exists ? prev.map((f) => (f.id === food.id ? food : f)) : [...prev, food];
    });
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
          onFoodSaved={handleFoodSaved}
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
  onFoodSaved,
}: {
  profile: ProfileRow;
  goal: GoalRow;
  foods: FoodRow[];
  todayLogs: MealLogRow[];
  caloriesConsumed: number;
  proteinConsumed: number;
  onLogged: () => void;
  onDelete: (id: string) => void;
  onFoodSaved: (food: FoodRow) => void;
}) {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [search, setSearch] = useState("");
  const caloriesLeft = Math.max(goal.calorie_target - caloriesConsumed, 0);
  const proteinLeft = Math.max(goal.protein_target_g - proteinConsumed, 0);
  const overCalories = caloriesConsumed > goal.calorie_target;

  const featuredFoods = useMemo(() => foods.filter((f) => f.featured), [foods]);

  const groups = useMemo(() => {
    const byCategory = new Map<string, FoodRow[]>();
    for (const food of featuredFoods) {
      const list = byCategory.get(food.category) ?? [];
      list.push(food);
      byCategory.set(food.category, list);
    }
    return Array.from(byCategory.entries());
  }, [featuredFoods]);

  const searchQuery = search.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    return foods.filter((f) => f.name.toLowerCase().includes(searchQuery));
  }, [foods, searchQuery]);

  async function handleAddFood(food: FoodRow, grams: number) {
    if (!supabase) return;
    await insertMealLogFromFood(supabase, profile.id, todayISO(), food, grams);
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
        <p className="mb-3 text-sm text-ink/50">
          Escolha a quantidade e toque em adicionar — as calorias somam
          automático.
        </p>

        <div className="relative mb-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar outro alimento (ex: batata doce, salmão...)"
            className="w-full rounded-2xl border border-mist bg-white py-3 pl-10 pr-4 text-base text-ink outline-none focus:border-sage"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
          >
            🔍
          </span>
        </div>

        {searchQuery ? (
          <div className="flex flex-col gap-2">
            {searchResults.length === 0 ? (
              <p className="py-2 text-sm text-ink/50">
                Nenhum alimento encontrado com esse nome. Você pode cadastrar
                ele abaixo.
              </p>
            ) : (
              searchResults.map((food) => (
                <FoodRowPicker
                  key={food.id}
                  food={food}
                  profile={profile}
                  onAdd={handleAddFood}
                  onEdited={onFoodSaved}
                />
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {groups.map(([category, items]) => (
              <div key={category}>
                <h4 className="mb-2 text-sm font-semibold text-ink/70">
                  {foodCategoryLabel(category)}
                </h4>
                <div className="flex flex-col gap-2">
                  {items.map((food) => (
                    <FoodRowPicker
                      key={food.id}
                      food={food}
                      profile={profile}
                      onAdd={handleAddFood}
                      onEdited={onFoodSaved}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!showCustomForm ? (
          <button
            type="button"
            onClick={() => setShowCustomForm(true)}
            className="mt-4 text-sm font-medium text-sage-dark underline-offset-2 hover:underline"
          >
            + Cadastrar um alimento que não está na lista
          </button>
        ) : (
          <div className="mt-4 border-t border-mist/60 pt-4">
            <CustomFoodForm
              profile={profile}
              onSaved={(food) => {
                onFoodSaved(food);
                setShowCustomForm(false);
              }}
              onCancel={() => setShowCustomForm(false)}
            />
          </div>
        )}
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
  profile,
  onAdd,
  onEdited,
}: {
  food: FoodRow;
  profile: ProfileRow;
  onAdd: (food: FoodRow, grams: number) => Promise<void>;
  onEdited: (food: FoodRow) => void;
}) {
  const [grams, setGrams] = useState(String(food.default_grams));
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);

  const gramsNumber = Number(grams) || 0;
  const nutrition = computeFoodNutrition(food, gramsNumber);

  async function handleAdd() {
    if (gramsNumber <= 0) return;
    setAdding(true);
    try {
      await onAdd(food, gramsNumber);
      setGrams(String(food.default_grams));
    } finally {
      setAdding(false);
    }
  }

  if (editing) {
    return (
      <div className="rounded-2xl bg-cream px-4 py-3">
        <CustomFoodForm
          profile={profile}
          initialFood={food}
          onSaved={(updated) => {
            onEdited(updated);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-cream px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="truncate text-sm font-medium text-ink">{food.name}</p>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-ink/50">
            {formatNumber(food.calories_per_100g)} kcal / 100 g
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label={`Editar ${food.name}`}
            className="text-xs font-medium text-sage-dark underline-offset-2 hover:underline"
          >
            Editar
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            className="w-full rounded-xl border border-mist bg-white px-3 py-2 text-sm text-ink outline-none focus:border-sage"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink/40">
            g
          </span>
        </div>
        <span className="shrink-0 text-xs text-ink/60">
          = {formatNumber(nutrition.calories)} kcal ·{" "}
          {formatNumber(nutrition.proteinG)} g proteína
        </span>
        <Button
          onClick={handleAdd}
          disabled={adding || gramsNumber <= 0}
          className="min-h-0 shrink-0 px-3 py-2 text-sm"
        >
          Add
        </Button>
      </div>
    </div>
  );
}

const customFoodCategoryDefault: FoodCategory = "outro";

function CustomFoodForm({
  profile,
  initialFood,
  onSaved,
  onCancel,
}: {
  profile: ProfileRow;
  initialFood?: FoodRow;
  onSaved: (food: FoodRow) => void;
  onCancel: () => void;
}) {
  const isOwnFood = initialFood?.profile_id === profile.id;
  const [name, setName] = useState(initialFood?.name ?? "");
  const [category, setCategory] = useState<FoodCategory>(
    (initialFood?.category as FoodCategory) ?? customFoodCategoryDefault
  );
  const [caloriesPer100g, setCaloriesPer100g] = useState(
    initialFood ? String(initialFood.calories_per_100g) : ""
  );
  const [proteinPer100g, setProteinPer100g] = useState(
    initialFood ? String(initialFood.protein_per_100g) : ""
  );
  const [carbsPer100g, setCarbsPer100g] = useState(
    initialFood?.carbs_per_100g != null ? String(initialFood.carbs_per_100g) : ""
  );
  const [fatPer100g, setFatPer100g] = useState(
    initialFood?.fat_per_100g != null ? String(initialFood.fat_per_100g) : ""
  );
  const [defaultGrams, setDefaultGrams] = useState(
    String(initialFood?.default_grams ?? 100)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase || !name || !caloriesPer100g || !proteinPer100g) return;
    setSaving(true);
    setError(null);
    const input: CustomFoodInput = {
      name,
      category,
      caloriesPer100g: Number(caloriesPer100g),
      proteinPer100g: Number(proteinPer100g),
      carbsPer100g: carbsPer100g ? Number(carbsPer100g) : null,
      fatPer100g: fatPer100g ? Number(fatPer100g) : null,
      defaultGrams: Number(defaultGrams) || 100,
    };
    try {
      const food =
        initialFood && isOwnFood
          ? await updateFood(supabase, initialFood.id, input)
          : await insertCustomFood(supabase, profile.id, input);
      onSaved(food);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <p className="text-sm text-ink/60">
        {initialFood && !isOwnFood
          ? "Esse é um alimento padrão, compartilhado — ajustar aqui cria uma versão sua, só visível pra você."
          : "Informe os valores por 100 g — o app calcula o resto quando você adicionar a quantidade."}
      </p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome do alimento"
        required
        className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as FoodCategory)}
        className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
      >
        {foodCategories.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          inputMode="decimal"
          value={caloriesPer100g}
          onChange={(e) => setCaloriesPer100g(e.target.value)}
          placeholder="kcal / 100g"
          required
          className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
        />
        <input
          type="number"
          inputMode="decimal"
          value={proteinPer100g}
          onChange={(e) => setProteinPer100g(e.target.value)}
          placeholder="proteína g / 100g"
          required
          className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          inputMode="decimal"
          value={carbsPer100g}
          onChange={(e) => setCarbsPer100g(e.target.value)}
          placeholder="carbo g / 100g (opcional)"
          className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
        />
        <input
          type="number"
          inputMode="decimal"
          value={fatPer100g}
          onChange={(e) => setFatPer100g(e.target.value)}
          placeholder="gordura g / 100g (opcional)"
          className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
        />
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink/70">
          Porção sugerida (pra já vir preenchida ao adicionar)
        </span>
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            value={defaultGrams}
            onChange={(e) => setDefaultGrams(e.target.value)}
            className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink/40">
            g
          </span>
        </div>
      </label>

      {error && (
        <p className="rounded-2xl bg-peach/40 px-4 py-2.5 text-sm text-ink">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={saving} className="flex-1">
          {saving ? "Salvando..." : "Salvar alimento"}
        </Button>
      </div>
    </form>
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
