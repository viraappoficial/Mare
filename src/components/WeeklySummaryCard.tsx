import { Card } from "@/components/ui/Card";
import { InfoHelp } from "@/components/InfoHelp";
import { SectionHeader } from "@/components/SectionHeader";
import { formatKg, formatNumber } from "@/lib/utils";
import type { WeeklySummary } from "@/types";

interface WeeklySummaryCardProps {
  summary: WeeklySummary;
  compact?: boolean;
}

export function WeeklySummaryCard({
  summary,
  compact,
}: WeeklySummaryCardProps) {
  return (
    <Card>
      {!compact && (
        <SectionHeader
          title="Resumo da semana"
          subtitle="Uma visão geral, sem cobrança"
        />
      )}
      <div className="grid grid-cols-2 gap-4">
        <Stat
          label="Treinos"
          value={`${summary.workoutsCompleted}/${summary.workoutsTarget}`}
        />
        <Stat label="Dias registrados" value={`${summary.daysLogged}/7`} />
        <Stat label="Adesão" value={`${summary.adherencePercent}%`} />
        <Stat
          label="Calorias médias"
          value={`${formatNumber(summary.avgCaloriesLogged)} kcal`}
        />
        <Stat
          label="Déficit estimado"
          value={`~${formatNumber(summary.estimatedDeficit)} kcal/dia`}
        />
        <Stat
          label="Perda teórica"
          value={`~${formatNumber(summary.theoreticalLossKg, 2)} kg`}
          info={{
            title: "Perda teórica",
            description:
              "É apenas uma estimativa matemática, calculada a partir do déficit calórico da semana (usamos ~7700 kcal ≈ 1 kg de gordura como referência). Seu peso real pode variar por vários motivos, como água, sono e ciclo menstrual.",
          }}
        />
        <Stat label="Peso médio" value={formatKg(summary.avgWeightKg)} />
        <Stat
          label="Mudança de peso"
          value={`${summary.actualWeightChangeKg > 0 ? "+" : ""}${formatKg(
            summary.actualWeightChangeKg
          )}`}
        />
      </div>
    </Card>
  );
}

function Stat({
  label,
  value,
  info,
}: {
  label: string;
  value: string;
  info?: { title: string; description: string };
}) {
  return (
    <div>
      <div className="mb-0.5 flex items-center gap-1.5">
        <span className="text-xs text-ink/50">{label}</span>
        {info && (
          <InfoHelp
            title={info.title}
            description={info.description}
            filledBy="automatico"
          />
        )}
      </div>
      <span className="text-base font-semibold text-ink">{value}</span>
    </div>
  );
}
