import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors, fonts, radii, spacing } from '../../lib/theme';
import { AnimatedMareLogo } from '../../components/AnimatedMareLogo';

export default function Login() {
  const [modo, setModo] = useState<'entrar' | 'criar'>('entrar');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function enviar() {
    setErro(null);
    setInfo(null);
    if (!email.trim() || !senha) {
      setErro('Preenche email e senha.');
      return;
    }
    setCarregando(true);

    if (modo === 'entrar') {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
      setCarregando(false);
      if (error) setErro(error.message);
      return;
    }

    // Criando conta: escolher-perfil e tutorial só aparecem nesse fluxo, nunca num login normal.
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: senha });
    setCarregando(false);
    if (error) {
      setErro(error.message);
      return;
    }
    if (data.session) {
      router.replace('/(app)/escolher-perfil');
    } else {
      setInfo('Conta criada! Confirma seu email pra poder entrar.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.conteudo}>
        <View style={styles.header}>
          <AnimatedMareLogo size={56} />
          <Text style={styles.titulo}>Maré</Text>
          <Text style={styles.subtitulo}>Um espaço calmo para registrar o que você sente.</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          {erro && <Text style={styles.erro}>{erro}</Text>}
          {info && <Text style={styles.info}>{info}</Text>}

          <Pressable style={styles.botao} onPress={enviar} disabled={carregando}>
            {carregando ? (
              <ActivityIndicator color="#0A0B0F" />
            ) : (
              <Text style={styles.botaoTexto}>{modo === 'entrar' ? 'Entrar' : 'Criar conta'}</Text>
            )}
          </Pressable>

          <Pressable onPress={() => setModo(modo === 'entrar' ? 'criar' : 'entrar')}>
            <Text style={styles.alternar}>
              {modo === 'entrar' ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  conteudo: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  header: { alignItems: 'center', marginBottom: spacing.xxl },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.text,
    marginTop: spacing.md,
  },
  subtitulo: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  form: { gap: spacing.md },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  erro: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#F0644B',
  },
  info: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.accent,
  },
  botao: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  botaoTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: '#0A0B0F',
  },
  alternar: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
