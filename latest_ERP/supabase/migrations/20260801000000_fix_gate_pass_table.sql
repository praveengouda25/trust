-- Ensure student_gate_passes exists with the fields the ERP expects.
-- This migration is intentionally idempotent and must not destroy existing data.

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.student_gate_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  hostel_id uuid REFERENCES public.hostels(id) ON DELETE SET NULL,
  room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  bed_id uuid REFERENCES public.beds(id) ON DELETE SET NULL,
  gate_pass_number text,
  purpose text NOT NULL,
  destination text,
  out_time timestamptz NOT NULL,
  expected_return_time timestamptz,
  actual_exit_time timestamptz,
  actual_return_time timestamptz,
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz,
  security_id uuid REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'pending',
  parent_contact text,
  emergency_contact text,
  remarks text,
  qr_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id),
  deleted_at timestamptz
);

ALTER TABLE public.student_gate_passes
  ADD COLUMN IF NOT EXISTS actual_exit_time timestamptz,
  ADD COLUMN IF NOT EXISTS actual_return_time timestamptz,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS security_id uuid,
  ADD COLUMN IF NOT EXISTS parent_contact text,
  ADD COLUMN IF NOT EXISTS emergency_contact text;

CREATE INDEX IF NOT EXISTS idx_gate_passes_branch ON public.student_gate_passes(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_gate_passes_student ON public.student_gate_passes(student_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_gate_passes_status ON public.student_gate_passes(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_gate_passes_out_time ON public.student_gate_passes(out_time) WHERE deleted_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_gate_passes TO authenticated;
GRANT ALL ON public.student_gate_passes TO service_role;
ALTER TABLE public.student_gate_passes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gate_passes_select ON public.student_gate_passes;
DROP POLICY IF EXISTS gate_passes_write ON public.student_gate_passes;

CREATE POLICY "gate_passes_select" ON public.student_gate_passes FOR SELECT TO authenticated
  USING (public.has_branch_access(auth.uid(), branch_id));
CREATE POLICY "gate_passes_write" ON public.student_gate_passes FOR ALL TO authenticated
  USING (public.can_manage_gate(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_gate(auth.uid(), branch_id));

DROP TRIGGER IF EXISTS gate_passes_updated_at ON public.student_gate_passes;
CREATE TRIGGER gate_passes_updated_at BEFORE UPDATE ON public.student_gate_passes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

NOTIFY pgrst, 'reload schema';
