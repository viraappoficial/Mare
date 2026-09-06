import { Card } from "@/components/ui/Card";
import type { Meal } from "@/types";

interface MealCardProps {
  meal: Meal;
  onSwap?: () => void;
}

export function MealCard({ meal, onSwap }: MealCardProps) {
  return (
    <Card className="flex gap-4">
      <div className="w-14 shrink-0 pt-0.5 text-sm font-semibold text-sage-dark">
        {meal.time}
      </div>
      <div className="flex-1">
        <div className="mb-1.5 flex items-center gap-2">
          <h3 className="font-semibold text-ink">{meal.title}</h3>
          {meal.optional && (
            <span className="rounded-full bg-cream px-2 py-0.5 text-[11px] font-medium text-ink/50">
              opcional
            </span>
          )}
        </div>
        <ul className="mb-2 space-y-0.5">
          {meal.items.map((item) => (
            <li key={item} className="text-sm text-ink/70">
              {item}
            </li>
          ))}
        </ul>
        {(meal.approxCalories || meal.approxProteinG) && (
          <div className="flex flex-wrap gap-2">
            {meal.approxCalories && (
              <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-ink/70">
                ~{meal.approxCalories} kcal
              </span>
            )}
            {meal.approxProteinG && (
              <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-ink/70">
                ~{meal.approxProteinG} g proteína
              </span>
            )}
          </div>
        )}
        {onSwap && (
          <button
            type="button"
            onClick={onSwap}
            className="mt-2.5 text-sm font-medium text-sage-dark underline-offset-2 hover:underline"
          >
            Ver trocas
          </button>
        )}
      </div>
    </Card>
  );
}
