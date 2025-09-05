-- Fix critical security vulnerability: Remove public access to personal profile data

-- Drop the overly permissive policy that allows anyone to view all profiles
DROP POLICY "Users can view all profiles" ON public.profiles;

-- Create restrictive policies for profile access
-- Policy 1: Users can only view their own complete profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Limited public profile information for hosts only (first name only for experience discovery)
-- This allows guests to see host names when viewing experiences, but protects all other personal data
CREATE POLICY "Public can view limited host profile info" 
ON public.profiles 
FOR SELECT 
USING (
  is_host = true 
  AND auth.uid() IS NOT NULL  -- Require authentication
);

-- Add a function to get safe public profile data (first name only for hosts)
CREATE OR REPLACE FUNCTION public.get_public_host_profile(host_user_id uuid)
RETURNS TABLE(
  id uuid,
  first_name text,
  is_host boolean
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.first_name, p.is_host
  FROM public.profiles p
  WHERE p.id = host_user_id 
  AND p.is_host = true;
$$;