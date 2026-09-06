import { cn } from "@/lib/utils";
import type { WorkoutDayStatus, WorkoutFocus } from "@/types";

const focusLabels: Record<WorkoutFocus, string> = {
  inferiores: "Inferiores",
  superiores: "Superiores",
  full_body: "Full body",
  cardio: "Cardio",
  misto: "Misto",
};

const weekdayLabels: Record<string, string> = {
  seg: "Seg",
  ter: "Ter",
  qua: "Qua",
  qui: "Qui",
  sex: "Sex",
  sab: "Sáb",
  dom: "Dom",
};

const statusStyles: Record<
  WorkoutDayStatus,
  { badge: string; icon: string; label: string }
> = {
  feito: { badge: "bg-sage text-white", icon: "✓", label: "Treinou" },
  faltou: { badge: "bg-peach text-ink", icon: "·", label: "Não treinou" },
  descanso: { badge: "bg-mist text-ink/70", icon: "–", label: "Descanso" },
  pendente: {
    badge: "border-2 border-dashed border-mist text-ink/40",
    icon: "",
    label: "Ainda não registrado",
  },
};

interface WorkoutDayProps {
  weekday: string;
  status: WorkoutDayStatus;
  focus?: WorkoutFocus;
}

export function WorkoutDay({ weekday, status, focus }: WorkoutDayProps) {
  const s = statusStyles[status];
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-xs font-medium text-ink/50">
        {weekdayLabels[weekday] ?? weekday}
      </span>
      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-semibold",
          s.badge
        )}
        aria-label={s.label}
        title={s.label}
      >
        {s.icon}
      </span>
      <span className="h-8 text-center text-[11px] leading-tight text-ink/60">
        {focus ? focusLabels[focus] : ""}
      </span>
    </div>
  );
}
