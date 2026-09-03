DROP TABLE IF EXISTS public._whoami;
CREATE TABLE public._whoami AS SELECT current_user::text AS u, session_user::text AS s;
GRANT SELECT ON public._whoami TO service_role;