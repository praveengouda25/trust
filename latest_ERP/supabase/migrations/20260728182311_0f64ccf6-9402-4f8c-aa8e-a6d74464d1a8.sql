-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM (
  'super_admin','trust_admin','branch_admin','warden','teacher','accountant','student','parent','donor'
);
CREATE TYPE public.gender_type AS ENUM ('male','female','other');
CREATE TYPE public.hostel_type AS ENUM ('boys','girls','mixed');
CREATE TYPE public.bed_status AS ENUM ('available','occupied','reserved','maintenance');
CREATE TYPE public.allocation_status AS ENUM ('active','transferred','vacated');
CREATE TYPE public.student_status AS ENUM ('applicant','active','on_leave','alumni','withdrawn');
CREATE TYPE public.admission_status AS ENUM ('draft','submitted','under_review','approved','rejected','enrolled');

-- ============ SHARED FUNCTIONS ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ TRUSTS ============
CREATE TABLE public.trusts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  display_name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  primary_color text,
  accent_color text,
  contact_email text,
  contact_phone text,
  address text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trusts TO authenticated;
GRANT ALL ON public.trusts TO service_role;
ALTER TABLE public.trusts ENABLE ROW LEVEL SECURITY;

-- ============ BRANCHES ============
CREATE TABLE public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trust_id uuid NOT NULL REFERENCES public.trusts(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  city text,
  state text,
  address text,
  contact_phone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz,
  UNIQUE (trust_id, code)
);
CREATE INDEX idx_branches_trust ON public.branches(trust_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.branches TO authenticated;
GRANT ALL ON public.branches TO service_role;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- ============ PROFILES ============
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  default_branch_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  trust_id uuid REFERENCES public.trusts(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  UNIQUE (user_id, role, branch_id)
);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============ SECURITY DEFINER HELPERS ============
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id
    AND role IN ('super_admin','trust_admin','branch_admin'));
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id
    AND role IN ('super_admin','trust_admin','branch_admin','warden','teacher','accountant'));
$$;

CREATE OR REPLACE FUNCTION public.has_trust_access(_user_id uuid, _trust_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin(_user_id) OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    LEFT JOIN public.branches b ON b.id = ur.branch_id
    WHERE ur.user_id = _user_id
      AND (ur.trust_id = _trust_id OR b.trust_id = _trust_id)
  );
$$;

CREATE OR REPLACE FUNCTION public.has_branch_access(_user_id uuid, _branch_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin(_user_id) OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND (
        ur.branch_id = _branch_id
        OR (ur.trust_id IS NOT NULL AND ur.trust_id = (SELECT trust_id FROM public.branches WHERE id = _branch_id))
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_admin_branch(_user_id uuid, _branch_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin(_user_id) OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role IN ('trust_admin','branch_admin')
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
    WHERE ur.user_id = _user_id AND ur.role = 'warden' AND ur.branch_id = _branch_id
  );
$$;

-- ============ POLICIES: trusts / branches / profiles / user_roles ============
CREATE POLICY "trusts_select" ON public.trusts FOR SELECT TO authenticated
  USING (public.has_trust_access(auth.uid(), id));
CREATE POLICY "trusts_insert" ON public.trusts FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "trusts_update" ON public.trusts FOR UPDATE TO authenticated
  USING (public.is_super_admin(auth.uid()) OR (public.has_role(auth.uid(),'trust_admin') AND public.has_trust_access(auth.uid(), id)));
CREATE POLICY "trusts_delete" ON public.trusts FOR DELETE TO authenticated
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "branches_select" ON public.branches FOR SELECT TO authenticated
  USING (public.has_branch_access(auth.uid(), id));
CREATE POLICY "branches_insert" ON public.branches FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin(auth.uid()) OR (public.has_role(auth.uid(),'trust_admin') AND public.has_trust_access(auth.uid(), trust_id)));
CREATE POLICY "branches_update" ON public.branches FOR UPDATE TO authenticated
  USING (public.can_admin_branch(auth.uid(), id));
CREATE POLICY "branches_delete" ON public.branches FOR DELETE TO authenticated
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "user_roles_insert" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin(auth.uid()) OR (branch_id IS NOT NULL AND public.can_admin_branch(auth.uid(), branch_id)));
CREATE POLICY "user_roles_update" ON public.user_roles FOR UPDATE TO authenticated
  USING (public.is_super_admin(auth.uid()) OR (branch_id IS NOT NULL AND public.can_admin_branch(auth.uid(), branch_id)));
CREATE POLICY "user_roles_delete" ON public.user_roles FOR DELETE TO authenticated
  USING (public.is_super_admin(auth.uid()) OR (branch_id IS NOT NULL AND public.can_admin_branch(auth.uid(), branch_id)));

-- ============ ROLE PERMISSIONS MATRIX ============
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  module text NOT NULL,
  action text NOT NULL,
  scope text NOT NULL DEFAULT 'branch',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role, module, action)
);
GRANT SELECT ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "role_permissions_select" ON public.role_permissions FOR SELECT TO authenticated USING (true);

-- ============ AUDIT LOGS ============
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  branch_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_record ON public.audit_logs(table_name, record_id);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_select" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'trust_admin'));

CREATE OR REPLACE FUNCTION public.write_audit_log()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_branch uuid; v_rec uuid;
BEGIN
  BEGIN v_branch := (to_jsonb(COALESCE(NEW, OLD)) ->> 'branch_id')::uuid; EXCEPTION WHEN others THEN v_branch := NULL; END;
  v_rec := (to_jsonb(COALESCE(NEW, OLD)) ->> 'id')::uuid;
  INSERT INTO public.audit_logs (actor_id, action, table_name, record_id, branch_id, old_data, new_data)
  VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, v_rec, v_branch,
          CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
          CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END);
  RETURN COALESCE(NEW, OLD);
END; $$;

-- ============ HOSTELS ============
CREATE TABLE public.hostels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  type public.hostel_type NOT NULL DEFAULT 'mixed',
  warden_id uuid,
  capacity integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz,
  UNIQUE (branch_id, code)
);
CREATE INDEX idx_hostels_branch ON public.hostels(branch_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hostels TO authenticated;
GRANT ALL ON public.hostels TO service_role;
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hostels_select" ON public.hostels FOR SELECT TO authenticated
  USING (public.has_branch_access(auth.uid(), branch_id));
CREATE POLICY "hostels_write" ON public.hostels FOR ALL TO authenticated
  USING (public.can_admin_branch(auth.uid(), branch_id))
  WITH CHECK (public.can_admin_branch(auth.uid(), branch_id));

-- ============ BUILDINGS ============
CREATE TABLE public.buildings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  floors_count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz
);
CREATE INDEX idx_buildings_hostel ON public.buildings(hostel_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buildings TO authenticated;
GRANT ALL ON public.buildings TO service_role;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "buildings_select" ON public.buildings FOR SELECT TO authenticated
  USING (public.has_branch_access(auth.uid(), branch_id));
CREATE POLICY "buildings_write" ON public.buildings FOR ALL TO authenticated
  USING (public.can_manage_branch_ops(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));

-- ============ FLOORS ============
CREATE TABLE public.floors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  name text NOT NULL,
  level integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz
);
CREATE INDEX idx_floors_building ON public.floors(building_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.floors TO authenticated;
GRANT ALL ON public.floors TO service_role;
ALTER TABLE public.floors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "floors_select" ON public.floors FOR SELECT TO authenticated
  USING (public.has_branch_access(auth.uid(), branch_id));
CREATE POLICY "floors_write" ON public.floors FOR ALL TO authenticated
  USING (public.can_manage_branch_ops(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));

-- ============ ROOMS ============
CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  floor_id uuid NOT NULL REFERENCES public.floors(id) ON DELETE CASCADE,
  hostel_id uuid NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  room_number text NOT NULL,
  room_type text,
  capacity integer NOT NULL DEFAULT 1,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz,
  UNIQUE (floor_id, room_number)
);
CREATE INDEX idx_rooms_hostel ON public.rooms(hostel_id);
CREATE INDEX idx_rooms_branch ON public.rooms(branch_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT ALL ON public.rooms TO service_role;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rooms_select" ON public.rooms FOR SELECT TO authenticated
  USING (public.has_branch_access(auth.uid(), branch_id));
CREATE POLICY "rooms_write" ON public.rooms FOR ALL TO authenticated
  USING (public.can_manage_branch_ops(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));

-- ============ BEDS ============
CREATE TABLE public.beds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  hostel_id uuid NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  bed_number text NOT NULL,
  status public.bed_status NOT NULL DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz,
  UNIQUE (room_id, bed_number)
);
CREATE INDEX idx_beds_room ON public.beds(room_id);
CREATE INDEX idx_beds_branch_status ON public.beds(branch_id, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.beds TO authenticated;
GRANT ALL ON public.beds TO service_role;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "beds_select" ON public.beds FOR SELECT TO authenticated
  USING (public.has_branch_access(auth.uid(), branch_id));
CREATE POLICY "beds_write" ON public.beds FOR ALL TO authenticated
  USING (public.can_manage_branch_ops(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));

-- ============ STUDENTS ============
CREATE SEQUENCE public.admission_number_seq;

CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  hostel_id uuid REFERENCES public.hostels(id) ON DELETE SET NULL,
  user_id uuid,
  admission_number text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text,
  gender public.gender_type,
  date_of_birth date,
  photo_url text,
  phone text,
  email text,
  address text,
  class_grade text,
  status public.student_status NOT NULL DEFAULT 'active',
  admission_date date DEFAULT CURRENT_DATE,
  blood_group text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz
);
CREATE INDEX idx_students_branch ON public.students(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_hostel ON public.students(hostel_id);
CREATE INDEX idx_students_user ON public.students(user_id);
CREATE INDEX idx_students_name ON public.students(lower(first_name), lower(last_name));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_admission_number()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.admission_number IS NULL OR NEW.admission_number = '' THEN
    NEW.admission_number := 'ADM-' || to_char(now(),'YYYY') || '-' ||
      lpad(nextval('public.admission_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_students_admission_number BEFORE INSERT ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.set_admission_number();

-- ============ GUARDIANS ============
CREATE TABLE public.guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  user_id uuid,
  full_name text NOT NULL,
  phone text,
  email text,
  occupation text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz
);
CREATE INDEX idx_guardians_branch ON public.guardians(branch_id);
CREATE INDEX idx_guardians_user ON public.guardians(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guardians TO authenticated;
GRANT ALL ON public.guardians TO service_role;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.student_guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  guardian_id uuid NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
  relationship text NOT NULL DEFAULT 'guardian',
  is_primary boolean NOT NULL DEFAULT false,
  portal_access boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  UNIQUE (student_id, guardian_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_guardians TO authenticated;
GRANT ALL ON public.student_guardians TO service_role;
ALTER TABLE public.student_guardians ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_guardian_of(_user_id uuid, _student_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.student_guardians sg
    JOIN public.guardians g ON g.id = sg.guardian_id
    WHERE sg.student_id = _student_id AND g.user_id = _user_id AND sg.portal_access
  );
$$;

CREATE OR REPLACE FUNCTION public.can_view_student(_user_id uuid, _student_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = _student_id
      AND (
        s.user_id = _user_id
        OR public.has_branch_access(_user_id, s.branch_id) AND public.is_staff(_user_id)
        OR public.is_guardian_of(_user_id, _student_id)
      )
  );
$$;

CREATE POLICY "students_select" ON public.students FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR (public.is_staff(auth.uid()) AND public.has_branch_access(auth.uid(), branch_id))
    OR public.is_guardian_of(auth.uid(), id)
  );
CREATE POLICY "students_write" ON public.students FOR ALL TO authenticated
  USING (public.can_manage_branch_ops(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));

CREATE POLICY "guardians_select" ON public.guardians FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (public.is_staff(auth.uid()) AND public.has_branch_access(auth.uid(), branch_id)));
CREATE POLICY "guardians_write" ON public.guardians FOR ALL TO authenticated
  USING (public.can_manage_branch_ops(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));

CREATE POLICY "student_guardians_select" ON public.student_guardians FOR SELECT TO authenticated
  USING (public.can_view_student(auth.uid(), student_id));
CREATE POLICY "student_guardians_write" ON public.student_guardians FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND public.can_manage_branch_ops(auth.uid(), s.branch_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND public.can_manage_branch_ops(auth.uid(), s.branch_id)));

-- ============ DOCUMENTS ============
CREATE TABLE public.student_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  doc_type text NOT NULL,
  file_path text NOT NULL,
  file_name text,
  is_verified boolean NOT NULL DEFAULT false,
  verified_by uuid,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz
);
CREATE INDEX idx_student_documents_student ON public.student_documents(student_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_documents TO authenticated;
GRANT ALL ON public.student_documents TO service_role;
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student_documents_select" ON public.student_documents FOR SELECT TO authenticated
  USING (public.can_view_student(auth.uid(), student_id));
CREATE POLICY "student_documents_write" ON public.student_documents FOR ALL TO authenticated
  USING (public.can_manage_branch_ops(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));

-- ============ ADMISSIONS ============
CREATE TABLE public.admissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  applicant_name text NOT NULL,
  gender public.gender_type,
  date_of_birth date,
  guardian_name text,
  guardian_phone text,
  status public.admission_status NOT NULL DEFAULT 'submitted',
  remarks text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz
);
CREATE INDEX idx_admissions_branch ON public.admissions(branch_id, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admissions TO authenticated;
GRANT ALL ON public.admissions TO service_role;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admissions_select" ON public.admissions FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) AND public.has_branch_access(auth.uid(), branch_id));
CREATE POLICY "admissions_write" ON public.admissions FOR ALL TO authenticated
  USING (public.can_manage_branch_ops(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));

-- ============ TIMELINE ============
CREATE TABLE public.student_timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  title text NOT NULL,
  description text,
  metadata jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);
CREATE INDEX idx_timeline_student ON public.student_timeline_events(student_id, occurred_at DESC);
GRANT SELECT, INSERT ON public.student_timeline_events TO authenticated;
GRANT ALL ON public.student_timeline_events TO service_role;
ALTER TABLE public.student_timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "timeline_select" ON public.student_timeline_events FOR SELECT TO authenticated
  USING (public.can_view_student(auth.uid(), student_id));
CREATE POLICY "timeline_insert" ON public.student_timeline_events FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));

CREATE OR REPLACE FUNCTION public.log_student_timeline()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.student_timeline_events (student_id, branch_id, event_type, title, created_by)
    VALUES (NEW.id, NEW.branch_id, 'admission', 'Student record created', auth.uid());
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.student_timeline_events (student_id, branch_id, event_type, title, description, created_by)
    VALUES (NEW.id, NEW.branch_id, 'status_change', 'Status changed',
            OLD.status::text || ' → ' || NEW.status::text, auth.uid());
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_students_timeline AFTER INSERT OR UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.log_student_timeline();

-- ============ BED ALLOCATIONS ============
CREATE TABLE public.bed_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  bed_id uuid NOT NULL REFERENCES public.beds(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  hostel_id uuid NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  status public.allocation_status NOT NULL DEFAULT 'active',
  allocated_at timestamptz NOT NULL DEFAULT now(),
  vacated_at timestamptz,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);
CREATE UNIQUE INDEX idx_bed_allocations_active_bed ON public.bed_allocations(bed_id) WHERE status = 'active';
CREATE UNIQUE INDEX idx_bed_allocations_active_student ON public.bed_allocations(student_id) WHERE status = 'active';
CREATE INDEX idx_bed_allocations_branch ON public.bed_allocations(branch_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bed_allocations TO authenticated;
GRANT ALL ON public.bed_allocations TO service_role;
ALTER TABLE public.bed_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bed_allocations_select" ON public.bed_allocations FOR SELECT TO authenticated
  USING (public.can_view_student(auth.uid(), student_id));
CREATE POLICY "bed_allocations_write" ON public.bed_allocations FOR ALL TO authenticated
  USING (public.can_manage_branch_ops(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));

CREATE OR REPLACE FUNCTION public.sync_bed_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE public.beds SET status = 'occupied', updated_at = now() WHERE id = NEW.bed_id;
    INSERT INTO public.student_timeline_events (student_id, branch_id, event_type, title, created_by)
    VALUES (NEW.student_id, NEW.branch_id, 'allocation', 'Bed allocated', auth.uid());
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status <> 'active' THEN
    UPDATE public.beds SET status = 'available', updated_at = now() WHERE id = NEW.bed_id;
    INSERT INTO public.student_timeline_events (student_id, branch_id, event_type, title, created_by)
    VALUES (NEW.student_id, NEW.branch_id, 'allocation', 'Bed ' || NEW.status::text, auth.uid());
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_bed_allocations_sync AFTER INSERT OR UPDATE ON public.bed_allocations
  FOR EACH ROW EXECUTE FUNCTION public.sync_bed_status();

-- ============ updated_at TRIGGERS ============
CREATE TRIGGER trg_trusts_updated BEFORE UPDATE ON public.trusts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_branches_updated BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_hostels_updated BEFORE UPDATE ON public.hostels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_buildings_updated BEFORE UPDATE ON public.buildings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_floors_updated BEFORE UPDATE ON public.floors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_rooms_updated BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_beds_updated BEFORE UPDATE ON public.beds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_students_updated BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_guardians_updated BEFORE UPDATE ON public.guardians FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_admissions_updated BEFORE UPDATE ON public.admissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_bed_allocations_updated BEFORE UPDATE ON public.bed_allocations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ AUDIT TRIGGERS ============
CREATE TRIGGER trg_audit_branches AFTER INSERT OR UPDATE OR DELETE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();
CREATE TRIGGER trg_audit_hostels AFTER INSERT OR UPDATE OR DELETE ON public.hostels FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();
CREATE TRIGGER trg_audit_students AFTER INSERT OR UPDATE OR DELETE ON public.students FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();
CREATE TRIGGER trg_audit_user_roles AFTER INSERT OR UPDATE OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();
CREATE TRIGGER trg_audit_bed_allocations AFTER INSERT OR UPDATE OR DELETE ON public.bed_allocations FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();

-- ============ OCCUPANCY VIEW ============
CREATE VIEW public.v_hostel_occupancy WITH (security_invoker = true) AS
SELECT h.id AS hostel_id, h.branch_id, h.name AS hostel_name,
  COUNT(b.id) AS total_beds,
  COUNT(b.id) FILTER (WHERE b.status = 'occupied') AS occupied_beds,
  COUNT(b.id) FILTER (WHERE b.status = 'available') AS available_beds,
  CASE WHEN COUNT(b.id) = 0 THEN 0
       ELSE ROUND(100.0 * COUNT(b.id) FILTER (WHERE b.status = 'occupied') / COUNT(b.id), 1)
  END AS occupancy_rate
FROM public.hostels h
LEFT JOIN public.beds b ON b.hostel_id = h.id AND b.deleted_at IS NULL
WHERE h.deleted_at IS NULL
GROUP BY h.id, h.branch_id, h.name;
GRANT SELECT ON public.v_hostel_occupancy TO authenticated;

-- ============ BOOTSTRAP: first user becomes super admin ============
CREATE OR REPLACE FUNCTION public.claim_super_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles) THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, 'super_admin')
  ON CONFLICT DO NOTHING;
  RETURN true;
END; $$;
GRANT EXECUTE ON FUNCTION public.claim_super_admin() TO authenticated;

-- ============ SEED PERMISSION MATRIX ============
INSERT INTO public.role_permissions (role, module, action, scope) VALUES
('super_admin','*','*','global'),
('trust_admin','*','*','trust'),
('branch_admin','settings','view','branch'),
('branch_admin','users','manage','branch'),
('branch_admin','students','manage','branch'),
('branch_admin','hostels','manage','branch'),
('branch_admin','allocations','manage','branch'),
('warden','students','edit','branch'),
('warden','hostels','edit','branch'),
('warden','allocations','manage','branch'),
('teacher','students','view','branch'),
('accountant','students','view','branch'),
('accountant','finance','manage','branch'),
('student','students','view_own','self'),
('parent','students','view_own','self'),
('donor','donations','view_own','self');