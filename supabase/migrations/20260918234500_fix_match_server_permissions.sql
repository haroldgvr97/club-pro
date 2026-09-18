-- Match actions check the user's permission and resolve their team before
-- accessing these tables through the server-only service client.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matches, public.opponents TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.matches_id_seq, public.opponents_id_seq TO service_role;
