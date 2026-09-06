import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/TopBar";
import { ProgressCard } from "@/components/ProgressCard";
import { MetricCard } from "@/components/MetricCard";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { TimelineItem } from "@/components/TimelineItem";
import { WeeklySummaryCard } from "@/components/WeeklySummaryCard";
import { FlameIcon, ProteinIcon, DropletIcon, DumbbellIcon } from "@/components/icons";
import {
  goal,
  today,
  dayTimeline,
  weeklySummary,
} from "@/data/mockFernanda";
import { formatKg, formatLiters, formatNumber } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <AppShell>
      <TopBar
        greeting="Bom dia, Fernanda"
        subtitle="Vamos cuidar do seu progresso hoje?"
      />

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-3 lg:items-start lg:gap-6">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <ProgressCard
            currentWeightKg={goal.currentWeightKg}
            startingWeightKg={goal.startingWeightKg}
          />

          <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
            <MetricCard
              icon={<FlameIcon className="h-5 w-5 text-peach-dark" />}
              label="Calorias"
              valueLabel={formatNumber(today.caloriesConsumed)}
              targetLabel={`${formatNumber(goal.calorieTarget)} kcal`}
              progressValue={today.caloriesConsumed}
              progressMax={goal.calorieTarget}
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
              valueLabel={`${formatNumber(today.proteinConsumedG)} g`}
              targetLabel={`${formatNumber(goal.proteinTargetG)} g`}
              progressValue={today.proteinConsumedG}
              progressMax={goal.proteinTargetG}
              progressColorClassName="bg-sage-dark"
              info={{
                title: "Meta de proteína",
                description:
                  "Ajuda a preservar massa muscular durante o emagrecimento. É calculada automaticamente a partir do seu peso.",
                filledBy: "automatico",
              }}
            />
            <MetricCard
              icon={<DropletIcon className="h-5 w-5 text-sky-500" />}
              label="Água"
              valueLabel={formatLiters(today.waterMl)}
              targetLabel={formatLiters(goal.waterTargetMl)}
              progressValue={today.waterMl}
              progressMax={goal.waterTargetMl}
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
              valueLabel={`${today.workoutsThisWeek}`}
              targetLabel={`${goal.weeklyWorkoutTarget} nesta semana`}
              progressValue={today.workoutsThisWeek}
              progressMax={goal.weeklyWorkoutTarget}
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
            <SectionHeader title="Seu dia" subtitle="Linha do tempo de hoje" />
            <div>
              {dayTimeline.map((item, i) => (
                <TimelineItem
                  key={item.time}
                  time={item.time}
                  label={item.label}
                  isLast={i === dayTimeline.length - 1}
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
        Peso inicial: {formatKg(goal.startingWeightKg)} · Números são
        estimativas de organização pessoal, não prescrição médica.
      </p>
    </AppShell>
  );
}
