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
