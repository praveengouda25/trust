-- Create AI Settings table for AI configuration
-- This migration enables AI configuration for Super Admin

-- Ensure the handle_updated_at function exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trust_id uuid REFERENCES public.trusts(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
  ai_enabled boolean NOT NULL DEFAULT false,
  ai_provider text NOT NULL DEFAULT 'openai',
  api_key_encrypted text,
  ai_widgets_enabled boolean NOT NULL DEFAULT false,
  dashboard_insights_enabled boolean NOT NULL DEFAULT false,
  attendance_prediction_enabled boolean NOT NULL DEFAULT false,
  inventory_prediction_enabled boolean NOT NULL DEFAULT false,
  donation_prediction_enabled boolean NOT NULL DEFAULT false,
  maintenance_prediction_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id),
  UNIQUE (trust_id, branch_id)
);

CREATE INDEX idx_ai_settings_trust ON public.ai_settings(trust_id);
CREATE INDEX idx_ai_settings_branch ON public.ai_settings(branch_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_settings TO authenticated;
GRANT ALL ON public.ai_settings TO service_role;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_settings_select" ON public.ai_settings FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "ai_settings_write" ON public.ai_settings FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- Enable AI permissions for Super Admin, Trust Admin, Branch Admin, Warden
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'role_permissions' AND table_schema = 'public') THEN
    INSERT INTO public.role_permissions (role, module, action, scope)
    VALUES
      ('super_admin', 'ai_insights', 'view', 'global'),
      ('super_admin', 'ai_insights', 'configure', 'global'),
      ('super_admin', 'ai_insights', 'use', 'global'),
      ('trust_admin', 'ai_insights', 'view', 'trust'),
      ('trust_admin', 'ai_insights', 'use', 'trust'),
      ('branch_admin', 'ai_insights', 'view', 'branch'),
      ('branch_admin', 'ai_insights', 'use', 'branch'),
      ('warden', 'ai_insights', 'view', 'branch'),
      ('warden', 'ai_insights', 'use', 'branch')
    ON CONFLICT (role, module, action) DO NOTHING;

    -- Ensure Students and Parents cannot access AI
    DELETE FROM public.role_permissions
    WHERE role IN ('student', 'parent') AND module = 'ai_insights';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'ai_settings_updated_at' AND event_object_table = 'ai_settings') THEN
    CREATE TRIGGER ai_settings_updated_at BEFORE UPDATE ON public.ai_settings
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;
