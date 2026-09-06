"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { InfoHelp } from "@/components/InfoHelp";
import { StatusBadge } from "@/components/StatusBadge";
import { SectionHeader } from "@/components/SectionHeader";
import {
  calculateBMI,
  calculateBMR,
  calculateCarbTarget,
  calculateCalorieTarget,
  calculateFatTarget,
  calculateProteinTarget,
  calculateTDEE,
  calculateWaterTarget,
  calculateWaterTargetTrainingDay,
} from "@/lib/calculations";
import { formatLiters, formatNumber } from "@/lib/utils";
import { useProfileData } from "@/lib/profile-context";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import {
  ACTIVITY_MULTIPLIERS,
  activityLevelFromMultiplier,
  updateGoal,
  updateProfile,
  type GoalRow,
  type ProfileRow,
} from "@/lib/queries";
import type { ActivityLevel, Sex } from "@/types";

const activityLabels: Record<ActivityLevel, string> = {
  sedentario: "Sedentário (pouco ou nenhum exercício)",
  leve: "Leve (1–2x por semana)",
  moderado: "Moderado (3–4x por semana)",
  ativo: "Ativo (5x por semana)",
  muito_ativo: "Muito ativo (trabalho físico + treino)",
};

export default function PerfilPage() {
  const { profile, goal } = useProfileData();

  return (
    <AppShell>
      {profile && goal ? <PerfilBody profile={profile} goal={goal} /> : null}
    </AppShell>
  );
}

function PerfilBody({ profile, goal }: { profile: ProfileRow; goal: GoalRow }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const { refresh } = useProfileData();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [sex, setSex] = useState<Sex>("feminino");
  const [weightKg, setWeightKg] = useState("");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderado");
  const [deficitPercent, setDeficitPercent] = useState("");
  const [weeklyWorkoutTarget, setWeeklyWorkoutTarget] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setAge(String(profile.age));
    setHeightCm(String(profile.height_cm));
    setSex(profile.sex as Sex);
    setWeightKg(String(goal.current_weight_kg));
    setActivityLevel(activityLevelFromMultiplier(goal.activity_multiplier));
    setDeficitPercent(String(goal.deficit_percent));
    setWeeklyWorkoutTarget(String(goal.weekly_workout_target));
  }, [profile, goal]);

  const weightNum = Number(weightKg) || goal.current_weight_kg;
  const heightNum = Number(heightCm) || profile.height_cm;
  const ageNum = Number(age) || profile.age;
  const deficitNum = Number(deficitPercent) || goal.deficit_percent;
  const activityMultiplier = ACTIVITY_MULTIPLIERS[activityLevel];

  const bmi = calculateBMI(weightNum, heightNum);
  const bmr = calculateBMR(weightNum, heightNum, ageNum, sex);
  const tdee = calculateTDEE(bmr, activityMultiplier);
  const calorieTarget = calculateCalorieTarget(tdee, deficitNum);
  const proteinTargetG = calculateProteinTarget(weightNum);
  const fatTargetG = calculateFatTarget(weightNum);
  const carbTargetG = calculateCarbTarget(calorieTarget, proteinTargetG, fatTargetG);
  const waterTargetMl = calculateWaterTarget(weightNum);
  const waterTargetTrainingDayMl = calculateWaterTargetTrainingDay(waterTargetMl);

  async function handleSave() {
    if (!supabase) return;
    setSaving(true);
    try {
      await updateProfile(supabase, profile.id, {
        name,
        age: ageNum,
        height_cm: heightNum,
        sex,
      });
      await updateGoal(supabase, profile.id, {
        current_weight_kg: weightNum,
        activity_multiplier: activityMultiplier,
        deficit_percent: deficitNum,
        weekly_workout_target: Number(weeklyWorkoutTarget) || goal.weekly_workout_target,
        calorie_target: Math.round(calorieTarget),
        protein_target_g: proteinTargetG,
        fat_target_g: fatTargetG,
        carb_target_g: carbTargetG,
        water_target_ml: waterTargetMl,
        water_target_training_day_ml: waterTargetTrainingDayMl,
      });
      await refresh();
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <>
      <TopBar title="Perfil e metas" />

      <div className="flex flex-col gap-5">
        <Card>
          <SectionHeader
            title="Seus dados"
            right={<StatusBadge kind="preenche" />}
          />
          <div className="flex flex-col gap-4">
            <Field label="Nome" value={name} onChange={setName} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Idade" value={age} onChange={setAge} type="number" suffix="anos" />
              <Field
                label="Altura"
                value={heightCm}
                onChange={setHeightCm}
                type="number"
                suffix="cm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Peso inicial"
                value={String(goal.starting_weight_kg)}
                onChange={() => {}}
                type="number"
                suffix="kg"
                disabled
              />
              <Field
                label="Peso atual"
                value={weightKg}
                onChange={setWeightKg}
                type="number"
                suffix="kg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Meta de treinos"
                value={weeklyWorkoutTarget}
                onChange={setWeeklyWorkoutTarget}
                type="number"
                suffix="/ semana"
              />
              <Field
                label="Déficit alvo"
                value={deficitPercent}
                onChange={setDeficitPercent}
                type="number"
                suffix="%"
              />
            </div>
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink/70">
                Nível de atividade
                <InfoHelp
                  title="Nível de atividade"
                  description="Estimativa de quanto você se movimenta fora dos treinos (trabalho, rotina diária). É usado para calcular seu gasto diário estimado."
                  filledBy="preenche"
                />
              </span>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
              >
                {Object.entries(activityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            {saved && (
              <p className="rounded-2xl bg-sage/15 px-4 py-2.5 text-sm font-medium text-sage-dark">
                Perfil e metas atualizados 💚
              </p>
            )}

            <Button onClick={handleSave} disabled={saving} fullWidth>
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Cálculos automáticos"
            right={<StatusBadge kind="automatico" />}
          />
          <p className="mb-4 text-sm text-ink/60">
            Você não precisa preencher nada aqui — são recalculados a partir
            dos seus dados acima sempre que você salvar.
          </p>
          <div className="flex flex-col divide-y divide-mist/50">
            <MetricRow
              label="IMC"
              value={formatNumber(bmi, 1)}
              info="É uma relação entre peso e altura usada apenas como referência geral. Não mede diretamente gordura corporal ou massa muscular."
            />
            <MetricRow
              label="Metabolismo basal"
              value={`${formatNumber(bmr)} kcal`}
              info="É a energia aproximada que seu corpo gastaria mesmo em repouso total, sem se mexer."
            />
            <MetricRow
              label="Gasto diário estimado"
              value={`${formatNumber(tdee)} kcal`}
              info="É o metabolismo basal somado à energia gasta com suas atividades do dia (trabalho, treino, rotina)."
            />
            <MetricRow
              label="Meta de calorias"
              value={`${formatNumber(calorieTarget)} kcal`}
              info="É o gasto diário estimado menos o déficit calórico definido — a diferença entre o que seu corpo gasta e o que você come, usada para emagrecer aos poucos."
            />
            <MetricRow
              label="Proteína"
              value={`${formatNumber(proteinTargetG)} g`}
              info="Ajuda a preservar massa muscular durante o emagrecimento. Calculada a partir do seu peso."
            />
            <MetricRow
              label="Gorduras"
              value={`${formatNumber(fatTargetG)} g`}
              info="Importante para hormônios e saciedade. Calculada a partir do seu peso."
            />
            <MetricRow
              label="Carboidratos"
              value={`${formatNumber(carbTargetG)} g`}
              info="Sua principal fonte de energia para os treinos. É o restante da meta de calorias depois de proteína e gordura."
            />
            <MetricRow
              label="Água"
              value={`${formatLiters(waterTargetMl)} (${formatLiters(
                waterTargetTrainingDayMl
              )} em dia de treino)`}
              info="Referência diária de hidratação, calculada a partir do seu peso. Sobe um pouco em dias de treino."
            />
          </div>
        </Card>

        <Button variant="ghost" fullWidth onClick={handleSignOut}>
          Sair da conta
        </Button>

        <p className="px-1 text-center text-xs leading-relaxed text-ink/40">
          Esses números são estimativas para organização e acompanhamento
          pessoal. Não substituem orientação de um profissional de saúde ou
          nutrição.
        </p>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  suffix,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  suffix?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink/70">
        {label}
      </span>
      <div className="relative">
        <input
          type={type}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage disabled:bg-cream disabled:text-ink/50"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink/40">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

function MetricRow({
  label,
  value,
  info,
}: {
  label: string;
  value: string;
  info: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="flex items-center gap-1.5 text-sm font-medium text-ink/70">
        {label}
        <InfoHelp title={label} description={info} filledBy="automatico" />
      </span>
      <span className="text-base font-semibold text-ink">{value}</span>
    </div>
  );
}
