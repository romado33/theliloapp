-- Create storage buckets for experience photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('experience-photos', 'experience-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Create RLS policies for experience photos bucket
CREATE POLICY "Anyone can view experience photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'experience-photos');

CREATE POLICY "Authenticated users can upload experience photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'experience-photos' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own experience photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'experience-photos' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own experience photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'experience-photos' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);