CREATE OR REPLACE FUNCTION public.set_team_permissions(p_team_id bigint, p_user_id uuid, p_permissions jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE actor_admin boolean := public.is_admin();
BEGIN
  IF auth.uid() IS NULL OR (auth.jwt()->>'aal') IS DISTINCT FROM 'aal2' THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;
  IF NOT actor_admin AND NOT EXISTS (
    SELECT 1 FROM public.team_members WHERE team_id = p_team_id
    AND profile_id = auth.uid() AND can_manage_permissions
  ) THEN RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501'; END IF;
  IF NOT actor_admin AND p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot change own permissions' USING ERRCODE = '42501';
  END IF;
  -- Even forged requests cannot modify the global administrator.
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Administrator protected' USING ERRCODE = '42501';
  END IF;
  IF NOT actor_admin AND p_permissions ? 'can_manage_permissions' THEN
    RAISE EXCEPTION 'Only the administrator can delegate' USING ERRCODE = '42501';
  END IF;
  UPDATE public.team_members SET
    can_manage_matches = COALESCE((p_permissions->>'can_manage_matches')::boolean, can_manage_matches),
    can_edit_other_player_stats = COALESCE((p_permissions->>'can_edit_other_player_stats')::boolean, can_edit_other_player_stats),
    can_view_other_manager_stats = COALESCE((p_permissions->>'can_view_other_manager_stats')::boolean, can_view_other_manager_stats),
    can_send_invites = COALESCE((p_permissions->>'can_send_invites')::boolean, can_send_invites),
    can_manage_seasons = COALESCE((p_permissions->>'can_manage_seasons')::boolean, can_manage_seasons),
    can_manage_permissions = CASE WHEN actor_admin THEN COALESCE((p_permissions->>'can_manage_permissions')::boolean, can_manage_permissions) ELSE can_manage_permissions END
  WHERE team_id = p_team_id AND profile_id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'User not in team'; END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.set_team_permissions(bigint, uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_team_permissions(bigint, uuid, jsonb) TO authenticated;
