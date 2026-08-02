import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';
import { colors, fonts, radii, spacing } from '../lib/theme';
import { gerarCodigoConvite } from '../lib/codigo';
import type { Convite, Envio } from '../lib/types';

export function SecaoPsicologo() {
  const { session } = useAuth();
  const [convite, setConvite] = useState<Convite | null>(null);
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [gerando, setGerando] = useState(false);

  const carregar = useCallback(async () => {
    if (!session) return;
    setCarregando(true);

    const [{ data: conviteAtivo }, { data: enviosRecebidos }] = await Promise.all([
      supabase
        .from('convites')
        .select('*')
        .eq('psicologo_id', session.user.id)
        .eq('usado', false)
        .order('criado_em', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('envios')
        .select('*, vinculos!inner(paciente_id, psicologo_id)')
        .eq('vinculos.psicologo_id', session.user.id)
        .order('criado_em', { ascending: false })
        .limit(20),
    ]);

    setConvite(conviteAtivo);
    setEnvios((enviosRecebidos as unknown as Envio[]) ?? []);
    setCarregando(false);
  }, [session]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function gerarCodigo() {
    if (!session) return;
    setGerando(true);
    const codigo = gerarCodigoConvite();
    const { error } = await supabase.from('convites').insert({ psicologo_id: session.user.id, codigo });
    setGerando(false);
    if (!error) await carregar();
  }

  if (carregando) {
    return (
      <View style={styles.secao}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.secao}>
      <Text style={styles.secaoTitulo}>Convidar paciente</Text>
      <View style={styles.card}>
        {convite ? (
          <>
            <Text style={styles.cardTexto}>Passa esse código pro paciente:</Text>
            <Text style={styles.codigo}>{convite.codigo}</Text>
          </>
        ) : (
          <Text style={styles.cardTexto}>Gera um código pra vincular um paciente novo.</Text>
        )}
        <Pressable style={styles.botao} onPress={gerarCodigo} disabled={gerando}>
          {gerando ? (
            <ActivityIndicator color={colors.accent} size="small" />
          ) : (
            <Text style={styles.botaoTexto}>{convite ? 'Gerar outro código' : 'Gerar código'}</Text>
          )}
        </Pressable>
      </View>

      <Text style={[styles.secaoTitulo, { marginTop: spacing.md }]}>Envios recebidos</Text>
      {envios.length === 0 ? (
        <Text style={styles.vazio}>Nenhum envio recebido ainda.</Text>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {envios.map((envio) => (
            <View key={envio.id} style={styles.envioCard}>
              <Text style={styles.envioPeriodo}>{envio.periodo_label}</Text>
              <Text style={styles.envioMeta}>
                {envio.snapshot.total} {envio.snapshot.total === 1 ? 'registro' : 'registros'} ·{' '}
                {new Date(envio.criado_em).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  secao: { gap: spacing.sm, marginBottom: spacing.md },
  secaoTitulo: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textMuted },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.sm + 2,
    alignItems: 'flex-start',
  },
  cardTexto: { fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted, lineHeight: 18 },
  codigo: {
    fontFamily: fonts.mono,
    fontSize: 24,
    letterSpacing: 4,
    color: colors.accent,
  },
  botao: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  botaoTexto: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.accent },
  vazio: { fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted },
  envioCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  envioPeriodo: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.text, marginBottom: 2 },
  envioMeta: { fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted },
});
