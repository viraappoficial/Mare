import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing } from '../lib/theme';
import type { RegistroComSentimento } from '../lib/types';

function formatarHora(iso: string) {
  const data = new Date(iso);
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function RegistroItem({ registro }: { registro: RegistroComSentimento }) {
  const cor = registro.sentimentos_catalogo?.cor ?? colors.accent;
  const nome = registro.sentimentos_catalogo?.nome ?? 'Sentimento';

  return (
    <View style={styles.linha}>
      <View style={[styles.barra, { backgroundColor: cor }]} />
      <View style={styles.conteudo}>
        <View style={styles.topo}>
          <Text style={[styles.nome, { color: cor }]}>{nome}</Text>
          <Text style={styles.hora}>{formatarHora(registro.sentido_em)}</Text>
        </View>
        {!!registro.descricao && <Text style={styles.texto}>{registro.descricao}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  barra: {
    width: 6,
    borderRadius: radii.full,
    alignSelf: 'stretch',
  },
  conteudo: { flex: 1, gap: 2 },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nome: { fontFamily: fonts.bodySemiBold, fontSize: 13 },
  hora: { fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted },
  texto: { fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted, lineHeight: 18 },
});
