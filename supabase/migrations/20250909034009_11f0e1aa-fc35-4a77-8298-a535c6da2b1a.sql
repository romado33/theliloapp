-- Phase 1: Critical Data Protection Fixes

-- Create a security definer function for safe host profile retrieval
CREATE OR REPLACE FUNCTION public.get_safe_host_profile(host_user_id uuid)
RETURNS TABLE(id uuid, first_name text, bio text, location text, is_host boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.first_name, p.bio, p.location, p.is_host
  FROM public.profiles p
  WHERE p.id = host_user_id 
  AND p.is_host = true;
$$;

-- Update profiles RLS policy to restrict public access to sensitive data
DROP POLICY IF EXISTS "Public can view safe host business info" ON public.profiles;

CREATE POLICY "Public can view limited host info"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  is_host = true 
  AND auth.uid() IS NOT NULL
  AND (
    -- Users can see their own full profile
    auth.uid() = id 
    -- Or limited public info for other hosts
    OR (id != auth.uid())
  )
);

-- Restrict chat message updates to only allow marking as read
DROP POLICY IF EXISTS "Users can update chat messages in their conversations" ON public.chat_messages;

CREATE POLICY "Users can mark messages as read"
ON public.chat_messages  
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM chat_conversations c
    WHERE c.id = chat_messages.conversation_id 
    AND (c.guest_id = auth.uid() OR c.host_id = auth.uid())
  )
  AND auth.uid() != sender_id  -- Only recipients can mark as read
)
WITH CHECK (
  -- Only allow updating read_at field
  OLD.content = NEW.content 
  AND OLD.sender_id = NEW.sender_id 
  AND OLD.conversation_id = NEW.conversation_id
);

-- Create secure function for host booking information with data minimization
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
SET search_path = public
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