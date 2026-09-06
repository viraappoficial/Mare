import { cn } from "@/lib/utils";

export type StatusBadgeKind = "preenche" | "automatico" | "meta";

const config: Record<
  StatusBadgeKind,
  { label: string; className: string; dot: string }
> = {
  preenche: {
    label: "Você preenche",
    className: "bg-peach/60 text-ink",
    dot: "bg-peach-dark",
  },
  automatico: {
    label: "Automático",
    className: "bg-mist/60 text-ink",
    dot: "bg-sage-dark",
  },
  meta: {
    label: "Sua meta",
    className: "bg-gold/40 text-ink",
    dot: "bg-gold-dark",
  },
};

interface StatusBadgeProps {
  kind: StatusBadgeKind;
  className?: string;
}

export function StatusBadge({ kind, className }: StatusBadgeProps) {
  const c = config[kind];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        c.className,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} aria-hidden />
      {c.label}
    </span>
  );
}
