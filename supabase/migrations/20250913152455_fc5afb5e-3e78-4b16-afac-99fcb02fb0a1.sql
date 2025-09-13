-- Add foreign key constraint between saved_experiences and experiences
ALTER TABLE saved_experiences 
ADD CONSTRAINT fk_saved_experiences_experience_id 
FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE;

-- Add foreign key constraint between experiences and profiles for the host relationship
ALTER TABLE experiences 
ADD CONSTRAINT fk_experiences_host_id 
FOREIGN KEY (host_id) REFERENCES profiles(id) ON DELETE CASCADE;