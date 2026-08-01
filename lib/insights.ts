import type { RegistroComSentimento } from './types';

export type Turno = 'manhã' | 'tarde' | 'noite';

const DIAS_SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

export function turnoDoHorario(hora: number): Turno {
  if (hora >= 5 && hora < 12) return 'manhã';
  if (hora >= 12 && hora < 18) return 'tarde';
  return 'noite';
}

export function padraoPorTurno(registros: RegistroComSentimento[]) {
  if (registros.length === 0) return null;
  const contagem: Record<Turno, number> = { manhã: 0, tarde: 0, noite: 0 };
  for (const r of registros) {
    contagem[turnoDoHorario(new Date(r.sentido_em).getHours())]++;
  }
  const [turno, total] = (Object.entries(contagem) as [Turno, number][]).sort((a, b) => b[1] - a[1])[0];
  if (total === 0) return null;
  return { turno, total, porcentagem: Math.round((total / registros.length) * 100) };
}

export function padraoPorDiaDaSemana(registros: RegistroComSentimento[]) {
  if (registros.length < 3) return null;
  const contagem = new Array(7).fill(0);
  for (const r of registros) contagem[new Date(r.sentido_em).getDay()]++;
  let maxI = 0;
  for (let i = 1; i < 7; i++) if (contagem[i] > contagem[maxI]) maxI = i;
  return contagem[maxI] > 0 ? { dia: DIAS_SEMANA[maxI], total: contagem[maxI] } : null;
}

/** Dias seguidos (até hoje ou ontem) com pelo menos um registro. */
export function calcularSequencia(datasIso: string[]) {
  const dias = new Set(datasIso.map((iso) => new Date(iso).toDateString()));
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!dias.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let sequencia = 0;
  while (dias.has(cursor.toDateString())) {
    sequencia++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return sequencia;
}

export type Tendencia = { direcao: 'alta' | 'baixa' | 'estavel'; delta: number | null };

export function calcularTendencia(totalAtual: number, totalAnterior: number): Tendencia | null {
  if (totalAnterior === 0 && totalAtual === 0) return null;
  if (totalAnterior === 0) return { direcao: 'alta', delta: null };
  const delta = Math.round(((totalAtual - totalAnterior) / totalAnterior) * 100);
  if (delta === 0) return { direcao: 'estavel', delta: 0 };
  return { direcao: delta > 0 ? 'alta' : 'baixa', delta };
}
