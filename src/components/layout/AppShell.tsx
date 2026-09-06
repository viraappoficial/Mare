"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/BottomNavigation";
import { SupabaseNotConfigured } from "@/components/SupabaseNotConfigured";
import { useAuth } from "@/lib/auth-context";
import { useProfileData } from "@/lib/profile-context";
import { supabase } from "@/lib/supabase";

function FullScreenSpinner() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-mist border-t-sage" />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfileData();

  const ready = !authLoading && !profileLoading;

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!profile) {
      router.replace("/onboarding");
    }
  }, [ready, user, profile, router]);

  if (!supabase) return <SupabaseNotConfigured />;
  if (!ready || !user || !profile) return <FullScreenSpinner />;

  return (
    <div className="min-h-dvh bg-cream">
      <main className="mx-auto max-w-app px-4 pb-28 pt-6 sm:px-6 lg:px-10">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
