import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  colorClassName?: string;
  trackClassName?: string;
}

export function ProgressBar({
  value,
  max,
  className,
  colorClassName = "bg-sage",
  trackClassName = "bg-mist/50",
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;
  return (
    <div
      className={cn("h-2.5 w-full overflow-hidden rounded-full", trackClassName, className)}
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-500", colorClassName)}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
