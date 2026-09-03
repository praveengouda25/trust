-- enums
DO $$ BEGIN CREATE TYPE public.complaint_status AS ENUM ('open','assigned','in_progress','resolved','closed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.maintenance_status AS ENUM ('reported','scheduled','in_progress','completed','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.notification_priority AS ENUM ('low','normal','high','critical'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
  recipient_id uuid,
  recipient_role public.app_role,
  category text NOT NULL DEFAULT 'general',
  priority public.notification_priority NOT NULL DEFAULT 'normal',
  title text NOT NULL,
  message text,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_read_own" ON public.notifications FOR SELECT TO authenticated
USING (
  recipient_id = auth.uid()
  OR (recipient_role IS NOT NULL AND public.has_role(auth.uid(), recipient_role)
      AND (branch_id IS NULL OR public.has_branch_access(auth.uid(), branch_id)))
);
CREATE POLICY "notifications_staff_write" ON public.notifications FOR INSERT TO authenticated
WITH CHECK (public.is_staff(auth.uid()) AND (branch_id IS NULL OR public.has_branch_access(auth.uid(), branch_id)));
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE TO authenticated
USING (recipient_id = auth.uid() OR (branch_id IS NOT NULL AND public.can_manage_branch_ops(auth.uid(), branch_id)))
WITH CHECK (true);

-- complaints
CREATE TABLE IF NOT EXISTS public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  hostel_id uuid REFERENCES public.hostels(id) ON DELETE SET NULL,
  room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  category text NOT NULL DEFAULT 'other',
  title text NOT NULL,
  description text,
  priority public.issue_priority NOT NULL DEFAULT 'medium',
  status public.complaint_status NOT NULL DEFAULT 'open',
  assigned_to uuid,
  reported_on date NOT NULL DEFAULT current_date,
  resolved_at timestamptz,
  resolution_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "complaints_read" ON public.complaints FOR SELECT TO authenticated
USING (public.has_branch_access(auth.uid(), branch_id) OR (student_id IS NOT NULL AND public.can_view_student(auth.uid(), student_id)));
CREATE POLICY "complaints_write" ON public.complaints FOR ALL TO authenticated
USING (public.has_branch_access(auth.uid(), branch_id))
WITH CHECK (public.has_branch_access(auth.uid(), branch_id));

-- maintenance
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  hostel_id uuid REFERENCES public.hostels(id) ON DELETE SET NULL,
  room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL,
  request_type text NOT NULL DEFAULT 'repair',
  title text NOT NULL,
  description text,
  priority public.issue_priority NOT NULL DEFAULT 'medium',
  status public.maintenance_status NOT NULL DEFAULT 'reported',
  assigned_to uuid,
  vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL,
  cost numeric,
  reported_on date NOT NULL DEFAULT current_date,
  completed_on date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenance_requests TO authenticated;
GRANT ALL ON public.maintenance_requests TO service_role;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "maintenance_read" ON public.maintenance_requests FOR SELECT TO authenticated
USING (public.has_branch_access(auth.uid(), branch_id));
CREATE POLICY "maintenance_write" ON public.maintenance_requests FOR ALL TO authenticated
USING (public.can_manage_branch_ops(auth.uid(), branch_id))
WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));

-- emergency contacts
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  label text NOT NULL,
  contact_type text NOT NULL DEFAULT 'other',
  phone text NOT NULL,
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emergency_contacts TO authenticated;
GRANT ALL ON public.emergency_contacts TO service_role;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "emergency_read" ON public.emergency_contacts FOR SELECT TO authenticated
USING (public.has_branch_access(auth.uid(), branch_id));
CREATE POLICY "emergency_write" ON public.emergency_contacts FOR ALL TO authenticated
USING (public.can_manage_branch_ops(auth.uid(), branch_id))
WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));

-- richer hostel + room detail
ALTER TABLE public.hostels
  ADD COLUMN IF NOT EXISTS contact_person text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS emergency_contact text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS rules text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS maintenance_status text NOT NULL DEFAULT 'operational';

ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS has_attached_bathroom boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_fan boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS has_ac boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_study_table boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_cupboard boolean NOT NULL DEFAULT false;

-- timestamps
CREATE TRIGGER trg_notifications_updated BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_complaints_updated BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_maintenance_updated BEFORE UPDATE ON public.maintenance_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_emergency_updated BEFORE UPDATE ON public.emergency_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- live updates
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['notifications','complaints','maintenance_requests']
  LOOP
    BEGIN EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications (recipient_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_role ON public.notifications (recipient_role, branch_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_branch_status ON public.complaints (branch_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_maintenance_branch_status ON public.maintenance_requests (branch_id, status) WHERE deleted_at IS NULL;