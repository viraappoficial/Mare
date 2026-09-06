# Fernanda Fit — instruções do projeto

App mobile-first de acompanhamento de alimentação, treino e emagrecimento.

- Stack: Next.js (App Router) + TypeScript + Tailwind CSS + Supabase (Postgres + Auth).
- Backend real: Supabase Auth (e-mail/senha) + 10 tabelas com RLS por usuária.
  Tudo client-side (sessão em localStorage) porque o site é exportado estático
  (`output: "export"`) para publicar no GitHub Pages — sem servidor Node,
  sem middleware.
- Tipos gerados do schema em `src/types/database.ts`; tipos de domínio
  (camelCase, usados pelos componentes) em `src/types/index.ts`; a ponte
  entre os dois está em `src/lib/queries.ts`.
- Login/cadastro em `src/app/login`; onboarding (cria profile + user_goals a
  partir dos dados iniciais) em `src/app/onboarding`.
- Prioridade de layout: mobile primeiro (largura ~375–430px), desktop é secundário.
- Números de saúde (calorias, macros, IMC, metabolismo) são estimativas de
  organização pessoal, não prescrição médica/nutricional — isso deve ficar
  sempre claro na interface.
