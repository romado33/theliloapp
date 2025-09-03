-- Add onboarded field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN onboarded boolean DEFAULT false;

-- Create experiences status enum
CREATE TYPE public.experience_status AS ENUM ('submitted', 'under_review', 'more_info_needed', 'approved', 'rejected');

-- Add status field to experiences table
ALTER TABLE public.experiences 
ADD COLUMN status experience_status DEFAULT 'submitted';

-- Create experience_photos table for multiple images per experience
CREATE TABLE public.experience_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on experience_photos
ALTER TABLE public.experience_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for experience_photos
CREATE POLICY "Anyone can view photos for active experiences"
ON public.experience_photos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.experiences 
    WHERE experiences.id = experience_photos.experience_id 
    AND experiences.is_active = true
  )
);

CREATE POLICY "Hosts can manage their experience photos"
ON public.experience_photos
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.experiences 
    WHERE experiences.id = experience_photos.experience_id 
    AND experiences.host_id = auth.uid()
  )
);

-- Add trigger for experience_photos updated_at
CREATE TRIGGER update_experience_photos_updated_at
BEFORE UPDATE ON public.experience_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();