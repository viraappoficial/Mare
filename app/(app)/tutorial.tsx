import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AnimatedMareLogo } from '../../components/AnimatedMareLogo';
import { colors, fonts, radii, spacing } from '../../lib/theme';

const PASSOS = [
  {
    cor: colors.accent,
    titulo: 'Como você tá agora?',
    texto: 'Escolha um sentimento e descreve em poucas palavras. Leva só alguns segundos — sem julgamento, sem métrica de performance.',
  },
  {
    cor: colors.reflexao,
    titulo: 'Quando escreveu ≠ quando sentiu',
    texto: 'Nem sempre dá pra registrar na hora. Ajuste "quando senti" pra qualquer momento — o app guarda os dois horários.',
  },
  {
    cor: colors.alert,
    titulo: 'Linha do tempo do dia',
    texto: 'Veja tudo que você registrou hoje, com a cor de cada sentimento. Toca num registro pra editar ou ler a descrição completa.',
  },
  {
    cor: colors.accent,
    titulo: 'Relatório por período',
    texto: 'Semana, mês ou um período personalizado — com resumo de padrões e exportação em PDF, do jeitinho do Maré.',
  },
];

export default function Tutorial() {
  const [passo, setPasso] = useState(0);
  const ultimo = passo === PASSOS.length - 1;
  const atual = PASSOS[passo];

  function irParaApp() {
    router.replace('/(app)/(tabs)');
  }

  function avancar() {
    if (ultimo) {
      irParaApp();
    } else {
      setPasso((p) => p + 1);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topo}>
        <Pressable onPress={irParaApp} hitSlop={12}>
          <Text style={styles.pular}>Pular tutorial</Text>
        </Pressable>
      </View>

      <View style={styles.conteudo}>
        <AnimatedMareLogo size={64} />

        <View style={[styles.bolinha, { backgroundColor: atual.cor }]} />

        <Text style={styles.titulo}>{atual.titulo}</Text>
        <Text style={styles.texto}>{atual.texto}</Text>
      </View>

      <View style={styles.rodape}>
        <View style={styles.pontos}>
          {PASSOS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.ponto,
                i === passo && { backgroundColor: colors.accent, width: 18 },
              ]}
            />
          ))}
        </View>

        <Pressable style={styles.botao} onPress={avancar}>
          <Text style={styles.botaoTexto}>{ultimo ? 'Começar' : 'Próximo'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topo: { alignItems: 'flex-end', paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  pular: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textMuted },
  conteudo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.lg,
  },
  bolinha: { width: 6, height: 6, borderRadius: radii.full, marginTop: spacing.sm },
  titulo: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.text,
    textAlign: 'center',
  },
  texto: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 21,
  },
  rodape: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.lg },
  pontos: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  ponto: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.border,
  },
  botao: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  botaoTexto: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: '#0A0B0F' },
});
