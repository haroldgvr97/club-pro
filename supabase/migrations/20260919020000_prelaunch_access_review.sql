-- Team isolation also applies to direct API queries.
CREATE POLICY "Team isolation" ON public.matches AS RESTRICTIVE FOR ALL TO authenticated
USING (public.is_admin() OR team_id IN (SELECT team_id FROM public.team_members WHERE profile_id=auth.uid()))
WITH CHECK (public.is_admin() OR team_id IN (SELECT team_id FROM public.team_members WHERE profile_id=auth.uid()));
CREATE POLICY "Team isolation" ON public.managers AS RESTRICTIVE FOR ALL TO authenticated
USING (public.is_admin() OR team_id IN (SELECT team_id FROM public.team_members WHERE profile_id=auth.uid()))
WITH CHECK (public.is_admin() OR team_id IN (SELECT team_id FROM public.team_members WHERE profile_id=auth.uid()));
CREATE POLICY "Team isolation" ON public.opponents AS RESTRICTIVE FOR ALL TO authenticated
USING (public.is_admin() OR team_id IN (SELECT team_id FROM public.team_members WHERE profile_id=auth.uid()))
WITH CHECK (public.is_admin() OR team_id IN (SELECT team_id FROM public.team_members WHERE profile_id=auth.uid()));
CREATE POLICY "Team isolation" ON public.seasons AS RESTRICTIVE FOR ALL TO authenticated
USING (public.is_admin() OR team_id IN (SELECT team_id FROM public.team_members WHERE profile_id=auth.uid()))
WITH CHECK (public.is_admin() OR team_id IN (SELECT team_id FROM public.team_members WHERE profile_id=auth.uid()));

DROP INDEX public.seasons_only_one_active_idx;
CREATE UNIQUE INDEX seasons_only_one_active_per_team_idx ON public.seasons(team_id) WHERE is_active;
CREATE OR REPLACE FUNCTION public.activate_season(p_season_id bigint)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE target_team bigint;
BEGIN
  IF auth.uid() IS NULL OR (auth.jwt()->>'aal') IS DISTINCT FROM 'aal2' THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE='42501';
  END IF;
  SELECT team_id INTO target_team FROM public.seasons WHERE id=p_season_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'SEASON_NOT_FOUND'; END IF;
  IF NOT public.is_admin() AND NOT EXISTS (SELECT 1 FROM public.team_members
    WHERE team_id=target_team AND profile_id=auth.uid() AND can_manage_seasons) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE='42501';
  END IF;
  PERFORM id FROM public.teams WHERE id=target_team FOR UPDATE;
  UPDATE public.seasons SET is_active=false WHERE team_id=target_team AND is_active;
  UPDATE public.seasons SET is_active=true WHERE id=p_season_id;
END;
$$;
REVOKE ALL ON FUNCTION public.activate_season(bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.activate_season(bigint) TO authenticated;

-- Attachments are server-only; ordinary users cannot attach arbitrary accounts.
DROP FUNCTION public.assign_invited_user_to_team(bigint,uuid);
CREATE FUNCTION public.assign_invited_user_to_team(p_team_id bigint,p_user_id uuid,p_inviter_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE invited_profile public.profiles%ROWTYPE;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Server only' USING ERRCODE='42501'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id=p_inviter_id AND role='admin')
    AND NOT EXISTS (SELECT 1 FROM public.team_members WHERE team_id=p_team_id AND profile_id=p_inviter_id AND can_send_invites) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE='42501';
  END IF;
  SELECT * INTO invited_profile FROM public.profiles WHERE id=p_user_id FOR UPDATE;
  IF NOT FOUND OR invited_profile.role='admin'
    OR NOT EXISTS (SELECT 1 FROM auth.users WHERE id=p_user_id AND invited_at IS NOT NULL) THEN
    RAISE EXCEPTION 'Invalid invited account';
  END IF;
  IF EXISTS (SELECT 1 FROM public.team_members WHERE profile_id=p_user_id AND team_id<>p_team_id) THEN
    RAISE EXCEPTION 'Account already assigned to a different team';
  END IF;
  INSERT INTO public.team_members(team_id,profile_id) VALUES(p_team_id,p_user_id) ON CONFLICT DO NOTHING;
  IF invited_profile.display_name IS NOT NULL THEN
    INSERT INTO public.managers(name,profile_id,team_id) VALUES(invited_profile.display_name,p_user_id,p_team_id)
    ON CONFLICT(team_id,profile_id) DO UPDATE SET name=EXCLUDED.name;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.assign_invited_user_to_team(bigint,uuid,uuid) FROM PUBLIC,authenticated;
GRANT EXECUTE ON FUNCTION public.assign_invited_user_to_team(bigint,uuid,uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.update_player_stats(p_team_id bigint,p_manager_id bigint,p_goals integer,p_assists integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE owner_id uuid;
BEGIN
  IF auth.uid() IS NULL OR (auth.jwt()->>'aal') IS DISTINCT FROM 'aal2' THEN RAISE EXCEPTION 'Unauthorized' USING ERRCODE='42501'; END IF;
  IF p_goals IS NULL OR p_assists IS NULL OR p_goals<0 OR p_assists<0 THEN RAISE EXCEPTION 'Invalid player statistics' USING ERRCODE='22023'; END IF;
  SELECT profile_id INTO owner_id FROM public.managers WHERE id=p_manager_id AND team_id=p_team_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Player not found'; END IF;
  IF NOT public.is_admin() AND (owner_id IS DISTINCT FROM auth.uid() OR NOT EXISTS (
    SELECT 1 FROM public.team_members WHERE team_id=p_team_id AND profile_id=auth.uid()
  )) THEN RAISE EXCEPTION 'Cannot edit another player' USING ERRCODE='42501'; END IF;
  UPDATE public.managers SET goals=p_goals,assists=p_assists WHERE id=p_manager_id AND team_id=p_team_id;
END;
$$;
