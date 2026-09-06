export function SupabaseNotConfigured() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream px-6 text-center">
      <div className="max-w-sm rounded-3xl bg-white p-6 shadow-card">
        <h1 className="mb-2 text-lg font-semibold text-ink">
          Configuração pendente
        </h1>
        <p className="text-sm leading-relaxed text-ink/70">
          As variáveis <code>NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> não foram encontradas.
          Copie <code>.env.example</code> para <code>.env.local</code> e
          preencha com os dados do seu projeto Supabase.
        </p>
      </div>
    </div>
  );
}
