CREATE OR REPLACE FUNCTION public.assign_invited_user_to_team(p_team_id bigint, p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE invited_profile public.profiles%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR (auth.jwt()->>'aal') IS DISTINCT FROM 'aal2' THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;
  IF NOT public.is_admin() AND NOT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id AND profile_id = auth.uid() AND can_send_invites
  ) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO invited_profile FROM public.profiles WHERE id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invited user profile not found'; END IF;
  INSERT INTO public.team_members(team_id, profile_id)
  VALUES (p_team_id, p_user_id)
  ON CONFLICT (team_id, profile_id) DO NOTHING;
  IF invited_profile.role <> 'admin' AND invited_profile.display_name IS NOT NULL THEN
    INSERT INTO public.managers(name, profile_id, team_id)
    VALUES (invited_profile.display_name, p_user_id, p_team_id)
    ON CONFLICT (team_id, profile_id) DO UPDATE SET name = EXCLUDED.name;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.assign_invited_user_to_team(bigint, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_invited_user_to_team(bigint, uuid) TO authenticated;
