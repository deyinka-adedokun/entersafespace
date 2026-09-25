-- Sessions & support requests move from in-memory arrays to these tables.
-- 1. Seed the conversation packages (same values as CANONICAL_PACKAGES in
--    src/data/mockData.ts). support_requests/sessions reference them by id.
insert into public.session_packages
  (id, name, duration_seconds, duration_minutes, price_ngn, description, is_free_trial, provider_share_percent)
values
  ('package-try',  'Try Safespace',      180,  3,  0,     'First time trying Safespace? Start with a free 3-minute conversation.', true,  0),
  ('package-quick','Quick Talk',         900,  15, 1000,  'For when you just need to get something off your chest.',               false, 40),
  ('package-open', 'Open Conversation',  1800, 30, 3000,  'For a little more time to unpack what''s on your mind.',                false, 40),
  ('package-deep', 'Deep Conversation',  3600, 60, 5000,  'For when you need space to really talk and process deeply.',            false, 40),
  ('package-stay', 'Stay With Me',       5400, 90, 10000, 'For when you don''t want to rush the conversation.',                    false, 40)
on conflict (id) do update set
  name = excluded.name,
  duration_seconds = excluded.duration_seconds,
  duration_minutes = excluded.duration_minutes,
  price_ngn = excluded.price_ngn,
  description = excluded.description,
  is_free_trial = excluded.is_free_trial,
  provider_share_percent = excluded.provider_share_percent;

-- 2. Link a request to the provider the matching engine reserved, and to the
--    session it became. /sessions/create only accepts a live reservation, so
--    a client can't start a session with a provider it picked itself.
alter table public.support_requests
  add column if not exists matched_provider_id uuid references public.provider_profiles(id) on delete set null,
  add column if not exists session_id uuid references public.sessions(id) on delete set null;

create index if not exists support_requests_matched_provider_idx
  on public.support_requests (matched_provider_id) where status = 'MATCHED' and session_id is null;
create index if not exists sessions_active_idx on public.sessions (status) where status = 'ACTIVE';
