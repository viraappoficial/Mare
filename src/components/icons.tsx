import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function FlameIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        d="M12 3s-5 4.5-5 9.5a5 5 0 0 0 10 0c0-1.3-.5-2.2-1-3 0 1.5-1 2-1 2 .5-3-1.5-5-3-6.5.3 1.5-.2 2.6-1 3.5-.6.7-1 1.6-1 2.5"
        stroke="currentColor"
      />
    </svg>
  );
}

export function ProteinIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        d="M8 15a5 5 0 1 1 3-9c1.5-1.5 4-1.7 5.3-.4 1.3 1.3 1.1 3.8-.4 5.3a5 5 0 1 1-9 3Z"
        stroke="currentColor"
      />
      <path d="m5 19 3-3" stroke="currentColor" />
    </svg>
  );
}

export function DropletIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"
        stroke="currentColor"
      />
    </svg>
  );
}

export function DumbbellIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.5 8.5v7M17.5 8.5v7M3 10v4M21 10v4M6.5 12h11" stroke="currentColor" />
    </svg>
  );
}

export function ScaleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        d="M12 3v18M7 7H2l2.5 5A2.5 2.5 0 0 0 9 12L7 7ZM17 7h5l-2.5 5A2.5 2.5 0 0 1 15 12l2-5ZM8 21h8"
        stroke="currentColor"
      />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="5" width="16" height="15" rx="3" stroke="currentColor" />
      <path d="M4 9.5h16M8 3v3M16 3v3" stroke="currentColor" />
    </svg>
  );
}

export function TrendingUpIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 17 10 11l4 4 6-7M20 8h-4v4" stroke="currentColor" />
    </svg>
  );
}

export function RulerIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        d="m4 15 5-5 3 3 8-8M9 6l2 2M13 10l2 2M6 13l2 2"
        stroke="currentColor"
      />
      <path d="M2 21 21 2" stroke="currentColor" strokeOpacity={0} />
    </svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" />
      <path d="m8.5 12.5 2.3 2.3L16 10" stroke="currentColor" />
    </svg>
  );
}
