ALTER TABLE public.profiles
  ADD COLUMN can_manage_matches boolean NOT NULL DEFAULT false,
  ADD COLUMN can_edit_other_player_stats boolean NOT NULL DEFAULT false,
  ADD COLUMN can_view_other_manager_stats boolean NOT NULL DEFAULT false,
  ADD COLUMN can_send_invites boolean NOT NULL DEFAULT false,
  ADD COLUMN can_manage_seasons boolean NOT NULL DEFAULT false;

ALTER TABLE public.managers
  ADD COLUMN profile_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE;

INSERT INTO public.managers (name, profile_id)
SELECT display_name, id
FROM public.profiles
WHERE display_name IS NOT NULL
ON CONFLICT (profile_id) DO UPDATE
SET name = EXCLUDED.name;

CREATE OR REPLACE FUNCTION public.set_profile_display_name(p_display_name text)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
AS $function$
DECLARE
  clean_display_name text := btrim(p_display_name);
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF clean_display_name IS NULL
     OR char_length(clean_display_name) NOT BETWEEN 1 AND 50 THEN
    RAISE EXCEPTION 'Display name must contain between 1 and 50 characters';
  END IF;

  UPDATE public.profiles
  SET display_name = clean_display_name
  WHERE id = auth.uid();

  INSERT INTO public.managers (name, profile_id)
  VALUES (clean_display_name, auth.uid())
  ON CONFLICT (profile_id) DO UPDATE
  SET name = EXCLUDED.name;
END;
$function$;
