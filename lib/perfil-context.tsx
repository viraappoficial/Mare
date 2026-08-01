import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth-context';
import type { Perfil } from './types';

type PerfilContextValue = {
  perfil: Perfil | null;
  carregando: boolean;
  recarregar: () => Promise<void>;
};

const PerfilContext = createContext<PerfilContextValue>({
  perfil: null,
  carregando: true,
  recarregar: async () => {},
});

export function PerfilProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    if (!session) {
      setPerfil(null);
      setCarregando(false);
      return;
    }
    setCarregando(true);
    const { data } = await supabase.from('perfis').select('*').eq('id', session.user.id).maybeSingle();
    setPerfil(data);
    setCarregando(false);
  }, [session]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return (
    <PerfilContext.Provider value={{ perfil, carregando, recarregar }}>{children}</PerfilContext.Provider>
  );
}

export function usePerfil() {
  return useContext(PerfilContext);
}
