"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SupabaseNotConfigured } from "@/components/SupabaseNotConfigured";
import { useAuth } from "@/lib/auth-context";
import { useProfileData } from "@/lib/profile-context";
import { supabase } from "@/lib/supabase";
import { createProfileAndGoal } from "@/lib/queries";
import type { ActivityLevel, Sex } from "@/types";

const activityLabels: Record<ActivityLevel, string> = {
  sedentario: "Sedentário (pouco ou nenhum exercício)",
  leve: "Leve (1–2x por semana)",
  moderado: "Moderado (3–4x por semana)",
  ativo: "Ativo (5x por semana)",
  muito_ativo: "Muito ativo (trabalho físico + treino)",
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, refresh } = useProfileData();

  const [name, setName] = useState("Fernanda");
  const [age, setAge] = useState("21");
  const [heightCm, setHeightCm] = useState("180");
  const [sex, setSex] = useState<Sex>("feminino");
  const [weightKg, setWeightKg] = useState("90");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderado");
  const [deficitPercent, setDeficitPercent] = useState("20");
  const [weeklyWorkoutTarget, setWeeklyWorkoutTarget] = useState("5");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading || profileLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (profile) {
      router.replace("/");
    }
  }, [authLoading, profileLoading, user, profile, router]);

  if (!supabase) return <SupabaseNotConfigured />;
  if (authLoading || profileLoading || !user || profile) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await createProfileAndGoal(supabase!, {
        userId: user!.id,
        name,
        age: Number(age),
        heightCm: Number(heightCm),
        sex,
        weightKg: Number(weightKg),
        activityLevel,
        deficitPercent: Number(deficitPercent),
        weeklyWorkoutTarget: Number(weeklyWorkoutTarget),
      });
      await refresh();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-ink">Vamos começar</h1>
          <p className="text-sm text-ink/60">
            Alguns dados pra calcular suas metas automaticamente
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Nome" value={name} onChange={setName} />
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Idade"
                value={age}
                onChange={setAge}
                type="number"
                suffix="anos"
              />
              <Field
                label="Altura"
                value={heightCm}
                onChange={setHeightCm}
                type="number"
                suffix="cm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Peso atual"
                value={weightKg}
                onChange={setWeightKg}
                type="number"
                suffix="kg"
              />
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink/70">
                  Sexo
                </span>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as Sex)}
                  className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
                >
                  <option value="feminino">Feminino</option>
                  <option value="masculino">Masculino</option>
                  <option value="outro">Outro</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink/70">
                Nível de atividade
              </span>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
              >
                {Object.entries(activityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Déficit alvo"
                value={deficitPercent}
                onChange={setDeficitPercent}
                type="number"
                suffix="%"
              />
              <Field
                label="Meta de treinos"
                value={weeklyWorkoutTarget}
                onChange={setWeeklyWorkoutTarget}
                type="number"
                suffix="/ semana"
              />
            </div>

            {error && (
              <p className="rounded-2xl bg-peach/40 px-4 py-2.5 text-sm text-ink">
                {error}
              </p>
            )}

            <Button type="submit" fullWidth disabled={saving}>
              {saving ? "Calculando..." : "Calcular minhas metas e começar"}
            </Button>
          </form>
        </Card>

        <p className="mt-4 px-2 text-center text-xs leading-relaxed text-ink/40">
          Suas metas (calorias, macros, água) são calculadas automaticamente a
          partir desses dados — estimativas de organização pessoal, não
          prescrição médica.
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink/70">
        {label}
      </span>
      <div className="relative">
        <input
          type={type}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink/40">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}
