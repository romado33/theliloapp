-- Update the most recent dev user to be a host and link the Italian Cooking experience to them
UPDATE profiles 
SET is_host = true 
WHERE id = '59c4e920-fb1d-4987-a1f8-473d0c782355';

UPDATE experiences 
SET host_id = '59c4e920-fb1d-4987-a1f8-473d0c782355' 
WHERE id = '550e8400-e29b-41d4-a716-446655440003';