-- Allegorio · esquema inicial
--
-- Reconciliado com `app/app/types/domain.ts` em 2026-08-19. A versão anterior
-- foi escrita antes da interface existir e tinha divergências que só apareceriam
-- na primeira sincronização: faixa de formalidade diferente, coluna de contagem
-- de uso ausente, e três tabelas sem nenhum código que escrevesse nelas.
--
-- Regra adotada: o esquema descreve o que o aplicativo faz hoje. Tabela que
-- ninguém escreve entra quando existir a tela que escreve nela.

create extension if not exists pgcrypto;

create type public.item_kind as enum ('garment', 'scent');
create type public.ownership_status as enum ('owned', 'wishlist');
create type public.recommendation_role as enum (
  'top', 'bottom', 'outer_layer', 'footwear', 'accessory', 'one_piece', 'scent'
);
create type public.climate as enum ('hot', 'mild', 'cold');
create type public.projection as enum ('low', 'moderate', 'high');

-- ---------------------------------------------------------------- perfil

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  city text,
  -- clima padrão da tela Hoje; hoje o aplicativo assume 'mild' no código
  default_climate public.climate not null default 'mild',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- categorias

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  kind public.item_kind not null,
  role public.recommendation_role not null,
  -- `custom` distingue categoria criada pelo usuário da semente inicial:
  -- só a criada por ele pode ser removida
  custom boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint category_role_matches_kind check (
    (kind = 'scent' and role = 'scent') or
    (kind = 'garment' and role <> 'scent')
  ),
  constraint category_name_unique_per_user unique (user_id, name)
);

-- ---------------------------------------------------------------- itens

create table public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,

  kind public.item_kind not null,
  ownership public.ownership_status not null default 'owned',
  name text not null check (char_length(name) between 1 and 160),
  brand text not null default '',
  description text not null default '',

  -- caminho no bucket `item-images`, no formato `<user_id>/<uuid>.<ext>`.
  -- O aplicativo troca por URL assinada na leitura.
  image_path text,

  -- true quando o arquivo tem canal alfa porque o fundo foi recortado no
  -- aparelho. A exibição depende disso: recorte aparece contido sobre o campo
  -- de cor, foto inteira aparece cobrindo o quadro.
  image_cutout boolean not null default false,

  -- procedência de imagem externa. Exigido por docs/07-app-mvp.md: todo arquivo
  -- de terceiro precisa registrar provedor, origem, licença e atribuição.
  source_url text,
  source_provider text,
  source_license text,
  source_attribution text,

  price numeric(12, 2) check (price is null or price >= 0),
  currency char(3) not null default 'BRL',
  color text,
  color_hex text check (color_hex is null or color_hex ~ '^#[0-9a-fA-F]{6}$'),
  size text,
  material text,

  -- 1 casual, 2 intermediária, 3 formal. Mesma faixa do seletor da tela de
  -- cadastro e do alvo de cada contexto no recomendador.
  formality smallint not null default 2 check (formality between 1 and 3),
  climates public.climate[] not null default array['hot', 'mild', 'cold']::public.climate[],
  contexts text[] not null default array['everyday'],
  style_tags text[] not null default '{}',

  -- perfume
  concentration text,
  volume_ml numeric(8, 2) check (volume_ml is null or volume_ml >= 0),
  remaining_percent smallint check (remaining_percent between 0 and 100),
  projection public.projection,

  -- recência e frequência: é o que o recomendador lê para dar a vez a quem está
  -- parado, e o que "Usei hoje" escreve
  last_worn_at date,
  wear_count integer not null default 0 check (wear_count >= 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint climates_not_empty check (array_length(climates, 1) >= 1),
  constraint scent_fields_only_on_scent check (
    kind = 'scent' or (concentration is null and volume_ml is null
      and remaining_percent is null and projection is null)
  )
);

-- ---------------------------------------------------------------- combinações

create table public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  context_id text not null,
  climate public.climate not null,
  -- true quando veio de "Usei hoje", false quando foi só guardada
  worn boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.outfit_items (
  outfit_id uuid not null references public.outfits(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  position integer not null default 0,
  primary key (outfit_id, item_id)
);

-- ---------------------------------------------------------------- índices

create index categories_user_kind_idx on public.categories(user_id, kind);
create index items_user_ownership_kind_idx on public.items(user_id, ownership, kind);
create index items_user_category_idx on public.items(user_id, category_id);
create index outfits_user_created_idx on public.outfits(user_id, created_at desc);
create index outfit_items_item_idx on public.outfit_items(item_id);

-- ---------------------------------------------------------------- gatilhos

create function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();
create trigger items_set_updated_at before update on public.items
for each row execute function public.set_updated_at();
create trigger outfits_set_updated_at before update on public.outfits
for each row execute function public.set_updated_at();

-- Perfil nasce junto com a conta. Sem isso a primeira leitura de preferências
-- volta vazia e a tela precisa tratar um caso que não deveria existir.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- RLS

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.items enable row level security;
alter table public.outfits enable row level security;
alter table public.outfit_items enable row level security;

create policy "profiles_owner_all" on public.profiles
for all to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "categories_owner_all" on public.categories
for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- O item precisa pertencer ao usuário e apontar para categoria dele: sem a
-- segunda condição daria para pendurar um item numa categoria alheia.
create policy "items_owner_all" on public.items
for all to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.categories
    where categories.id = category_id and categories.user_id = (select auth.uid())
  )
);

create policy "outfits_owner_all" on public.outfits
for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "outfit_items_owner_all" on public.outfit_items
for all to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.outfits
    where outfits.id = outfit_id and outfits.user_id = (select auth.uid())
  )
  and exists (
    select 1 from public.items
    where items.id = item_id and items.user_id = (select auth.uid())
  )
);

-- ---------------------------------------------------------------- imagens

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('item-images', 'item-images', false, 8388608,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- primeira pasta do caminho é o id do usuário
create policy "item_images_owner_select" on storage.objects
for select to authenticated
using (bucket_id = 'item-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "item_images_owner_insert" on storage.objects
for insert to authenticated
with check (bucket_id = 'item-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "item_images_owner_update" on storage.objects
for update to authenticated
using (bucket_id = 'item-images' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'item-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "item_images_owner_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'item-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
