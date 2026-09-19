-- Temporary fixtures only. RLS assertions run with the actual authenticated role.
BEGIN;
DO $$
DECLARE a uuid; u uuid; t bigint; other_t bigint; p bigint; other_p bigint; s bigint; other_s bigint; o bigint; other_o bigint; mid bigint;
BEGIN
  SELECT id INTO STRICT a FROM public.profiles WHERE role='admin' LIMIT 1;
  SELECT id INTO STRICT u FROM public.profiles WHERE role='user' LIMIT 1;
  INSERT INTO public.teams(name,owner_profile_id) VALUES('__access_own__',a) RETURNING id INTO t;
  INSERT INTO public.teams(name,owner_profile_id) VALUES('__access_other__',a) RETURNING id INTO other_t;
  INSERT INTO public.team_members(team_id,profile_id,can_manage_matches,can_manage_seasons,can_send_invites,can_manage_permissions)
  VALUES(t,u,true,true,true,true);
  INSERT INTO public.managers(name,profile_id,team_id) VALUES('Own',u,t) RETURNING id INTO p;
  INSERT INTO public.managers(name,team_id) VALUES('Other',other_t) RETURNING id INTO other_p;
  INSERT INTO public.seasons(name,team_id,is_active) VALUES('Own',t,true) RETURNING id INTO s;
  INSERT INTO public.seasons(name,team_id,is_active) VALUES('Other',other_t,true) RETURNING id INTO other_s;
  INSERT INTO public.opponents(name,team_id) VALUES('Own',t) RETURNING id INTO o;
  INSERT INTO public.opponents(name,team_id) VALUES('Other',other_t) RETURNING id INTO other_o;
  INSERT INTO public.matches(team_id,manager_id,season_id,opponent_id,our_goals,opponent_goals)
  VALUES(other_t,other_p,other_s,other_o,1,0) RETURNING id INTO mid;
  INSERT INTO public.match_players(match_id,player_id) VALUES(mid,other_p);
  PERFORM set_config('audit.user',u::text,true);
  PERFORM set_config('audit.admin',a::text,true);
  PERFORM set_config('audit.own',t::text,true);
  PERFORM set_config('audit.other',other_t::text,true);
  PERFORM set_config('audit.season',s::text,true);
  PERFORM set_config('audit.other_season',other_s::text,true);
  PERFORM set_config('audit.other_player',other_p::text,true);
  PERFORM set_config('request.jwt.claims',json_build_object('sub',u,'aal','aal2','role','authenticated')::text,true);
END;
$$;
SET LOCAL ROLE authenticated;
DO $$
DECLARE other_t bigint := current_setting('audit.other')::bigint;
BEGIN
  IF EXISTS(SELECT 1 FROM public.managers WHERE team_id=other_t)
    OR EXISTS(SELECT 1 FROM public.matches WHERE team_id=other_t)
    OR EXISTS(SELECT 1 FROM public.seasons WHERE team_id=other_t)
    OR EXISTS(SELECT 1 FROM public.opponents WHERE team_id=other_t)
    OR EXISTS(SELECT 1 FROM public.match_players WHERE player_id=current_setting('audit.other_player')::bigint)
  THEN RAISE EXCEPTION 'Cross-team read leak'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.managers WHERE team_id=current_setting('audit.own')::bigint) THEN RAISE EXCEPTION 'Own team inaccessible'; END IF;
  IF EXISTS(SELECT 1 FROM public.profiles WHERE id=current_setting('audit.admin')::uuid) THEN RAISE EXCEPTION 'Admin profile leak'; END IF;
  PERFORM public.activate_season(current_setting('audit.season')::bigint);
  BEGIN
    PERFORM public.activate_season(current_setting('audit.other_season')::bigint);
    RAISE EXCEPTION 'Other season changed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    PERFORM public.set_team_permissions(current_setting('audit.own')::bigint,auth.uid(),'{"can_manage_matches":false}');
    RAISE EXCEPTION 'Self permissions changed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    PERFORM public.set_team_permissions(current_setting('audit.own')::bigint,current_setting('audit.admin')::uuid,'{"can_manage_matches":false}');
    RAISE EXCEPTION 'Admin permissions changed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    PERFORM public.assign_invited_user_to_team(current_setting('audit.own')::bigint,current_setting('audit.admin')::uuid,auth.uid());
    RAISE EXCEPTION 'Direct invitation assignment accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM set_config('request.jwt.claims',json_build_object('sub',current_setting('audit.user'),'aal','aal1','role','authenticated')::text,true);
  IF EXISTS(SELECT 1 FROM public.managers) OR EXISTS(SELECT 1 FROM public.matches) OR EXISTS(SELECT 1 FROM public.profiles) THEN RAISE EXCEPTION 'MFA read bypass'; END IF;
END;
$$;
RESET ROLE;
DO $$
DECLARE invitee uuid := gen_random_uuid();
BEGIN
  IF NOT (SELECT is_active FROM public.seasons WHERE id=current_setting('audit.other_season')::bigint) THEN RAISE EXCEPTION 'Season activation affected another team'; END IF;
  INSERT INTO auth.users(id,email,invited_at) VALUES(invitee,'audit-' || invitee::text || '@example.invalid',now());
  PERFORM set_config('request.jwt.claims','{"role":"service_role"}',true);
  PERFORM public.assign_invited_user_to_team(current_setting('audit.own')::bigint,invitee,current_setting('audit.user')::uuid);
  PERFORM public.assign_invited_user_to_team(current_setting('audit.own')::bigint,invitee,current_setting('audit.user')::uuid);
  IF (SELECT count(*) FROM public.team_members WHERE profile_id=invitee) <> 1 THEN RAISE EXCEPTION 'Invited account assignment failed'; END IF;
  BEGIN
    PERFORM public.assign_invited_user_to_team(current_setting('audit.other')::bigint,invitee,current_setting('audit.user')::uuid);
    RAISE EXCEPTION 'Inviter assigned to unauthorized team';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END;
$$;
ROLLBACK;
SELECT 'Team read isolation, season isolation, admin/self protection, invitation privilege and MFA checks passed' AS result;
