CREATE OR REPLACE FUNCTION public.update_player_stats(
  p_team_id bigint,
  p_manager_id bigint,
  p_goals integer,
  p_assists integer
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE player_profile_id uuid;
BEGIN
  IF auth.uid() IS NULL OR (auth.jwt()->>'aal') IS DISTINCT FROM 'aal2' THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;
  IF p_goals < 0 OR p_assists < 0 THEN
    RAISE EXCEPTION 'Invalid player statistics' USING ERRCODE = '22023';
  END IF;
  SELECT profile_id INTO player_profile_id
  FROM public.managers
  WHERE id = p_manager_id AND team_id = p_team_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Player not found'; END IF;
  IF NOT public.is_admin() AND player_profile_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Cannot edit another player' USING ERRCODE = '42501';
  END IF;
  UPDATE public.managers SET goals = p_goals, assists = p_assists
  WHERE id = p_manager_id AND team_id = p_team_id;
END;
$$;
REVOKE ALL ON FUNCTION public.update_player_stats(bigint, bigint, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_player_stats(bigint, bigint, integer, integer) TO authenticated;
