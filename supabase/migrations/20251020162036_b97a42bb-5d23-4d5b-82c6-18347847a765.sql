-- Fix dev bypass by ensuring auth users exist with correct fixed UUIDs
-- and updating their passwords to match our dev credentials

-- Update or create dev-user auth entry
DO $$
BEGIN
  -- Update password for existing user or do nothing if doesn't exist
  UPDATE auth.users 
  SET 
    encrypted_password = crypt('dev-password-123', gen_salt('bf')),
    email_confirmed_at = NOW(),
    raw_user_meta_data = '{"first_name":"Dev","last_name":"User"}'
  WHERE id = '59c4e920-fb1d-4987-a1f8-473d0c782355';
  
  -- If no rows updated, insert new user
  IF NOT FOUND THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      '59c4e920-fb1d-4987-a1f8-473d0c782355',
      'authenticated', 'authenticated', 'dev-user@lilo.local',
      crypt('dev-password-123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"first_name":"Dev","last_name":"User"}',
      NOW(), NOW(), '', '', '', ''
    );
  END IF;
END $$;

-- Update or create dev-host auth entry
DO $$
BEGIN
  UPDATE auth.users 
  SET 
    encrypted_password = crypt('dev-password-123', gen_salt('bf')),
    email_confirmed_at = NOW(),
    raw_user_meta_data = '{"first_name":"Dev","last_name":"Host"}'
  WHERE id = 'c0e0848a-389c-4ef3-8313-5557bf541e9b';
  
  IF NOT FOUND THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'c0e0848a-389c-4ef3-8313-5557bf541e9b',
      'authenticated', 'authenticated', 'dev-host@lilo.local',
      crypt('dev-password-123', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"first_name":"Dev","last_name":"Host"}',
      NOW(), NOW(), '', '', '', ''
    );
  END IF;
END $$;

-- Ensure profiles exist
INSERT INTO profiles (id, email, first_name, last_name, is_host, onboarded)
VALUES 
  ('59c4e920-fb1d-4987-a1f8-473d0c782355', 'dev-user@lilo.local', 'Dev', 'User', false, true),
  ('c0e0848a-389c-4ef3-8313-5557bf541e9b', 'dev-host@lilo.local', 'Dev', 'Host', true, true)
ON CONFLICT (id) DO UPDATE SET
  is_host = EXCLUDED.is_host,
  onboarded = EXCLUDED.onboarded;