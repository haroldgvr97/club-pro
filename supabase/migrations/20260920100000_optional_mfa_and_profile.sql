-- MFA is mandatory for administrators and optional for regular team members.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

CREATE OR REPLACE FUNCTION public.mfa_required_for_current_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.mfa_required_for_current_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mfa_required_for_current_user() TO authenticated;

ALTER POLICY "Require MFA" ON public.managers
  USING ((auth.jwt()->>'aal') = 'aal2' OR NOT public.mfa_required_for_current_user())
  WITH CHECK ((auth.jwt()->>'aal') = 'aal2' OR NOT public.mfa_required_for_current_user());
ALTER POLICY "Require MFA" ON public.matches
  USING ((auth.jwt()->>'aal') = 'aal2' OR NOT public.mfa_required_for_current_user())
  WITH CHECK ((auth.jwt()->>'aal') = 'aal2' OR NOT public.mfa_required_for_current_user());
ALTER POLICY "Require MFA" ON public.opponents
  USING ((auth.jwt()->>'aal') = 'aal2' OR NOT public.mfa_required_for_current_user())
  WITH CHECK ((auth.jwt()->>'aal') = 'aal2' OR NOT public.mfa_required_for_current_user());
ALTER POLICY "Require MFA" ON public.profiles
  USING ((auth.jwt()->>'aal') = 'aal2' OR NOT public.mfa_required_for_current_user())
  WITH CHECK ((auth.jwt()->>'aal') = 'aal2' OR NOT public.mfa_required_for_current_user());
ALTER POLICY "Require MFA" ON public.seasons
  USING ((auth.jwt()->>'aal') = 'aal2' OR NOT public.mfa_required_for_current_user())
  WITH CHECK ((auth.jwt()->>'aal') = 'aal2' OR NOT public.mfa_required_for_current_user());
ALTER POLICY "Team management requires MFA" ON public.teams
  USING ((auth.jwt()->>'aal') = 'aal2' OR NOT public.mfa_required_for_current_user())
  WITH CHECK ((auth.jwt()->>'aal') = 'aal2' OR NOT public.mfa_required_for_current_user());
ALTER POLICY "Membership management requires MFA" ON public.team_members
  USING ((auth.jwt()->>'aal') = 'aal2' OR NOT public.mfa_required_for_current_user())
  WITH CHECK ((auth.jwt()->>'aal') = 'aal2' OR NOT public.mfa_required_for_current_user());
ALTER POLICY "Read team participants" ON public.match_players
  USING ((auth.jwt()->>'aal') = 'aal2' OR NOT public.mfa_required_for_current_user());

CREATE OR REPLACE FUNCTION public.update_profile_settings(p_display_name text, p_avatar_url text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE clean_display_name text := btrim(p_display_name);
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  IF clean_display_name IS NULL OR char_length(clean_display_name) NOT BETWEEN 1 AND 50 THEN
    RAISE EXCEPTION 'Display name must contain between 1 and 50 characters';
  END IF;
  IF p_avatar_url IS NOT NULL AND char_length(p_avatar_url) > 2048 THEN
    RAISE EXCEPTION 'Avatar URL is too long';
  END IF;
  UPDATE public.profiles SET display_name = clean_display_name, avatar_url = NULLIF(btrim(p_avatar_url), '')
  WHERE id = auth.uid();
  INSERT INTO public.managers(name, profile_id, team_id)
  SELECT clean_display_name, p.id, tm.team_id
  FROM public.team_members tm
  JOIN public.profiles p ON p.id = tm.profile_id
  WHERE p.id = auth.uid() AND p.role <> 'admin'
  ON CONFLICT (team_id, profile_id) DO UPDATE SET name = EXCLUDED.name;
END;
$$;
REVOKE ALL ON FUNCTION public.update_profile_settings(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_profile_settings(text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.activate_season(p_season_id bigint)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE target_team bigint;
BEGIN
  IF auth.uid() IS NULL OR (public.mfa_required_for_current_user() AND (auth.jwt()->>'aal') IS DISTINCT FROM 'aal2') THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE='42501';
  END IF;
  SELECT team_id INTO target_team FROM public.seasons WHERE id=p_season_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'SEASON_NOT_FOUND'; END IF;
  IF NOT public.is_admin() AND NOT EXISTS (SELECT 1 FROM public.team_members WHERE team_id=target_team AND profile_id=auth.uid() AND can_manage_seasons) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE='42501';
  END IF;
  PERFORM id FROM public.teams WHERE id=target_team FOR UPDATE;
  UPDATE public.seasons SET is_active=false WHERE team_id=target_team AND is_active;
  UPDATE public.seasons SET is_active=true WHERE id=p_season_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_team_roster(p_team_id bigint)
RETURNS TABLE(id bigint,name text,is_active boolean,profile_id uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF auth.uid() IS NULL OR (public.mfa_required_for_current_user() AND (auth.jwt()->>'aal') IS DISTINCT FROM 'aal2')
    OR (NOT public.is_admin() AND NOT EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id=p_team_id AND tm.profile_id=auth.uid())) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE='42501';
  END IF;
  RETURN QUERY SELECT m.id,m.name,m.is_active,m.profile_id FROM public.managers m WHERE m.team_id=p_team_id ORDER BY m.is_active DESC,m.name;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_player_stats(p_team_id bigint,p_manager_id bigint,p_goals integer,p_assists integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE owner_id uuid;
BEGIN
  IF auth.uid() IS NULL OR (public.mfa_required_for_current_user() AND (auth.jwt()->>'aal') IS DISTINCT FROM 'aal2') THEN RAISE EXCEPTION 'Unauthorized' USING ERRCODE='42501'; END IF;
  IF p_goals IS NULL OR p_assists IS NULL OR p_goals<0 OR p_assists<0 THEN RAISE EXCEPTION 'Invalid player statistics' USING ERRCODE='22023'; END IF;
  SELECT profile_id INTO owner_id FROM public.managers WHERE id=p_manager_id AND team_id=p_team_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Player not found'; END IF;
  IF NOT public.is_admin() AND (owner_id IS DISTINCT FROM auth.uid() OR NOT EXISTS (SELECT 1 FROM public.team_members WHERE team_id=p_team_id AND profile_id=auth.uid())) THEN RAISE EXCEPTION 'Cannot edit another player' USING ERRCODE='42501'; END IF;
  UPDATE public.managers SET goals=p_goals,assists=p_assists WHERE id=p_manager_id AND team_id=p_team_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_team_permissions(p_team_id bigint,p_user_id uuid,p_permissions jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE actor_admin boolean := public.is_admin();
BEGIN
  IF auth.uid() IS NULL OR (public.mfa_required_for_current_user() AND (auth.jwt()->>'aal') IS DISTINCT FROM 'aal2') THEN RAISE EXCEPTION 'Unauthorized' USING ERRCODE='42501'; END IF;
  IF NOT actor_admin AND NOT EXISTS (SELECT 1 FROM public.team_members WHERE team_id=p_team_id AND profile_id=auth.uid() AND can_manage_permissions) THEN RAISE EXCEPTION 'Unauthorized' USING ERRCODE='42501'; END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id=p_user_id AND role='admin') THEN RAISE EXCEPTION 'Administrator protected' USING ERRCODE='42501'; END IF;
  IF NOT actor_admin AND p_permissions ? 'can_manage_permissions' THEN RAISE EXCEPTION 'Only the administrator can delegate' USING ERRCODE='42501'; END IF;
  UPDATE public.team_members SET
    can_manage_matches=COALESCE((p_permissions->>'can_manage_matches')::boolean,can_manage_matches),
    can_edit_other_player_stats=COALESCE((p_permissions->>'can_edit_other_player_stats')::boolean,can_edit_other_player_stats),
    can_view_other_manager_stats=COALESCE((p_permissions->>'can_view_other_manager_stats')::boolean,can_view_other_manager_stats),
    can_send_invites=COALESCE((p_permissions->>'can_send_invites')::boolean,can_send_invites),
    can_manage_seasons=COALESCE((p_permissions->>'can_manage_seasons')::boolean,can_manage_seasons),
    can_manage_permissions=CASE WHEN actor_admin THEN COALESCE((p_permissions->>'can_manage_permissions')::boolean,can_manage_permissions) ELSE can_manage_permissions END
  WHERE team_id=p_team_id AND profile_id=p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'User not in team'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.save_match_with_players(p_team_id bigint,p_match jsonb,p_player_ids bigint[],p_match_id bigint DEFAULT NULL)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE saved_id bigint; coach bigint := (p_match->>'manager_id')::bigint; season bigint := (p_match->>'season_id')::bigint; opponent bigint := (p_match->>'opponent_id')::bigint; players bigint[];
BEGIN
  IF auth.uid() IS NULL OR (public.mfa_required_for_current_user() AND (auth.jwt()->>'aal') IS DISTINCT FROM 'aal2') THEN RAISE EXCEPTION 'Unauthorized' USING ERRCODE='42501'; END IF;
  IF NOT public.is_admin() AND NOT EXISTS (SELECT 1 FROM public.team_members WHERE team_id=p_team_id AND profile_id=auth.uid() AND can_manage_matches) THEN RAISE EXCEPTION 'Unauthorized' USING ERRCODE='42501'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.managers WHERE id=coach AND team_id=p_team_id) OR NOT EXISTS (SELECT 1 FROM public.seasons WHERE id=season AND team_id=p_team_id) OR NOT EXISTS (SELECT 1 FROM public.opponents WHERE id=opponent AND team_id=p_team_id) THEN RAISE EXCEPTION 'INVALID_TEAM_REFERENCE' USING ERRCODE='23503'; END IF;
  SELECT array_agg(DISTINCT id) INTO players FROM unnest(COALESCE(p_player_ids,'{}'::bigint[]) || ARRAY[coach]) id;
  IF EXISTS (SELECT 1 FROM unnest(players) AS selected(player_id) WHERE selected.player_id IS NULL OR NOT EXISTS (SELECT 1 FROM public.managers WHERE managers.id=selected.player_id AND team_id=p_team_id)) THEN RAISE EXCEPTION 'INVALID_PARTICIPANTS' USING ERRCODE='22023'; END IF;
  IF p_match_id IS NULL THEN
    INSERT INTO public.matches(team_id,season_id,manager_id,opponent_id,our_goals,opponent_goals,location,notes,played_at,participants_recorded)
    VALUES (p_team_id,season,coach,opponent,(p_match->>'our_goals')::integer,(p_match->>'opponent_goals')::integer,p_match->>'location',p_match->>'notes',(p_match->>'played_at')::timestamptz,true) RETURNING id INTO saved_id;
  ELSE
    UPDATE public.matches SET season_id=season,manager_id=coach,opponent_id=opponent,our_goals=(p_match->>'our_goals')::integer,opponent_goals=(p_match->>'opponent_goals')::integer,location=CASE WHEN p_match ? 'location' THEN p_match->>'location' ELSE location END,notes=p_match->>'notes',played_at=(p_match->>'played_at')::timestamptz,participants_recorded=true WHERE id=p_match_id AND team_id=p_team_id RETURNING id INTO saved_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'MATCH_NOT_FOUND'; END IF;
  END IF;
  DELETE FROM public.match_players WHERE match_id=saved_id;
  INSERT INTO public.match_players(match_id,player_id) SELECT saved_id,unnest(players);
  RETURN saved_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.save_profile_avatar_path(p_avatar_url text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  UPDATE public.profiles SET avatar_url = NULLIF(btrim(p_avatar_url), '') WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.save_profile_avatar_path(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_profile_avatar_path(text) TO authenticated;

DO $$ BEGIN
  INSERT INTO storage.buckets (id,name,public) VALUES ('avatars','avatars',true) ON CONFLICT (id) DO UPDATE SET public=true;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DROP POLICY IF EXISTS "Avatar images are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Avatar images are publicly readable" ON storage.objects FOR SELECT USING (bucket_id='avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='avatars' AND (storage.foldername(name))[1]=(select auth.uid()::text));
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id='avatars' AND (storage.foldername(name))[1]=(select auth.uid()::text)) WITH CHECK (bucket_id='avatars' AND (storage.foldername(name))[1]=(select auth.uid()::text));
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE TO authenticated USING (bucket_id='avatars' AND (storage.foldername(name))[1]=(select auth.uid()::text));
