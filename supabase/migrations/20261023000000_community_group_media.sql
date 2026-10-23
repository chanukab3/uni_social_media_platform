alter table public.groups
  add column if not exists image_url text,
  add column if not exists image_path text,
  add column if not exists invite_link text;

alter table public.messages
  add column if not exists deleted_for uuid[] not null default '{}'::uuid[];

insert into storage.buckets (id, name, public)
values ('group-images', 'group-images', true)
on conflict (id) do update set public = excluded.public;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'group-images-owner-upload'
  ) then
    create policy "group-images-owner-upload"
      on storage.objects
      for insert
      to authenticated
      with check (
        bucket_id = 'group-images'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end
$$;

create or replace function public.notify_group_member_added()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_name text;
  group_name text;
begin
  if auth.uid() is null or new.user_id = auth.uid() then
    return new;
  end if;

  select display_name into actor_name from profiles where id = auth.uid();
  select name into group_name from groups where id = new.group_id;

  insert into notifications (user_id, body)
  values (
    new.user_id,
    coalesce(actor_name, 'A community member') || ' added you to ' || coalesce(group_name, 'a group') || '.'
  );
  return new;
end;
$$;

drop trigger if exists notify_group_member_added on public.group_members;
create trigger notify_group_member_added
  after insert on public.group_members
  for each row execute function public.notify_group_member_added();

create or replace function public.notify_friend_request_accepted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  accepter_name text;
begin
  if old.status is distinct from 'accepted' and new.status = 'accepted' then
    select display_name into accepter_name from profiles where id = new.recipient_id;
    insert into notifications (user_id, body)
    values (
      new.sender_id,
      coalesce(accepter_name, 'A community member') || ' accepted your friend request.'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists notify_friend_request_accepted on public.friend_requests;
create trigger notify_friend_request_accepted
  after update of status on public.friend_requests
  for each row execute function public.notify_friend_request_accepted();

create or replace function public.is_accepted_community_friend(left_user_id uuid, right_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from friend_requests
    where status = 'accepted'
      and (
        (sender_id = left_user_id and recipient_id = right_user_id)
        or (sender_id = right_user_id and recipient_id = left_user_id)
      )
  );
$$;

create or replace function public.is_community_group_member(target_group_id uuid, target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from group_members
    where group_id = target_group_id
      and user_id = target_user_id
  );
$$;

create or replace function public.add_community_group_members(target_group_id uuid, member_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  group_owner_id uuid;
  member_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Sign in to manage group members.';
  end if;

  select created_by into group_owner_id
  from groups
  where id = target_group_id;
  if not found then
    raise exception 'Group not found.';
  end if;

  if group_owner_id is distinct from auth.uid()
    and not public.is_community_group_member(target_group_id, auth.uid()) then
    raise exception 'Only group members can invite friends.';
  end if;

  foreach member_id in array coalesce(member_ids, '{}'::uuid[]) loop
    if member_id <> auth.uid()
      and not public.is_accepted_community_friend(auth.uid(), member_id) then
      raise exception 'Group invitations can only be sent to accepted friends.';
    end if;
  end loop;

  insert into group_members (group_id, user_id)
  select target_group_id, invited_id
  from unnest(array_append(coalesce(member_ids, '{}'::uuid[]), auth.uid())) as members(invited_id)
  on conflict do nothing;
end;
$$;

create or replace function public.delete_community_group(target_group_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  group_image_path text;
begin
  if auth.uid() is null then
    raise exception 'Sign in to delete a group.';
  end if;

  select image_path into group_image_path
  from groups
  where id = target_group_id
    and created_by = auth.uid()
  for update;
  if not found then
    raise exception 'Only the group creator can delete this group.';
  end if;

  delete from messages where group_id = target_group_id;
  delete from group_members where group_id = target_group_id;
  delete from groups where id = target_group_id;
  if group_image_path is not null then
    delete from storage.objects where bucket_id = 'group-images' and name = group_image_path;
  end if;
end;
$$;

create or replace function public.accept_community_friend_request(request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in to accept friend requests.';
  end if;

  update friend_requests
  set status = 'accepted'
  where id = request_id
    and recipient_id = auth.uid()
    and status = 'pending';
  if not found then
    raise exception 'Friend request is no longer pending.';
  end if;
end;
$$;

create or replace function public.hide_direct_conversation(other_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or other_user_id is null or other_user_id = auth.uid() then
    raise exception 'Choose a valid conversation to delete.';
  end if;

  update messages
  set deleted_for = array_append(deleted_for, auth.uid())
  where group_id is null
    and room is distinct from 'world'
    and (
      (sender_id = auth.uid() and recipient_id = other_user_id)
      or (sender_id = other_user_id and recipient_id = auth.uid())
    )
    and not (auth.uid() = any(deleted_for));
end;
$$;

revoke all on function public.is_accepted_community_friend(uuid, uuid) from public;
revoke all on function public.is_community_group_member(uuid, uuid) from public;
revoke all on function public.add_community_group_members(uuid, uuid[]) from public;
revoke all on function public.delete_community_group(uuid) from public;
revoke all on function public.accept_community_friend_request(uuid) from public;
revoke all on function public.hide_direct_conversation(uuid) from public;
grant execute on function public.is_accepted_community_friend(uuid, uuid) to authenticated;
grant execute on function public.is_community_group_member(uuid, uuid) to authenticated;
grant execute on function public.add_community_group_members(uuid, uuid[]) to authenticated;
grant execute on function public.delete_community_group(uuid) to authenticated;
grant execute on function public.accept_community_friend_request(uuid) to authenticated;
grant execute on function public.hide_direct_conversation(uuid) to authenticated;

alter table public.messages enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.friend_requests enable row level security;
alter table public.notifications enable row level security;
alter table public.profiles enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'groups' and policyname = 'community-groups-readable') then
    create policy "community-groups-readable"
      on public.groups
      for select
      to authenticated
      using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'groups' and policyname = 'community-groups-create-own') then
    create policy "community-groups-create-own"
      on public.groups
      for insert
      to authenticated
      with check (created_by = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'group_members' and policyname = 'community-group-members-readable') then
    create policy "community-group-members-readable"
      on public.group_members
      for select
      to authenticated
      using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'group_members' and policyname = 'community-group-members-join-own') then
    create policy "community-group-members-join-own"
      on public.group_members
      for insert
      to authenticated
      with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'group_members' and policyname = 'community-group-members-leave-own') then
    create policy "community-group-members-leave-own"
      on public.group_members
      for delete
      to authenticated
      using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'friend_requests' and policyname = 'community-friend-requests-readable') then
    create policy "community-friend-requests-readable"
      on public.friend_requests
      for select
      to authenticated
      using (sender_id = auth.uid() or recipient_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'friend_requests' and policyname = 'community-friend-requests-create-own') then
    create policy "community-friend-requests-create-own"
      on public.friend_requests
      for insert
      to authenticated
      with check (
        sender_id = auth.uid()
        and recipient_id <> auth.uid()
        and coalesce(status, 'pending') = 'pending'
      );
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'notifications' and policyname = 'community-notifications-readable') then
    create policy "community-notifications-readable"
      on public.notifications
      for select
      to authenticated
      using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'notifications' and policyname = 'community-notifications-update-own') then
    create policy "community-notifications-update-own"
      on public.notifications
      for update
      to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'community-profiles-readable') then
    create policy "community-profiles-readable"
      on public.profiles
      for select
      to authenticated
      using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'community-profiles-update-own') then
    create policy "community-profiles-update-own"
      on public.profiles
      for update
      to authenticated
      using (id = auth.uid())
      with check (id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'messages' and policyname = 'community-messages-readable') then
    create policy "community-messages-readable"
      on public.messages
      for select
      to authenticated
      using (
        room = 'world'
        or sender_id = auth.uid()
        or recipient_id = auth.uid()
        or (group_id is not null and public.is_community_group_member(group_id, auth.uid()))
      );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'messages' and policyname = 'community-messages-sendable') then
    create policy "community-messages-sendable"
      on public.messages
      for insert
      to authenticated
      with check (
        sender_id = auth.uid()
        and (
          (room = 'world' and recipient_id is null and group_id is null)
          or (room is distinct from 'world' and recipient_id is not null and group_id is null)
          or (group_id is not null and recipient_id is null and public.is_community_group_member(group_id, auth.uid()))
        )
      );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'messages' and policyname = 'community-messages-deleteable') then
    create policy "community-messages-deleteable"
      on public.messages
      for delete
      to authenticated
      using (
        sender_id = auth.uid()
        or recipient_id = auth.uid()
      );
  end if;
end
$$;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages') then
      execute 'alter publication supabase_realtime add table public.messages';
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications') then
      execute 'alter publication supabase_realtime add table public.notifications';
    end if;
  end if;
end
$$;
