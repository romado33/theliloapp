-- Fix activity_log RLS policy to prevent unauthorized insertions
-- Only service role or authenticated users can insert their own activity logs

DROP POLICY IF EXISTS "System can insert activity logs" ON public.activity_log;

-- Create new policy that validates user_id matches authenticated user
CREATE POLICY "Users can insert their own activity logs" 
ON public.activity_log 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Note: Service role can still bypass RLS to insert logs for any user