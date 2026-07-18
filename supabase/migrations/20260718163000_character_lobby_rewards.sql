create or replace function public.sync_player_character_sheet(
  p_campaign_id uuid,
  p_character jsonb,
  p_sheet_state jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null or not exists (
    select 1
    from public.campaign_members member
    where member.campaign_id = p_campaign_id
      and member.user_id = auth.uid()
      and member.role = 'player'
  ) then
    raise exception 'Only a campaign player can update this character sheet';
  end if;

  update public.player_characters sheet
  set character = coalesce(p_character, '{}'::jsonb),
      player_state = coalesce(sheet.player_state, '{}'::jsonb)
        || coalesce(p_sheet_state, '{}'::jsonb)
        || jsonb_build_object(
          'pendingRewards',
          coalesce(sheet.player_state->'pendingRewards', '[]'::jsonb)
        ),
      updated_at = now()
  where sheet.campaign_id = p_campaign_id
    and sheet.user_id = auth.uid();

  if not found then
    raise exception 'Player character record was not found';
  end if;
end;
$$;

create or replace function public.queue_campaign_reward(
  p_campaign_id uuid,
  p_user_id uuid,
  p_reward_type text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  reward_grant jsonb;
begin
  if auth.uid() is null or not public.is_campaign_dm(p_campaign_id) then
    raise exception 'Only the campaign DM can send rewards';
  end if;
  if p_reward_type not in (
    'level-up',
    'common',
    'elite',
    'boss',
    'final-boss',
    'feat',
    'asi'
  ) then
    raise exception 'Unknown reward type';
  end if;
  if not exists (
    select 1
    from public.campaign_members member
    where member.campaign_id = p_campaign_id
      and member.user_id = p_user_id
      and member.role = 'player'
  ) then
    raise exception 'Reward target is not a player in this campaign';
  end if;

  reward_grant := jsonb_build_object(
    'id', gen_random_uuid(),
    'type', p_reward_type,
    'grantedAt', now(),
    'grantedBy', auth.uid()
  );

  update public.player_characters sheet
  set player_state = jsonb_set(
        coalesce(sheet.player_state, '{}'::jsonb),
        '{pendingRewards}',
        coalesce(sheet.player_state->'pendingRewards', '[]'::jsonb)
          || jsonb_build_array(reward_grant),
        true
      ),
      updated_at = now()
  where sheet.campaign_id = p_campaign_id
    and sheet.user_id = p_user_id;

  if not found then
    raise exception 'Player character record was not found';
  end if;
  return reward_grant;
end;
$$;

create or replace function public.consume_campaign_reward(
  p_campaign_id uuid,
  p_grant_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null or not exists (
    select 1
    from public.campaign_members member
    where member.campaign_id = p_campaign_id
      and member.user_id = auth.uid()
      and member.role = 'player'
  ) then
    raise exception 'Only the rewarded player can claim this reward';
  end if;

  update public.player_characters sheet
  set player_state = jsonb_set(
        coalesce(sheet.player_state, '{}'::jsonb),
        '{pendingRewards}',
        coalesce((
          select jsonb_agg(reward_item)
          from jsonb_array_elements(
            coalesce(sheet.player_state->'pendingRewards', '[]'::jsonb)
          ) reward_item
          where reward_item->>'id' <> p_grant_id::text
        ), '[]'::jsonb),
        true
      ),
      updated_at = now()
  where sheet.campaign_id = p_campaign_id
    and sheet.user_id = auth.uid();
end;
$$;

revoke all on function public.sync_player_character_sheet(uuid, jsonb, jsonb) from public;
revoke all on function public.queue_campaign_reward(uuid, uuid, text) from public;
revoke all on function public.consume_campaign_reward(uuid, uuid) from public;

grant execute on function public.sync_player_character_sheet(uuid, jsonb, jsonb) to authenticated;
grant execute on function public.queue_campaign_reward(uuid, uuid, text) to authenticated;
grant execute on function public.consume_campaign_reward(uuid, uuid) to authenticated;
