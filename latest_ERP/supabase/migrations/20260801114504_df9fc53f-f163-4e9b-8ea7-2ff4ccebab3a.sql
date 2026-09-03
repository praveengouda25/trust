-- 1. Sequence permissions
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;

CREATE OR REPLACE FUNCTION public.set_admission_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.admission_number IS NULL OR NEW.admission_number = '' THEN
    NEW.admission_number := 'ADM-' || to_char(now(),'YYYY') || '-' ||
      lpad(nextval('public.admission_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END; $$;

-- 2. Role helpers
-- Operational staff: admins + warden (security guards handled separately)
CREATE OR REPLACE FUNCTION public.can_manage_branch_ops(_user_id uuid, _branch_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT public.can_admin_branch(_user_id, _branch_id) OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id AND ur.role = 'warden'
      AND (
        ur.branch_id = _branch_id
        OR (ur.trust_id IS NOT NULL AND ur.trust_id = (SELECT trust_id FROM public.branches WHERE id = _branch_id))
      )
  );
$$;

-- Academic staff: operational staff + teachers (students / admissions)
CREATE OR REPLACE FUNCTION public.can_manage_academics(_user_id uuid, _branch_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT public.can_manage_branch_ops(_user_id, _branch_id) OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id AND ur.role = 'teacher'
      AND (
        ur.branch_id = _branch_id
        OR (ur.trust_id IS NOT NULL AND ur.trust_id = (SELECT trust_id FROM public.branches WHERE id = _branch_id))
      )
  );
$$;

-- Gate/visitor staff: operational staff + security guards
CREATE OR REPLACE FUNCTION public.can_manage_gate(_user_id uuid, _branch_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT public.can_manage_branch_ops(_user_id, _branch_id)
      OR public.is_security(_user_id, _branch_id);
$$;

-- 3. Warden can manage hostels
DROP POLICY IF EXISTS hostels_write ON public.hostels;
CREATE POLICY hostels_write ON public.hostels FOR ALL TO authenticated
  USING (public.can_manage_branch_ops(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));

-- 4. Students / admissions writable by teachers too
DROP POLICY IF EXISTS students_write ON public.students;
CREATE POLICY students_write ON public.students FOR ALL TO authenticated
  USING (public.can_manage_academics(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_academics(auth.uid(), branch_id));

DROP POLICY IF EXISTS admissions_write ON public.admissions;
CREATE POLICY admissions_write ON public.admissions FOR ALL TO authenticated
  USING (public.can_manage_academics(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_academics(auth.uid(), branch_id));

DROP POLICY IF EXISTS student_documents_write ON public.student_documents;
CREATE POLICY student_documents_write ON public.student_documents FOR ALL TO authenticated
  USING (public.can_manage_academics(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_academics(auth.uid(), branch_id));

DROP POLICY IF EXISTS student_guardians_write ON public.student_guardians;
CREATE POLICY student_guardians_write ON public.student_guardians FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_guardians.student_id
        AND public.can_manage_academics(auth.uid(), s.branch_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_guardians.student_id
        AND public.can_manage_academics(auth.uid(), s.branch_id)));

DROP POLICY IF EXISTS timeline_insert ON public.student_timeline_events;
CREATE POLICY timeline_insert ON public.student_timeline_events FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_academics(auth.uid(), branch_id));

DROP POLICY IF EXISTS bed_allocations_write ON public.bed_allocations;
CREATE POLICY bed_allocations_write ON public.bed_allocations FOR ALL TO authenticated
  USING (public.can_manage_branch_ops(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));

-- 5. Visitors / gate passes: ops staff + security guards
DROP POLICY IF EXISTS visitors_manage ON public.visitors;
CREATE POLICY visitors_manage ON public.visitors FOR ALL TO authenticated
  USING (public.can_manage_gate(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_gate(auth.uid(), branch_id));

DROP POLICY IF EXISTS gate_passes_write ON public.student_gate_passes;
CREATE POLICY gate_passes_write ON public.student_gate_passes FOR ALL TO authenticated
  USING (public.can_manage_gate(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_gate(auth.uid(), branch_id));

-- 6. Permission matrix rows
DELETE FROM public.role_permissions WHERE role IN ('security_guard','teacher');
INSERT INTO public.role_permissions (role, module, action, scope) VALUES
  ('security_guard','dashboard','view','branch'),
  ('security_guard','visitors','view','branch'),
  ('security_guard','visitors','create','branch'),
  ('security_guard','visitors','edit','branch'),
  ('security_guard','gatepass','view','branch'),
  ('security_guard','gatepass','create','branch'),
  ('security_guard','gatepass','edit','branch'),
  ('security_guard','security','view','branch'),
  ('security_guard','security','create','branch'),
  ('security_guard','security','edit','branch'),
  ('security_guard','reports','view','branch'),
  ('security_guard','notifications','view','branch'),
  ('teacher','dashboard','view','branch'),
  ('teacher','students','view','branch'),
  ('teacher','students','create','branch'),
  ('teacher','students','edit','branch'),
  ('teacher','admissions','view','branch'),
  ('teacher','admissions','create','branch'),
  ('teacher','admissions','edit','branch'),
  ('teacher','attendance','view','branch'),
  ('teacher','attendance','create','branch'),
  ('teacher','attendance','edit','branch'),
  ('teacher','leave','view','branch'),
  ('teacher','complaints','view','branch'),
  ('teacher','complaints','create','branch'),
  ('teacher','mess','view','branch'),
  ('teacher','security','view','branch'),
  ('teacher','reports','view','branch'),
  ('teacher','notifications','view','branch');