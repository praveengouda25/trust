-- Backward-compatible schema and authorization corrections.
-- This project uses imperative migrations; do not drop existing data.

ALTER TABLE public.student_gate_passes
  ADD COLUMN IF NOT EXISTS actual_exit_time timestamptz,
  ADD COLUMN IF NOT EXISTS parent_contact text,
  ADD COLUMN IF NOT EXISTS emergency_contact text,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz;

-- Security Guard and Kitchen Staff must not inherit admin-only permissions.
DELETE FROM public.role_permissions
WHERE role IN ('security_guard', 'kitchen_staff');

INSERT INTO public.role_permissions (role, module, action, scope) VALUES
  ('security_guard','security','view','branch'),
  ('security_guard','visitors','view','branch'),
  ('security_guard','visitors','create','branch'),
  ('security_guard','visitors','edit','branch'),
  ('security_guard','gatepass','view','branch'),
  ('security_guard','gatepass','create','branch'),
  ('security_guard','gatepass','edit','branch'),
  ('kitchen_staff','leave','view','branch'),
  ('kitchen_staff','issues','view','branch'),
  ('kitchen_staff','complaints','view','branch'),
  ('kitchen_staff','maintenance','view','branch'),
  ('kitchen_staff','inventory','view','branch'),
  ('kitchen_staff','visitors','view','branch'),
  ('kitchen_staff','gatepass','view','branch'),
  ('kitchen_staff','security','view','branch'),
  ('kitchen_staff','medical','view','branch'),
  ('kitchen_staff','mess','view','branch'),
  ('kitchen_staff','assets','view','branch')
ON CONFLICT (role, module, action) DO NOTHING;

-- Gate pass state changes are allowed to branch operations and assigned guards.
DROP POLICY IF EXISTS gate_passes_write ON public.student_gate_passes;
CREATE POLICY gate_passes_write ON public.student_gate_passes FOR ALL TO authenticated
  USING (public.can_manage_gate(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_gate(auth.uid(), branch_id));

-- Student photos are private and limited to authorized staff. The SELECT policy
-- is intentionally authenticated-only; clients resolve paths with signed URLs.
DROP POLICY IF EXISTS student_photos_insert ON storage.objects;
DROP POLICY IF EXISTS student_photos_update ON storage.objects;
DROP POLICY IF EXISTS student_photos_delete ON storage.objects;
DROP POLICY IF EXISTS "Students can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Students can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Students can update photos" ON storage.objects;
DROP POLICY IF EXISTS "Staff can delete photos" ON storage.objects;
DROP POLICY IF EXISTS student_photos_select ON storage.objects;
CREATE POLICY student_photos_select ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'student-photos' AND public.is_staff(auth.uid()));
CREATE POLICY student_photos_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'student-photos' AND public.is_staff(auth.uid()));
CREATE POLICY student_photos_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'student-photos' AND public.is_staff(auth.uid()))
  WITH CHECK (bucket_id = 'student-photos' AND public.is_staff(auth.uid()));
CREATE POLICY student_photos_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'student-photos' AND public.is_staff(auth.uid()));
