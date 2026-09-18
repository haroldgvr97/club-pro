GRANT SELECT, INSERT, UPDATE, DELETE ON public.teams, public.team_members TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.teams_id_seq TO authenticated;

CREATE POLICY "Team management requires MFA" ON public.teams AS RESTRICTIVE
FOR ALL TO authenticated USING ((auth.jwt()->>'aal') = 'aal2')
WITH CHECK ((auth.jwt()->>'aal') = 'aal2');
CREATE POLICY "Membership management requires MFA" ON public.team_members AS RESTRICTIVE
FOR ALL TO authenticated USING ((auth.jwt()->>'aal') = 'aal2')
WITH CHECK ((auth.jwt()->>'aal') = 'aal2');

UPDATE public.teams SET name = 'FIFA27' WHERE id = 1 AND name = 'Equipo Principal';

CREATE OR REPLACE FUNCTION public.create_managed_team(p_name text)
RETURNS bigint LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE new_id bigint;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  IF char_length(btrim(p_name)) NOT BETWEEN 1 AND 80 THEN RAISE EXCEPTION 'Invalid name'; END IF;
  INSERT INTO public.teams(name, owner_profile_id) VALUES (btrim(p_name), auth.uid()) RETURNING id INTO new_id;
  INSERT INTO public.team_members(team_id, profile_id) VALUES (new_id, auth.uid());
  RETURN new_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_managed_team(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_managed_team(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.delete_managed_team(p_team_id bigint)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE member_ids uuid[];
BEGIN
  IF NOT public.is_admin() OR (auth.jwt()->>'aal') IS DISTINCT FROM 'aal2' THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  PERFORM id FROM public.teams WHERE id = p_team_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Team not found'; END IF;
  SELECT array_agg(profile_id) INTO member_ids FROM public.team_members WHERE team_id = p_team_id;
  -- Delete dependent matches first so their references cannot block the cascade.
  DELETE FROM public.matches WHERE team_id = p_team_id;
  DELETE FROM public.teams WHERE id = p_team_id;
  DELETE FROM auth.users u USING public.profiles p
    WHERE u.id = p.id AND p.id = ANY(member_ids) AND p.role <> 'admin'
      AND NOT EXISTS (SELECT 1 FROM public.team_members m WHERE m.profile_id = p.id)
      AND NOT EXISTS (SELECT 1 FROM public.teams t WHERE t.owner_profile_id = p.id);
END;
$$;
REVOKE ALL ON FUNCTION public.delete_managed_team(bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_managed_team(bigint) TO authenticated;
