CREATE OR REPLACE FUNCTION public.get_my_team_id()
  RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO ''
AS $function$
  SELECT team_id FROM public.team_members
  WHERE profile_id = auth.uid() ORDER BY team_id LIMIT 1;
$function$;

REVOKE ALL ON FUNCTION public.get_my_team_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_team_id() TO authenticated;
