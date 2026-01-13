-- 1. Add explicit denial policy for anonymous access to profiles
CREATE POLICY "deny_anonymous_access" 
ON public.profiles 
FOR SELECT 
TO anon 
USING (false);

-- 2. Allow message senders to delete their own messages within 24 hours
CREATE POLICY "Senders can delete their own messages within 24h" 
ON public.messages 
FOR DELETE 
USING (auth.uid() = sender_id AND created_at > now() - interval '24 hours');

-- 3. Create a secure function to get masked guest contact info for hosts
CREATE OR REPLACE FUNCTION public.get_masked_guest_contact(p_booking_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  host_user_id uuid;
BEGIN
  -- Verify the caller is the host for this booking
  SELECT e.host_id INTO host_user_id
  FROM bookings b
  JOIN experiences e ON b.experience_id = e.id
  WHERE b.id = p_booking_id;
  
  IF host_user_id IS NULL OR host_user_id != auth.uid() THEN
    RETURN NULL;
  END IF;
  
  -- Return masked contact info
  SELECT jsonb_build_object(
    'email', CASE 
      WHEN b.guest_contact_info->>'email' IS NOT NULL 
      THEN regexp_replace(
        (b.guest_contact_info->>'email')::text, 
        '^(.{2}).*(@.*)$', 
        '\1****\2'
      )
      ELSE NULL 
    END,
    'phone', CASE 
      WHEN b.guest_contact_info->>'phone' IS NOT NULL 
      THEN regexp_replace(
        (b.guest_contact_info->>'phone')::text, 
        '^(.{3}).*(.{2})$', 
        '\1****\2'
      )
      ELSE NULL 
    END,
    'first_name', p.first_name
  ) INTO result
  FROM bookings b
  JOIN profiles p ON b.guest_id = p.id
  WHERE b.id = p_booking_id;
  
  RETURN result;
END;
$$;

-- 4. Add index for faster message lookups
CREATE INDEX IF NOT EXISTS idx_messages_sender_recipient 
ON public.messages(sender_id, recipient_id);

-- 5. Add index for faster conversation lookups  
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation 
ON public.chat_messages(conversation_id, created_at DESC);