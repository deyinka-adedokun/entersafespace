-- Listener presence and phone call alerts.
--
-- last_seen_at: updated while a listener has Safespace open, so matching only
-- rings listeners who can actually answer (or who can be woken by a push).
alter table public.provider_profiles
  add column if not exists last_seen_at timestamptz;

-- Web Push subscriptions (one per browser/device). Server-only: RLS is on and
-- there are no policies, so only the service role can read or write them.
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions(user_id);
alter table public.push_subscriptions enable row level security;

-- Server-generated keys that must stay the same across restarts (the Web Push
-- signing keys). Server-only, like push_subscriptions.
create table if not exists public.app_secrets (
  name text primary key,
  value text not null,
  created_at timestamptz not null default now()
);
alter table public.app_secrets enable row level security;
