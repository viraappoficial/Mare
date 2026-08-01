import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';
import { colors, fonts, radii, spacing } from '../../../lib/theme';
import { RegistroItem } from '../../../components/RegistroItem';
import { AppHeader } from '../../../components/AppHeader';
import { EditarRegistroModal } from '../../../components/EditarRegistroModal';
import { DataInput } from '../../../components/DataInput';
import { exportarRelatorioPdf } from '../../../lib/pdf';
import {
  calcularSequencia,
  calcularTendencia,
  padraoPorDiaDaSemana,
  padraoPorTurno,
  type Tendencia,
} from '../../../lib/insights';
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

function periodoAnterior(p: Periodo, dataInicioCustom: string, dataFimCustom: string) {
  if (p === 'tudo') return null;

  if (p === 'personalizado') {
    const inicio = new Date(`${dataInicioCustom}T00:00:00`);
    const fim = new Date(`${dataFimCustom}T23:59:59.999`);
    const duracaoMs = fim.getTime() - inicio.getTime();
    if (duracaoMs < 0) return null;
    const fimAnterior = new Date(inicio.getTime() - 1);
    const inicioAnterior = new Date(fimAnterior.getTime() - duracaoMs);
    return { inicio: inicioAnterior.toISOString(), fim: fimAnterior.toISOString() };
  }

  const dias = p === 'semana' ? 7 : 30;
  const fimAnterior = new Date();
  fimAnterior.setDate(fimAnterior.getDate() - dias);
  fimAnterior.setHours(0, 0, 0, 0);
  const inicioAnterior = new Date(fimAnterior);
  inicioAnterior.setDate(inicioAnterior.getDate() - dias);
  return { inicio: inicioAnterior.toISOString(), fim: fimAnterior.toISOString() };
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
  const [sequencia, setSequencia] = useState(0);
  const [tendencia, setTendencia] = useState<Tendencia | null>(null);

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

  useEffect(() => {
    supabase
      .from('registros')
      .select('sentido_em')
      .order('sentido_em', { ascending: false })
      .limit(400)
      .then(({ data }) => setSequencia(calcularSequencia((data ?? []).map((r) => r.sentido_em))));
  }, [registros.length]);

  useEffect(() => {
    const anterior = periodoAnterior(periodo, dataInicioCustom, dataFimCustom);
    if (!anterior) {
      setTendencia(null);
      return;
    }
    supabase
      .from('registros')
      .select('id', { count: 'exact', head: true })
      .gte('sentido_em', anterior.inicio)
      .lte('sentido_em', anterior.fim)
      .then(({ count }) => setTendencia(calcularTendencia(registros.length, count ?? 0)));
  }, [periodo, dataInicioCustom, dataFimCustom, registros.length]);

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

  const turno = useMemo(() => padraoPorTurno(registros), [registros]);
  const diaSemana = useMemo(() => padraoPorDiaDaSemana(registros), [registros]);

  const periodoLabel =
    periodo === 'personalizado'
      ? `${formatarDataBr(dataInicioCustom)} – ${formatarDataBr(dataFimCustom)}`
      : OPCOES.find((o) => o.chave === periodo)?.rotulo ?? '';

  async function exportarPdf() {
    setExportando(true);
    try {
      await exportarRelatorioPdf(registros, resumo, periodoLabel, { sequencia, tendencia, turno, diaSemana });
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
              <DataInput value={dataInicioCustom} onChange={setDataInicioCustom} />
            </View>
            <View style={styles.inputCustomWrap}>
              <Text style={styles.labelCustom}>Até</Text>
              <DataInput value={dataFimCustom} onChange={setDataFimCustom} />
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
            registros.length > 0 || sequencia > 0 ? (
              <>
                {(sequencia > 0 || tendencia || turno || diaSemana) && (
                  <View style={styles.insights}>
                    {sequencia > 0 && (
                      <View style={styles.insightCard}>
                        <Text style={styles.insightValor}>{sequencia}</Text>
                        <Text style={styles.insightLabel}>
                          {sequencia === 1 ? 'dia seguido' : 'dias seguidos'}
                        </Text>
                      </View>
                    )}
                    {tendencia && (
                      <View style={styles.insightCard}>
                        <Text style={styles.insightValor}>
                          {tendencia.direcao === 'alta' ? '↑' : tendencia.direcao === 'baixa' ? '↓' : '='}
                          {tendencia.delta !== null ? ` ${Math.abs(tendencia.delta)}%` : ''}
                        </Text>
                        <Text style={styles.insightLabel}>vs período anterior</Text>
                      </View>
                    )}
                    {turno && (
                      <View style={styles.insightCard}>
                        <Text style={styles.insightValor}>{turno.porcentagem}%</Text>
                        <Text style={styles.insightLabel}>registros de {turno.turno}</Text>
                      </View>
                    )}
                    {diaSemana && (
                      <View style={styles.insightCard}>
                        <Text style={[styles.insightValor, styles.insightValorTexto]}>{diaSemana.dia}</Text>
                        <Text style={styles.insightLabel}>dia mais frequente</Text>
                      </View>
                    )}
                  </View>
                )}

                {registros.length > 0 && (
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
                )}
              </>
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
  insights: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  insightCard: {
    flexGrow: 1,
    minWidth: 92,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  insightValor: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.accent },
  insightValorTexto: { fontSize: 14, textTransform: 'capitalize' },
  insightLabel: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    color: colors.textMuted,
    textAlign: 'center',
  },
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
