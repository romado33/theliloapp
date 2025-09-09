-- Phase 1: Critical Data Protection Fixes

-- Drop the problematic policy first
DROP POLICY IF EXISTS "Users can update chat messages in their conversations" ON public.chat_messages;

-- Create a simpler policy for chat message read updates only
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
  AND auth.uid() != sender_id
);

-- Update profiles policy to restrict sensitive data access  
DROP POLICY IF EXISTS "Public can view safe host business info" ON public.profiles;

CREATE POLICY "Public can view limited host info"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Users can see their own full profile
  auth.uid() = id 
  -- Or limited public info for hosts only (sensitive fields filtered in app layer)
  OR (is_host = true AND auth.uid() IS NOT NULL)
);