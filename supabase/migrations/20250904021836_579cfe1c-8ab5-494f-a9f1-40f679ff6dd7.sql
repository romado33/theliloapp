-- Create saved_experiences table for users to save experiences they're interested in
CREATE TABLE public.saved_experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  experience_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, experience_id)
);

-- Enable RLS
ALTER TABLE public.saved_experiences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own saved experiences" 
ON public.saved_experiences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save experiences" 
ON public.saved_experiences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove saved experiences" 
ON public.saved_experiences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create activity_log table to track user actions
CREATE TABLE public.activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  activity_description TEXT NOT NULL,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own activity" 
ON public.activity_log 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs" 
ON public.activity_log 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_saved_experiences_user_id ON public.saved_experiences(user_id);
CREATE INDEX idx_saved_experiences_experience_id ON public.saved_experiences(experience_id);
CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);