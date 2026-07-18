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
declare
  existing_character jsonb;
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

  select sheet.character
  into existing_character
  from public.player_characters sheet
  where sheet.campaign_id = p_campaign_id
    and sheet.user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Player character record was not found';
  end if;

  if existing_character <> '{}'::jsonb and (
    existing_character->'race' is distinct from p_character->'race'
    or existing_character->'subrace' is distinct from p_character->'subrace'
    or existing_character->'class' is distinct from p_character->'class'
    or existing_character->'classOption' is distinct from p_character->'classOption'
    or existing_character->'startingSpell' is distinct from p_character->'startingSpell'
    or existing_character->'startingSpells' is distinct from p_character->'startingSpells'
    or existing_character->'originFeat' is distinct from p_character->'originFeat'
    or existing_character->'humanFeat' is distinct from p_character->'humanFeat'
  ) then
    raise exception 'This character is locked for the campaign and cannot be rebuilt';
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
end;
$$;

revoke all on function public.sync_player_character_sheet(uuid, jsonb, jsonb) from public;
grant execute on function public.sync_player_character_sheet(uuid, jsonb, jsonb) to authenticated;
