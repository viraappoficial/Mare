import type { ReactNode } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-cream">
      <main className="mx-auto max-w-app px-4 pb-28 pt-6 sm:px-6 lg:px-10">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
