-- Add availability timeslots for testing the booking feature
-- Generate slots for the next 7 days for several experiences

-- Get the experience IDs we'll add availability for
DO $$
DECLARE
  pottery_id uuid := '550e8400-e29b-41d4-a716-446655440001'; -- Pottery Workshop for Beginners
  italian_cooking_id uuid := '550e8400-e29b-41d4-a716-446655440003'; -- Italian Cooking Masterclass
  mini_chef_id uuid := '090031d7-25b1-43f1-8273-23c4b3cc2cb2'; -- Mini Chef Cooking Class
  farm_visit_id uuid := '848b7e3c-a5c7-434b-9418-e44e9d9a3f01'; -- Family Farm Visit
  scavenger_hunt_id uuid := 'd19ead55-25d6-4a22-bcac-848492f6d9e5'; -- Nature Scavenger Hunt
  day_offset integer;
  slot_time timestamp with time zone;
BEGIN
  -- Generate timeslots for the next 7 days
  FOR day_offset IN 0..6 LOOP
    -- Pottery Workshop - Morning and afternoon slots
    slot_time := (CURRENT_DATE + day_offset * interval '1 day' + interval '10 hours')::timestamp with time zone;
    INSERT INTO availability (experience_id, start_time, end_time, available_spots, is_available)
    VALUES (pottery_id, slot_time, slot_time + interval '2 hours', 6, true);
    
    slot_time := (CURRENT_DATE + day_offset * interval '1 day' + interval '14 hours')::timestamp with time zone;
    INSERT INTO availability (experience_id, start_time, end_time, available_spots, is_available)
    VALUES (pottery_id, slot_time, slot_time + interval '2 hours', 6, true);
    
    -- Italian Cooking - Evening slots
    slot_time := (CURRENT_DATE + day_offset * interval '1 day' + interval '18 hours')::timestamp with time zone;
    INSERT INTO availability (experience_id, start_time, end_time, available_spots, is_available)
    VALUES (italian_cooking_id, slot_time, slot_time + interval '3 hours', 8, true);
    
    -- Mini Chef - Morning slots on weekends (days 5 and 6)
    IF day_offset >= 5 THEN
      slot_time := (CURRENT_DATE + day_offset * interval '1 day' + interval '11 hours')::timestamp with time zone;
      INSERT INTO availability (experience_id, start_time, end_time, available_spots, is_available)
      VALUES (mini_chef_id, slot_time, slot_time + interval '2 hours', 10, true);
    END IF;
    
    -- Farm Visit - Morning and early afternoon
    slot_time := (CURRENT_DATE + day_offset * interval '1 day' + interval '9 hours')::timestamp with time zone;
    INSERT INTO availability (experience_id, start_time, end_time, available_spots, is_available)
    VALUES (farm_visit_id, slot_time, slot_time + interval '3 hours', 15, true);
    
    slot_time := (CURRENT_DATE + day_offset * interval '1 day' + interval '13 hours')::timestamp with time zone;
    INSERT INTO availability (experience_id, start_time, end_time, available_spots, is_available)
    VALUES (farm_visit_id, slot_time, slot_time + interval '3 hours', 15, true);
    
    -- Nature Scavenger Hunt - Afternoon slots
    slot_time := (CURRENT_DATE + day_offset * interval '1 day' + interval '15 hours')::timestamp with time zone;
    INSERT INTO availability (experience_id, start_time, end_time, available_spots, is_available)
    VALUES (scavenger_hunt_id, slot_time, slot_time + interval '2 hours', 20, true);
  END LOOP;
END $$;