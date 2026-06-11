-- Drop old bids table if it exists and recreate with match_num instead of match_id FK
drop table if exists public.bids;

create table public.bids (
  id         uuid primary key default uuid_generate_v4(),
  player_id  uuid references public.players(id) on delete cascade,
  match_num  integer not null,   -- FIFA match number (no FK needed, comes from FIFA API)
  pick       text not null,      -- home team name, away team name, or 'Draw'
  amount     integer not null check (amount >= 1),
  created_at timestamptz default now(),
  unique (player_id, match_num)
);

alter table public.bids enable row level security;

create policy "Read own bids" on public.bids for select using (
  player_id in (select id from public.players where user_id = auth.uid())
);
create policy "Player manages own bids" on public.bids for all using (
  player_id in (select id from public.players where user_id = auth.uid())
);
create policy "Admin reads all bids" on public.bids for select using (
  exists (select 1 from public.players p where p.user_id = auth.uid() and p.is_admin = true)
);

-- App settings table (admin-configurable key/value pairs)
create table if not exists public.app_settings (
  key   text primary key,
  value text
);

alter table public.app_settings enable row level security;
create policy "Anyone reads settings" on public.app_settings for select using (true);
create policy "Admin manages settings" on public.app_settings for all using (
  exists (select 1 from public.players p where p.user_id = auth.uid() and p.is_admin = true)
);

insert into public.app_settings (key, value) values
  ('teams_channel_url',   ''),
  ('teams_channel_email', ''),
  ('app_name',            'FIFA WC2026 Predictor')
on conflict do nothing;

select 'Bids + Settings tables ready ✅' as status;
