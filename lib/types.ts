export type SentimentoCatalogo = {
  id: string;
  nome: string;
  cor: string;
  usuario_id: string | null;
  criado_em: string;
};

export type Registro = {
  id: string;
  usuario_id: string;
  sentimento_id: string;
  descricao: string;
  sentido_em: string;
  criado_em: string;
};

export type RegistroComSentimento = Registro & {
  sentimentos_catalogo: SentimentoCatalogo | null;
};

export type TipoPerfil = 'paciente' | 'psicologo';

export type Perfil = {
  id: string;
  tipo: TipoPerfil;
  criado_em: string;
};

export type StatusVinculo = 'ativo' | 'encerrado';

export type Vinculo = {
  id: string;
  psicologo_id: string;
  paciente_id: string;
  status: StatusVinculo;
  criado_em: string;
};

export type Convite = {
  id: string;
  psicologo_id: string;
  codigo: string;
  usado: boolean;
  usado_por: string | null;
  usado_em: string | null;
  criado_em: string;
};

export type EnvioSnapshotRegistro = {
  nome: string;
  cor: string;
  descricao: string;
  sentido_em: string;
};

export type EnvioSnapshot = {
  periodoLabel: string;
  registros: EnvioSnapshotRegistro[];
  resumo: { nome: string; cor: string; total: number }[];
  total: number;
};

export type Envio = {
  id: string;
  vinculo_id: string;
  periodo_label: string;
  snapshot: EnvioSnapshot;
  criado_em: string;
};
