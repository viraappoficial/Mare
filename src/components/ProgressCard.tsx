import { Card } from "@/components/ui/Card";
import { InfoHelp } from "@/components/InfoHelp";
import { formatKg } from "@/lib/utils";

interface ProgressCardProps {
  currentWeightKg: number;
  startingWeightKg: number;
}

export function ProgressCard({
  currentWeightKg,
  startingWeightKg,
}: ProgressCardProps) {
  const diff = currentWeightKg - startingWeightKg;
  const hasChanged = Math.abs(diff) >= 0.05;
  const diffLabel = hasChanged
    ? `${diff > 0 ? "+" : "-"}${formatKg(Math.abs(diff))} desde o início`
    : "Começo do projeto";

  return (
    <Card className="bg-sage text-white">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium text-white/80">Peso atual</span>
        <InfoHelp
          title="Peso atual"
          description="É o último peso que você registrou. Pequenas variações de um dia para o outro são normais — o que importa é a tendência ao longo das semanas."
          filledBy="preenche"
          example="Registre na tela Hoje sempre que quiser, não precisa ser todo dia."
        />
      </div>
      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-4xl font-bold tracking-tight">
          {formatKg(currentWeightKg)}
        </span>
      </div>
      <div
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
          hasChanged && diff < 0
            ? "bg-white/20 text-white"
            : "bg-white/15 text-white/90"
        }`}
      >
        {hasChanged && diff < 0 && <span aria-hidden>↓</span>}
        {diffLabel}
      </div>
      <p className="mt-3 text-xs text-white/70">
        Peso inicial: {formatKg(startingWeightKg)}
      </p>
    </Card>
  );
}
