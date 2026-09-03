DROP POLICY IF EXISTS "student_photos_read" ON storage.objects;

DROP POLICY IF EXISTS "guardians_write" ON public.guardians;
CREATE POLICY "guardians_write" ON public.guardians FOR ALL TO authenticated
USING (public.can_admin_branch(auth.uid(), branch_id))
WITH CHECK (public.can_admin_branch(auth.uid(), branch_id));

DROP POLICY IF EXISTS "role_permissions_select" ON public.role_permissions;
CREATE POLICY "role_permissions_select" ON public.role_permissions FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));