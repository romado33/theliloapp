-- Add notifications with valid types
INSERT INTO notifications (user_id, type, title, message, read, data)
VALUES 
  ('56b64efe-52ad-4278-8421-1c1786577e0d', 'booking_confirmed', 'Booking Confirmed!', 'Your pottery workshop booking for Feb 4 has been confirmed.', false, '{"experience_id": "bf2d435a-2338-486d-a635-7d4cf0581aae"}'::jsonb),
  ('56b64efe-52ad-4278-8421-1c1786577e0d', 'message_received', 'New Message', 'You have a new message from your host.', true, '{"conversation_id": "c1234567-89ab-cdef-0123-456789abcdef"}'::jsonb),
  ('47dbab53-759b-42ab-9983-91c65114d199', 'booking_created', 'New Booking!', 'Alex Guest booked your Pottery Workshop for Feb 4.', false, '{"experience_id": "bf2d435a-2338-486d-a635-7d4cf0581aae"}'::jsonb),
  ('47dbab53-759b-42ab-9983-91c65114d199', 'message_received', 'New Message', 'You have a new message from Alex Guest.', false, '{"conversation_id": "c1234567-89ab-cdef-0123-456789abcdef"}'::jsonb),
  ('47dbab53-759b-42ab-9983-91c65114d199', 'payment_received', 'Payment Received', 'You received $130.00 for Pottery Workshop booking.', false, '{"amount": 130}'::jsonb);