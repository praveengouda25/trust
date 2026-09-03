-- Fix Admission RLS Policy to allow Wardens to create admissions
-- This migration fixes the RLS violation error when Wardens create admissions

DROP POLICY IF EXISTS "admissions_select" ON public.admissions;
DROP POLICY IF EXISTS "admissions_write" ON public.admissions;

CREATE POLICY "admissions_select" ON public.admissions FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) AND public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "admissions_write" ON public.admissions FOR ALL TO authenticated
  USING (public.can_manage_branch_ops(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));
