# Fernanda Fit

App mobile-first para acompanhamento de alimentação, treino e emagrecimento.
Login com e-mail/senha, cada pessoa com seus próprios dados (Supabase +
RLS), publicado automaticamente no GitHub Pages.

🔗 **Publicado em:** https://viraappoficial.github.io/Mare/ (atualiza
automaticamente a cada push na branch principal, via GitHub Pages — ver
seção abaixo).

## Stack

- **Next.js 14** (App Router) + **TypeScript**, exportado como site estático
  (`output: "export"`) — sem servidor Node, tudo roda no navegador.
- **Tailwind CSS**, componentes próprios (sem dependência de biblioteca de UI).
- **Supabase**: Postgres (11 tabelas, todas com RLS por usuária) + Auth
  (e-mail/senha, sessão em `localStorage`, já que o site é estático).

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha com a URL e anon key do seu projeto Supabase
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). A primeira tela pede
login — crie uma conta (a confirmação por e-mail pode estar ativada por
padrão no seu projeto Supabase; veja "Autenticação" abaixo) e depois preencha
o onboarding para gerar seu perfil e metas automaticamente.

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
  app/
    login/page.tsx        # entrar / criar conta (Supabase Auth)
    onboarding/page.tsx    # 1ª vez: cria profile + user_goals a partir dos dados iniciais
    page.tsx               # Dashboard / Início (rota "/")
    hoje/page.tsx           # Registro rápido do dia
    alimentacao/page.tsx    # Resumo + "Meu cardápio" (monta o dia escolhendo alimentos)
    treinos/page.tsx        # Semana de treinos + cardio complementar
    evolucao/page.tsx       # Peso, gráfico, medidas e resumo semanal
    perfil/page.tsx         # Dados + cálculos automáticos + sair da conta
    layout.tsx              # <AuthProvider><ProfileProvider>{children}</...>
    globals.css             # Tailwind + tokens visuais globais

  components/
    ui/                  # primitivos (Card, Button, ProgressBar)
    layout/AppShell.tsx  # gate de autenticação/onboarding + navegação inferior fixa
    BottomNavigation.tsx # navegação inferior (Início/Hoje/Alimentação/Treinos/Evolução)
    TopBar.tsx           # cabeçalho com saudação/título + avatar (lê do ProfileProvider)
    InfoHelp.tsx         # botão "?" -> bottom sheet (mobile) / popover (desktop)
    StatusBadge.tsx      # selos "Você preenche" / "Automático" / "Sua meta"
    MetricCard.tsx, ProgressCard.tsx, TimelineItem.tsx,
    WorkoutDay.tsx, WeeklySummaryCard.tsx, WaterTracker.tsx, WeightChart.tsx,
    SectionHeader.tsx, icons.tsx

  lib/
    auth-context.tsx      # <AuthProvider> — sessão Supabase Auth (client-side)
    profile-context.tsx   # <ProfileProvider> — profile + user_goals da pessoa logada
    queries.ts            # todas as leituras/escritas no banco, tipadas
    weeklySummary.ts       # calcula o resumo semanal ao vivo a partir dos registros
    calculations.ts        # fórmulas de IMC, metabolismo basal, TDEE e macros
    date.ts                 # helpers de data (semana atual, dia da semana)
    supabase.ts             # cliente Supabase (null se env vars não configuradas)
    utils.ts                # helpers (cn, formatação de números/kg/litros)

  types/
    index.ts             # tipos de domínio (camelCase) usados pelos componentes
    database.ts           # tipos gerados do schema real do Supabase (snake_case)
```

### Autenticação e dados por usuária

- Login/cadastro simples por e-mail e senha (`src/app/login`).
- No primeiro acesso, o onboarding (`src/app/onboarding`) pede nome, idade,
  altura, peso, nível de atividade, déficit e meta de treinos — e calcula e
  salva as metas automaticamente (mesmas fórmulas de `lib/calculations.ts`).
- Cada tabela tem RLS: uma pessoa só lê/escreve suas próprias linhas
  (`profile_id = auth.uid()`). `meals`, `workouts` e `foods` têm também
  linhas "padrão" (`profile_id null`), visíveis a todo mundo — é o
  catálogo de treino e o banco de alimentos usados no app.
- **Meu cardápio** (aba na tela Alimentação): a pessoa monta o próprio dia
  escolhendo alimentos do banco (`foods` — valores por 100g) e digitando os
  gramas; o app calcula a calorias/proteína na hora (`lib/queries.ts` ->
  `computeFoodNutrition`). Dá pra cadastrar um alimento próprio (fica
  visível só pra quem criou) ou registrar algo livre com kcal manual. A
  soma do dia é comparada com a meta calculada no onboarding.
- Se o seu projeto Supabase tiver **"Confirm email" ativado** (padrão), a
  conta só libera sessão depois de clicar no link recebido por e-mail. Para
  testar mais rápido, desative em Authentication → Sign In / Providers →
  Email no painel do Supabase.

### Padrão visual "quem preenche o quê"

Qualquer informação que possa gerar dúvida tem um ícone **"?"**
(`<InfoHelp />`) que abre uma explicação simples em bottom sheet (mobile) ou
popover (desktop), dizendo o que é o dado, para que serve, e se é algo que
você preenche, algo calculado automaticamente, ou uma meta. Esse último
ponto usa o componente `<StatusBadge />` com três variações:

- 🟠 **Você preenche** — dado que a própria pessoa informa
- 🟢 **Automático** — calculado pelo sistema a partir de outros dados
- 🟡 **Sua meta** — um alvo definido (pode ser ajustado no Perfil)

## Banco de dados (Supabase)

Schema completo em produção — 11 tabelas, todas com RLS:
`profiles`, `user_goals`, `daily_logs`, `weight_logs`, `measurements`,
`meals`, `meal_logs`, `foods`, `workouts`, `workout_logs`, `weekly_summaries`
(essa última reservada para snapshots futuros; hoje o resumo semanal é
calculado ao vivo em `lib/weeklySummary.ts`).

Se precisar regenerar os tipos depois de uma migration nova:

```bash
# via MCP do Supabase, ou:
npx supabase gen types typescript --project-id <seu-project-ref> > src/types/database.ts
```

## Publicação automática no GitHub Pages

Todo push na branch principal roda `.github/workflows/deploy-pages.yml`, que
builda o site como export estático do Next.js e publica em
https://viraappoficial.github.io/Mare/.

**Necessário configurar uma vez**: em Settings → Secrets and variables →
Actions do repositório, adicione:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Sem esses secrets, o build no GitHub Actions publica o app sem conexão com o
banco (tela de "Configuração pendente").

Detalhes técnicos (em `next.config.mjs`):

- `output: "export"` gera HTML estático em `out/` — sem servidor Node, cada
  rota vira uma pasta com `index.html` (ex: `out/hoje/index.html`).
- `basePath`/`assetPrefix: "/Mare"` fazem o site funcionar a partir do
  subcaminho `/Mare` (nome do repositório) — só é aplicado quando a variável
  de ambiente `GITHUB_PAGES_BUILD=true` está definida (setada pelo próprio
  workflow), então `npm run build` local ou na Vercel continua servindo a
  partir da raiz normalmente.
- `images: { unoptimized: true }` porque a otimização de imagem do Next
  precisa de servidor, indisponível em export estático (o app não usa
  `next/image` hoje, mas a opção já fica pronta).
- Autenticação é 100% client-side (sessão em `localStorage`) — não depende
  de servidor, então funciona normalmente num site estático.

Se quiser rodar esse build de exportação localmente:

```bash
GITHUB_PAGES_BUILD=true npm run build   # gera a pasta out/
```

## Como publicar na Vercel (alternativa)

1. Suba este repositório no GitHub (branch principal com o projeto Next.js).
2. Em [vercel.com](https://vercel.com), clique em "Add New… → Project" e
   importe o repositório.
3. A Vercel detecta automaticamente que é um projeto Next.js — não é
   necessário configurar build command nem output directory.
4. Adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` em
   Project Settings → Environment Variables antes do deploy.
5. Cada push na branch principal gera um novo deploy automaticamente.

## Aviso importante

Os números de calorias, macros, IMC, metabolismo basal etc. são
**estimativas para organização pessoal**, calculadas com fórmulas gerais
(Mifflin-St Jeor para metabolismo basal, ~7700 kcal ≈ 1 kg para perda de
peso teórica). Não substituem orientação de um profissional de saúde ou
nutrição — isso fica indicado no rodapé da tela de Perfil.
