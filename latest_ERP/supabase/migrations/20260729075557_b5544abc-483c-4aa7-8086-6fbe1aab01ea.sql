DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['students','bed_allocations','beds','donations','expenses','attendance','visitors','inventory_items','issues','leave_requests','admissions','student_timeline_events']
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS idx_students_branch_status ON public.students (branch_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_students_admission_number ON public.students (admission_number);
CREATE INDEX IF NOT EXISTS idx_students_hostel ON public.students (hostel_id);
CREATE INDEX IF NOT EXISTS idx_bed_alloc_student ON public.bed_allocations (student_id, status);
CREATE INDEX IF NOT EXISTS idx_bed_alloc_branch ON public.bed_allocations (branch_id, status);
CREATE INDEX IF NOT EXISTS idx_beds_room_status ON public.beds (room_id, status);
CREATE INDEX IF NOT EXISTS idx_beds_branch_status ON public.beds (branch_id, status);
CREATE INDEX IF NOT EXISTS idx_attendance_branch_date ON public.attendance (branch_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance (student_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_donations_branch_date ON public.donations (branch_id, donated_on) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_expenses_branch_date ON public.expenses (branch_id, spent_on) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_issues_branch_status ON public.issues (branch_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_visitors_branch_status ON public.visitors (branch_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_timeline_student ON public.student_timeline_events (student_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_leave_branch_status ON public.leave_requests (branch_id, status);