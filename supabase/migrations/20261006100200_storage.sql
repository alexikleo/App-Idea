-- Photo storage: profile photos and review photos.
-- Files live under a folder named after the uploader's user id, e.g.
--   photos/<user-id>/<random>.jpg
-- so people can only add or remove their own files. Anyone can view them.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Anyone can view photos" on storage.objects for select
  using (bucket_id = 'photos');

create policy "Users upload to their own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users delete their own photos" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
