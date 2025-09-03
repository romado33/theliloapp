-- Fix categories table to allow authenticated users to insert data
CREATE POLICY "Authenticated users can insert categories for development"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add unique constraint for experiences table to support ON CONFLICT
CREATE UNIQUE INDEX IF NOT EXISTS idx_experiences_title_host 
ON public.experiences (title, host_id);

-- Update categories table to allow updates for development
CREATE POLICY "Authenticated users can update categories"
ON public.categories
FOR UPDATE
TO authenticated
USING (true);

-- Allow authenticated users to delete their own experiences for development cleanup
CREATE POLICY "Users can delete their own experiences"
ON public.experiences
FOR DELETE
USING (auth.uid() = host_id);