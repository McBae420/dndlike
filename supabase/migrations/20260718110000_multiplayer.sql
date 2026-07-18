create extension if not exists pgcrypto;

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  join_code text not null unique check (join_code ~ '^[A-Z2-9]{6}$'),
  name text not null check (char_length(name) between 1 and 80),
  dm_user_id uuid not null references auth.users(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_members (
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('dm', 'player')),
  display_name text not null check (char_length(display_name) between 1 and 50),
  token_id text,
  joined_at timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  primary key (campaign_id, user_id),
  unique (campaign_id, token_id),
  check (
    (role = 'dm' and token_id is null)
    or (role = 'player' and token_id is not null)
  )
);

create table if not exists public.player_characters (
  campaign_id uuid not null,
  user_id uuid not null,
  character jsonb not null default '{}'::jsonb,
  player_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (campaign_id, user_id),
  foreign key (campaign_id, user_id)
    references public.campaign_members(campaign_id, user_id)
    on delete cascade
);

create table if not exists public.campaign_dm_state (
  campaign_id uuid primary key references public.campaigns(id) on delete cascade,
  dungeon_state jsonb not null,
  revision bigint not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid not null references auth.users(id)
);

create table if not exists public.player_views (
  campaign_id uuid not null,
  user_id uuid not null,
  dungeon_state jsonb not null,
  revision bigint not null default 1,
  updated_at timestamptz not null default now(),
  primary key (campaign_id, user_id),
  foreign key (campaign_id, user_id)
    references public.campaign_members(campaign_id, user_id)
    on delete cascade
);

create table if not exists public.player_actions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  action_type text not null check (
    action_type in ('move-token', 'toggle-door', 'update-resources', 'claim-reward')
  ),
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists campaign_members_user_idx
  on public.campaign_members(user_id);
create index if not exists player_actions_pending_idx
  on public.player_actions(campaign_id, status, created_at);

create or replace function public.is_campaign_member(p_campaign_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.campaign_members member
    where member.campaign_id = p_campaign_id
      and member.user_id = auth.uid()
  );
$$;

create or replace function public.is_campaign_dm(p_campaign_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.campaigns campaign
    where campaign.id = p_campaign_id
      and campaign.dm_user_id = auth.uid()
  );
$$;

create or replace function public.make_campaign_code()
returns text
language plpgsql
volatile
set search_path = public, pg_temp
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  generated text := '';
  index_number integer;
begin
  for index_number in 1..6 loop
    generated := generated || substr(
      alphabet,
      1 + floor(random() * length(alphabet))::integer,
      1
    );
  end loop;
  return generated;
end;
$$;

create or replace function public.create_campaign(
  p_name text,
  p_display_name text default 'Dungeon Master'
)
returns table (
  campaign_id uuid,
  join_code text,
  member_role text,
  token_id text
)
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  new_campaign_id uuid;
  new_code text;
  attempts integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;
  if char_length(trim(coalesce(p_name, ''))) not between 1 and 80 then
    raise exception 'Campaign name must be between 1 and 80 characters';
  end if;
  if char_length(trim(coalesce(p_display_name, ''))) not between 1 and 50 then
    raise exception 'DM name must be between 1 and 50 characters';
  end if;

  loop
    attempts := attempts + 1;
    new_code := public.make_campaign_code();
    begin
      insert into public.campaigns (join_code, name, dm_user_id)
      values (new_code, trim(p_name), auth.uid())
      returning id into new_campaign_id;
      exit;
    exception when unique_violation then
      if attempts >= 10 then
        raise exception 'Could not allocate a campaign code';
      end if;
    end;
  end loop;

  insert into public.campaign_members (
    campaign_id,
    user_id,
    role,
    display_name,
    token_id
  )
  values (
    new_campaign_id,
    auth.uid(),
    'dm',
    trim(p_display_name),
    null
  );

  return query
    select new_campaign_id, new_code, 'dm'::text, null::text;
end;
$$;

create or replace function public.join_campaign(
  p_code text,
  p_display_name text,
  p_character jsonb default '{}'::jsonb,
  p_player_state jsonb default '{}'::jsonb
)
returns table (
  campaign_id uuid,
  join_code text,
  campaign_name text,
  member_role text,
  token_id text
)
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  found_campaign public.campaigns%rowtype;
  assigned_token text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;
  if char_length(trim(coalesce(p_display_name, ''))) not between 1 and 50 then
    raise exception 'Player name must be between 1 and 50 characters';
  end if;

  select *
  into found_campaign
  from public.campaigns
  where campaigns.join_code = upper(trim(p_code))
    and campaigns.active = true
  for update;

  if not found then
    raise exception 'Campaign code not found';
  end if;

  if (
    select count(*)
    from public.campaign_members
    where campaign_members.campaign_id = found_campaign.id
      and campaign_members.role = 'player'
  ) >= 12 then
    raise exception 'This campaign is full';
  end if;

  assigned_token := 'player-' || left(replace(auth.uid()::text, '-', ''), 12);

  insert into public.campaign_members (
    campaign_id,
    user_id,
    role,
    display_name,
    token_id,
    last_seen
  )
  values (
    found_campaign.id,
    auth.uid(),
    'player',
    trim(p_display_name),
    assigned_token,
    now()
  )
  on conflict on constraint campaign_members_pkey do update
  set display_name = excluded.display_name,
      last_seen = now()
  returning campaign_members.token_id into assigned_token;

  insert into public.player_characters (
    campaign_id,
    user_id,
    character,
    player_state,
    updated_at
  )
  values (
    found_campaign.id,
    auth.uid(),
    coalesce(p_character, '{}'::jsonb),
    coalesce(p_player_state, '{}'::jsonb),
    now()
  )
  on conflict on constraint player_characters_pkey do update
  set character = case
        when excluded.character = '{}'::jsonb
          then player_characters.character
        else excluded.character
      end,
      player_state = case
        when excluded.player_state = '{}'::jsonb
          then player_characters.player_state
        else excluded.player_state
      end,
      updated_at = now();

  return query
    select
      found_campaign.id,
      found_campaign.join_code,
      found_campaign.name,
      'player'::text,
      assigned_token;
end;
$$;

alter table public.campaigns enable row level security;
alter table public.campaign_members enable row level security;
alter table public.player_characters enable row level security;
alter table public.campaign_dm_state enable row level security;
alter table public.player_views enable row level security;
alter table public.player_actions enable row level security;

drop policy if exists campaigns_read_participants on public.campaigns;
create policy campaigns_read_participants
on public.campaigns for select
to authenticated
using (public.is_campaign_member(id));

drop policy if exists campaigns_update_dm on public.campaigns;
create policy campaigns_update_dm
on public.campaigns for update
to authenticated
using (public.is_campaign_dm(id))
with check (public.is_campaign_dm(id));

drop policy if exists members_read_campaign on public.campaign_members;
create policy members_read_campaign
on public.campaign_members for select
to authenticated
using (public.is_campaign_member(campaign_id));

drop policy if exists members_update_self_or_dm on public.campaign_members;
create policy members_update_self_or_dm
on public.campaign_members for update
to authenticated
using (user_id = auth.uid() or public.is_campaign_dm(campaign_id))
with check (user_id = auth.uid() or public.is_campaign_dm(campaign_id));

drop policy if exists characters_read_owner_or_dm on public.player_characters;
create policy characters_read_owner_or_dm
on public.player_characters for select
to authenticated
using (user_id = auth.uid() or public.is_campaign_dm(campaign_id));

drop policy if exists characters_insert_owner on public.player_characters;
create policy characters_insert_owner
on public.player_characters for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.is_campaign_member(campaign_id)
);

drop policy if exists characters_update_owner_or_dm on public.player_characters;
create policy characters_update_owner_or_dm
on public.player_characters for update
to authenticated
using (user_id = auth.uid() or public.is_campaign_dm(campaign_id))
with check (user_id = auth.uid() or public.is_campaign_dm(campaign_id));

drop policy if exists dm_state_dm_only on public.campaign_dm_state;
create policy dm_state_dm_only
on public.campaign_dm_state for all
to authenticated
using (public.is_campaign_dm(campaign_id))
with check (
  public.is_campaign_dm(campaign_id)
  and updated_by = auth.uid()
);

drop policy if exists player_views_read_owner_or_dm on public.player_views;
create policy player_views_read_owner_or_dm
on public.player_views for select
to authenticated
using (user_id = auth.uid() or public.is_campaign_dm(campaign_id));

drop policy if exists player_views_write_dm on public.player_views;
create policy player_views_write_dm
on public.player_views for insert
to authenticated
with check (public.is_campaign_dm(campaign_id));

drop policy if exists player_views_update_dm on public.player_views;
create policy player_views_update_dm
on public.player_views for update
to authenticated
using (public.is_campaign_dm(campaign_id))
with check (public.is_campaign_dm(campaign_id));

drop policy if exists actions_read_owner_or_dm on public.player_actions;
create policy actions_read_owner_or_dm
on public.player_actions for select
to authenticated
using (user_id = auth.uid() or public.is_campaign_dm(campaign_id));

drop policy if exists actions_insert_owner on public.player_actions;
create policy actions_insert_owner
on public.player_actions for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.is_campaign_member(campaign_id)
);

drop policy if exists actions_update_dm on public.player_actions;
create policy actions_update_dm
on public.player_actions for update
to authenticated
using (public.is_campaign_dm(campaign_id))
with check (public.is_campaign_dm(campaign_id));

revoke all on public.campaigns from anon, authenticated;
revoke all on public.campaign_members from anon, authenticated;
revoke all on public.player_characters from anon, authenticated;
revoke all on public.campaign_dm_state from anon, authenticated;
revoke all on public.player_views from anon, authenticated;
revoke all on public.player_actions from anon, authenticated;

grant select on public.campaigns to authenticated;
grant update (name, active, updated_at) on public.campaigns to authenticated;
grant select on public.campaign_members to authenticated;
grant update (display_name, last_seen) on public.campaign_members to authenticated;
grant select, insert on public.player_characters to authenticated;
grant update on public.player_characters to authenticated;
grant select, insert on public.campaign_dm_state to authenticated;
grant update on public.campaign_dm_state to authenticated;
grant select, insert on public.player_views to authenticated;
grant update on public.player_views to authenticated;
grant select, insert on public.player_actions to authenticated;
grant update (status, result, processed_at) on public.player_actions to authenticated;

revoke all on function public.is_campaign_member(uuid) from public;
revoke all on function public.is_campaign_dm(uuid) from public;
revoke all on function public.make_campaign_code() from public;
revoke all on function public.create_campaign(text, text) from public;
revoke all on function public.join_campaign(text, text, jsonb, jsonb) from public;

grant execute on function public.is_campaign_member(uuid) to authenticated;
grant execute on function public.is_campaign_dm(uuid) to authenticated;
grant execute on function public.create_campaign(text, text) to authenticated;
grant execute on function public.join_campaign(text, text, jsonb, jsonb) to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'campaign_members',
    'player_characters',
    'campaign_dm_state',
    'player_views',
    'player_actions'
  ]
  loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = table_name
    ) then
      execute format(
        'alter publication supabase_realtime add table public.%I',
        table_name
      );
    end if;
  end loop;
end
$$;
