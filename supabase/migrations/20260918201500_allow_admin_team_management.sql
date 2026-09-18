CREATE POLICY "Admins can manage teams" ON public.teams
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage team members" ON public.team_members
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
