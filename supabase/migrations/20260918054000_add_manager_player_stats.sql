ALTER TABLE public.managers
  ADD COLUMN goals integer NOT NULL DEFAULT 0,
  ADD COLUMN assists integer NOT NULL DEFAULT 0,
  ADD CONSTRAINT managers_goals_check CHECK (goals >= 0),
  ADD CONSTRAINT managers_assists_check CHECK (assists >= 0);
