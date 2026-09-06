/**
 * Cliente Supabase — preparado para a integração futura, ainda não usado.
 *
 * Nesta etapa o app roda 100% com dados mockados (`src/data/mockFernanda.ts`)
 * e NÃO há autenticação real. Quando o backend for conectado:
 *
 * 1. Rodar as migrations que criam as tabelas descritas em `src/types/index.ts`
 *    (profiles, user_goals, daily_logs, weight_logs, measurements, meals,
 *    meal_logs, workouts, workout_logs, weekly_summaries), todas com RLS
 *    por usuário (auth.uid() = profile_id).
 * 2. Preencher `.env.local` com NEXT_PUBLIC_SUPABASE_URL e
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY (ver `.env.example`).
 * 3. Trocar os imports de `src/data/mockFernanda.ts` por chamadas a este
 *    cliente nos componentes/páginas (idealmente via um data layer/hooks,
 *    ex: `useDailyLog()`, `useWeeklySummary()`), mantendo os mesmos tipos.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * `null` enquanto as variáveis de ambiente não estiverem configuradas —
 * o app não depende deste cliente para funcionar nesta etapa.
 */
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
