-- 1. security_logs
CREATE TABLE IF NOT EXISTS public.security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  log_type text NOT NULL DEFAULT 'entry',
  title text NOT NULL,
  description text,
  alert_level text NOT NULL DEFAULT 'info',
  student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  visitor_id uuid REFERENCES public.visitors(id) ON DELETE SET NULL,
  resolved boolean NOT NULL DEFAULT false,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_logs TO authenticated;
GRANT ALL ON public.security_logs TO service_role;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- 2. staff / ops helpers include security_guard and the new roles
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id
    AND role IN ('super_admin','trust_admin','branch_admin','warden','teacher','accountant','security_guard','inventory_manager','kitchen_staff'));
$$;

CREATE OR REPLACE FUNCTION public.is_security(_user_id uuid, _branch_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id AND ur.role = 'security_guard'
      AND (
        ur.branch_id = _branch_id
        OR (ur.trust_id IS NOT NULL AND ur.trust_id = (SELECT trust_id FROM public.branches WHERE id = _branch_id))
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_branch_ops(_user_id uuid, _branch_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.can_admin_branch(_user_id, _branch_id) OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id AND ur.role IN ('warden','security_guard') AND ur.branch_id = _branch_id
  );
$$;

DROP POLICY IF EXISTS security_logs_view ON public.security_logs;
CREATE POLICY security_logs_view ON public.security_logs FOR SELECT TO authenticated
  USING (public.has_branch_access(auth.uid(), branch_id) AND public.is_staff(auth.uid()));

DROP POLICY IF EXISTS security_logs_manage ON public.security_logs;
CREATE POLICY security_logs_manage ON public.security_logs FOR ALL TO authenticated
  USING (public.can_manage_branch_ops(auth.uid(), branch_id) OR public.is_security(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id) OR public.is_security(auth.uid(), branch_id));

DROP TRIGGER IF EXISTS security_logs_updated_at ON public.security_logs;
CREATE TRIGGER security_logs_updated_at BEFORE UPDATE ON public.security_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. role permissions matrix rows
DELETE FROM public.role_permissions WHERE role IN ('security_guard','inventory_manager','kitchen_staff');
INSERT INTO public.role_permissions (role, module, action, scope)
SELECT 'security_guard'::public.app_role, m, a, 'branch' FROM unnest(ARRAY['dashboard','visitors','notifications']) m,
  unnest(ARRAY['view','create','edit']) a
UNION ALL SELECT 'inventory_manager'::public.app_role, m, a, 'branch' FROM unnest(ARRAY['dashboard','inventory','assets','notifications']) m,
  unnest(ARRAY['view','create','edit']) a
UNION ALL SELECT 'kitchen_staff'::public.app_role, m, a, 'branch' FROM unnest(ARRAY['dashboard','mess','inventory','notifications']) m,
  unnest(ARRAY['view','create','edit']) a;

-- 4. starter trust + branch
INSERT INTO public.trusts (id, name, display_name, slug, contact_email, is_active)
VALUES ('11111111-1111-4111-8111-111111111111', 'SVRST Trust', 'SVRST Hostel Management', 'svrst', 'gurugs250000@gmail.com', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.branches (id, trust_id, name, code, city, state, is_active)
VALUES ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', 'Main Campus', 'MAIN', 'Bengaluru', 'Karnataka', true)
ON CONFLICT (id) DO NOTHING;

-- 5. super admin profile + role
INSERT INTO public.profiles (id, email, full_name, is_active, default_branch_id)
VALUES ('e4fa39db-4af8-439f-bc14-058ae05d520e', 'gurugs250000@gmail.com', 'Super Admin', true, '22222222-2222-4222-8222-222222222222')
ON CONFLICT (id) DO UPDATE SET is_active = true, default_branch_id = EXCLUDED.default_branch_id;

INSERT INTO public.user_roles (user_id, role, trust_id)
SELECT 'e4fa39db-4af8-439f-bc14-058ae05d520e', 'super_admin'::public.app_role, '11111111-1111-4111-8111-111111111111'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = 'e4fa39db-4af8-439f-bc14-058ae05d520e' AND role = 'super_admin'
);

-- 6. AI settings enabled
INSERT INTO public.ai_settings (trust_id, ai_enabled, ai_provider, ai_widgets_enabled,
  dashboard_insights_enabled, attendance_prediction_enabled, inventory_prediction_enabled,
  donation_prediction_enabled, maintenance_prediction_enabled, created_by)
SELECT '11111111-1111-4111-8111-111111111111', true, 'openai', true, true, true, true, true, true,
  'e4fa39db-4af8-439f-bc14-058ae05d520e'
WHERE NOT EXISTS (SELECT 1 FROM public.ai_settings WHERE trust_id = '11111111-1111-4111-8111-111111111111');