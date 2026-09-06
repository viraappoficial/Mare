import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { InfoHelp } from "@/components/InfoHelp";
import { cn } from "@/lib/utils";
import type { StatusBadgeKind } from "@/components/StatusBadge";

interface MetricCardInfo {
  title: string;
  description: string;
  filledBy?: StatusBadgeKind;
  example?: string;
}

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  valueLabel: string;
  targetLabel?: string;
  progressValue?: number;
  progressMax?: number;
  progressColorClassName?: string;
  info?: MetricCardInfo;
  className?: string;
}

export function MetricCard({
  icon,
  label,
  valueLabel,
  targetLabel,
  progressValue,
  progressMax,
  progressColorClassName = "bg-sage",
  info,
  className,
}: MetricCardProps) {
  const hasProgress = progressValue !== undefined && progressMax !== undefined;
  return (
    <Card className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-lg"
            aria-hidden
          >
            {icon}
          </span>
          <span className="text-sm font-medium text-ink/70">{label}</span>
        </div>
        {info && (
          <InfoHelp
            title={info.title}
            description={info.description}
            filledBy={info.filledBy}
            example={info.example}
          />
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-ink">{valueLabel}</span>
        {targetLabel && (
          <span className="text-sm text-ink/50">/ {targetLabel}</span>
        )}
      </div>
      {hasProgress && (
        <ProgressBar
          value={progressValue!}
          max={progressMax!}
          colorClassName={progressColorClassName}
        />
      )}
    </Card>
  );
}
