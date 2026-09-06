"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { InfoHelp } from "@/components/InfoHelp";
import { MealCard } from "@/components/MealCard";
import { cn, formatNumber } from "@/lib/utils";
import { dailyPlan, foodSwaps, goal, today } from "@/data/mockFernanda";

type Tab = "resumo" | "plano" | "trocas";

const tabs: { value: Tab; label: string }[] = [
  { value: "resumo", label: "Resumo" },
  { value: "plano", label: "Plano do dia" },
  { value: "trocas", label: "Trocas" },
];

export default function AlimentacaoPage() {
  const [tab, setTab] = useState<Tab>("resumo");

  return (
    <AppShell>
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

      {tab === "resumo" && <ResumoTab onVerTrocas={() => setTab("trocas")} />}
      {tab === "plano" && <PlanoTab onSwap={() => setTab("trocas")} />}
      {tab === "trocas" && <TrocasTab />}
    </AppShell>
  );
}

function ResumoTab({ onVerTrocas }: { onVerTrocas: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-4">
        <MacroRow
          label="Calorias"
          value={today.caloriesConsumed}
          target={goal.calorieTarget}
          unit="kcal"
          colorClassName="bg-peach-dark"
          info="É a quantidade de energia recomendada para o seu dia. Calculada automaticamente a partir do seu gasto diário estimado e do déficit definido no seu perfil."
        />
        <MacroRow
          label="Proteína"
          value={today.proteinConsumedG}
          target={goal.proteinTargetG}
          unit="g"
          colorClassName="bg-sage-dark"
          info="Ajuda a manter massa muscular durante o emagrecimento. Calculada automaticamente a partir do seu peso."
        />
        <MacroRow
          label="Carboidratos"
          target={goal.carbTargetG}
          unit="g"
          colorClassName="bg-gold-dark"
          info="Sua principal fonte de energia para os treinos. É uma meta de referência, calculada automaticamente."
        />
        <MacroRow
          label="Gorduras"
          target={goal.fatTargetG}
          unit="g"
          colorClassName="bg-ink/40"
          info="Importante para hormônios e saciedade. É uma meta de referência, calculada automaticamente."
        />
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

function PlanoTab({ onSwap }: { onSwap: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-peach/40 py-3.5">
        <p className="text-sm leading-relaxed text-ink/80">
          Este é um guia, não uma lista obrigatória. Siga o quanto fizer
          sentido no seu dia.
        </p>
      </Card>
      {dailyPlan.map((meal) => (
        <MealCard key={meal.id} meal={meal} onSwap={onSwap} />
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
