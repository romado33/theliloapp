-- Fix dev users by deleting and recreating with correct credentials

-- First delete profiles (cascade will handle)
DELETE FROM public.profiles WHERE email IN ('dev-user@lilo.local', 'dev-host@lilo.local');

-- Delete existing dev users if they exist
DELETE FROM auth.users WHERE email IN ('dev-user@lilo.local', 'dev-host@lilo.local');

-- Insert dev-user (guest role) - trigger will create profile automatically
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'dev-user@lilo.local',
  crypt('dev123456', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Dev","last_name":"User","is_host":false}',
  now(),
  now(),
  'authenticated',
  'authenticated',
  ''
);

-- Insert dev-host (host role) - trigger will create profile automatically
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token
)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'dev-host@lilo.local',
  crypt('dev123456', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Dev","last_name":"Host","is_host":true}',
  now(),
  now(),
  'authenticated',
  'authenticated',
  ''
);