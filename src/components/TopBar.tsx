import Link from "next/link";
import { profile } from "@/data/mockFernanda";

interface TopBarProps {
  greeting?: string;
  subtitle?: string;
  title?: string;
}

export function TopBar({ greeting, subtitle, title }: TopBarProps) {
  const initial = profile.name.charAt(0).toUpperCase();
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        {greeting ? (
          <>
            <h1 className="text-xl font-bold text-ink">{greeting}</h1>
            {subtitle && <p className="text-sm text-ink/60">{subtitle}</p>}
          </>
        ) : (
          <h1 className="text-xl font-bold text-ink">{title}</h1>
        )}
      </div>
      <Link
        href="/perfil"
        aria-label="Ir para o perfil"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-peach text-base font-semibold text-ink"
      >
        {initial}
      </Link>
    </div>
  );
}
