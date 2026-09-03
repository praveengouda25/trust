-- Create missing tables referenced in the application
-- This migration ensures all tables referenced in the code exist

-- Notifications table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
    CREATE TABLE public.notifications (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
      recipient_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
      recipient_role text,
      category text,
      priority text NOT NULL DEFAULT 'normal',
      title text NOT NULL,
      message text NOT NULL,
      type text,
      link text,
      is_read boolean NOT NULL DEFAULT false,
      is_archived boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now(),
      created_by uuid REFERENCES public.profiles(id)
    );
    CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id, is_read);
    CREATE INDEX idx_notifications_role ON public.notifications(recipient_role, is_archived);
    CREATE INDEX idx_notifications_branch ON public.notifications(branch_id);
    GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
    GRANT ALL ON public.notifications TO service_role;
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT TO authenticated
      USING (recipient_id = auth.uid() OR public.is_staff(auth.uid()));
    CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT TO authenticated
      WITH CHECK (public.is_staff(auth.uid()));
    CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE TO authenticated
      USING (recipient_id = auth.uid() OR public.is_staff(auth.uid()));
  END IF;
END $$;

-- Complaints table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'complaints' AND table_schema = 'public') THEN
    CREATE TABLE public.complaints (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
      hostel_id uuid REFERENCES public.hostels(id) ON DELETE SET NULL,
      student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
      category text,
      title text NOT NULL,
      description text,
      priority text NOT NULL DEFAULT 'medium',
      status text NOT NULL DEFAULT 'open',
      resolution_notes text,
      resolved_at timestamptz,
      reported_on date NOT NULL DEFAULT CURRENT_DATE,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      created_by uuid REFERENCES public.profiles(id),
      deleted_at timestamptz
    );
    CREATE INDEX idx_complaints_branch ON public.complaints(branch_id) WHERE deleted_at IS NULL;
    CREATE INDEX idx_complaints_status ON public.complaints(status) WHERE deleted_at IS NULL;
    CREATE INDEX idx_complaints_student ON public.complaints(student_id) WHERE deleted_at IS NULL;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.complaints TO authenticated;
    GRANT ALL ON public.complaints TO service_role;
    ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "complaints_select" ON public.complaints FOR SELECT TO authenticated
      USING (public.has_branch_access(auth.uid(), branch_id) AND public.is_staff(auth.uid()));
    CREATE POLICY "complaints_write" ON public.complaints FOR ALL TO authenticated
      USING (public.can_manage_branch_ops(auth.uid(), branch_id))
      WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));
  END IF;
END $$;

-- Maintenance requests table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_requests' AND table_schema = 'public') THEN
    CREATE TABLE public.maintenance_requests (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
      hostel_id uuid REFERENCES public.hostels(id) ON DELETE SET NULL,
      room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
      asset_id uuid,
      request_type text,
      title text NOT NULL,
      description text,
      priority text NOT NULL DEFAULT 'medium',
      status text NOT NULL DEFAULT 'reported',
      cost numeric(14,2),
      completed_on date,
      notes text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      created_by uuid REFERENCES public.profiles(id),
      deleted_at timestamptz
    );
    CREATE INDEX idx_maintenance_branch ON public.maintenance_requests(branch_id) WHERE deleted_at IS NULL;
    CREATE INDEX idx_maintenance_status ON public.maintenance_requests(status) WHERE deleted_at IS NULL;
    CREATE INDEX idx_maintenance_room ON public.maintenance_requests(room_id) WHERE deleted_at IS NULL;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenance_requests TO authenticated;
    GRANT ALL ON public.maintenance_requests TO service_role;
    ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "maintenance_select" ON public.maintenance_requests FOR SELECT TO authenticated
      USING (public.has_branch_access(auth.uid(), branch_id) AND public.is_staff(auth.uid()));
    CREATE POLICY "maintenance_write" ON public.maintenance_requests FOR ALL TO authenticated
      USING (public.can_manage_branch_ops(auth.uid(), branch_id))
      WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));
  END IF;
END $$;

-- Emergency contacts table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'emergency_contacts' AND table_schema = 'public') THEN
    CREATE TABLE public.emergency_contacts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
      label text NOT NULL,
      contact_type text,
      phone text NOT NULL,
      notes text,
      sort_order integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      created_by uuid REFERENCES public.profiles(id),
      deleted_at timestamptz
    );
    CREATE INDEX idx_emergency_branch ON public.emergency_contacts(branch_id) WHERE deleted_at IS NULL;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.emergency_contacts TO authenticated;
    GRANT ALL ON public.emergency_contacts TO service_role;
    ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "emergency_select" ON public.emergency_contacts FOR SELECT TO authenticated
      USING (public.has_branch_access(auth.uid(), branch_id));
    CREATE POLICY "emergency_write" ON public.emergency_contacts FOR ALL TO authenticated
      USING (public.can_manage_branch_ops(auth.uid(), branch_id))
      WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));
  END IF;
END $$;

-- Triggers for updated_at (only create if table exists and trigger doesn't exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'complaints' AND table_schema = 'public') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trg_complaints_updated' AND event_object_table = 'complaints') THEN
    CREATE TRIGGER trg_complaints_updated BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_requests' AND table_schema = 'public')
     AND NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trg_maintenance_updated' AND event_object_table = 'maintenance_requests') THEN
    CREATE TRIGGER trg_maintenance_updated BEFORE UPDATE ON public.maintenance_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'emergency_contacts' AND table_schema = 'public')
     AND NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trg_emergency_updated' AND event_object_table = 'emergency_contacts') THEN
    CREATE TRIGGER trg_emergency_updated BEFORE UPDATE ON public.emergency_contacts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;
