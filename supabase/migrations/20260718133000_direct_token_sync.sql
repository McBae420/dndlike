create table if not exists public.campaign_token_positions (
  campaign_id uuid not null,
  token_id text not null,
  owner_user_id uuid not null,
  dungeon_id text not null,
  x integer not null check (x >= 0),
  y integer not null check (y >= 0),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  primary key (campaign_id, token_id),
  unique (campaign_id, owner_user_id),
  foreign key (campaign_id, owner_user_id)
    references public.campaign_members(campaign_id, user_id)
    on delete cascade
);

create index if not exists campaign_token_positions_campaign_idx
  on public.campaign_token_positions(campaign_id);

alter table public.campaign_token_positions enable row level security;

drop policy if exists token_positions_read_members on public.campaign_token_positions;
create policy token_positions_read_members
on public.campaign_token_positions for select
to authenticated
using (public.is_campaign_member(campaign_id));

drop policy if exists token_positions_insert_dm on public.campaign_token_positions;
create policy token_positions_insert_dm
on public.campaign_token_positions for insert
to authenticated
with check (public.is_campaign_dm(campaign_id));

drop policy if exists token_positions_update_dm on public.campaign_token_positions;
create policy token_positions_update_dm
on public.campaign_token_positions for update
to authenticated
using (public.is_campaign_dm(campaign_id))
with check (public.is_campaign_dm(campaign_id));

drop policy if exists token_positions_delete_dm on public.campaign_token_positions;
create policy token_positions_delete_dm
on public.campaign_token_positions for delete
to authenticated
using (public.is_campaign_dm(campaign_id));

create or replace function public.sync_campaign_token_positions(
  p_campaign_id uuid,
  p_tokens jsonb
)
returns setof public.campaign_token_positions
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  token jsonb;
  token_id_value text;
  owner_id_value uuid;
  dungeon_id_value text;
  x_value integer;
  y_value integer;
begin
  if auth.uid() is null or not public.is_campaign_dm(p_campaign_id) then
    raise exception 'Only the campaign DM can initialize token positions';
  end if;
  if jsonb_typeof(p_tokens) <> 'array' then
    raise exception 'Token positions must be an array';
  end if;

  for token in select value from jsonb_array_elements(p_tokens)
  loop
    token_id_value := nullif(token->>'tokenId', '');
    owner_id_value := nullif(token->>'ownerUserId', '')::uuid;
    dungeon_id_value := nullif(token->>'dungeonId', '');
    x_value := (token->>'x')::integer;
    y_value := (token->>'y')::integer;

    if token_id_value is null or owner_id_value is null or dungeon_id_value is null then
      raise exception 'Each token requires tokenId, ownerUserId, and dungeonId';
    end if;
    if not exists (
      select 1
      from public.campaign_members member
      where member.campaign_id = p_campaign_id
        and member.user_id = owner_id_value
        and member.role = 'player'
        and member.token_id = token_id_value
    ) then
      raise exception 'Token owner is not a matching campaign player';
    end if;

    insert into public.campaign_token_positions (
      campaign_id,
      token_id,
      owner_user_id,
      dungeon_id,
      x,
      y,
      revision,
      updated_at
    )
    values (
      p_campaign_id,
      token_id_value,
      owner_id_value,
      dungeon_id_value,
      x_value,
      y_value,
      1,
      now()
    )
    on conflict (campaign_id, token_id) do update
    set owner_user_id = excluded.owner_user_id,
        dungeon_id = case
          when campaign_token_positions.dungeon_id is distinct from excluded.dungeon_id
            then excluded.dungeon_id
          else campaign_token_positions.dungeon_id
        end,
        x = case
          when campaign_token_positions.dungeon_id is distinct from excluded.dungeon_id
            then excluded.x
          else campaign_token_positions.x
        end,
        y = case
          when campaign_token_positions.dungeon_id is distinct from excluded.dungeon_id
            then excluded.y
          else campaign_token_positions.y
        end,
        revision = case
          when campaign_token_positions.dungeon_id is distinct from excluded.dungeon_id
            then campaign_token_positions.revision + 1
          else campaign_token_positions.revision
        end,
        updated_at = case
          when campaign_token_positions.dungeon_id is distinct from excluded.dungeon_id
            or campaign_token_positions.owner_user_id is distinct from excluded.owner_user_id
            then now()
          else campaign_token_positions.updated_at
        end
    where campaign_token_positions.dungeon_id is distinct from excluded.dungeon_id
       or campaign_token_positions.owner_user_id is distinct from excluded.owner_user_id;
  end loop;

  return query
    select position.*
    from public.campaign_token_positions position
    where position.campaign_id = p_campaign_id
    order by position.token_id;
end;
$$;

create or replace function public.move_campaign_token(
  p_campaign_id uuid,
  p_token_id text,
  p_path jsonb,
  p_expected_revision bigint default null
)
returns table (
  campaign_id uuid,
  token_id text,
  owner_user_id uuid,
  dungeon_id text,
  x integer,
  y integer,
  revision bigint,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  position_row public.campaign_token_positions%rowtype;
  dungeon_state_value jsonb;
  caller_is_dm boolean;
  caller_owns_token boolean;
  path_length integer;
  max_steps integer := 6;
  point_index integer;
  token_index integer;
  previous_x integer;
  previous_y integer;
  next_x integer;
  next_y integer;
  tile_type text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;
  if jsonb_typeof(p_path) <> 'array' then
    raise exception 'Movement path must be an array';
  end if;

  path_length := jsonb_array_length(p_path);
  if path_length < 2 then
    raise exception 'Movement path must include a start and destination';
  end if;

  select position.*
  into position_row
  from public.campaign_token_positions position
  where position.campaign_id = p_campaign_id
    and position.token_id = p_token_id
  for update;

  if not found then
    raise exception 'Player token is not ready yet';
  end if;

  caller_is_dm := public.is_campaign_dm(p_campaign_id);
  select exists (
    select 1
    from public.campaign_members member
    where member.campaign_id = p_campaign_id
      and member.user_id = auth.uid()
      and member.role = 'player'
      and member.token_id = p_token_id
      and position_row.owner_user_id = auth.uid()
  )
  into caller_owns_token;

  if not caller_is_dm and not caller_owns_token then
    raise exception 'You cannot move this token';
  end if;
  if not caller_is_dm and p_expected_revision is distinct from position_row.revision then
    raise exception 'Token position changed; refresh and try again';
  end if;

  select state.dungeon_state
  into dungeon_state_value
  from public.campaign_dm_state state
  where state.campaign_id = p_campaign_id
  for update;

  if not found then
    raise exception 'Campaign dungeon is not ready';
  end if;
  if dungeon_state_value->>'id' is distinct from position_row.dungeon_id then
    raise exception 'Token belongs to a different dungeon';
  end if;

  select greatest(1, coalesce((entry->>'movement')::integer, 6))
  into max_steps
  from jsonb_array_elements(dungeon_state_value->'tokens') entry
  where entry->>'id' = p_token_id
  limit 1;
  max_steps := coalesce(max_steps, 6);

  if not caller_is_dm and path_length - 1 > max_steps then
    raise exception 'Movement path is too long';
  end if;

  if (p_path->0->>'x') !~ '^-?[0-9]+$'
    or (p_path->0->>'y') !~ '^-?[0-9]+$' then
    raise exception 'Movement coordinates must be integers';
  end if;
  previous_x := (p_path->0->>'x')::integer;
  previous_y := (p_path->0->>'y')::integer;
  if previous_x <> position_row.x or previous_y <> position_row.y then
    raise exception 'Movement must start at the current token position';
  end if;

  for point_index in 1..path_length - 1
  loop
    if (p_path->point_index->>'x') !~ '^-?[0-9]+$'
      or (p_path->point_index->>'y') !~ '^-?[0-9]+$' then
      raise exception 'Movement coordinates must be integers';
    end if;
    next_x := (p_path->point_index->>'x')::integer;
    next_y := (p_path->point_index->>'y')::integer;

    if not (
      (mod(previous_x, 2) = 0 and (
        (next_x = previous_x + 1 and next_y in (previous_y, previous_y - 1))
        or (next_x = previous_x and next_y in (previous_y - 1, previous_y + 1))
        or (next_x = previous_x - 1 and next_y in (previous_y - 1, previous_y))
      ))
      or
      (mod(previous_x, 2) <> 0 and (
        (next_x = previous_x + 1 and next_y in (previous_y, previous_y + 1))
        or (next_x = previous_x and next_y in (previous_y - 1, previous_y + 1))
        or (next_x = previous_x - 1 and next_y in (previous_y, previous_y + 1))
      ))
    ) then
      raise exception 'Movement path contains non-adjacent hexes';
    end if;

    tile_type := dungeon_state_value #>> array[
      'grid',
      next_y::text,
      next_x::text,
      'type'
    ];
    if tile_type is null or tile_type not in (
      'floor',
      'open door',
      'trap tile',
      'reward tile',
      'special feature tile',
      'entrance tile',
      'exit tile'
    ) then
      raise exception 'Movement path enters a blocked tile';
    end if;

    if exists (
      select 1
      from jsonb_array_elements(dungeon_state_value->'tokens') entry
      where entry->>'id' <> p_token_id
        and entry->>'type' <> 'player'
        and coalesce((entry->>'currentHp')::numeric, 0) > 0
        and (entry->>'x')::integer = next_x
        and (entry->>'y')::integer = next_y
    ) then
      raise exception 'Movement path is blocked by another token';
    end if;

    if point_index = path_length - 1 and exists (
      select 1
      from public.campaign_token_positions other
      where other.campaign_id = p_campaign_id
        and other.token_id <> p_token_id
        and other.dungeon_id = position_row.dungeon_id
        and other.x = next_x
        and other.y = next_y
    ) then
      raise exception 'Movement destination is occupied';
    end if;

    previous_x := next_x;
    previous_y := next_y;
  end loop;

  update public.campaign_token_positions position
  set x = previous_x,
      y = previous_y,
      revision = position.revision + 1,
      updated_at = now()
  where position.campaign_id = p_campaign_id
    and position.token_id = p_token_id
  returning position.* into position_row;

  select ordinality::integer - 1
  into token_index
  from jsonb_array_elements(dungeon_state_value->'tokens') with ordinality entry
  where entry.value->>'id' = p_token_id
  limit 1;

  if token_index is not null then
    dungeon_state_value := jsonb_set(
      dungeon_state_value,
      array['tokens', token_index::text, 'x'],
      to_jsonb(previous_x),
      false
    );
    dungeon_state_value := jsonb_set(
      dungeon_state_value,
      array['tokens', token_index::text, 'y'],
      to_jsonb(previous_y),
      false
    );
    update public.campaign_dm_state state
    set dungeon_state = dungeon_state_value,
        revision = state.revision + 1,
        updated_at = now(),
        updated_by = auth.uid()
    where state.campaign_id = p_campaign_id;
  end if;

  return query
    select
      position_row.campaign_id,
      position_row.token_id,
      position_row.owner_user_id,
      position_row.dungeon_id,
      position_row.x,
      position_row.y,
      position_row.revision,
      position_row.updated_at;
end;
$$;

revoke all on public.campaign_token_positions from anon, authenticated;
grant select on public.campaign_token_positions to authenticated;

revoke all on function public.sync_campaign_token_positions(uuid, jsonb) from public;
grant execute on function public.sync_campaign_token_positions(uuid, jsonb) to authenticated;

revoke all on function public.move_campaign_token(uuid, text, jsonb, bigint) from public;
grant execute on function public.move_campaign_token(uuid, text, jsonb, bigint) to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'campaign_token_positions'
  ) then
    alter publication supabase_realtime add table public.campaign_token_positions;
  end if;
end;
$$;
