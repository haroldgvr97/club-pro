-- Admin accounts manage clubs without having a player/manager record.
-- Existing match history is preserved by matches_manager_id_fkey (SET NULL).
DELETE FROM public.managers m
USING public.profiles p
WHERE m.profile_id = p.id AND p.role = 'admin';

CREATE OR REPLACE FUNCTION public.set_profile_display_name(p_display_name text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $$
DECLARE clean_display_name text := btrim(p_display_name);
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  IF clean_display_name IS NULL OR char_length(clean_display_name) NOT BETWEEN 1 AND 50 THEN
    RAISE EXCEPTION 'Display name must contain between 1 and 50 characters';
  END IF;
  UPDATE public.profiles SET display_name = clean_display_name WHERE id = auth.uid();
  INSERT INTO public.managers (name, profile_id, team_id)
  SELECT clean_display_name, p.id, tm.team_id
  FROM public.team_members tm
  JOIN public.profiles p ON p.id = tm.profile_id
  WHERE p.id = auth.uid() AND p.role <> 'admin'
  ON CONFLICT (team_id, profile_id) DO UPDATE SET name = EXCLUDED.name;
END;
$$;

CREATE FUNCTION public.prevent_admin_manager()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.profile_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Admin accounts cannot be managers or players' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.prevent_admin_manager() FROM PUBLIC;
CREATE TRIGGER prevent_admin_manager
BEFORE INSERT OR UPDATE OF profile_id ON public.managers
FOR EACH ROW EXECUTE FUNCTION public.prevent_admin_manager();
