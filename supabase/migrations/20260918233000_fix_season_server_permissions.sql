-- Season actions authorize the user and active team before using the server client.
-- BYPASSRLS does not supply the underlying table or sequence privileges.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seasons TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.seasons_id_seq TO service_role;
