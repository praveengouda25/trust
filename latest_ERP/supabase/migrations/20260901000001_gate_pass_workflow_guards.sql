-- Keep the API and direct Data API updates consistent with the gate-pass workflow.
-- Idempotent so it also repairs projects where the earlier schema-cache migration
-- was not applied.
ALTER TABLE public.student_gate_passes
  ADD COLUMN IF NOT EXISTS actual_exit_time timestamptz,
  ADD COLUMN IF NOT EXISTS parent_contact text,
  ADD COLUMN IF NOT EXISTS emergency_contact text,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz;

CREATE OR REPLACE FUNCTION public.enforce_gate_pass_workflow()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  is_security boolean;
  is_approver boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'security_guard'),
         EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin','trust_admin','branch_admin','warden'))
    INTO is_security, is_approver;

  IF TG_OP = 'INSERT' THEN
    IF NOT is_approver OR NEW.status IS DISTINCT FROM 'pending' THEN
      RAISE EXCEPTION 'Only authorized hostel staff can create pending gate passes';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF OLD.status = 'pending' AND NEW.status IN ('approved','rejected') AND NOT is_approver THEN
      RAISE EXCEPTION 'Only an authorized warden or administrator can approve or reject a gate pass';
    ELSIF OLD.status = 'approved' AND NEW.status = 'out' AND NOT (is_security OR is_approver) THEN
      RAISE EXCEPTION 'Only security staff can verify exit';
    ELSIF OLD.status IN ('out','late_return') AND NEW.status = 'returned' AND NOT (is_security OR is_approver) THEN
      RAISE EXCEPTION 'Only security staff can verify return';
    ELSIF OLD.status = 'returned' AND NEW.status = 'closed' AND NOT is_approver THEN
      RAISE EXCEPTION 'Only authorized hostel staff can close a gate pass';
    ELSIF is_security AND NEW.status NOT IN ('out','returned','late_return') THEN
      RAISE EXCEPTION 'Security staff may only verify exit and return';
    END IF;
  ELSIF is_security AND (
    (to_jsonb(NEW) - ARRAY['status','actual_exit_time','actual_return_time','security_id','updated_at'])
      IS DISTINCT FROM
    (to_jsonb(OLD) - ARRAY['status','actual_exit_time','actual_return_time','security_id','updated_at'])
  ) THEN
    RAISE EXCEPTION 'Security staff may only update a gate pass by changing its status';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS gate_pass_workflow_guard ON public.student_gate_passes;
CREATE TRIGGER gate_pass_workflow_guard
  BEFORE INSERT OR UPDATE ON public.student_gate_passes
  FOR EACH ROW EXECUTE FUNCTION public.enforce_gate_pass_workflow();

NOTIFY pgrst, 'reload schema';
