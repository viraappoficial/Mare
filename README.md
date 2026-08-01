# Maré

Diário emocional simples e acolhedor — registre o que sentiu, quando sentiu, e acompanhe padrões ao longo do tempo.

## Stack

- **App/Site**: React Native + Expo (Expo Router), roda em Android, iOS e Web a partir do mesmo código
- **Backend**: Supabase (Postgres + Auth) — todo dado é sincronizado, sem depender de armazenamento local

## Rodando localmente

1. Instale as dependências:
   ```
   npm install
   ```
2. Copie `.env.example` para `.env` e preencha com a URL e a anon key do seu projeto Supabase (Project Settings → API):
   ```
   cp .env.example .env
   ```
3. Aplique as migrations em `supabase/migrations/` no seu projeto Supabase (via CLI `supabase db push`, ou pela integração Git do Supabase, que aplica automaticamente a cada push).
4. Rode o app:
   ```
   npm run web      # navegador
   npm run android
   npm run ios
   ```

## Estrutura

- `app/(auth)` — login / criação de conta
- `app/(app)` — telas autenticadas: Hoje (registro + timeline), Relatório, Perfil
- `lib/` — cliente Supabase, tema, contexto de autenticação, tipos
- `components/` — chips de sentimento, item de registro
- `supabase/migrations/` — schema: `sentimentos_catalogo` e `registros`, com RLS por usuário
