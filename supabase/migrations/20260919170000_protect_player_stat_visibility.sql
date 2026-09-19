-- Names remain available for match forms; private player totals require permission.
CREATE POLICY "Player statistics visibility" ON public.managers AS RESTRICTIVE
FOR SELECT TO authenticated USING (
  public.is_admin() OR profile_id=auth.uid() OR EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id=managers.team_id AND tm.profile_id=auth.uid()
      AND tm.can_view_other_manager_stats
  )
);

CREATE FUNCTION public.get_team_roster(p_team_id bigint)
RETURNS TABLE(id bigint,name text,is_active boolean,profile_id uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF auth.uid() IS NULL OR (auth.jwt()->>'aal') IS DISTINCT FROM 'aal2'
    OR (NOT public.is_admin() AND NOT EXISTS (
      SELECT 1 FROM public.team_members tm WHERE tm.team_id=p_team_id AND tm.profile_id=auth.uid()
    )) THEN RAISE EXCEPTION 'Unauthorized' USING ERRCODE='42501'; END IF;
  RETURN QUERY SELECT m.id,m.name,m.is_active,m.profile_id
    FROM public.managers m WHERE m.team_id=p_team_id ORDER BY m.is_active DESC,m.name;
END;
$$;
REVOKE ALL ON FUNCTION public.get_team_roster(bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_team_roster(bigint) TO authenticated;
