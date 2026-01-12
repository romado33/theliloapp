-- Fix the Security Definer View warning by dropping it and using RLS-based approach instead
DROP VIEW IF EXISTS public.host_booking_view;

-- Instead, update the bookings SELECT policy for hosts to only return safe columns
-- The existing policy allows hosts to see ALL booking data - we can't restrict columns via RLS
-- So we'll rely on the secure function get_guest_booking_info for hosts to access booking details

-- Also fix the request_logs INSERT policy which has WITH CHECK (true)
DROP POLICY IF EXISTS "System can log requests" ON request_logs;

-- Create a more restrictive insert policy - only authenticated users or service role
CREATE POLICY "Authenticated users can log their requests"
ON request_logs
FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR (auth.role() = 'service_role')
);