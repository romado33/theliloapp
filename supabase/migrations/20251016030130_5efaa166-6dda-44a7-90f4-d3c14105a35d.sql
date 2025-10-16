-- Allow hosts to view basic profile info of guests who booked their experiences
CREATE POLICY "Hosts can view profiles of their guests"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM bookings b
    JOIN experiences e ON b.experience_id = e.id
    WHERE b.guest_id = profiles.id
    AND e.host_id = auth.uid()
  )
);