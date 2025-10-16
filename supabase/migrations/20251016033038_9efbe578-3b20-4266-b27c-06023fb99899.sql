-- Update Italian Cooking Masterclass to use the common dev-host ID
UPDATE experiences 
SET host_id = 'c0e0848a-389c-4ef3-8313-5557bf541e9b'
WHERE id = '550e8400-e29b-41d4-a716-446655440003';

-- Ensure the dev-host profile exists with this fixed ID
INSERT INTO profiles (id, email, first_name, last_name, is_host, onboarded)
VALUES (
  'c0e0848a-389c-4ef3-8313-5557bf541e9b',
  'dev-host@lilo.local',
  'Dev',
  'Host',
  true,
  true
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  is_host = EXCLUDED.is_host,
  onboarded = EXCLUDED.onboarded;