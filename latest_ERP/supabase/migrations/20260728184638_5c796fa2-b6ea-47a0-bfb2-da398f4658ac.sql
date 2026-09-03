
-- ENUMS
CREATE TYPE public.attendance_status AS ENUM ('present','absent','leave','late');
CREATE TYPE public.leave_status AS ENUM ('pending','approved','rejected','cancelled');
CREATE TYPE public.payment_mode AS ENUM ('cash','cheque','bank_transfer','upi','card','other');
CREATE TYPE public.issue_status AS ENUM ('open','in_progress','resolved','closed');
CREATE TYPE public.issue_priority AS ENUM ('low','medium','high','urgent');
CREATE TYPE public.stock_txn_type AS ENUM ('in','out','adjustment');
CREATE TYPE public.staff_status AS ENUM ('active','on_leave','inactive');

-- ATTENDANCE
CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  hostel_id uuid REFERENCES public.hostels(id) ON DELETE SET NULL,
  attendance_date date NOT NULL DEFAULT CURRENT_DATE,
  status public.attendance_status NOT NULL DEFAULT 'present',
  remarks text,
  marked_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  UNIQUE (student_id, attendance_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attendance_read" ON public.attendance FOR SELECT TO authenticated
USING (public.can_view_student(auth.uid(), student_id) OR (public.is_staff(auth.uid()) AND public.has_branch_access(auth.uid(), branch_id)));
CREATE POLICY "attendance_write" ON public.attendance FOR ALL TO authenticated
USING (public.can_manage_branch_ops(auth.uid(), branch_id) OR (public.is_staff(auth.uid()) AND public.has_branch_access(auth.uid(), branch_id)))
WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id) OR (public.is_staff(auth.uid()) AND public.has_branch_access(auth.uid(), branch_id)));

-- LEAVE REQUESTS
CREATE TABLE public.leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  from_date date NOT NULL,
  to_date date NOT NULL,
  reason text NOT NULL,
  destination text,
  contact_phone text,
  status public.leave_status NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leave_requests TO authenticated;
GRANT ALL ON public.leave_requests TO service_role;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leave_read" ON public.leave_requests FOR SELECT TO authenticated
USING (public.can_view_student(auth.uid(), student_id) OR (public.is_staff(auth.uid()) AND public.has_branch_access(auth.uid(), branch_id)));
CREATE POLICY "leave_write" ON public.leave_requests FOR ALL TO authenticated
USING (public.is_staff(auth.uid()) AND public.has_branch_access(auth.uid(), branch_id))
WITH CHECK (public.is_staff(auth.uid()) AND public.has_branch_access(auth.uid(), branch_id));

-- DONATIONS
CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  donor_name text NOT NULL,
  donor_email text,
  donor_phone text,
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'INR',
  purpose text,
  mode public.payment_mode NOT NULL DEFAULT 'cash',
  receipt_number text,
  donated_on date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "donations_read" ON public.donations FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()) AND public.has_branch_access(auth.uid(), branch_id));
CREATE POLICY "donations_write" ON public.donations FOR ALL TO authenticated
USING (public.can_admin_branch(auth.uid(), branch_id) OR public.has_role(auth.uid(),'accountant'))
WITH CHECK (public.can_admin_branch(auth.uid(), branch_id) OR public.has_role(auth.uid(),'accountant'));

-- EXPENSES
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  category text NOT NULL,
  description text,
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  spent_on date NOT NULL DEFAULT CURRENT_DATE,
  vendor text,
  mode public.payment_mode NOT NULL DEFAULT 'cash',
  reference_number text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "expenses_read" ON public.expenses FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()) AND public.has_branch_access(auth.uid(), branch_id));
CREATE POLICY "expenses_write" ON public.expenses FOR ALL TO authenticated
USING (public.can_admin_branch(auth.uid(), branch_id) OR public.has_role(auth.uid(),'accountant'))
WITH CHECK (public.can_admin_branch(auth.uid(), branch_id) OR public.has_role(auth.uid(),'accountant'));

-- INVENTORY
CREATE TABLE public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  hostel_id uuid REFERENCES public.hostels(id) ON DELETE SET NULL,
  name text NOT NULL,
  category text,
  unit text NOT NULL DEFAULT 'pcs',
  quantity numeric(14,2) NOT NULL DEFAULT 0,
  min_quantity numeric(14,2) NOT NULL DEFAULT 0,
  location text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_items TO authenticated;
GRANT ALL ON public.inventory_items TO service_role;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inventory_read" ON public.inventory_items FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()) AND public.has_branch_access(auth.uid(), branch_id));
CREATE POLICY "inventory_write" ON public.inventory_items FOR ALL TO authenticated
USING (public.can_manage_branch_ops(auth.uid(), branch_id))
WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));

CREATE TABLE public.inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  txn_type public.stock_txn_type NOT NULL,
  quantity numeric(14,2) NOT NULL,
  reason text,
  occurred_on date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_transactions TO authenticated;
GRANT ALL ON public.inventory_transactions TO service_role;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inv_txn_read" ON public.inventory_transactions FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()) AND public.has_branch_access(auth.uid(), branch_id));
CREATE POLICY "inv_txn_write" ON public.inventory_transactions FOR ALL TO authenticated
USING (public.can_manage_branch_ops(auth.uid(), branch_id))
WITH CHECK (public.can_manage_branch_ops(auth.uid(), branch_id));

CREATE OR REPLACE FUNCTION public.apply_stock_txn()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.inventory_items
  SET quantity = CASE
      WHEN NEW.txn_type = 'in' THEN quantity + NEW.quantity
      WHEN NEW.txn_type = 'out' THEN quantity - NEW.quantity
      ELSE NEW.quantity END,
    updated_at = now()
  WHERE id = NEW.item_id;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_apply_stock_txn AFTER INSERT ON public.inventory_transactions
FOR EACH ROW EXECUTE FUNCTION public.apply_stock_txn();

-- ISSUE REGISTER
CREATE TABLE public.issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  hostel_id uuid REFERENCES public.hostels(id) ON DELETE SET NULL,
  room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  category text,
  priority public.issue_priority NOT NULL DEFAULT 'medium',
  status public.issue_status NOT NULL DEFAULT 'open',
  reported_on date NOT NULL DEFAULT CURRENT_DATE,
  assigned_to uuid,
  resolved_at timestamptz,
  resolution_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.issues TO authenticated;
GRANT ALL ON public.issues TO service_role;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "issues_read" ON public.issues FOR SELECT TO authenticated
USING ((public.is_staff(auth.uid()) AND public.has_branch_access(auth.uid(), branch_id))
   OR (student_id IS NOT NULL AND public.can_view_student(auth.uid(), student_id)));
CREATE POLICY "issues_write" ON public.issues FOR ALL TO authenticated
USING (public.is_staff(auth.uid()) AND public.has_branch_access(auth.uid(), branch_id))
WITH CHECK (public.is_staff(auth.uid()) AND public.has_branch_access(auth.uid(), branch_id));

-- STAFF
CREATE TABLE public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  user_id uuid,
  full_name text NOT NULL,
  designation text,
  department text,
  email text,
  phone text,
  joined_on date,
  status public.staff_status NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff TO authenticated;
GRANT ALL ON public.staff TO service_role;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_read" ON public.staff FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()) AND public.has_branch_access(auth.uid(), branch_id));
CREATE POLICY "staff_write" ON public.staff FOR ALL TO authenticated
USING (public.can_admin_branch(auth.uid(), branch_id))
WITH CHECK (public.can_admin_branch(auth.uid(), branch_id));

-- updated_at triggers
CREATE TRIGGER trg_attendance_updated BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_leave_updated BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_donations_updated BEFORE UPDATE ON public.donations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_expenses_updated BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_inventory_updated BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_issues_updated BEFORE UPDATE ON public.issues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_staff_updated BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- audit triggers
CREATE TRIGGER trg_donations_audit AFTER INSERT OR UPDATE OR DELETE ON public.donations FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();
CREATE TRIGGER trg_expenses_audit AFTER INSERT OR UPDATE OR DELETE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();
CREATE TRIGGER trg_staff_audit AFTER INSERT OR UPDATE OR DELETE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();

-- indexes
CREATE INDEX idx_attendance_branch_date ON public.attendance(branch_id, attendance_date);
CREATE INDEX idx_leave_branch_status ON public.leave_requests(branch_id, status);
CREATE INDEX idx_donations_branch_date ON public.donations(branch_id, donated_on);
CREATE INDEX idx_expenses_branch_date ON public.expenses(branch_id, spent_on);
CREATE INDEX idx_issues_branch_status ON public.issues(branch_id, status);
CREATE INDEX idx_staff_branch ON public.staff(branch_id);
CREATE INDEX idx_inv_items_branch ON public.inventory_items(branch_id);
