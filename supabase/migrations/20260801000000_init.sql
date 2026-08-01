-- Maré — estrutura inicial: catálogo de sentimentos e registros

create table if not exists public.sentimentos_catalogo (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cor text not null,
  usuario_id uuid references auth.users (id) on delete cascade,
  criado_em timestamptz not null default now()
);

comment on table public.sentimentos_catalogo is 'Sentimentos disponíveis para seleção. usuario_id nulo = catálogo padrão global.';

create table if not exists public.registros (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  sentimento_id uuid not null references public.sentimentos_catalogo (id) on delete restrict,
  descricao text not null default '',
  sentido_em timestamptz not null default now(),
  criado_em timestamptz not null default now()
);

comment on table public.registros is 'Núcleo do app: cada registro de sentimento feito pela pessoa.';

create index if not exists registros_usuario_sentido_em_idx
  on public.registros (usuario_id, sentido_em desc);

create index if not exists sentimentos_catalogo_usuario_idx
  on public.sentimentos_catalogo (usuario_id);

-- RLS

alter table public.sentimentos_catalogo enable row level security;
alter table public.registros enable row level security;

-- Catálogo: todo mundo lê o catálogo padrão (usuario_id null) + o próprio custom.
-- Só é possível criar/editar/apagar entradas custom (usuario_id = auth.uid()).
create policy "sentimentos_catalogo_select"
  on public.sentimentos_catalogo for select
  to authenticated
  using (usuario_id is null or usuario_id = auth.uid());

create policy "sentimentos_catalogo_insert"
  on public.sentimentos_catalogo for insert
  to authenticated
  with check (usuario_id = auth.uid());

create policy "sentimentos_catalogo_update"
  on public.sentimentos_catalogo for update
  to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

create policy "sentimentos_catalogo_delete"
  on public.sentimentos_catalogo for delete
  to authenticated
  using (usuario_id = auth.uid());

-- Registros: cada pessoa só vê e mexe nos próprios.
create policy "registros_select"
  on public.registros for select
  to authenticated
  using (usuario_id = auth.uid());

create policy "registros_insert"
  on public.registros for insert
  to authenticated
  with check (usuario_id = auth.uid());

create policy "registros_update"
  on public.registros for update
  to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

create policy "registros_delete"
  on public.registros for delete
  to authenticated
  using (usuario_id = auth.uid());

-- Catálogo padrão global (usuario_id null)
insert into public.sentimentos_catalogo (nome, cor, usuario_id) values
  ('Calma', '#4FD1C5', null),
  ('Ansiedade', '#E8B84B', null),
  ('Alegria', '#8CE8A8', null),
  ('Tristeza', '#7EA8E8', null),
  ('Frustração', '#F0644B', null),
  ('Gratidão', '#B48CE8', null)
on conflict do nothing;
