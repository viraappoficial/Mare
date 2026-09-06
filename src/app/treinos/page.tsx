"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { InfoHelp } from "@/components/InfoHelp";
import { WorkoutDay } from "@/components/WorkoutDay";
import { SectionHeader } from "@/components/SectionHeader";
import {
  cardioMinutesThisWeek,
  goal,
  weekWorkouts,
} from "@/data/mockFernanda";

export default function TreinosPage() {
  const completed = weekWorkouts.filter((w) => w.status === "feito").length;
  const [cardioMinutes, setCardioMinutes] = useState(cardioMinutesThisWeek);

  return (
    <AppShell>
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
              {completed} de {goal.weeklyWorkoutTarget}
            </span>
          </div>
          <ProgressBar
            value={completed}
            max={goal.weeklyWorkoutTarget}
            colorClassName="bg-gold-dark"
          />
        </Card>

        <Card>
          <SectionHeader title="Sua semana" />
          <div className="grid grid-cols-7 gap-1.5 overflow-x-auto sm:gap-2">
            {weekWorkouts.map((w) => (
              <WorkoutDay
                key={w.id}
                weekday={w.weekday}
                status={w.status}
                focus={w.focus}
              />
            ))}
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
              description="Caminhadas e outros cardios fora da academia também contam. Registre os minutos aproximados da semana."
              filledBy="preenche"
            />
          </div>
          <div className="mb-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-ink">
              {cardioMinutes}
            </span>
            <span className="text-sm text-ink/50">min esta semana</span>
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
      </div>
    </AppShell>
  );
}
