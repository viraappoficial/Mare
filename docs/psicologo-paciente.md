# Maré — Plano: modelo psicólogo/paciente

> Documento de planejamento. Estende o app existente (não mexe no que já
> funciona: `app/(auth)`, `app/(app)` com Hoje/Relatório/Perfil,
> `sentimentos_catalogo` e `registros` com RLS por usuário).

## Modelo de negócio

Psicólogo assina o Maré e distribui acesso pra pacientes. Paciente usa o
app normalmente (fluxo atual) e pode, quando quiser, **enviar** um
resumo de período pro psicólogo vinculado — não é acesso permanente.

## Decisões já fechadas (não reabrir sem motivo)

- **Perfil (psicólogo/paciente)**: escolhido numa tela extra logo após
  o cadastro, antes do tutorial atual.
- **Vínculo nasce do psicólogo**: ele gera um código/token na própria
  tela, passa pro paciente fora do app (sessão, WhatsApp). Paciente
  digita o código → vínculo criado direto como `ativo` (o psicólogo já
  gerou pra aquele paciente específico, não tem risco de vínculo
  indesejado).
- **Sem acesso permanente à tabela `registros`**: o psicólogo nunca lê
  `registros` do paciente diretamente via RLS contínua.
- **Envio = snapshot, não janela de acesso**: paciente escolhe um
  período (reaproveita o seletor que já existe no Relatório) e aperta
  "Enviar pro psicólogo" → grava uma cópia (JSON) dos registros +
  resumo daquele período numa tabela `envios`, com data do envio.
- **Revogação real**: paciente pode apagar um `envio` específico depois
  — some do psicólogo na hora, sem ambiguidade de "até quando ele tinha
  acesso".
- **IA fica pra depois**: quando entrar, roda em cima do snapshot de
  `envios` (não precisa tocar em `registros`). Teste com Gemini
  (camada grátis), produção com Claude Haiku.

## Fases

### Fase A — Fundação
- Migration: tabela `perfis` (`id` → auth.users, `tipo`:
  `'paciente' | 'psicologo'`, `codigo_pessoal` opcional — ver se ainda
  precisa dado o modelo de convite da Fase B)
- Tela nova no fluxo de cadastro: "Você é psicólogo(a) ou tá se
  registrando pra você?"

### Fase B — Vínculo por convite + Envio de relatório
- Migration: `vinculos` (`psicologo_id`, `paciente_id`, `status`:
  `'ativo' | 'encerrado'`, `criado_em`) — sem `'pendente'`, já que o
  convite nasce do psicólogo e o paciente entrar com o código já é a
  confirmação
- Migration: tabela de convites/token do psicólogo (código curto,
  expiração, uso único ou múltiplo — decidir na hora)
- Migration: `envios` (`id`, `vinculo_id`, `periodo_inicio`,
  `periodo_fim`, `snapshot` jsonb, `criado_em`)
- RLS: psicólogo só lê `envios` onde `psicologo_id` é ele; nunca lê
  `registros`
- Botão "Enviar pro psicólogo" no Relatório, ao lado do "Exportar PDF"
  já existente — reaproveita a mesma lógica de período/resumo
- Paciente pode apagar um envio específico (revoga na hora)

### Fase C — Perguntas-guia
- Migration: `perguntas_guia` (`id`, `psicologo_id`, `texto`, `ordem`,
  `ativa`, `criado_em`)
- RLS: psicólogo CRUD nas próprias; paciente lê as `ativa=true` do
  psicólogo vinculado
- Tela `perguntas/` pro psicólogo cadastrar/reordenar/ativar-desativar

### Fase D — Modo guiado
- Na tela Hoje: se o paciente tem psicólogo vinculado com perguntas
  ativas, aparece opção "Modo guiado" ao lado do modo livre atual
- Percorre as perguntas em sequência, resultado final vira um
  `registro` normal (mesma tabela, sem campo novo)

### Fase E — Área do psicólogo
- Rota `pacientes/`: lista de vinculados + envios recebidos de cada um
  (não é mais timeline ao vivo, é a lista de snapshots enviados)

## LGPD — pendências antes de produção real

- Consentimento explícito já coberto pelo modelo de envio (ação
  deliberada do paciente a cada compartilhamento)
- Revogação já coberta (apagar envio)
- Falta definir: retenção/exclusão de dados se paciente encerrar conta
  ou vínculo; logs de auditoria de quando o psicólogo abriu um envio
