-- Run against a migrated database with an existing administrator; all fixtures roll back.
BEGIN;
DO $$
DECLARE a uuid; member_id uuid; t bigint; t2 bigint; p1 bigint; p2 bigint; absent bigint; outsider bigint;
  s bigint; o bigint; saved bigint; old_match bigint; body jsonb;
BEGIN
  SELECT id INTO STRICT a FROM public.profiles WHERE role='admin' LIMIT 1;
  PERFORM set_config('request.jwt.claims',json_build_object('sub',a,'aal','aal2')::text,true);
  INSERT INTO public.teams(name,owner_profile_id) VALUES ('__attendance_test__',a) RETURNING id INTO t;
  INSERT INTO public.teams(name,owner_profile_id) VALUES ('__attendance_other__',a) RETURNING id INTO t2;
  INSERT INTO public.managers(name,team_id) VALUES ('Coach',t) RETURNING id INTO p1;
  INSERT INTO public.managers(name,team_id) VALUES ('Player',t) RETURNING id INTO p2;
  INSERT INTO public.managers(name,team_id) VALUES ('Absent',t) RETURNING id INTO absent;
  INSERT INTO public.managers(name,team_id) VALUES ('Other team',t2) RETURNING id INTO outsider;
  INSERT INTO public.seasons(name,team_id) VALUES ('Season',t) RETURNING id INTO s;
  INSERT INTO public.opponents(name,team_id) VALUES ('Opponent',t) RETURNING id INTO o;
  body := jsonb_build_object('manager_id',p1,'season_id',s,'opponent_id',o,'our_goals',0,'opponent_goals',0,'played_at',now());
  -- Historical matches are deliberately not backfilled.
  INSERT INTO public.matches(team_id,season_id,opponent_id,manager_id,our_goals,opponent_goals)
  VALUES(t,s,o,p1,1,0) RETURNING id INTO old_match;
  IF EXISTS(SELECT 1 FROM public.match_players WHERE match_id=old_match)
    OR (SELECT participants_recorded FROM public.matches WHERE id=old_match) THEN RAISE EXCEPTION 'Historical participation invented'; END IF;
  saved := public.save_match_with_players(t,body,ARRAY[p2,p2]);
  IF (SELECT count(*) FROM public.match_players WHERE match_id=saved) <> 2 THEN RAISE EXCEPTION 'Coach inclusion or deduplication failed'; END IF;
  IF EXISTS(SELECT 1 FROM public.match_players WHERE match_id=saved AND player_id=absent) THEN RAISE EXCEPTION 'Absent player counted'; END IF;
  IF (SELECT manager_id FROM public.matches WHERE id=saved) <> p1 THEN RAISE EXCEPTION 'Manager changed'; END IF;
  PERFORM public.save_match_with_players(t,body,'{}',saved);
  IF (SELECT count(*) FROM public.match_players WHERE match_id=saved) <> 1
    OR NOT EXISTS(SELECT 1 FROM public.match_players WHERE match_id=saved AND player_id=p1) THEN RAISE EXCEPTION 'Attendance correction failed'; END IF;
  BEGIN
    PERFORM public.save_match_with_players(t,body,ARRAY[outsider],saved);
    RAISE EXCEPTION 'Other team participant accepted';
  EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
  IF (SELECT count(*) FROM public.match_players WHERE match_id=saved) <> 1 THEN RAISE EXCEPTION 'Failed save changed attendance'; END IF;
  PERFORM public.save_match_with_players(t,body,ARRAY[p2],old_match);
  IF NOT (SELECT participants_recorded FROM public.matches WHERE id=old_match) THEN RAISE EXCEPTION 'Historical completion failed'; END IF;
  DELETE FROM public.matches WHERE id=saved;
  IF EXISTS(SELECT 1 FROM public.match_players WHERE match_id=saved) THEN RAISE EXCEPTION 'Match deletion did not remove attendance'; END IF;
  SELECT id INTO STRICT member_id FROM public.profiles WHERE role='user' LIMIT 1;
  INSERT INTO public.team_members(team_id,profile_id,can_manage_matches) VALUES(t,member_id,true);
  PERFORM set_config('request.jwt.claims',json_build_object('sub',member_id,'aal','aal2')::text,true);
  saved := public.save_match_with_players(t,body,ARRAY[p2]);
  IF (SELECT count(*) FROM public.match_players WHERE match_id=saved) <> 2 THEN RAISE EXCEPTION 'Delegated match recording failed'; END IF;
  UPDATE public.team_members SET can_manage_matches=false WHERE team_id=t AND profile_id=member_id;
  BEGIN
    PERFORM public.save_match_with_players(t,body,ARRAY[p2],saved);
    RAISE EXCEPTION 'Unauthorized match edit accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM set_config('request.jwt.claims',json_build_object('sub',a,'aal','aal1')::text,true);
  BEGIN
    PERFORM public.save_match_with_players(t,body,ARRAY[p2]);
    RAISE EXCEPTION 'MFA bypass accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END;
$$;
ROLLBACK;
SELECT 'Attendance, historical completion, team isolation, deletion and MFA checks passed' AS result;
