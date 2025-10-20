-- 1. Create enum for roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'platform_admin', 'moderator', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Migrate existing admin_role data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, admin_role::text::app_role
FROM public.profiles
WHERE admin_role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Update RLS policies to use has_role()

-- Drop old policies that use admin_role
DROP POLICY IF EXISTS "Admins can manage email campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Admins can manage platform analytics" ON public.platform_analytics;
DROP POLICY IF EXISTS "Admins can view platform analytics" ON public.platform_analytics;
DROP POLICY IF EXISTS "Admins can manage campaign recipients" ON public.campaign_recipients;

-- Create new policies using has_role()
CREATE POLICY "Admins can manage email campaigns"
ON public.email_campaigns
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::app_role) OR 
  public.has_role(auth.uid(), 'platform_admin'::app_role)
);

CREATE POLICY "Super admins can manage platform analytics"
ON public.platform_analytics
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can view platform analytics"
ON public.platform_analytics
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::app_role) OR 
  public.has_role(auth.uid(), 'platform_admin'::app_role)
);

CREATE POLICY "Admins can manage campaign recipients"
ON public.campaign_recipients
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::app_role) OR 
  public.has_role(auth.uid(), 'platform_admin'::app_role)
);

-- 6. Add RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- 7. Drop admin_role column from profiles (keep for backward compatibility for now, can be removed later)
-- Commenting out for safety - remove this line after verifying all code is updated
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS admin_role;