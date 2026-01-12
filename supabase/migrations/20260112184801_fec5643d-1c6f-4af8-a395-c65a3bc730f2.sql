-- 1. Create a secure function for hosts to access MINIMAL guest info (not full profile)
CREATE OR REPLACE FUNCTION public.get_guest_booking_info(p_booking_id uuid)
RETURNS TABLE (
  guest_first_name text,
  guest_count integer,
  booking_date timestamp with time zone,
  special_requests text,
  status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.first_name,
    b.guest_count,
    b.booking_date,
    b.special_requests,
    b.status
  FROM bookings b
  JOIN profiles p ON b.guest_id = p.id
  JOIN experiences e ON b.experience_id = e.id
  WHERE b.id = p_booking_id
    AND e.host_id = auth.uid();
$$;

-- 2. Drop the overly permissive host profile access policy
DROP POLICY IF EXISTS "Hosts can view profiles of their guests" ON profiles;

-- 3. Create a more restrictive policy - hosts can only see first_name via the secure function
-- (The function above handles this, no direct profile access needed)

-- 4. Add DELETE policy for reviews (within 30 days)
CREATE POLICY "Guests can delete their own reviews within 30 days"
ON reviews
FOR DELETE
USING (
  auth.uid() = guest_id 
  AND created_at > (now() - interval '30 days')
);

-- 5. Add DELETE policy for chat messages (users can delete their own)
CREATE POLICY "Users can delete their own chat messages"
ON chat_messages
FOR DELETE
USING (
  auth.uid() = sender_id
  AND created_at > (now() - interval '24 hours')
);

-- 6. Fix request_logs policy - don't expose anonymous user logs
DROP POLICY IF EXISTS "Users can view their own request logs" ON request_logs;

CREATE POLICY "Users can only view their own request logs"
ON request_logs
FOR SELECT
USING (auth.uid() = user_id AND user_id IS NOT NULL);

-- 7. Restrict what hosts can see in bookings (mask guest_contact_info)
-- Create a view for hosts that masks sensitive data
CREATE OR REPLACE VIEW public.host_booking_view AS
SELECT 
  b.id,
  b.experience_id,
  b.guest_count,
  b.total_price,
  b.booking_date,
  b.status,
  b.special_requests,
  b.created_at,
  b.updated_at,
  p.first_name as guest_first_name
  -- Intentionally excluding: guest_contact_info, payment_intent_id, guest_id
FROM bookings b
JOIN profiles p ON b.guest_id = p.id
JOIN experiences e ON b.experience_id = e.id
WHERE e.host_id = auth.uid();

-- 8. Add index for better query performance on common lookups
CREATE INDEX IF NOT EXISTS idx_bookings_experience_id ON bookings(experience_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_experiences_host_id ON experiences(host_id);
CREATE INDEX IF NOT EXISTS idx_experiences_is_active ON experiences(is_active);
CREATE INDEX IF NOT EXISTS idx_reviews_experience_id ON reviews(experience_id);

-- 9. Add notification cleanup - users can delete old notifications
CREATE POLICY "Users can delete their own notifications"
ON notifications
FOR DELETE
USING (auth.uid() = user_id);

-- 10. Grant execute permission on the secure function
GRANT EXECUTE ON FUNCTION public.get_guest_booking_info(uuid) TO authenticated;