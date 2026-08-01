import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { colors, fonts, radii, spacing } from '../../lib/theme';
import { RegistroItem } from '../../components/RegistroItem';
import { exportarRelatorioPdf } from '../../lib/pdf';
import type { RegistroComSentimento } from '../../lib/types';

type Periodo = 'semana' | 'mes' | 'tudo';

const OPCOES: { chave: Periodo; rotulo: string }[] = [
  { chave: 'semana', rotulo: 'Últimos 7 dias' },
  { chave: 'mes', rotulo: 'Últimos 30 dias' },
  { chave: 'tudo', rotulo: 'Tudo' },
];

function dataInicial(periodo: Periodo) {
  if (periodo === 'tudo') return null;
  const dias = periodo === 'semana' ? 7 : 30;
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default function Relatorio() {
  const [periodo, setPeriodo] = useState<Periodo>('semana');
  const [registros, setRegistros] = useState<RegistroComSentimento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [exportando, setExportando] = useState(false);

  const carregar = useCallback(async (p: Periodo) => {
    setCarregando(true);
    let query = supabase
      .from('registros')
      .select('*, sentimentos_catalogo(*)')
      .order('sentido_em', { ascending: false });

    const inicio = dataInicial(p);
    if (inicio) query = query.gte('sentido_em', inicio);

    const { data } = await query;
    setRegistros((data as RegistroComSentimento[]) ?? []);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar(periodo);
  }, [periodo, carregar]);

  const resumo = useMemo(() => {
    const contagem = new Map<string, { nome: string; cor: string; total: number }>();
    for (const r of registros) {
      const s = r.sentimentos_catalogo;
      if (!s) continue;
      const atual = contagem.get(s.id) ?? { nome: s.nome, cor: s.cor, total: 0 };
      atual.total += 1;
      contagem.set(s.id, atual);
    }
    const lista = [...contagem.values()].sort((a, b) => b.total - a.total);
    return { lista, total: registros.length, maisFrequente: lista[0] ?? null };
  }, [registros]);

  const periodoLabel = OPCOES.find((o) => o.chave === periodo)?.rotulo ?? '';

  async function exportarPdf() {
    setExportando(true);
    try {
      await exportarRelatorioPdf(registros, resumo, periodoLabel);
    } finally {
      setExportando(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.tituloLinha}>
          <Text style={styles.titulo}>Relatório</Text>
          <Pressable
            style={styles.botaoPdf}
            onPress={exportarPdf}
            disabled={exportando || registros.length === 0}
          >
            {exportando ? (
              <ActivityIndicator color={colors.accent} size="small" />
            ) : (
              <Text style={styles.botaoPdfTexto}>Exportar PDF</Text>
            )}
          </Pressable>
        </View>
        <View style={styles.opcoes}>
          {OPCOES.map((o) => (
            <Pressable
              key={o.chave}
              onPress={() => setPeriodo(o.chave)}
              style={[
                styles.opcao,
                periodo === o.chave && { borderColor: colors.accent, backgroundColor: colors.accentSoft },
              ]}
            >
              <Text
                style={[styles.opcaoTexto, periodo === o.chave && { color: colors.accent }]}
              >
                {o.rotulo}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {carregando ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={registros}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RegistroItem registro={item} />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          contentContainerStyle={styles.listaConteudo}
          ListHeaderComponent={
            registros.length > 0 ? (
              <View style={styles.resumo}>
                <Text style={styles.resumoTotal}>
                  {resumo.total} {resumo.total === 1 ? 'registro' : 'registros'}
                  {resumo.maisFrequente ? ` · mais frequente: ${resumo.maisFrequente.nome}` : ''}
                </Text>
                <View style={styles.barras}>
                  {resumo.lista.map((s) => (
                    <View key={s.nome} style={styles.barraLinha}>
                      <Text style={[styles.barraNome, { color: s.cor }]}>{s.nome}</Text>
                      <View style={styles.barraFundo}>
                        <View
                          style={[
                            styles.barraPreenchida,
                            { backgroundColor: s.cor, width: `${(s.total / resumo.total) * 100}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.barraTotal}>{s.total}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <Text style={styles.vazio}>Nenhum registro nesse período.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  tituloLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titulo: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text },
  botaoPdf: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
    minWidth: 96,
    alignItems: 'center',
  },
  botaoPdfTexto: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.accent },
  opcoes: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  opcao: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  opcaoTexto: { fontFamily: fonts.bodyMedium, fontSize: 12.5, color: colors.textMuted },
  listaConteudo: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  resumo: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  resumoTotal: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  barras: { gap: spacing.sm + 2 },
  barraLinha: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  barraNome: { fontFamily: fonts.bodyMedium, fontSize: 12, width: 78 },
  barraFundo: {
    flex: 1,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  barraPreenchida: { height: '100%', borderRadius: radii.full },
  barraTotal: { fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted, width: 20, textAlign: 'right' },
  vazio: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
