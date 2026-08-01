import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { colors } from './theme';
import type { RegistroComSentimento } from './types';

type ResumoItem = { nome: string; cor: string; total: number };

function formatarDataLonga(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

function formatarHora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function agruparPorDia(registros: RegistroComSentimento[]) {
  const grupos = new Map<string, RegistroComSentimento[]>();
  for (const r of registros) {
    const chave = new Date(r.sentido_em).toDateString();
    const lista = grupos.get(chave) ?? [];
    lista.push(r);
    grupos.set(chave, lista);
  }
  return [...grupos.values()];
}

function escapeHtml(texto: string) {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildRelatorioHtml(
  registros: RegistroComSentimento[],
  resumo: { lista: ResumoItem[]; total: number; maisFrequente: ResumoItem | null },
  periodoLabel: string
) {
  const geradoEm = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const dias = agruparPorDia(registros);

  const barrasHtml = resumo.lista
    .map(
      (s) => `
      <div class="barra-linha">
        <span class="barra-nome" style="color:${s.cor}">${escapeHtml(s.nome)}</span>
        <div class="barra-fundo">
          <div class="barra-preenchida" style="background:${s.cor};width:${(s.total / Math.max(resumo.total, 1)) * 100}%"></div>
        </div>
        <span class="barra-total">${s.total}</span>
      </div>`
    )
    .join('');

  const diasHtml = dias
    .map((registrosDoDia) => {
      const itens = registrosDoDia
        .map((r) => {
          const cor = r.sentimentos_catalogo?.cor ?? colors.accent;
          const nome = r.sentimentos_catalogo?.nome ?? 'Sentimento';
          return `
          <div class="registro">
            <span class="registro-barra" style="background:${cor}"></span>
            <div class="registro-conteudo">
              <div class="registro-topo">
                <span class="registro-nome" style="color:${cor}">${escapeHtml(nome)}</span>
                <span class="registro-hora">${formatarHora(r.sentido_em)}</span>
              </div>
              ${r.descricao ? `<p class="registro-texto">${escapeHtml(r.descricao)}</p>` : ''}
            </div>
          </div>`;
        })
        .join('');

      return `
        <div class="dia">
          <p class="dia-titulo">${formatarDataLonga(registrosDoDia[0].sentido_em)}</p>
          <div class="dia-registros">${itens}</div>
        </div>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<style>
  @page { margin: 28px; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: ${colors.bg};
    color: ${colors.text};
    font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    padding: 36px;
  }
  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 4px;
  }
  .logo {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    background: ${colors.accent};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .logo svg { display: block; }
  .marca { font-size: 20px; font-weight: 700; letter-spacing: 0.2px; }
  .subtitulo { color: ${colors.textMuted}; font-size: 12px; margin: 2px 0 0 46px; }
  h1 {
    font-size: 26px;
    margin: 28px 0 4px;
    font-weight: 700;
  }
  .meta { color: ${colors.textMuted}; font-size: 12px; margin-bottom: 24px; }

  .resumo {
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: 16px;
    padding: 20px 22px;
    margin-bottom: 28px;
  }
  .resumo-total {
    font-size: 13px;
    color: ${colors.textMuted};
    margin: 0 0 14px;
  }
  .resumo-total b { color: ${colors.text}; }
  .barra-linha { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .barra-linha:last-child { margin-bottom: 0; }
  .barra-nome { font-size: 12px; font-weight: 600; width: 90px; flex-shrink: 0; }
  .barra-fundo { flex: 1; height: 7px; border-radius: 999px; background: ${colors.bg}; overflow: hidden; }
  .barra-preenchida { height: 100%; border-radius: 999px; }
  .barra-total { font-size: 11px; color: ${colors.textMuted}; width: 22px; text-align: right; font-variant-numeric: tabular-nums; }

  .dia { margin-bottom: 26px; page-break-inside: avoid; }
  .dia-titulo {
    font-size: 12px;
    font-weight: 600;
    color: ${colors.textMuted};
    text-transform: capitalize;
    margin: 0 0 10px;
  }
  .dia-registros { display: flex; flex-direction: column; gap: 8px; }
  .registro {
    display: flex;
    gap: 12px;
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: 14px;
    padding: 12px 14px;
    page-break-inside: avoid;
  }
  .registro-barra { width: 4px; border-radius: 999px; align-self: stretch; flex-shrink: 0; }
  .registro-conteudo { flex: 1; min-width: 0; }
  .registro-topo { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
  .registro-nome { font-size: 12.5px; font-weight: 600; }
  .registro-hora { font-size: 10.5px; color: ${colors.textMuted}; font-variant-numeric: tabular-nums; }
  .registro-texto { font-size: 12px; color: ${colors.textMuted}; line-height: 1.5; margin: 0; }

  .rodape { margin-top: 32px; text-align: center; font-size: 10.5px; color: ${colors.textMuted}; }
</style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
        <path d="M14 34 Q22 24, 32 34 T50 34" stroke="#0A0B0F" stroke-width="6" stroke-linecap="round" fill="none" />
      </svg>
    </div>
    <span class="marca">maré</span>
  </div>
  <p class="subtitulo">diário emocional</p>

  <h1>Relatório · ${escapeHtml(periodoLabel)}</h1>
  <p class="meta">Gerado em ${geradoEm} · ${registros.length} ${registros.length === 1 ? 'registro' : 'registros'}</p>

  ${
    resumo.total > 0
      ? `<div class="resumo">
          <p class="resumo-total">
            <b>${resumo.total}</b> ${resumo.total === 1 ? 'registro' : 'registros'} no período
            ${resumo.maisFrequente ? ` · sentimento mais frequente: <b style="color:${resumo.maisFrequente.cor}">${escapeHtml(resumo.maisFrequente.nome)}</b>` : ''}
          </p>
          ${barrasHtml}
        </div>`
      : ''
  }

  ${diasHtml || `<p class="meta">Nenhum registro nesse período.</p>`}

  <p class="rodape">maré — um espaço calmo para registrar o que você sente</p>
</body>
</html>`;
}

export async function exportarRelatorioPdf(
  registros: RegistroComSentimento[],
  resumo: { lista: ResumoItem[]; total: number; maisFrequente: ResumoItem | null },
  periodoLabel: string
) {
  const html = buildRelatorioHtml(registros, resumo, periodoLabel);

  if (Platform.OS === 'web') {
    const janela = window.open('', '_blank');
    if (!janela) return;
    janela.document.write(html);
    janela.document.close();
    janela.focus();
    setTimeout(() => janela.print(), 300);
    return;
  }

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const disponivel = await Sharing.isAvailableAsync();
  if (disponivel) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
  }
}
