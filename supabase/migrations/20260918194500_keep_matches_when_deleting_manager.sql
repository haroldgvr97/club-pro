ALTER TABLE public.matches
  ALTER COLUMN manager_id DROP NOT NULL;

ALTER TABLE public.matches
  DROP CONSTRAINT matches_manager_id_fkey;

ALTER TABLE public.matches
  ADD CONSTRAINT matches_manager_id_fkey
  FOREIGN KEY (manager_id)
  REFERENCES public.managers(id)
  ON DELETE SET NULL;
