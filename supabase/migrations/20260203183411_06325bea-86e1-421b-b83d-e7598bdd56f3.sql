-- Create sample bookings using real user ID (testguest1)
-- Confirmed booking for tomorrow
INSERT INTO bookings (experience_id, guest_id, availability_id, booking_date, guest_count, total_price, status, guest_contact_info, special_requests)
VALUES 
  ('bf2d435a-2338-486d-a635-7d4cf0581aae', '56b64efe-52ad-4278-8421-1c1786577e0d', '99f3bd3c-c40c-414f-b6fc-23bba0aa0757', '2026-02-04', 2, 130.00, 'confirmed', '{"email": "testguest1@gmail.com", "phone": "555-1234"}', 'First time doing pottery!'),
  -- Pending booking for next week
  ('08d97cc7-a04a-406c-b5a5-67abf8bfb981', '56b64efe-52ad-4278-8421-1c1786577e0d', '49297e42-4091-4bd6-9541-09453d68f9b6', '2026-02-05', 4, 220.00, 'pending', '{"email": "testguest1@gmail.com"}', NULL),
  -- Completed booking (for review testing) - use a past-dated slot we'll create
  ('9e9e0898-a745-401b-8cff-79012f1ef0e8', '56b64efe-52ad-4278-8421-1c1786577e0d', 'ee04c52f-ecca-4edc-8d93-24cd2f9999f2', '2026-02-05', 2, 170.00, 'completed', '{"email": "testguest1@gmail.com"}', 'Vegetarian please'),
  -- Cancelled booking
  ('3795ee69-3268-458c-aa35-965789e4dc5c', '56b64efe-52ad-4278-8421-1c1786577e0d', '36e54eb0-f1a0-4974-91d8-9871a5af7f03', '2026-02-04', 3, 105.00, 'cancelled', '{"email": "testguest1@gmail.com"}', NULL);

-- Reduce available spots for booked slots
UPDATE availability SET available_spots = available_spots - 2 WHERE id = '99f3bd3c-c40c-414f-b6fc-23bba0aa0757';
UPDATE availability SET available_spots = available_spots - 4 WHERE id = '49297e42-4091-4bd6-9541-09453d68f9b6';

-- Create a sold-out slot for waitlist testing
UPDATE availability SET available_spots = 0 WHERE id = 'd4a03c10-57a3-4b49-89c9-80865d6cc531';