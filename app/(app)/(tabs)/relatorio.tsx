import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';
import { colors, fonts, radii, spacing } from '../../../lib/theme';
import { RegistroItem } from '../../../components/RegistroItem';
import { AppHeader } from '../../../components/AppHeader';
import { EditarRegistroModal } from '../../../components/EditarRegistroModal';
import { exportarRelatorioPdf } from '../../../lib/pdf';
import type { RegistroComSentimento, SentimentoCatalogo } from '../../../lib/types';

type Periodo = 'semana' | 'mes' | 'tudo' | 'personalizado';

const OPCOES: { chave: Periodo; rotulo: string }[] = [
  { chave: 'semana', rotulo: 'Últimos 7 dias' },
  { chave: 'mes', rotulo: 'Últimos 30 dias' },
  { chave: 'tudo', rotulo: 'Tudo' },
  { chave: 'personalizado', rotulo: 'Personalizado' },
];

function dataInicial(periodo: Periodo) {
  if (periodo === 'tudo' || periodo === 'personalizado') return null;
  const dias = periodo === 'semana' ? 7 : 30;
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function hojeInput() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatarDataBr(input: string) {
  const [ano, mes, dia] = input.split('-');
  if (!ano || !mes || !dia) return input;
  return `${dia}/${mes}/${ano}`;
}

export default function Relatorio() {
  const [periodo, setPeriodo] = useState<Periodo>('semana');
  const [registros, setRegistros] = useState<RegistroComSentimento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [sentimentos, setSentimentos] = useState<SentimentoCatalogo[]>([]);
  const [registroEditando, setRegistroEditando] = useState<RegistroComSentimento | null>(null);
  const [dataInicioCustom, setDataInicioCustom] = useState(hojeInput());
  const [dataFimCustom, setDataFimCustom] = useState(hojeInput());

  const carregar = useCallback(
    async (p: Periodo) => {
      if (p === 'personalizado' && (!dataInicioCustom || !dataFimCustom)) return;

      setCarregando(true);
      let query = supabase
        .from('registros')
        .select('*, sentimentos_catalogo(*)')
        .order('sentido_em', { ascending: false });

      if (p === 'personalizado') {
        query = query
          .gte('sentido_em', new Date(`${dataInicioCustom}T00:00:00`).toISOString())
          .lte('sentido_em', new Date(`${dataFimCustom}T23:59:59.999`).toISOString());
      } else {
        const inicio = dataInicial(p);
        if (inicio) query = query.gte('sentido_em', inicio);
      }

      const { data } = await query;
      setRegistros((data as RegistroComSentimento[]) ?? []);
      setCarregando(false);
    },
    [dataInicioCustom, dataFimCustom]
  );

  useEffect(() => {
    carregar(periodo);
  }, [periodo, carregar]);

  useEffect(() => {
    supabase
      .from('sentimentos_catalogo')
      .select('*')
      .order('nome', { ascending: true })
      .then(({ data }) => setSentimentos(data ?? []));
  }, []);

  async function salvarEdicaoRegistro(id: string, sentimentoId: string, sentidoEm: string) {
    const { error } = await supabase
      .from('registros')
      .update({ sentimento_id: sentimentoId, sentido_em: sentidoEm })
      .eq('id', id);
    if (!error) {
      setRegistroEditando(null);
      await carregar(periodo);
    }
  }

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

  const periodoLabel =
    periodo === 'personalizado'
      ? `${formatarDataBr(dataInicioCustom)} – ${formatarDataBr(dataFimCustom)}`
      : OPCOES.find((o) => o.chave === periodo)?.rotulo ?? '';

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
      <AppHeader />
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

        {periodo === 'personalizado' && (
          <View style={styles.linhaCustom}>
            <View style={styles.inputCustomWrap}>
              <Text style={styles.labelCustom}>De</Text>
              <TextInput
                style={styles.inputCustom}
                value={dataInicioCustom}
                onChangeText={setDataInicioCustom}
                placeholder="AAAA-MM-DD"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={styles.inputCustomWrap}>
              <Text style={styles.labelCustom}>Até</Text>
              <TextInput
                style={styles.inputCustom}
                value={dataFimCustom}
                onChangeText={setDataFimCustom}
                placeholder="AAAA-MM-DD"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
        )}
      </View>

      {carregando ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={registros}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RegistroItem registro={item} onEditar={setRegistroEditando} />}
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

      <EditarRegistroModal
        registro={registroEditando}
        sentimentos={sentimentos}
        onFechar={() => setRegistroEditando(null)}
        onSalvar={salvarEdicaoRegistro}
      />
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
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  linhaCustom: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  inputCustomWrap: { flex: 1, minWidth: 0, gap: 4 },
  labelCustom: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.textMuted },
  inputCustom: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 14,
    minWidth: 0,
    width: '100%',
  },
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
