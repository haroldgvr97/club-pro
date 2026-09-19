BEGIN;
DO $$
DECLARE a uuid; u uuid; t bigint; own_player bigint; other_player bigint;
BEGIN
  SELECT id INTO STRICT a FROM public.profiles WHERE role='admin' LIMIT 1;
  SELECT id INTO STRICT u FROM public.profiles WHERE role='user' LIMIT 1;
  INSERT INTO public.teams(name,owner_profile_id) VALUES('__visibility_test__',a) RETURNING id INTO t;
  INSERT INTO public.team_members(team_id,profile_id,can_view_other_manager_stats) VALUES(t,u,false);
  INSERT INTO public.managers(name,profile_id,team_id,goals,assists) VALUES('Own',u,t,2,3) RETURNING id INTO own_player;
  INSERT INTO public.managers(name,team_id,goals,assists) VALUES('Other',t,10,20) RETURNING id INTO other_player;
  PERFORM set_config('audit.team',t::text,true);
  PERFORM set_config('audit.own',own_player::text,true);
  PERFORM set_config('audit.other',other_player::text,true);
  PERFORM set_config('audit.user',u::text,true);
  PERFORM set_config('request.jwt.claims',json_build_object('sub',u,'aal','aal2','role','authenticated')::text,true);
END;
$$;
SET LOCAL ROLE authenticated;
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM public.managers WHERE id=current_setting('audit.other')::bigint) THEN RAISE EXCEPTION 'Other player statistics leaked'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.managers WHERE id=current_setting('audit.own')::bigint AND goals=2) THEN RAISE EXCEPTION 'Own statistics missing'; END IF;
  IF (SELECT count(*) FROM public.get_team_roster(current_setting('audit.team')::bigint)) <> 2 THEN RAISE EXCEPTION 'Roster missing'; END IF;
  PERFORM public.update_player_stats(current_setting('audit.team')::bigint,current_setting('audit.own')::bigint,4,5);
  IF NOT EXISTS(SELECT 1 FROM public.managers WHERE id=current_setting('audit.own')::bigint AND goals=4 AND assists=5) THEN RAISE EXCEPTION 'Own update failed'; END IF;
  BEGIN
    PERFORM public.update_player_stats(current_setting('audit.team')::bigint,current_setting('audit.other')::bigint,4,5);
    RAISE EXCEPTION 'Other player edited';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END;
$$;
RESET ROLE;
UPDATE public.team_members SET can_view_other_manager_stats=true WHERE team_id=current_setting('audit.team')::bigint;
SET LOCAL ROLE authenticated;
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.managers WHERE id=current_setting('audit.other')::bigint AND goals=10 AND assists=20) THEN RAISE EXCEPTION 'View permission ineffective'; END IF;
  BEGIN
    PERFORM public.update_player_stats(current_setting('audit.team')::bigint,current_setting('audit.other')::bigint,4,5);
    RAISE EXCEPTION 'Viewing granted editing';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM set_config('request.jwt.claims',json_build_object('sub',current_setting('audit.user'),'aal','aal1','role','authenticated')::text,true);
  BEGIN
    PERFORM public.get_team_roster(current_setting('audit.team')::bigint);
    RAISE EXCEPTION 'Roster MFA bypass';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END;
$$;
ROLLBACK;
SELECT 'Player statistics visibility, roster access, self editing and MFA passed' AS result;
