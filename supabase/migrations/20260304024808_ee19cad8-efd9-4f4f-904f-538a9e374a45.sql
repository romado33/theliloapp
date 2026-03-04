-- Drop the overly restrictive policy that blocks ALL profile reads
DROP POLICY IF EXISTS "deny_anonymous_access" ON public.profiles;

-- Also drop the duplicate SELECT policy (keep just one)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- The remaining "Users can only view their own profile" policy handles SELECT correctly