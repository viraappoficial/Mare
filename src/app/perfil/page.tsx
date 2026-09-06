"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { InfoHelp } from "@/components/InfoHelp";
import { StatusBadge } from "@/components/StatusBadge";
import { SectionHeader } from "@/components/SectionHeader";
import { calculatedMetrics, goal, profile } from "@/data/mockFernanda";
import type { ActivityLevel } from "@/types";
import { formatLiters, formatNumber } from "@/lib/utils";

const activityLabels: Record<ActivityLevel, string> = {
  sedentario: "Sedentário (pouco ou nenhum exercício)",
  leve: "Leve (1–2x por semana)",
  moderado: "Moderado (3–4x por semana)",
  ativo: "Ativo (5x por semana)",
  muito_ativo: "Muito ativo (trabalho físico + treino)",
};

export default function PerfilPage() {
  const [activity, setActivity] = useState<ActivityLevel>("moderado");

  return (
    <AppShell>
      <TopBar title="Perfil e metas" />

      <div className="flex flex-col gap-5">
        <Card>
          <SectionHeader
            title="Seus dados"
            right={<StatusBadge kind="preenche" />}
          />
          <div className="flex flex-col gap-4">
            <Field label="Nome" defaultValue={profile.name} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Idade" defaultValue={profile.age} suffix="anos" />
              <Field
                label="Altura"
                defaultValue={profile.heightCm}
                suffix="cm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Peso inicial"
                defaultValue={goal.startingWeightKg}
                suffix="kg"
              />
              <Field
                label="Peso atual"
                defaultValue={goal.currentWeightKg}
                suffix="kg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Meta de treinos"
                defaultValue={goal.weeklyWorkoutTarget}
                suffix="/ semana"
              />
              <Field
                label="Déficit alvo"
                defaultValue={goal.deficitPercent}
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
                value={activity}
                onChange={(e) => setActivity(e.target.value as ActivityLevel)}
                className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
              >
                {Object.entries(activityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Cálculos automáticos"
            right={<StatusBadge kind="automatico" />}
          />
          <p className="mb-4 text-sm text-ink/60">
            Você não precisa preencher nada aqui — o sistema calcula tudo a
            partir dos seus dados acima.
          </p>
          <div className="flex flex-col divide-y divide-mist/50">
            <MetricRow
              label="IMC"
              value={formatNumber(calculatedMetrics.bmi, 1)}
              info="É uma relação entre peso e altura usada apenas como referência geral. Não mede diretamente gordura corporal ou massa muscular."
            />
            <MetricRow
              label="Metabolismo basal"
              value={`${formatNumber(calculatedMetrics.bmr)} kcal`}
              info="É a energia aproximada que seu corpo gastaria mesmo em repouso total, sem se mexer."
            />
            <MetricRow
              label="Gasto diário estimado"
              value={`${formatNumber(calculatedMetrics.tdee)} kcal`}
              info="É o metabolismo basal somado à energia gasta com suas atividades do dia (trabalho, treino, rotina)."
            />
            <MetricRow
              label="Meta de calorias"
              value={`${formatNumber(calculatedMetrics.calorieTarget)} kcal`}
              info="É o gasto diário estimado menos o déficit calórico definido — a diferença entre o que seu corpo gasta e o que você come, usada para emagrecer aos poucos."
            />
            <MetricRow
              label="Proteína"
              value={`${formatNumber(calculatedMetrics.proteinTargetG)} g`}
              info="Ajuda a preservar massa muscular durante o emagrecimento. Calculada a partir do seu peso."
            />
            <MetricRow
              label="Gorduras"
              value={`${formatNumber(calculatedMetrics.fatTargetG)} g`}
              info="Importante para hormônios e saciedade. Calculada a partir do seu peso."
            />
            <MetricRow
              label="Carboidratos"
              value={`${formatNumber(calculatedMetrics.carbTargetG)} g`}
              info="Sua principal fonte de energia para os treinos. É o restante da meta de calorias depois de proteína e gordura."
            />
            <MetricRow
              label="Água"
              value={`${formatLiters(
                calculatedMetrics.waterTargetMl
              )} (${formatLiters(
                calculatedMetrics.waterTargetTrainingDayMl
              )} em dia de treino)`}
              info="Referência diária de hidratação, calculada a partir do seu peso. Sobe um pouco em dias de treino."
            />
          </div>
        </Card>

        <p className="px-1 text-center text-xs leading-relaxed text-ink/40">
          Esses números são estimativas para organização e acompanhamento
          pessoal. Não substituem orientação de um profissional de saúde ou
          nutrição.
        </p>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  defaultValue,
  suffix,
}: {
  label: string;
  defaultValue: string | number;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink/70">
        {label}
      </span>
      <div className="relative">
        <input
          defaultValue={defaultValue}
          className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
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
