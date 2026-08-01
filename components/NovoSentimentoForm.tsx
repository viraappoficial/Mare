import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radii, spacing } from '../lib/theme';
import { ColorPicker } from './ColorPicker';

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
  const [misturarCor, setMisturarCor] = useState(false);
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

      <View style={styles.corLinha}>
        <View style={styles.cores}>
          {CORES_DISPONIVEIS.map((c) => (
            <Pressable
              key={c}
              onPress={() => {
                setCor(c);
                setMisturarCor(false);
              }}
              style={[
                styles.corSwatch,
                { backgroundColor: c },
                cor === c && !misturarCor && styles.corSwatchAtiva,
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={() => setMisturarCor((v) => !v)}
          style={[styles.corSwatch, styles.corCustomBotao, misturarCor && styles.corSwatchAtiva]}
        >
          <View style={[styles.corCustomPreview, { backgroundColor: cor }]} />
        </Pressable>
      </View>

      {misturarCor && (
        <View style={styles.pickerWrap}>
          <ColorPicker value={cor} onChange={setCor} />
          <View style={styles.hexLinha}>
            <View style={[styles.hexSwatch, { backgroundColor: cor }]} />
            <Text style={styles.hexTexto}>{cor}</Text>
          </View>
        </View>
      )}

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
    fontSize: 16,
  },
  corLinha: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  cores: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, flex: 1 },
  corSwatch: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  corSwatchAtiva: { borderColor: colors.text },
  corCustomBotao: {
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corCustomPreview: {
    width: 16,
    height: 16,
    borderRadius: radii.full,
  },
  pickerWrap: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  hexLinha: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  hexSwatch: { width: 18, height: 18, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border },
  hexTexto: { fontFamily: fonts.mono, fontSize: 12, color: colors.textMuted },
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
