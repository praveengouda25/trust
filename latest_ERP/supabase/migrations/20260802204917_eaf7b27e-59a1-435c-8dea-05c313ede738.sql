ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS father_name text,
  ADD COLUMN IF NOT EXISTS father_mobile text,
  ADD COLUMN IF NOT EXISTS father_occupation text,
  ADD COLUMN IF NOT EXISTS father_aadhaar text,
  ADD COLUMN IF NOT EXISTS father_pan text,
  ADD COLUMN IF NOT EXISTS mother_name text,
  ADD COLUMN IF NOT EXISTS mother_mobile text,
  ADD COLUMN IF NOT EXISTS mother_occupation text,
  ADD COLUMN IF NOT EXISTS guardian_name text,
  ADD COLUMN IF NOT EXISTS guardian_mobile text,
  ADD COLUMN IF NOT EXISTS guardian_relationship text,
  ADD COLUMN IF NOT EXISTS school_name text,
  ADD COLUMN IF NOT EXISTS religion text,
  ADD COLUMN IF NOT EXISTS caste text,
  ADD COLUMN IF NOT EXISTS nationality text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS aadhaar_number text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS taluk text,
  ADD COLUMN IF NOT EXISTS village text,
  ADD COLUMN IF NOT EXISTS custom_village text,
  ADD COLUMN IF NOT EXISTS pincode text;

DROP POLICY IF EXISTS "student_photos_read" ON storage.objects;
DROP POLICY IF EXISTS "student_photos_insert" ON storage.objects;
DROP POLICY IF EXISTS "student_photos_update" ON storage.objects;
DROP POLICY IF EXISTS "student_photos_delete" ON storage.objects;

CREATE POLICY "student_photos_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'student-photos');

CREATE POLICY "student_photos_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'student-photos' AND public.is_staff(auth.uid()));

CREATE POLICY "student_photos_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'student-photos' AND public.is_staff(auth.uid()))
  WITH CHECK (bucket_id = 'student-photos' AND public.is_staff(auth.uid()));

CREATE POLICY "student_photos_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'student-photos' AND public.is_staff(auth.uid()));