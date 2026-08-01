import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing } from '../lib/theme';
import { SentimentoChip } from './SentimentoChip';
import { DataInput } from './DataInput';
import { HoraInput } from './HoraInput';
import type { RegistroComSentimento, SentimentoCatalogo } from '../lib/types';

function paraDataInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function paraHoraInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function hojeInput() {
  return paraDataInput(new Date().toISOString());
}

type Props = {
  registro: RegistroComSentimento | null;
  sentimentos: SentimentoCatalogo[];
  onFechar: () => void;
  onSalvar: (id: string, sentimentoId: string, sentidoEm: string) => Promise<void>;
  /** Quando true (tela Hoje), trava a data em hoje — só a hora pode mudar. */
  restringirAoDiaDeHoje?: boolean;
};

export function EditarRegistroModal({
  registro,
  sentimentos,
  onFechar,
  onSalvar,
  restringirAoDiaDeHoje,
}: Props) {
  const [sentimentoId, setSentimentoId] = useState<string | null>(null);
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [registroAtual, setRegistroAtual] = useState<string | null>(null);

  if (registro && registro.id !== registroAtual) {
    setRegistroAtual(registro.id);
    setSentimentoId(registro.sentimento_id);
    setData(restringirAoDiaDeHoje ? hojeInput() : paraDataInput(registro.sentido_em));
    setHora(paraHoraInput(registro.sentido_em));
    setErro(null);
  }

  async function salvar() {
    if (!registro || !sentimentoId) return;

    if (restringirAoDiaDeHoje && data !== hojeInput()) {
      setErro('Aqui é a tela de Hoje — a data fica travada em hoje.');
      return;
    }

    const dataHora = new Date(`${data}T${hora}:00`);
    if (Number.isNaN(dataHora.getTime())) {
      setErro('Data ou hora inválida.');
      return;
    }
    setSalvando(true);
    await onSalvar(registro.id, sentimentoId, dataHora.toISOString());
    setSalvando(false);
  }

  return (
    <Modal visible={!!registro} transparent animationType="fade" onRequestClose={onFechar}>
      <View style={styles.fundo}>
        <View style={styles.card}>
          <Text style={styles.titulo}>Editar registro</Text>

          <Text style={styles.label}>Sentimento</Text>
          <View style={styles.chips}>
            {sentimentos.map((s) => (
              <SentimentoChip
                key={s.id}
                nome={s.nome}
                cor={s.cor}
                ativo={sentimentoId === s.id}
                onPress={() => setSentimentoId(s.id)}
              />
            ))}
          </View>

          <Text style={styles.label}>Quando senti</Text>
          <View style={styles.linhaDataHora}>
            <View style={styles.inputWrap}>
              {restringirAoDiaDeHoje ? (
                <View style={[styles.input, styles.inputTravado]}>
                  <Text style={styles.textoTravado}>{data}</Text>
                </View>
              ) : (
                <DataInput value={data} onChange={setData} />
              )}
            </View>
            <View style={[styles.inputWrap, styles.inputWrapHora]}>
              <HoraInput value={hora} onChange={setHora} />
            </View>
          </View>
          {restringirAoDiaDeHoje && (
            <Text style={styles.dica}>Na tela Hoje só dá pra ajustar o horário — a data fica em hoje.</Text>
          )}

          {erro && <Text style={styles.erro}>{erro}</Text>}

          <View style={styles.acoes}>
            <Pressable style={styles.botaoCancelar} onPress={onFechar}>
              <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.botaoSalvar, !sentimentoId && styles.botaoDesabilitado]}
              onPress={salvar}
              disabled={!sentimentoId || salvando}
            >
              {salvando ? (
                <ActivityIndicator color="#0A0B0F" />
              ) : (
                <Text style={styles.botaoSalvarTexto}>Salvar</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(10,11,15,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm + 2,
    overflow: 'hidden',
  },
  titulo: { fontFamily: fonts.headingBold, fontSize: 17, color: colors.text, marginBottom: spacing.xs },
  label: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  linhaDataHora: { flexDirection: 'row', gap: spacing.sm },
  inputWrap: { flex: 1.4, minWidth: 0 },
  inputWrapHora: { flex: 1 },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  inputTravado: { opacity: 0.6 },
  textoTravado: { fontFamily: fonts.mono, fontSize: 15, color: colors.textMuted },
  dica: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: -spacing.xs },
  erro: { fontFamily: fonts.body, fontSize: 12, color: '#F0644B' },
  acoes: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
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
