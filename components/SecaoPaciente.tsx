import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';
import { colors, fonts, radii, spacing } from '../lib/theme';
import type { Vinculo } from '../lib/types';

export function SecaoPaciente() {
  const { session } = useAuth();
  const [vinculo, setVinculo] = useState<Vinculo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [codigo, setCodigo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!session) return;
    setCarregando(true);
    const { data } = await supabase
      .from('vinculos')
      .select('*')
      .eq('paciente_id', session.user.id)
      .eq('status', 'ativo')
      .order('criado_em', { ascending: false })
      .limit(1)
      .maybeSingle();
    setVinculo(data);
    setCarregando(false);
  }, [session]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function vincular() {
    if (!codigo.trim()) return;
    setErro(null);
    setEnviando(true);
    const { error } = await supabase.rpc('aceitar_convite', { p_codigo: codigo.trim().toUpperCase() });
    setEnviando(false);
    if (error) {
      setErro('Código inválido ou já utilizado.');
      return;
    }
    setCodigo('');
    await carregar();
  }

  async function encerrar() {
    if (!vinculo) return;
    setEnviando(true);
    await supabase.from('vinculos').update({ status: 'encerrado' }).eq('id', vinculo.id);
    setEnviando(false);
    await carregar();
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
      <Text style={styles.secaoTitulo}>Psicólogo(a)</Text>

      {vinculo ? (
        <View style={styles.card}>
          <Text style={styles.cardTexto}>
            Vinculado(a). Você decide o que enviar, quando quiser, na tela de Relatório.
          </Text>
          <Pressable style={styles.botaoEncerrar} onPress={encerrar} disabled={enviando}>
            {enviando ? (
              <ActivityIndicator color="#F0644B" size="small" />
            ) : (
              <Text style={styles.botaoEncerrarTexto}>Encerrar vínculo</Text>
            )}
          </Pressable>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTexto}>
            Recebeu um código do seu psicólogo(a)? Digita aqui pra vincular.
          </Text>
          <View style={styles.linha}>
            <TextInput
              style={styles.input}
              value={codigo}
              onChangeText={setCodigo}
              placeholder="CÓDIGO"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              maxLength={8}
            />
            <Pressable style={styles.botaoVincular} onPress={vincular} disabled={enviando || !codigo.trim()}>
              {enviando ? (
                <ActivityIndicator color="#0A0B0F" size="small" />
              ) : (
                <Text style={styles.botaoVincularTexto}>Vincular</Text>
              )}
            </Pressable>
          </View>
          {erro && <Text style={styles.erro}>{erro}</Text>}
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
  },
  cardTexto: { fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted, lineHeight: 18 },
  linha: { flexDirection: 'row', gap: spacing.sm },
  input: {
    flex: 1,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 15,
    letterSpacing: 2,
  },
  botaoVincular: {
    paddingHorizontal: spacing.lg,
    borderRadius: radii.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoVincularTexto: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: '#0A0B0F' },
  erro: { fontFamily: fonts.body, fontSize: 12, color: '#F0644B' },
  botaoEncerrar: { alignSelf: 'flex-start' },
  botaoEncerrarTexto: { fontFamily: fonts.bodyMedium, fontSize: 12.5, color: '#F0644B' },
});
