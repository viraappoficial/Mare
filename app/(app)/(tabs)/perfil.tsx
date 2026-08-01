import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth-context';
import { colors, fonts, radii, spacing } from '../../../lib/theme';
import { AppHeader } from '../../../components/AppHeader';

export default function Perfil() {
  const { session } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader />
      <View style={styles.conteudo}>
        <Text style={styles.titulo}>Perfil</Text>
        <Text style={styles.email}>{session?.user.email}</Text>

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
  email: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginBottom: spacing.md },
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
