import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth-context';
import { colors, fonts, radii, spacing } from '../../lib/theme';
import { SentimentoChip } from '../../components/SentimentoChip';
import { RegistroItem } from '../../components/RegistroItem';
import { NovoSentimentoForm } from '../../components/NovoSentimentoForm';
import { AppHeader } from '../../components/AppHeader';
import { EditarRegistroModal } from '../../components/EditarRegistroModal';
import type { RegistroComSentimento, SentimentoCatalogo } from '../../lib/types';

function inicioDoDia() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function fimDoDia() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export default function Hoje() {
  const { session } = useAuth();
  const [sentimentos, setSentimentos] = useState<SentimentoCatalogo[]>([]);
  const [registros, setRegistros] = useState<RegistroComSentimento[]>([]);
  const [selecionado, setSelecionado] = useState<SentimentoCatalogo | null>(null);
  const [descricao, setDescricao] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [criandoSentimento, setCriandoSentimento] = useState(false);
  const [registroEditando, setRegistroEditando] = useState<RegistroComSentimento | null>(null);

  const carregarSentimentos = useCallback(async () => {
    const { data } = await supabase
      .from('sentimentos_catalogo')
      .select('*')
      .order('nome', { ascending: true });
    setSentimentos(data ?? []);
  }, []);

  const carregarRegistrosDeHoje = useCallback(async () => {
    const { data } = await supabase
      .from('registros')
      .select('*, sentimentos_catalogo(*)')
      .gte('sentido_em', inicioDoDia())
      .lte('sentido_em', fimDoDia())
      .order('sentido_em', { ascending: false });
    setRegistros((data as RegistroComSentimento[]) ?? []);
  }, []);

  useEffect(() => {
    (async () => {
      setCarregando(true);
      await Promise.all([carregarSentimentos(), carregarRegistrosDeHoje()]);
      setCarregando(false);
    })();
  }, [carregarSentimentos, carregarRegistrosDeHoje]);

  async function registrar() {
    if (!selecionado || !session) return;
    setSalvando(true);
    const { error } = await supabase.from('registros').insert({
      usuario_id: session.user.id,
      sentimento_id: selecionado.id,
      descricao: descricao.trim(),
      sentido_em: new Date().toISOString(),
    });
    setSalvando(false);
    if (!error) {
      setSelecionado(null);
      setDescricao('');
      carregarRegistrosDeHoje();
    }
  }

  async function criarSentimento(nome: string, cor: string) {
    if (!session) return;
    const { data, error } = await supabase
      .from('sentimentos_catalogo')
      .insert({ nome, cor, usuario_id: session.user.id })
      .select()
      .single();
    if (!error && data) {
      await carregarSentimentos();
      setSelecionado(data as SentimentoCatalogo);
      setCriandoSentimento(false);
    }
  }

  async function atualizar() {
    setAtualizando(true);
    await carregarRegistrosDeHoje();
    setAtualizando(false);
  }

  async function salvarEdicaoRegistro(id: string, sentimentoId: string, sentidoEm: string) {
    const { error } = await supabase
      .from('registros')
      .update({ sentimento_id: sentimentoId, sentido_em: sentidoEm })
      .eq('id', id);
    if (!error) {
      setRegistroEditando(null);
      await carregarRegistrosDeHoje();
    }
  }

  if (carregando) {
    return (
      <SafeAreaView style={styles.centro}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <AppHeader />
        <FlatList
          data={registros}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RegistroItem registro={item} onEditar={setRegistroEditando} />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          contentContainerStyle={styles.listaConteudo}
          refreshControl={
            <RefreshControl refreshing={atualizando} onRefresh={atualizar} tintColor={colors.accent} />
          }
          ListHeaderComponent={
            <View>
              <Text style={styles.pergunta}>Como você tá agora?</Text>

              <View style={styles.chips}>
                {sentimentos.map((s) => (
                  <SentimentoChip
                    key={s.id}
                    nome={s.nome}
                    cor={s.cor}
                    ativo={selecionado?.id === s.id}
                    onPress={() => {
                      setCriandoSentimento(false);
                      setSelecionado(s);
                    }}
                  />
                ))}
                <SentimentoChip
                  nome="+ Novo"
                  cor={colors.textMuted}
                  ativo={criandoSentimento}
                  onPress={() => {
                    setSelecionado(null);
                    setCriandoSentimento((v) => !v);
                  }}
                />
              </View>

              {criandoSentimento && (
                <View style={styles.formulario}>
                  <NovoSentimentoForm
                    onCancelar={() => setCriandoSentimento(false)}
                    onCriar={criarSentimento}
                  />
                </View>
              )}

              {selecionado && (
                <View style={styles.formulario}>
                  <TextInput
                    style={styles.input}
                    placeholder="Descreve um pouco esse sentimento..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={3}
                    value={descricao}
                    onChangeText={setDescricao}
                  />
                  <Pressable style={styles.botao} onPress={registrar} disabled={salvando}>
                    {salvando ? (
                      <ActivityIndicator color="#0A0B0F" />
                    ) : (
                      <Text style={styles.botaoTexto}>Registrar</Text>
                    )}
                  </Pressable>
                </View>
              )}

              {registros.length > 0 && <Text style={styles.tituloLista}>Hoje</Text>}
            </View>
          }
          ListEmptyComponent={
            <Text style={styles.vazio}>Nenhum registro ainda hoje. Como você tá?</Text>
          }
        />

        <EditarRegistroModal
          registro={registroEditando}
          sentimentos={sentimentos}
          onFechar={() => setRegistroEditando(null)}
          onSalvar={salvarEdicaoRegistro}
          restringirAoDiaDeHoje
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centro: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  listaConteudo: { padding: spacing.lg, paddingBottom: spacing.xxl },
  pergunta: {
    fontFamily: fonts.headingBold,
    fontSize: 20,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  formulario: { marginBottom: spacing.lg },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  botao: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm + 4,
  },
  botaoTexto: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: '#0A0B0F' },
  tituloLista: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm + 2,
  },
  vazio: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
