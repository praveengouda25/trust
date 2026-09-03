DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE, CREATE ON SCHEMA public TO sandbox_exec;

CREATE TABLE public._mig (seq int PRIMARY KEY, name text, sql text);
GRANT SELECT, INSERT, UPDATE, DELETE ON public._mig TO sandbox_exec;
GRANT ALL ON public._mig TO service_role;
ALTER TABLE public._mig ENABLE ROW LEVEL SECURITY;