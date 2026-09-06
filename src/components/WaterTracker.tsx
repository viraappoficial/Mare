"use client";

import { formatLiters } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface WaterTrackerProps {
  valueMl: number;
  targetMl: number;
  onAdd: (amountMl: number) => void;
  onReset?: () => void;
}

export function WaterTracker({
  valueMl,
  targetMl,
  onAdd,
  onReset,
}: WaterTrackerProps) {
  const cupSize = 250;
  const totalCups = Math.max(Math.ceil(targetMl / cupSize), 1);
  const filledCups = Math.round(valueMl / cupSize);

  return (
    <div>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <span className="text-2xl font-bold text-ink">
            {formatLiters(valueMl)}
          </span>
          <span className="ml-1.5 text-sm text-ink/50">
            de {formatLiters(targetMl)}
          </span>
        </div>
        {onReset && valueMl > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-ink/40 underline-offset-2 hover:text-ink/70 hover:underline"
          >
            Reiniciar
          </button>
        )}
      </div>

      <ProgressBar
        value={valueMl}
        max={targetMl}
        colorClassName="bg-sky-500"
        className="mb-3"
      />

      <div
        className="mb-4 flex flex-wrap gap-1.5"
        aria-label={`${filledCups} de ${totalCups} copos de água`}
      >
        {Array.from({ length: totalCups }).map((_, i) => (
          <span
            key={i}
            aria-hidden
            className={`flex h-7 w-6 items-center justify-center rounded-b-md rounded-t-sm text-xs ${
              i < filledCups
                ? "bg-sky-400/80 text-white"
                : "bg-mist/40 text-transparent"
            }`}
          >
            💧
          </span>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onAdd(250)}
          className="flex-1 rounded-2xl bg-cream py-3 text-sm font-semibold text-ink hover:bg-mist/40"
        >
          + 250 ml
        </button>
        <button
          type="button"
          onClick={() => onAdd(500)}
          className="flex-1 rounded-2xl bg-cream py-3 text-sm font-semibold text-ink hover:bg-mist/40"
        >
          + 500 ml
        </button>
      </div>
    </div>
  );
}
