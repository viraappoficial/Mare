interface TimelineItemProps {
  time: string;
  label: string;
  isLast?: boolean;
}

export function TimelineItem({ time, label, isLast }: TimelineItemProps) {
  return (
    <div className="flex gap-3">
      <div className="flex w-14 shrink-0 justify-end pt-0.5">
        <span className="text-sm font-medium text-ink/60">{time}</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-sage" />
        {!isLast && <span className="w-px flex-1 bg-mist" />}
      </div>
      <div className="pb-4">
        <span className="text-[15px] text-ink">{label}</span>
      </div>
    </div>
  );
}
