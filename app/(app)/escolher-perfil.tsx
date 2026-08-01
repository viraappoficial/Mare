import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AnimatedMareLogo } from '../../components/AnimatedMareLogo';
import { useAuth } from '../../lib/auth-context';
import { usePerfil } from '../../lib/perfil-context';
import { supabase } from '../../lib/supabase';
import { colors, fonts, radii, spacing } from '../../lib/theme';
import type { TipoPerfil } from '../../lib/types';

const OPCOES: { tipo: TipoPerfil; titulo: string; texto: string }[] = [
  {
    tipo: 'paciente',
    titulo: 'Tô me registrando pra mim',
    texto: 'Uso o Maré pra acompanhar meus próprios sentimentos.',
  },
  {
    tipo: 'psicologo',
    titulo: 'Sou psicólogo(a)',
    texto: 'Quero acompanhar pacientes que me enviarem seus registros.',
  },
];

export default function EscolherPerfil() {
  const { session } = useAuth();
  const { recarregar } = usePerfil();
  const [salvando, setSalvando] = useState<TipoPerfil | null>(null);

  async function escolher(tipo: TipoPerfil) {
    if (!session) return;
    setSalvando(tipo);
    const { error } = await supabase
      .from('perfis')
      .upsert({ id: session.user.id, tipo }, { onConflict: 'id' });
    if (!error) {
      await recarregar();
      router.replace('/(app)/tutorial');
    }
    setSalvando(null);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.conteudo}>
        <AnimatedMareLogo size={56} />
        <Text style={styles.titulo}>Como você vai usar o Maré?</Text>
        <Text style={styles.subtitulo}>Dá pra ajustar isso depois, no Perfil.</Text>

        <View style={styles.opcoes}>
          {OPCOES.map((o) => (
            <Pressable
              key={o.tipo}
              style={styles.opcao}
              onPress={() => escolher(o.tipo)}
              disabled={!!salvando}
            >
              {salvando === o.tipo ? (
                <ActivityIndicator color={colors.accent} />
              ) : (
                <>
                  <Text style={styles.opcaoTitulo}>{o.titulo}</Text>
                  <Text style={styles.opcaoTexto}>{o.texto}</Text>
                </>
              )}
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  conteudo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  titulo: {
    fontFamily: fonts.headingBold,
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  subtitulo: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  opcoes: { width: '100%', gap: spacing.sm },
  opcao: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
    minHeight: 78,
    justifyContent: 'center',
  },
  opcaoTitulo: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.text, marginBottom: 4 },
  opcaoTexto: { fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted, lineHeight: 18 },
});
