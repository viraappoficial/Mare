import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing } from '../lib/theme';
import type { RegistroComSentimento } from '../lib/types';

function formatarHora(iso: string) {
  const data = new Date(iso);
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatarDataHora(iso: string) {
  const data = new Date(iso);
  const dataCurta = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${dataCurta} · ${hora}`;
}

type Props = {
  registro: RegistroComSentimento;
  onEditar?: (registro: RegistroComSentimento) => void;
  /** Mostra "dd/mm · hh:mm" em vez de só a hora — útil em listas que passam de um dia (ex: Relatório). */
  mostrarData?: boolean;
};

export function RegistroItem({ registro, onEditar, mostrarData }: Props) {
  const [expandido, setExpandido] = useState(false);
  const cor = registro.sentimentos_catalogo?.cor ?? colors.accent;
  const nome = registro.sentimentos_catalogo?.nome ?? 'Sentimento';
  const temTexto = !!registro.descricao;

  return (
    <Pressable
      style={styles.linha}
      onPress={() => temTexto && setExpandido((v) => !v)}
      disabled={!temTexto}
    >
      <View style={[styles.barra, { backgroundColor: cor }]} />
      <View style={styles.conteudo}>
        <View style={styles.topo}>
          <Text style={[styles.nome, { color: cor }]}>{nome}</Text>
          <View style={styles.topoDireita}>
            <Text style={styles.hora}>
              {mostrarData ? formatarDataHora(registro.sentido_em) : formatarHora(registro.sentido_em)}
            </Text>
            {onEditar && (
              <Pressable hitSlop={8} onPress={() => onEditar(registro)}>
                <Text style={styles.editar}>editar</Text>
              </Pressable>
            )}
            {temTexto && (
              <Text style={styles.seta}>{expandido ? '▲' : '▼'}</Text>
            )}
          </View>
        </View>
        {temTexto && (
          <Text style={styles.texto} numberOfLines={expandido ? undefined : 2}>
            {registro.descricao}
          </Text>
        )}
      </View>
    </Pressable>
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
  topoDireita: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2 },
  nome: { fontFamily: fonts.bodySemiBold, fontSize: 13 },
  hora: { fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted },
  editar: { fontFamily: fonts.bodyMedium, fontSize: 10.5, color: colors.accent },
  seta: { fontSize: 9, color: colors.textMuted },
  texto: { fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted, lineHeight: 18 },
});
