-- ============================================================
-- FIFA_WC_2026 — Missing tables + What's New seed
-- Run in: https://supabase.com/dashboard/project/esgitlslczwqykiamznt/sql/new
-- ============================================================

-- App settings (for Teams channel URL config in Admin)
create table if not exists public.app_settings (
  key   text primary key,
  value text
);
alter table public.app_settings enable row level security;
drop policy if exists "Anyone reads settings" on public.app_settings;
drop policy if exists "Admin manages settings" on public.app_settings;
create policy "Anyone reads settings" on public.app_settings for select using (true);
create policy "Admin manages settings" on public.app_settings for all using (
  exists (select 1 from public.players p where p.user_id = auth.uid() and p.is_admin = true)
);
insert into public.app_settings (key, value) values
  ('teams_channel_url',   ''),
  ('teams_channel_email', ''),
  ('app_name',            'FIFA WC2026 Predictor')
on conflict do nothing;

-- Changelog (for What's New page)
create table if not exists public.app_changelog (
  id           serial primary key,
  version      text not null,
  title        text not null,
  items        jsonb not null default '[]',
  is_major     boolean default false,
  released_at  timestamptz default now()
);
alter table public.app_changelog enable row level security;
drop policy if exists "Anyone reads changelog" on public.app_changelog;
drop policy if exists "Admin manages changelog" on public.app_changelog;
create policy "Anyone reads changelog" on public.app_changelog for select using (true);
create policy "Admin manages changelog" on public.app_changelog for all using (
  exists (select 1 from public.players p where p.user_id = auth.uid() and p.is_admin = true)
);

-- Seed changelog entries
insert into public.app_changelog (version, title, items, is_major, released_at) values
(
  '1.0.0',
  'Initial Launch 🚀',
  '["Predict group stage standings for all 12 groups (A–L) with drag-and-drop",
    "Match score predictions with Joker cards (3x per player, doubles points)",
    "Special Questions: Golden Boot, Champion, Drama picks with big bonus points",
    "Real-time Leaderboard with live Supabase Realtime scoring",
    "Avatar picker on signup — 15 DiceBear styles, unique per name",
    "Password login with forgot/reset password flow",
    "FIFA WC2026 emblem and background image on home page"]',
  true,
  '2026-06-11T00:00:00Z'
),
(
  '1.1.0',
  'Fixtures, Standings & Knockout Bracket 📅📊🏆',
  '["Fixtures page — all 72 group matches grouped by day, expand/collapse, team flags, kick-off times",
    "Standings page — all 12 groups live from FIFA API with W/D/L/GD/Pts",
    "Knockout Bracket — full Round of 32 to Final mirrored bracket, live from FIFA API",
    "Right sidebar hover-to-expand — slim strip shows FIFA live match scores on hover",
    "Responsive navbar — Predict and Tournament dropdowns, hamburger menu on mobile",
    "Groups prediction page loads teams dynamically from FIFA API (no hardcoded data)",
    "Bug fix: correct official FIFA WC 2026 groups — removed non-qualified teams"]',
  true,
  '2026-06-11T06:00:00Z'
),
(
  '1.2.0',
  'Fun Bidding + Bug Fixes 💰',
  '["NEW: Fun Bidding — each player starts with €2500 virtual money",
    "Bet on home win, away win or draw for any group stage match",
    "Win = stake doubled (×2), Lose = stake lost, bids lock 1 hour before kick-off",
    "Bidding fetches live from FIFA API — always correct teams and scores",
    "Bug fix: 3rd Place Picks blank for some users — fixed with null guard",
    "Bug fix: duplicate email signup now shows friendly message",
    "Bug fix: email confirmation redirect fixed to go to live site, not localhost",
    "Admin Settings tab — configure Teams channel URL and email without redeploying"]',
  true,
  '2026-06-11T18:00:00Z'
)
on conflict do nothing;

select 'app_settings and app_changelog created ✅' as status;
select version, title from public.app_changelog order by released_at;
