-- =============================================================
-- Grimorio de Personagens (D&D 5e) - schema do Supabase
-- Cole este SQL inteiro no painel do Supabase:
--   SQL Editor > New query > colar > Run
-- =============================================================

-- Tabela de personagens.
-- Os campos "soltos" (name, char_class, level, race, avatar_url) servem para
-- montar os cards da galeria rapidamente. A ficha completa de D&D 5e fica
-- guardada no campo JSONB "data", que cresce conforme o app evolui sem
-- precisar mexer no banco.
create table if not exists public.characters (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name        text not null,
  char_class  text,
  level       integer not null default 1,
  race        text,
  avatar_url  text,
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Indice para listar rapido os personagens de um usuario.
create index if not exists characters_user_id_idx on public.characters (user_id);

-- =============================================================
-- Row Level Security: cada usuario so enxerga e mexe nos
-- proprios personagens.
-- =============================================================
alter table public.characters enable row level security;

drop policy if exists "ver proprios personagens" on public.characters;
create policy "ver proprios personagens"
  on public.characters for select
  using (auth.uid() = user_id);

drop policy if exists "criar proprios personagens" on public.characters;
create policy "criar proprios personagens"
  on public.characters for insert
  with check (auth.uid() = user_id);

drop policy if exists "editar proprios personagens" on public.characters;
create policy "editar proprios personagens"
  on public.characters for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "apagar proprios personagens" on public.characters;
create policy "apagar proprios personagens"
  on public.characters for delete
  using (auth.uid() = user_id);

-- =============================================================
-- Mantem o updated_at sempre atualizado.
-- =============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists characters_set_updated_at on public.characters;
create trigger characters_set_updated_at
  before update on public.characters
  for each row execute function public.set_updated_at();
