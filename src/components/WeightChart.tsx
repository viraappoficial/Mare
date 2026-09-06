import type { WeightEntry } from "@/types";

interface WeightChartProps {
  data: WeightEntry[];
  height?: number;
}

export function WeightChart({ data, height = 160 }: WeightChartProps) {
  if (data.length === 0) return null;

  const width = 320;
  const paddingX = 24;
  const paddingY = 20;
  const weights = data.map((d) => d.weightKg);
  const min = Math.min(...weights) - 0.5;
  const max = Math.max(...weights) + 0.5;
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x =
      data.length === 1
        ? width / 2
        : paddingX + (i * (width - paddingX * 2)) / (data.length - 1);
    const y =
      height -
      paddingY -
      ((d.weightKg - min) / range) * (height - paddingY * 2);
    return { x, y, entry: d };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    height - paddingY
  } L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="Gráfico de evolução do peso por semana"
      >
        <path d={areaPath} fill="#52796F" fillOpacity={0.12} />
        <path
          d={linePath}
          fill="none"
          stroke="#52796F"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4} fill="#52796F" />
            <circle cx={p.x} cy={p.y} r={7} fill="#52796F" fillOpacity={0.15} />
          </g>
        ))}
      </svg>
      <div className="mt-1 flex justify-between px-1">
        {data.map((d) => (
          <div key={d.id} className="flex flex-col items-center">
            <span className="text-[11px] text-ink/40">
              {d.label ?? d.date}
            </span>
            <span className="text-xs font-semibold text-ink">
              {d.weightKg.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
