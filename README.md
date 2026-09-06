# Fernanda Fit

Mockup visual completo e navegável de um app mobile-first para acompanhamento
de alimentação, treino e emagrecimento. Roda 100% com dados mockados, sem
backend — pensado para depois ser conectado ao Supabase, versionado no GitHub
e publicado na Vercel.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS**
- Componentes próprios (sem dependência de biblioteca de UI)
- Dados 100% mockados nesta etapa — nenhuma chamada de rede

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). A primeira tela é o
Dashboard (Início).

Outros comandos úteis:

```bash
npm run build   # build de produção
npm run start   # roda o build de produção
npm run lint    # eslint
```

Priorize testar em telas de celular (375–430px de largura) — é o foco do
design. O layout também funciona em desktop, mas é secundário.

## Estrutura do projeto

```
src/
  app/                  # rotas (App Router)
    page.tsx            # Dashboard / Início (rota "/")
    hoje/page.tsx        # Registro rápido do dia
    alimentacao/page.tsx # Resumo, plano do dia e trocas de alimentos
    treinos/page.tsx     # Semana de treinos + cardio complementar
    evolucao/page.tsx    # Peso, gráfico, medidas e resumo semanal
    perfil/page.tsx      # Dados da Fernanda + cálculos automáticos
    layout.tsx           # layout raiz (fonte, viewport, <html>/<body>)
    globals.css          # Tailwind + tokens visuais globais

  components/
    ui/                  # primitivos (Card, Button, ProgressBar)
    layout/AppShell.tsx  # container central + navegação inferior fixa
    BottomNavigation.tsx # navegação inferior (Início/Hoje/Alimentação/Treinos/Evolução)
    TopBar.tsx           # cabeçalho com saudação/título + avatar
    InfoHelp.tsx         # botão "?" -> bottom sheet (mobile) / popover (desktop)
    StatusBadge.tsx       # selos "Você preenche" / "Automático" / "Sua meta"
    MetricCard.tsx, ProgressCard.tsx, MealCard.tsx, TimelineItem.tsx,
    WorkoutDay.tsx, WeeklySummaryCard.tsx, WaterTracker.tsx, WeightChart.tsx,
    SectionHeader.tsx, icons.tsx

  data/
    mockFernanda.ts      # TODOS os dados mockados (perfil, metas, plano
                          # alimentar, treinos, histórico de peso, medidas,
                          # resumo semanal, trocas de alimentos)

  lib/
    calculations.ts      # fórmulas de IMC, metabolismo basal, TDEE e macros
    supabase.ts          # cliente Supabase preparado (não usado ainda)
    utils.ts              # helpers (cn, formatação de números/kg/litros)

  types/
    index.ts             # tipos do domínio, já mapeados para as futuras
                          # tabelas do Supabase (ver comentário no topo do arquivo)
```

### Onde estão os dados mockados

Tudo em **`src/data/mockFernanda.ts`**. Nenhum componente tem números
"hardcoded" — todos importam desse arquivo. Para editar os números de
exemplo (peso, metas, plano alimentar, histórico etc.), esse é o único
arquivo que precisa mudar.

### Padrão visual "quem preenche o quê"

Qualquer informação que possa gerar dúvida tem um ícone **"?"**
(`<InfoHelp />`) que abre uma explicação simples em bottom sheet (mobile) ou
popover (desktop), dizendo o que é o dado, para que serve, e se é algo que a
Fernanda preenche, algo calculado automaticamente, ou uma meta. Esse último
ponto usa o componente `<StatusBadge />` com três variações:

- 🟠 **Você preenche** — dado que a própria Fernanda informa
- 🟢 **Automático** — calculado pelo sistema a partir de outros dados
- 🟡 **Sua meta** — um alvo definido (pode ser ajustado no Perfil)

## Como integrar o Supabase depois

A estrutura já foi pensada para isso, mas **nada está conectado ainda**:

1. Crie um projeto no [Supabase](https://supabase.com) e rode migrations
   criando as tabelas descritas nos comentários de `src/types/index.ts`:
   `profiles`, `user_goals`, `daily_logs`, `weight_logs`, `measurements`,
   `meals`, `meal_logs`, `workouts`, `workout_logs`, `weekly_summaries` —
   todas com RLS por usuário.
2. Copie `.env.example` para `.env.local` e preencha
   `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (Project Settings → API no painel do Supabase).
3. O cliente já existe em `src/lib/supabase.ts` (retorna `null` enquanto as
   variáveis de ambiente não estiverem configuradas).
4. Troque, página por página, os imports de `src/data/mockFernanda.ts` por
   consultas reais via esse cliente (o ideal é criar hooks como
   `useDailyLog()`, `useWeeklySummary()` etc.), mantendo os mesmos tipos de
   `src/types/index.ts` para não precisar reescrever os componentes.
5. Autenticação real (login da Fernanda) ainda não existe — é o próximo
   passo natural depois do banco de dados estar conectado.

## Como publicar na Vercel

1. Suba este repositório no GitHub (branch principal com o projeto Next.js).
2. Em [vercel.com](https://vercel.com), clique em "Add New… → Project" e
   importe o repositório.
3. A Vercel detecta automaticamente que é um projeto Next.js — não é
   necessário configurar build command nem output directory.
4. Quando o Supabase estiver conectado, adicione
   `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` em
   Project Settings → Environment Variables antes do deploy.
5. Cada push na branch principal gera um novo deploy automaticamente.

## Aviso importante

Os números de calorias, macros, IMC, metabolismo basal etc. são
**estimativas para organização pessoal**, calculadas com fórmulas gerais
(Mifflin-St Jeor para metabolismo basal, ~7700 kcal ≈ 1 kg para perda de
peso teórica). Não substituem orientação de um profissional de saúde ou
nutrição — isso fica indicado no rodapé da tela de Perfil.
