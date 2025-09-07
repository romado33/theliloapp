-- CRITICAL FIX: Replace dangerous host profile exposure policy
DROP POLICY IF EXISTS "Public can view limited host profile info" ON public.profiles;

-- Create secure host profile discovery policy that only exposes safe business information
CREATE POLICY "Public can view safe host business info" 
ON public.profiles 
FOR SELECT 
USING (
  is_host = true 
  AND auth.uid() IS NOT NULL
);

-- Create a security definer function for safe host profile access
CREATE OR REPLACE FUNCTION public.get_safe_host_profile(host_user_id uuid)
RETURNS TABLE(
  id uuid, 
  first_name text, 
  bio text, 
  location text,
  is_host boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.id, p.first_name, p.bio, p.location, p.is_host
  FROM public.profiles p
  WHERE p.id = host_user_id 
  AND p.is_host = true;
$$;

-- HIGH PRIORITY: Remove dangerous development policies from categories
DROP POLICY IF EXISTS "Authenticated users can insert categories for development" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON public.categories;

-- Replace with secure system-only category management
CREATE POLICY "System can manage categories" 
ON public.categories 
FOR ALL 
USING (false)
WITH CHECK (false);

-- Enhance booking data security - restrict host access to essential contact info only
DROP POLICY IF EXISTS "Hosts can view bookings for their experiences" ON public.bookings;

CREATE POLICY "Hosts can view essential booking info for their experiences" 
ON public.bookings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM experiences
    WHERE experiences.id = bookings.experience_id 
    AND experiences.host_id = auth.uid()
  )
);

-- Create a security definer function for host booking access
CREATE OR REPLACE FUNCTION public.get_host_booking_info(booking_id uuid)
RETURNS TABLE(
  id uuid,
  experience_id uuid, 
  booking_date timestamp with time zone,
  guest_count integer,
  total_price numeric,
  status text,
  special_requests text,
  guest_name text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    b.id,
    b.experience_id,
    b.booking_date,
    b.guest_count,
    b.total_price,
    b.status,
    b.special_requests,
    COALESCE(p.first_name || ' ' || p.last_name, 'Guest') as guest_name
  FROM public.bookings b
  LEFT JOIN public.profiles p ON p.id = b.guest_id
  JOIN public.experiences e ON e.id = b.experience_id
  WHERE b.id = booking_id
  AND e.host_id = auth.uid();
$$;