-- Update experiences to have proper category_ids
UPDATE experiences SET category_id = '6d8b5aa4-e546-4967-9340-d58bd131fc36' WHERE title ILIKE '%pottery%';
UPDATE experiences SET category_id = '4b38f0f9-c049-479f-a978-f1054983c0e1' WHERE title ILIKE '%wine%';
UPDATE experiences SET category_id = 'f5170d3e-7d66-42b7-8653-28d86d9075be' WHERE title ILIKE '%family%';
UPDATE experiences SET category_id = '4df473b0-7ed1-4537-af6a-5309f6a6292c' WHERE title ILIKE '%pasta%' OR title ILIKE '%italian%';
UPDATE experiences SET category_id = '37f6152b-4f08-44ec-9586-680f888fea31' WHERE title ILIKE '%yoga%';
UPDATE experiences SET category_id = '51785f80-8b17-4986-b51b-d6916345bed2' WHERE title ILIKE '%hike%';

-- Add availability slots for all experiences (next 14 days at 10am)
INSERT INTO availability (experience_id, start_time, end_time, available_spots, is_available)
SELECT 
  e.id,
  (CURRENT_DATE + (day_offset || ' days')::interval + '10:00:00'::time)::timestamp with time zone,
  (CURRENT_DATE + (day_offset || ' days')::interval + '10:00:00'::time + (e.duration_hours || ' hours')::interval)::timestamp with time zone,
  e.max_guests,
  true
FROM experiences e
CROSS JOIN generate_series(1, 14) AS day_offset
WHERE NOT EXISTS (SELECT 1 FROM availability a WHERE a.experience_id = e.id);

-- Add afternoon slots (2pm on even days)
INSERT INTO availability (experience_id, start_time, end_time, available_spots, is_available)
SELECT 
  e.id,
  (CURRENT_DATE + (day_offset || ' days')::interval + '14:00:00'::time)::timestamp with time zone,
  (CURRENT_DATE + (day_offset || ' days')::interval + '14:00:00'::time + (e.duration_hours || ' hours')::interval)::timestamp with time zone,
  e.max_guests,
  true
FROM experiences e
CROSS JOIN generate_series(2, 10, 2) AS day_offset;