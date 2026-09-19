ALTER TABLE public.matches ADD COLUMN participants_recorded boolean NOT NULL DEFAULT false;
CREATE TABLE public.match_players (
  match_id bigint NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id bigint NOT NULL REFERENCES public.managers(id) ON DELETE CASCADE,
  PRIMARY KEY (match_id, player_id)
);
CREATE INDEX match_players_player_idx ON public.match_players(player_id);
ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.match_players TO authenticated;
CREATE POLICY "Read team participants" ON public.match_players FOR SELECT TO authenticated
USING ((auth.jwt()->>'aal') = 'aal2' AND (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.matches m JOIN public.team_members tm ON tm.team_id = m.team_id
    WHERE m.id = match_id AND tm.profile_id = auth.uid()
  )
));

-- Match data and its attendance are saved in the same transaction.
CREATE FUNCTION public.save_match_with_players(p_team_id bigint, p_match jsonb, p_player_ids bigint[], p_match_id bigint DEFAULT NULL)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  saved_id bigint;
  coach bigint := (p_match->>'manager_id')::bigint;
  season bigint := (p_match->>'season_id')::bigint;
  opponent bigint := (p_match->>'opponent_id')::bigint;
  players bigint[];
BEGIN
  IF auth.uid() IS NULL OR (auth.jwt()->>'aal') IS DISTINCT FROM 'aal2' THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;
  IF NOT public.is_admin() AND NOT EXISTS (
    SELECT 1 FROM public.team_members WHERE team_id=p_team_id AND profile_id=auth.uid() AND can_manage_matches
  ) THEN RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.managers WHERE id=coach AND team_id=p_team_id)
    OR NOT EXISTS (SELECT 1 FROM public.seasons WHERE id=season AND team_id=p_team_id)
    OR NOT EXISTS (SELECT 1 FROM public.opponents WHERE id=opponent AND team_id=p_team_id) THEN
    RAISE EXCEPTION 'INVALID_TEAM_REFERENCE' USING ERRCODE = '23503';
  END IF;
  SELECT array_agg(DISTINCT id) INTO players FROM unnest(COALESCE(p_player_ids, '{}'::bigint[]) || ARRAY[coach]) id;
  IF EXISTS (SELECT 1 FROM unnest(players) AS selected(player_id) WHERE selected.player_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.managers WHERE managers.id=selected.player_id AND team_id=p_team_id
  )) THEN RAISE EXCEPTION 'INVALID_PARTICIPANTS' USING ERRCODE = '22023'; END IF;
  IF p_match_id IS NULL THEN
    INSERT INTO public.matches(team_id, season_id, manager_id, opponent_id, our_goals, opponent_goals, location, notes, played_at, participants_recorded)
    VALUES (p_team_id,season,coach,opponent,(p_match->>'our_goals')::integer,(p_match->>'opponent_goals')::integer,
      p_match->>'location',p_match->>'notes',(p_match->>'played_at')::timestamptz,true) RETURNING id INTO saved_id;
  ELSE
    UPDATE public.matches SET season_id=season,manager_id=coach,opponent_id=opponent,
      our_goals=(p_match->>'our_goals')::integer,opponent_goals=(p_match->>'opponent_goals')::integer,
      location=CASE WHEN p_match ? 'location' THEN p_match->>'location' ELSE location END,
      notes=p_match->>'notes',played_at=(p_match->>'played_at')::timestamptz,participants_recorded=true
    WHERE id=p_match_id AND team_id=p_team_id RETURNING id INTO saved_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'MATCH_NOT_FOUND'; END IF;
  END IF;
  DELETE FROM public.match_players WHERE match_id=saved_id;
  INSERT INTO public.match_players(match_id,player_id) SELECT saved_id,unnest(players);
  RETURN saved_id;
END;
$$;
REVOKE ALL ON FUNCTION public.save_match_with_players(bigint,jsonb,bigint[],bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_match_with_players(bigint,jsonb,bigint[],bigint) TO authenticated;
