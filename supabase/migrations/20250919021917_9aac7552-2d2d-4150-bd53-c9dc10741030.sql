-- Fix security issue: restrict profile access to only safe data for hosts
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public can view limited host info" ON public.profiles;

-- Create a new restrictive policy that only allows users to see their own profile
-- and prevents direct access to other users' profiles
CREATE POLICY "Users can only view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- For public host profile access, applications should use the existing 
-- get_safe_host_profile() or get_public_host_profile() functions instead
-- of direct table access. These functions only return safe, non-sensitive fields.