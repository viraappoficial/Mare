"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

type IconProps = SVGProps<SVGSVGElement>;

function HomeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} {...props}>
      <path
        d="M4 11.5 12 4l8 7.5M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TodayIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} {...props}>
      <rect x="4" y="5" width="16" height="15" rx="3" stroke="currentColor" />
      <path d="M4 9.5h16M8 3v3M16 3v3" stroke="currentColor" strokeLinecap="round" />
      <path
        d="m9 14 2 2 4-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MealIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} {...props}>
      <path
        d="M7 3v7a2 2 0 0 0 2 2v9M7 3v7M9 3v7M11 3v6a2 2 0 0 1-2 2M17 3c-1.7 0-3 2-3 5s1.3 5 3 5m0-10v18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WorkoutIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} {...props}>
      <path
        d="M6.5 8.5v7M17.5 8.5v7M3 10v4M21 10v4M6.5 12h11"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProgressIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} {...props}>
      <path
        d="M4 19V5M4 19h16M8 15l3-4 3 2.5L18 8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const navItems = [
  { href: "/", label: "Início", Icon: HomeIcon },
  { href: "/hoje", label: "Hoje", Icon: TodayIcon },
  { href: "/alimentacao", label: "Alimentação", Icon: MealIcon },
  { href: "/treinos", label: "Treinos", Icon: WorkoutIcon },
  { href: "/evolucao", label: "Evolução", Icon: ProgressIcon },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-mist/60 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegação principal"
    >
      <div className="mx-auto flex max-w-app justify-around px-1">
        {navItems.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex min-w-[64px] flex-1 flex-col items-center gap-1 py-2.5 sm:flex-initial sm:px-6"
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "h-6 w-6",
                  active ? "text-sage-dark" : "text-ink/40"
                )}
              />
              <span
                className={cn(
                  "text-[11px] font-medium",
                  active ? "text-sage-dark" : "text-ink/40"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
