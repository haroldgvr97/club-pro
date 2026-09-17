create or replace function public.activate_season(p_season_id bigint)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.seasons
    where id = p_season_id
  ) then
    raise exception 'SEASON_NOT_FOUND';
  end if;

  update public.seasons
  set is_active = false
  where is_active = true
    and id <> p_season_id;

  update public.seasons
  set is_active = true
  where id = p_season_id;
end;
$$;

revoke all on function public.activate_season(bigint) from public;
grant execute on function public.activate_season(bigint) to authenticated;
