"use client";

import { useState } from "react";
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
import {
  goal,
  latestMeasurement,
  weeklySummary,
  weightHistory,
} from "@/data/mockFernanda";

const measurementFields: {
  key: keyof typeof latestMeasurement;
  label: string;
}[] = [
  { key: "waistCm", label: "Cintura" },
  { key: "hipCm", label: "Quadril" },
  { key: "thighCm", label: "Coxa" },
  { key: "armCm", label: "Braço" },
];

export default function EvolucaoPage() {
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);
  const diff = goal.currentWeightKg - goal.startingWeightKg;

  return (
    <AppShell>
      <TopBar title="Evolução" />

      <div className="flex flex-col gap-5">
        <Card>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-ink/50">Inicial</p>
              <p className="text-lg font-bold text-ink">
                {formatKg(goal.startingWeightKg)}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink/50">Atual</p>
              <p className="text-lg font-bold text-sage-dark">
                {formatKg(goal.currentWeightKg)}
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

        <Card>
          <SectionHeader
            title="Peso por semana"
            subtitle="Olhe para a tendência, não para um único dia"
          />
          <WeightChart data={weightHistory} />
          <div className="mt-4 flex items-start gap-2 rounded-2xl bg-cream p-3.5">
            <TrendingUpIcon className="mt-0.5 h-4 w-4 shrink-0 text-sage-dark" />
            <p className="text-sm leading-relaxed text-ink/70">
              Seu peso pode variar por água, ciclo menstrual, alimentação,
              sal, sono e até o horário da pesagem. Tendência importa mais
              que peso de um único dia.
            </p>
          </div>
        </Card>

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
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {measurementFields.map((f) => (
              <div key={f.key} className="rounded-2xl bg-cream p-3.5">
                <p className="text-xs text-ink/50">{f.label}</p>
                <p className="text-lg font-bold text-ink">
                  {latestMeasurement[f.key]} cm
                </p>
              </div>
            ))}
          </div>

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
              {measurementFields.map((f) => (
                <label key={f.key} className="block">
                  <span className="mb-1.5 block text-sm font-medium text-ink/70">
                    {f.label} (cm)
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    defaultValue={latestMeasurement[f.key]}
                    className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
                  />
                </label>
              ))}
              <Button
                fullWidth
                onClick={() => {
                  setShowForm(false);
                  setSaved(true);
                }}
              >
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
    </AppShell>
  );
}
