import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radii, spacing } from '../lib/theme';

type Props = {
  nome: string;
  cor: string;
  ativo: boolean;
  onPress: () => void;
};

export function SentimentoChip({ nome, cor, ativo, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: ativo ? `${cor}22` : colors.surface,
          borderColor: ativo ? cor : colors.border,
        },
      ]}
    >
      <Text style={[styles.texto, { color: ativo ? cor : colors.textMuted }]}>{nome}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.full,
    borderWidth: 1.5,
  },
  texto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13.5,
  },
});
