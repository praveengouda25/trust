-- enums
CREATE TYPE public.visitor_type AS ENUM ('parent','guardian','guest','vendor','official','other');
CREATE TYPE public.visitor_status AS ENUM ('checked_in','checked_out','expected','denied');
CREATE TYPE public.medical_record_type AS ENUM ('history','doctor_visit','vaccination','emergency','medication');
CREATE TYPE public.meal_type AS ENUM ('breakfast','lunch','snacks','dinner');
CREATE TYPE public.asset_condition AS ENUM ('new','good','fair','poor','damaged','disposed');

-- visitors
CREATE TABLE public.visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  hostel_id uuid REFERENCES public.hostels(id) ON DELETE SET NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  visitor_name text NOT NULL,
  visitor_type public.visitor_type NOT NULL DEFAULT 'guest',
  phone text,
  id_proof text,
  purpose text,
  pass_code text NOT NULL DEFAULT upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  status public.visitor_status NOT NULL DEFAULT 'checked_in',
  entry_at timestamptz NOT NULL DEFAULT now(),
  exit_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visitors TO authenticated;
GRANT ALL ON public.visitors TO service_role;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "visitors_view" ON public.visitors FOR SELECT TO authenticated
  USING (public.has_branch_access(auth.uid(), branch_id) AND public.is_staff(auth.uid()));
CREATE POLICY "visitors_manage" ON public.visitors FOR ALL TO authenticated
  USING (public.can_manage_branch_ops(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));

-- medical records
CREATE TABLE public.medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  record_type public.medical_record_type NOT NULL DEFAULT 'history',
  title text NOT NULL,
  description text,
  doctor_name text,
  hospital text,
  medicine text,
  dosage text,
  occurred_on date NOT NULL DEFAULT current_date,
  next_due_on date,
  is_critical boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_records TO authenticated;
GRANT ALL ON public.medical_records TO service_role;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "medical_view" ON public.medical_records FOR SELECT TO authenticated
  USING (public.can_view_student(auth.uid(), student_id));
CREATE POLICY "medical_manage" ON public.medical_records FOR ALL TO authenticated
  USING (public.can_manage_branch_ops(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));

-- medicines
CREATE TABLE public.medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  unit text NOT NULL DEFAULT 'unit',
  quantity numeric NOT NULL DEFAULT 0,
  min_quantity numeric NOT NULL DEFAULT 0,
  expiry_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medicines TO authenticated;
GRANT ALL ON public.medicines TO service_role;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "medicines_view" ON public.medicines FOR SELECT TO authenticated
  USING (public.has_branch_access(auth.uid(), branch_id) AND public.is_staff(auth.uid()));
CREATE POLICY "medicines_manage" ON public.medicines FOR ALL TO authenticated
  USING (public.can_manage_branch_ops(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));

-- vendors
CREATE TABLE public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  contact_person text,
  phone text,
  email text,
  address text,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendors TO authenticated;
GRANT ALL ON public.vendors TO service_role;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendors_view" ON public.vendors FOR SELECT TO authenticated
  USING (public.has_branch_access(auth.uid(), branch_id) AND public.is_staff(auth.uid()));
CREATE POLICY "vendors_manage" ON public.vendors FOR ALL TO authenticated
  USING (public.can_manage_branch_ops(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));

-- mess menus
CREATE TABLE public.mess_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  menu_date date NOT NULL DEFAULT current_date,
  meal public.meal_type NOT NULL,
  items text NOT NULL,
  calories numeric,
  protein_g numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz,
  UNIQUE (branch_id, menu_date, meal)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mess_menus TO authenticated;
GRANT ALL ON public.mess_menus TO service_role;
ALTER TABLE public.mess_menus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mess_menus_view" ON public.mess_menus FOR SELECT TO authenticated
  USING (public.has_branch_access(auth.uid(), branch_id));
CREATE POLICY "mess_menus_manage" ON public.mess_menus FOR ALL TO authenticated
  USING (public.can_manage_branch_ops(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));

-- food stock
CREATE TABLE public.food_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  category text,
  unit text NOT NULL DEFAULT 'kg',
  quantity numeric NOT NULL DEFAULT 0,
  min_quantity numeric NOT NULL DEFAULT 0,
  unit_cost numeric,
  expiry_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.food_stock TO authenticated;
GRANT ALL ON public.food_stock TO service_role;
ALTER TABLE public.food_stock ENABLE ROW LEVEL SECURITY;
CREATE POLICY "food_stock_view" ON public.food_stock FOR SELECT TO authenticated
  USING (public.has_branch_access(auth.uid(), branch_id) AND public.is_staff(auth.uid()));
CREATE POLICY "food_stock_manage" ON public.food_stock FOR ALL TO authenticated
  USING (public.can_manage_branch_ops(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));

-- meal attendance
CREATE TABLE public.meal_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  meal_date date NOT NULL DEFAULT current_date,
  meal public.meal_type NOT NULL,
  present boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  UNIQUE (student_id, meal_date, meal)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_attendance TO authenticated;
GRANT ALL ON public.meal_attendance TO service_role;
ALTER TABLE public.meal_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meal_attendance_view" ON public.meal_attendance FOR SELECT TO authenticated
  USING (public.can_view_student(auth.uid(), student_id));
CREATE POLICY "meal_attendance_manage" ON public.meal_attendance FOR ALL TO authenticated
  USING (public.can_manage_branch_ops(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));

-- assets
CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  hostel_id uuid REFERENCES public.hostels(id) ON DELETE SET NULL,
  room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  name text NOT NULL,
  category text,
  asset_code text,
  serial_number text,
  location text,
  condition public.asset_condition NOT NULL DEFAULT 'good',
  quantity integer NOT NULL DEFAULT 1,
  purchase_date date,
  purchase_cost numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assets TO authenticated;
GRANT ALL ON public.assets TO service_role;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assets_view" ON public.assets FOR SELECT TO authenticated
  USING (public.has_branch_access(auth.uid(), branch_id) AND public.is_staff(auth.uid()));
CREATE POLICY "assets_manage" ON public.assets FOR ALL TO authenticated
  USING (public.can_manage_branch_ops(auth.uid(), branch_id))
  WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));

-- notification preferences on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_prefs jsonb NOT NULL DEFAULT '{}'::jsonb;

-- updated_at triggers
CREATE TRIGGER trg_visitors_updated BEFORE UPDATE ON public.visitors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_medical_updated BEFORE UPDATE ON public.medical_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_medicines_updated BEFORE UPDATE ON public.medicines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_vendors_updated BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mess_menus_updated BEFORE UPDATE ON public.mess_menus FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_food_stock_updated BEFORE UPDATE ON public.food_stock FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_meal_attendance_updated BEFORE UPDATE ON public.meal_attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_assets_updated BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- indexes
CREATE INDEX idx_visitors_branch ON public.visitors(branch_id, entry_at DESC);
CREATE INDEX idx_medical_student ON public.medical_records(student_id, occurred_on DESC);
CREATE INDEX idx_medicines_branch ON public.medicines(branch_id);
CREATE INDEX idx_vendors_branch ON public.vendors(branch_id);
CREATE INDEX idx_mess_menus_branch_date ON public.mess_menus(branch_id, menu_date DESC);
CREATE INDEX idx_food_stock_branch ON public.food_stock(branch_id);
CREATE INDEX idx_meal_attendance_branch_date ON public.meal_attendance(branch_id, meal_date DESC);
CREATE INDEX idx_assets_branch ON public.assets(branch_id);