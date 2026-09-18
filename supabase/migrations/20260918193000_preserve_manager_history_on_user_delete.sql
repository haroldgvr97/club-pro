ALTER TABLE public.managers
  DROP CONSTRAINT managers_profile_id_fkey;

ALTER TABLE public.managers
  ADD CONSTRAINT managers_profile_id_fkey
  FOREIGN KEY (profile_id)
  REFERENCES public.profiles(id)
  ON DELETE SET NULL;
