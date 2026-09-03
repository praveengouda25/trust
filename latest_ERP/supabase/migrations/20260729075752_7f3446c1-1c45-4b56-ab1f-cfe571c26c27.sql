DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE TO authenticated
USING (recipient_id = auth.uid() OR (branch_id IS NOT NULL AND public.can_manage_branch_ops(auth.uid(), branch_id)))
WITH CHECK (recipient_id = auth.uid() OR (branch_id IS NOT NULL AND public.can_manage_branch_ops(auth.uid(), branch_id)));