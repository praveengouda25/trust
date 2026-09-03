DO $mig$
DECLARE r record;
BEGIN
  FOR r IN SELECT seq, name, sql FROM public._mig ORDER BY seq LOOP
    BEGIN
      EXECUTE r.sql;
    EXCEPTION WHEN others THEN
      RAISE WARNING 'migration % (%) failed: %', r.seq, r.name, SQLERRM;
    END;
  END LOOP;
END
$mig$;

DROP TABLE public._mig;