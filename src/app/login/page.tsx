"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { SupabaseNotConfigured } from "@/components/SupabaseNotConfigured";

export default function LoginPage() {
  const { user, loading: authLoading, signInWithPassword, signUp } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"entrar" | "cadastrar">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  if (!supabase) return <SupabaseNotConfigured />;
  if (authLoading || user) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const result =
      mode === "entrar"
        ? await signInWithPassword(email, password)
        : await signUp(email, password);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.needsEmailConfirmation) {
      setInfo(
        "Conta criada! Verifique seu e-mail para confirmar antes de entrar."
      );
      return;
    }
    router.push("/");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-ink">Fernanda Fit</h1>
          <p className="text-sm text-ink/60">
            Acompanhamento de alimentação, treino e emagrecimento
          </p>
        </div>

        <Card>
          <div className="mb-5 flex gap-1.5 rounded-2xl bg-mist/30 p-1.5">
            <button
              type="button"
              onClick={() => setMode("entrar")}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                mode === "entrar" ? "bg-white text-ink shadow-sm" : "text-ink/50"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode("cadastrar")}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                mode === "cadastrar"
                  ? "bg-white text-ink shadow-sm"
                  : "text-ink/50"
              }`}
            >
              Criar conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink/70">
                E-mail
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink/70">
                Senha
              </span>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={
                  mode === "entrar" ? "current-password" : "new-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
              />
            </label>

            {error && (
              <p className="rounded-2xl bg-peach/40 px-4 py-2.5 text-sm text-ink">
                {error}
              </p>
            )}
            {info && (
              <p className="rounded-2xl bg-sage/15 px-4 py-2.5 text-sm text-sage-dark">
                {info}
              </p>
            )}

            <Button type="submit" fullWidth disabled={loading}>
              {loading
                ? "Aguarde..."
                : mode === "entrar"
                  ? "Entrar"
                  : "Criar conta"}
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-xs text-ink/40">
          Seus dados ficam privados — só você acessa o que registrar aqui.
        </p>
      </div>
    </div>
  );
}
