-- Maré — Fase B: convite, vínculo e envio de relatório (psicólogo/paciente)
--
-- Modelo: o psicólogo gera um código de convite e passa pro paciente fora
-- do app. O paciente usa o código pra criar o vínculo (já ativo, pois foi
-- o próprio psicólogo que gerou pra ele). Não existe acesso permanente do
-- psicólogo a `registros` — ele só vê o que o paciente explicitamente
-- "envia" (uma cópia/snapshot de um período, tabela `envios`).

create table if not exists public.convites (
  id uuid primary key default gen_random_uuid(),
  psicologo_id uuid not null references auth.users (id) on delete cascade,
  codigo text not null unique,
  usado boolean not null default false,
  usado_por uuid references auth.users (id) on delete set null,
  usado_em timestamptz,
  criado_em timestamptz not null default now()
);

comment on table public.convites is 'Códigos gerados pelo psicólogo pra vincular um paciente específico.';

alter table public.convites enable row level security;

create policy "convites_select_own"
  on public.convites for select
  to authenticated
  using (psicologo_id = auth.uid());

create policy "convites_insert_own"
  on public.convites for insert
  to authenticated
  with check (psicologo_id = auth.uid());

create table if not exists public.vinculos (
  id uuid primary key default gen_random_uuid(),
  psicologo_id uuid not null references auth.users (id) on delete cascade,
  paciente_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'ativo' check (status in ('ativo', 'encerrado')),
  criado_em timestamptz not null default now(),
  unique (psicologo_id, paciente_id)
);

comment on table public.vinculos is 'Vínculo psicólogo-paciente. Não dá acesso a `registros` — só habilita `envios`.';

alter table public.vinculos enable row level security;

create policy "vinculos_select_participantes"
  on public.vinculos for select
  to authenticated
  using (psicologo_id = auth.uid() or paciente_id = auth.uid());

create policy "vinculos_update_paciente_encerra"
  on public.vinculos for update
  to authenticated
  using (paciente_id = auth.uid())
  with check (paciente_id = auth.uid());

create table if not exists public.envios (
  id uuid primary key default gen_random_uuid(),
  vinculo_id uuid not null references public.vinculos (id) on delete cascade,
  periodo_label text not null,
  snapshot jsonb not null,
  criado_em timestamptz not null default now()
);

comment on table public.envios is 'Cópia (snapshot) de um período de registros, enviada deliberadamente pelo paciente. Não é uma janela de acesso — apagar o envio revoga o compartilhamento na hora.';

alter table public.envios enable row level security;

create policy "envios_select_participantes"
  on public.envios for select
  to authenticated
  using (
    exists (
      select 1 from public.vinculos v
      where v.id = envios.vinculo_id
        and (v.psicologo_id = auth.uid() or v.paciente_id = auth.uid())
    )
  );

create policy "envios_insert_paciente"
  on public.envios for insert
  to authenticated
  with check (
    exists (
      select 1 from public.vinculos v
      where v.id = envios.vinculo_id
        and v.paciente_id = auth.uid()
        and v.status = 'ativo'
    )
  );

create policy "envios_delete_paciente"
  on public.envios for delete
  to authenticated
  using (
    exists (
      select 1 from public.vinculos v
      where v.id = envios.vinculo_id
        and v.paciente_id = auth.uid()
    )
  );

-- Aceitar convite: validado e executado no servidor (security definer) pra
-- não precisar expor a tabela `convites` inteira via RLS pro paciente.
create or replace function public.aceitar_convite(p_codigo text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_convite record;
  v_vinculo_id uuid;
begin
  select * into v_convite
  from public.convites
  where codigo = p_codigo and usado = false
  for update;

  if not found then
    raise exception 'Código inválido ou já utilizado.';
  end if;

  if v_convite.psicologo_id = auth.uid() then
    raise exception 'Você não pode usar seu próprio código.';
  end if;

  insert into public.vinculos (psicologo_id, paciente_id, status)
  values (v_convite.psicologo_id, auth.uid(), 'ativo')
  on conflict (psicologo_id, paciente_id) do update set status = 'ativo'
  returning id into v_vinculo_id;

  update public.convites
  set usado = true, usado_por = auth.uid(), usado_em = now()
  where id = v_convite.id;

  return v_vinculo_id;
end;
$$;

grant execute on function public.aceitar_convite(text) to authenticated;
