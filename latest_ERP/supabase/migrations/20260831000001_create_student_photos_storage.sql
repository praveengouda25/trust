-- Create student-photos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('student-photos', 'student-photos', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload student photos
CREATE POLICY "Students can upload photos" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'student-photos');

-- Allow authenticated users to view student photos
CREATE POLICY "Students can view photos" ON storage.objects 
FOR SELECT TO authenticated 
USING (bucket_id = 'student-photos');

-- Allow authenticated users to update student photos
CREATE POLICY "Students can update photos" ON storage.objects 
FOR UPDATE TO authenticated 
USING (bucket_id = 'student-photos');

-- Allow staff to delete student photos
CREATE POLICY "Staff can delete photos" ON storage.objects 
FOR DELETE TO authenticated 
USING (bucket_id = 'student-photos' AND (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin','trust_admin','branch_admin','warden'))
));
