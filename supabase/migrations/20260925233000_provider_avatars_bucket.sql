-- Public bucket for listener profile photos (shown to matched seekers).
-- Only the server writes to it, using the service role, which bypasses
-- storage RLS -- so no insert/update/delete policies are granted here.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('provider-avatars', 'provider-avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
