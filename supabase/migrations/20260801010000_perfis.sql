-- Maré — perfis: base do modelo psicólogo/paciente (Fase A)

do $$
begin
  if not exists (select 1 from pg_type where typname = 'tipo_perfil') then
    create type public.tipo_perfil as enum ('paciente', 'psicologo');
  end if;
end
$$;

create table if not exists public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  tipo public.tipo_perfil not null default 'paciente',
  criado_em timestamptz not null default now()
);

comment on table public.perfis is 'Tipo de conta: paciente (padrão) ou psicólogo. Base pra vínculo/envio de relatório entre contas.';

alter table public.perfis enable row level security;

create policy "perfis_select_own"
  on public.perfis for select
  to authenticated
  using (id = auth.uid());

create policy "perfis_insert_own"
  on public.perfis for insert
  to authenticated
  with check (id = auth.uid());

create policy "perfis_update_own"
  on public.perfis for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
