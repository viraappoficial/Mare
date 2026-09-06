/**
 * Cliente Supabase — usado pelo app inteiro para autenticação e dados.
 *
 * O app é exportado como site estático (GitHub Pages), então tudo aqui é
 * client-side: sessão de auth fica no localStorage do navegador, e cada
 * página busca seus próprios dados via useEffect. RLS no banco garante que
 * cada usuária só vê suas próprias linhas (auth.uid() = profile_id).
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * `null` enquanto as variáveis de ambiente não estiverem configuradas —
 * componentes que dependem dele devem tratar esse caso (ver
 * `src/components/SupabaseNotConfigured.tsx`).
 */
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : null;
