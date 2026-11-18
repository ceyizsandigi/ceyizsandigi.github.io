create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  purchased boolean not null default false,
  brand text not null default '',
  model text not null default '',
  price numeric(12,2) not null default 0,
  down_payment numeric(12,2) not null default 0,
  installments int not null default 0,
  start_month text not null default to_char(now(), 'YYYY-MM'),
  paid_installments int not null default 0,
  note text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  constraint items_nonneg check (price >= 0 and down_payment >= 0 and installments >= 0 and paid_installments >= 0)
);

create index items_category_idx on public.items(category_id);
create index items_user_idx on public.items(user_id);
create index categories_user_idx on public.categories(user_id);

alter table public.categories enable row level security;
alter table public.items enable row level security;

create policy "kendi kategorilerim" on public.categories
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "kendi urunlerim" on public.items
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
