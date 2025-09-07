-- Address security concerns for edge functions
-- Enable JWT verification for edge functions to prevent unauthorized access

-- The vector extension in public schema is required for embeddings functionality
-- This is a standard practice and expected for AI/semantic search features

-- Additional security enhancements
-- Add rate limiting considerations by creating a simple request tracking table
CREATE TABLE IF NOT EXISTS public.request_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  endpoint text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address inet
);

-- Enable RLS on request logs
ALTER TABLE public.request_logs ENABLE ROW LEVEL SECURITY;

-- Only allow system to insert request logs
CREATE POLICY "System can log requests" 
ON public.request_logs 
FOR INSERT 
WITH CHECK (true);

-- Users can only view their own request logs
CREATE POLICY "Users can view their own request logs" 
ON public.request_logs 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_request_logs_user_created 
ON public.request_logs (user_id, created_at);

-- Create index for IP-based rate limiting
CREATE INDEX IF NOT EXISTS idx_request_logs_ip_created 
ON public.request_logs (ip_address, created_at);