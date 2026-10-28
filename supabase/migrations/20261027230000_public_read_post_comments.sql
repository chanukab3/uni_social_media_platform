alter table public.post_comments enable row level security;

grant select on table public.post_comments to anon, authenticated;

drop policy if exists "public_read_post_comments" on public.post_comments;

create policy "public_read_post_comments"
on public.post_comments
for select
to anon, authenticated
using (true);
