ALTER TABLE public.profiles
  ADD COLUMN display_name text;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_display_name_length_check
  CHECK (
    display_name IS NULL
    OR char_length(btrim(display_name)) BETWEEN 1 AND 50
  );

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
END;
$function$;

REVOKE ALL ON FUNCTION public.set_profile_display_name(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_profile_display_name(text) TO authenticated;
