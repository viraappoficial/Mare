"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { getGoal, getProfile, type GoalRow, type ProfileRow } from "@/lib/queries";

interface ProfileContextValue {
  profile: ProfileRow | null;
  goal: GoalRow | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [goal, setGoal] = useState<GoalRow | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !user) {
      setProfile(null);
      setGoal(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const profileRow = await getProfile(supabase, user.id);
    setProfile(profileRow);
    if (profileRow) {
      const goalRow = await getGoal(supabase, profileRow.id);
      setGoal(goalRow);
    } else {
      setGoal(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    refresh();
  }, [authLoading, refresh]);

  return (
    <ProfileContext.Provider value={{ profile, goal, loading, refresh }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileData() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfileData precisa estar dentro de <ProfileProvider>");
  return ctx;
}
