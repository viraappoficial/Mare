import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radii, spacing } from '../lib/theme';

const CORES_DISPONIVEIS = [
  '#4FD1C5',
  '#E8B84B',
  '#8CE8A8',
  '#7EA8E8',
  '#F0644B',
  '#B48CE8',
  '#F0A5D8',
  '#8EA3A3',
];

type Props = {
  onCancelar: () => void;
  onCriar: (nome: string, cor: string) => Promise<void>;
};

export function NovoSentimentoForm({ onCancelar, onCriar }: Props) {
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState(CORES_DISPONIVEIS[0]);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (!nome.trim()) return;
    setSalvando(true);
    await onCriar(nome.trim(), cor);
    setSalvando(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Novo sentimento</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do sentimento..."
        placeholderTextColor={colors.textMuted}
        value={nome}
        onChangeText={setNome}
        autoFocus
      />

      <View style={styles.cores}>
        {CORES_DISPONIVEIS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCor(c)}
            style={[
              styles.corSwatch,
              { backgroundColor: c },
              cor === c && styles.corSwatchAtiva,
            ]}
          />
        ))}
      </View>

      <View style={styles.acoes}>
        <Pressable style={styles.botaoCancelar} onPress={onCancelar}>
          <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
        </Pressable>
        <Pressable
          style={[styles.botaoSalvar, !nome.trim() && styles.botaoDesabilitado]}
          onPress={salvar}
          disabled={!nome.trim() || salvando}
        >
          {salvando ? (
            <ActivityIndicator color="#0A0B0F" />
          ) : (
            <Text style={styles.botaoSalvarTexto}>Criar</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md + 2,
    gap: spacing.md,
  },
  titulo: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.text },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  cores: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  corSwatch: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  corSwatchAtiva: { borderColor: colors.text },
  acoes: { flexDirection: 'row', gap: spacing.sm },
  botaoCancelar: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  botaoCancelarTexto: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textMuted },
  botaoSalvar: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.sm,
    alignItems: 'center',
    backgroundColor: colors.accent,
  },
  botaoDesabilitado: { opacity: 0.5 },
  botaoSalvarTexto: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: '#0A0B0F' },
});
