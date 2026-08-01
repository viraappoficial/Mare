import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth-context';
import { usePerfil } from '../../../lib/perfil-context';
import { colors, fonts, radii, spacing } from '../../../lib/theme';
import { AppHeader } from '../../../components/AppHeader';
import type { TipoPerfil } from '../../../lib/types';

export default function Perfil() {
  const { session } = useAuth();
  const { perfil, recarregar } = usePerfil();
  const [trocando, setTrocando] = useState(false);

  async function trocarTipo(tipo: TipoPerfil) {
    if (!session || tipo === perfil?.tipo) return;
    setTrocando(true);
    await supabase.from('perfis').upsert({ id: session.user.id, tipo }, { onConflict: 'id' });
    await recarregar();
    setTrocando(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader />
      <View style={styles.conteudo}>
        <Text style={styles.titulo}>Perfil</Text>
        <Text style={styles.email}>{session?.user.email}</Text>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Tipo de conta</Text>
          <View style={styles.tipoLinha}>
            <Pressable
              style={[styles.tipoOpcao, perfil?.tipo === 'paciente' && styles.tipoOpcaoAtiva]}
              onPress={() => trocarTipo('paciente')}
              disabled={trocando}
            >
              <Text style={[styles.tipoTexto, perfil?.tipo === 'paciente' && styles.tipoTextoAtivo]}>
                Paciente
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tipoOpcao, perfil?.tipo === 'psicologo' && styles.tipoOpcaoAtiva]}
              onPress={() => trocarTipo('psicologo')}
              disabled={trocando}
            >
              {trocando ? (
                <ActivityIndicator color={colors.accent} size="small" />
              ) : (
                <Text style={[styles.tipoTexto, perfil?.tipo === 'psicologo' && styles.tipoTextoAtivo]}>
                  Psicólogo(a)
                </Text>
              )}
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.botao} onPress={() => supabase.auth.signOut()}>
          <Text style={styles.botaoTexto}>Sair</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  conteudo: { padding: spacing.lg, gap: spacing.md },
  titulo: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text },
  email: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginBottom: spacing.sm },
  secao: { gap: spacing.sm, marginBottom: spacing.md },
  secaoTitulo: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textMuted },
  tipoLinha: { flexDirection: 'row', gap: spacing.sm },
  tipoOpcao: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  tipoOpcaoAtiva: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  tipoTexto: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textMuted },
  tipoTextoAtivo: { color: colors.accent },
  botao: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  botaoTexto: { fontFamily: fonts.bodyMedium, fontSize: 14, color: '#F0644B' },
});
