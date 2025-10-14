-- Delete old availability slots
DELETE FROM availability WHERE start_time < NOW();

-- Add future availability slots for all experiences
-- This will create 14 days of availability (2 weeks) with multiple time slots per day

DO $$
DECLARE
  exp RECORD;
  day_offset INT;
  time_slot INT;
  slot_start TIMESTAMP WITH TIME ZONE;
  slot_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Loop through all experiences
  FOR exp IN SELECT id, max_guests, duration_hours FROM experiences
  LOOP
    -- Create slots for the next 14 days
    FOR day_offset IN 0..13
    LOOP
      -- Create 2 time slots per day: morning (10 AM) and afternoon (2 PM)
      FOR time_slot IN 0..1
      LOOP
        slot_start := (NOW() + (day_offset || ' days')::INTERVAL + 
                       (CASE WHEN time_slot = 0 THEN '10 hours' ELSE '14 hours' END)::INTERVAL)::DATE + 
                       (CASE WHEN time_slot = 0 THEN '10 hours' ELSE '14 hours' END)::INTERVAL;
        slot_end := slot_start + (exp.duration_hours || ' hours')::INTERVAL;
        
        INSERT INTO availability (
          experience_id,
          start_time,
          end_time,
          available_spots,
          is_available
        ) VALUES (
          exp.id,
          slot_start,
          slot_end,
          exp.max_guests,
          true
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;