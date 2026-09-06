# Fernanda Fit — instruções do projeto

Mockup mobile-first de acompanhamento de alimentação, treino e emagrecimento.

- Stack: Next.js (App Router) + TypeScript + Tailwind CSS.
- Nesta etapa não há backend: todos os dados vêm de `src/data/mockFernanda.ts`.
- Estrutura pensada para integração futura com Supabase (ver tipos em `src/types/index.ts`
  e `src/lib/supabase.ts`), GitHub e Vercel — mas nenhuma dessas integrações está
  implementada de fato ainda.
- Prioridade de layout: mobile primeiro (largura ~375–430px), desktop é secundário.
- Números de saúde (calorias, macros, IMC, metabolismo) são estimativas de
  organização pessoal, não prescrição médica/nutricional — isso deve ficar
  sempre claro na interface.
