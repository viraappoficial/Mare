"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { InfoHelp } from "@/components/InfoHelp";
import { WaterTracker } from "@/components/WaterTracker";
import { cn, formatNumber } from "@/lib/utils";
import { goal, today } from "@/data/mockFernanda";
import type { TrainedStatus, WorkoutFocus } from "@/types";

const focusOptions: { value: WorkoutFocus; label: string }[] = [
  { value: "inferiores", label: "Inferiores" },
  { value: "superiores", label: "Superiores" },
  { value: "full_body", label: "Full body" },
  { value: "cardio", label: "Cardio/caminhada" },
  { value: "misto", label: "Misto" },
];

const todayDateLabel = new Date().toLocaleDateString("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});

export default function HojePage() {
  const [trained, setTrained] = useState<TrainedStatus>(null);
  const [focus, setFocus] = useState<WorkoutFocus | null>(null);
  const [minutes, setMinutes] = useState("");
  const [waterMl, setWaterMl] = useState(today.waterMl);
  const [weight, setWeight] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <AppShell>
      <TopBar title="Hoje" />
      <p className="-mt-3 mb-5 text-sm capitalize text-ink/50">
        {todayDateLabel}
      </p>

      {saved && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl bg-sage/15 px-4 py-3 text-sm font-medium text-sage-dark">
          <span aria-hidden>💚</span> Dia registrado! Bom trabalho, Fernanda.
        </div>
      )}

      <div className="flex flex-col gap-5">
        <Card>
          <h2 className="mb-3 text-base font-semibold text-ink">
            Treinei hoje?
          </h2>
          <div className="grid grid-cols-3 gap-2.5">
            <ChoiceButton
              label="Sim"
              active={trained === "sim"}
              onClick={() => setTrained("sim")}
            />
            <ChoiceButton
              label="Não"
              active={trained === "nao"}
              onClick={() => {
                setTrained("nao");
                setFocus(null);
              }}
            />
            <ChoiceButton
              label="Descanso"
              active={trained === "descanso_planejado"}
              onClick={() => {
                setTrained("descanso_planejado");
                setFocus(null);
              }}
            />
          </div>

          {trained === "sim" && (
            <div className="mt-5 border-t border-mist/60 pt-5">
              <p className="mb-2.5 text-sm font-medium text-ink/70">
                O que você treinou?
              </p>
              <div className="mb-4 flex flex-wrap gap-2">
                {focusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFocus(opt.value)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      focus === opt.value
                        ? "bg-sage text-white"
                        : "bg-cream text-ink/70 hover:bg-mist/40"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink/70">
                  Minutos de treino
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="Ex: 55"
                  className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
                />
              </label>
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-1 flex items-center gap-1.5">
            <h2 className="text-base font-semibold text-ink">Água</h2>
            <InfoHelp
              title="Meta de água"
              description="Referência diária de hidratação, calculada a partir do seu peso. Em dias de treino a meta sobe um pouco."
              filledBy="meta"
            />
          </div>
          <WaterTracker
            valueMl={waterMl}
            targetMl={goal.waterTargetMl}
            onAdd={(amount) => setWaterMl((v) => v + amount)}
            onReset={() => setWaterMl(0)}
          />
        </Card>

        <Card>
          <div className="mb-1 flex items-center gap-1.5">
            <h2 className="text-base font-semibold text-ink">Peso hoje</h2>
            <InfoHelp
              title="Peso hoje"
              description="Você não precisa se pesar todos os dias. Registre apenas quando quiser — o que importa é a tendência ao longo das semanas, não um único dia."
              filledBy="preenche"
            />
          </div>
          <p className="mb-3 text-sm text-ink/50">Campo opcional</p>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={`${goal.currentWeightKg}`}
              className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink/40">
              kg
            </span>
          </div>
        </Card>

        <Card>
          <div className="mb-1 flex items-center gap-1.5">
            <h2 className="text-base font-semibold text-ink">Alimentação</h2>
            <InfoHelp
              title="Calorias consumidas"
              description="Nesta etapa este número é apenas ilustrativo. Quando a tela de Alimentação estiver conectada ao seu registro de refeições, ele será atualizado automaticamente ao longo do dia."
              filledBy="automatico"
            />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-ink">
              {formatNumber(today.caloriesConsumed)}
            </span>
            <span className="text-sm text-ink/50">
              / {formatNumber(goal.calorieTarget)} kcal
            </span>
          </div>
        </Card>

        <Button fullWidth onClick={handleSave} className="mt-1">
          Salvar meu dia
        </Button>
      </div>
    </AppShell>
  );
}

function ChoiceButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-[52px] rounded-2xl text-sm font-semibold transition-colors",
        active ? "bg-sage text-white" : "bg-cream text-ink/70 hover:bg-mist/40"
      )}
    >
      {label}
    </button>
  );
}
