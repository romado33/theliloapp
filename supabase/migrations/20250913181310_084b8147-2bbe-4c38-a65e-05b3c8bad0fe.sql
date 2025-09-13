-- Create sample categories for testing
INSERT INTO categories (id, name, description, icon) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Outdoor Adventures', 'Hiking, camping, and nature experiences', '🏔️'),
('550e8400-e29b-41d4-a716-446655440002', 'Cooking Classes', 'Learn to cook local and international cuisine', '👨‍🍳'),
('550e8400-e29b-41d4-a716-446655440003', 'Art & Crafts', 'Creative workshops and artistic experiences', '🎨'),
('550e8400-e29b-41d4-a716-446655440004', 'Photography', 'Photo walks and photography workshops', '📸'),
('550e8400-e29b-41d4-a716-446655440005', 'Wellness', 'Yoga, meditation, and wellness activities', '🧘‍♀️')
ON CONFLICT (id) DO NOTHING;

-- Create sample host profiles for testing
INSERT INTO profiles (id, email, first_name, last_name, is_host, bio, location, phone) VALUES
('11111111-1111-1111-1111-111111111111', 'host1@test.com', 'Maria', 'Rodriguez', true, 'Experienced hiking guide with 10 years in the mountains', 'San Francisco, CA', '+1-555-0101'),
('22222222-2222-2222-2222-222222222222', 'host2@test.com', 'James', 'Chen', true, 'Professional chef specializing in Italian cuisine', 'New York, NY', '+1-555-0102'),
('33333333-3333-3333-3333-333333333333', 'host3@test.com', 'Sarah', 'Johnson', true, 'Artist and pottery instructor', 'Portland, OR', '+1-555-0103')
ON CONFLICT (id) DO NOTHING;

-- Create sample guest profiles
INSERT INTO profiles (id, email, first_name, last_name, is_host, location) VALUES
('44444444-4444-4444-4444-444444444444', 'guest1@test.com', 'Alex', 'Thompson', false, 'San Francisco, CA'),
('55555555-5555-5555-5555-555555555555', 'guest2@test.com', 'Emily', 'Davis', false, 'Los Angeles, CA'),
('66666666-6666-6666-6666-666666666666', 'guest3@test.com', 'Michael', 'Wilson', false, 'Seattle, WA')
ON CONFLICT (id) DO NOTHING;

-- Create sample experiences
INSERT INTO experiences (id, host_id, category_id, title, description, location, price, duration_hours, max_guests, latitude, longitude, image_urls, what_included, what_to_bring, is_active) VALUES
('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001', 'Golden Gate Park Nature Walk', 'Explore the hidden gems of Golden Gate Park with a local guide. Discover rare plants, scenic viewpoints, and learn about the park''s fascinating history.', 'Golden Gate Park, San Francisco, CA', 45.00, 3, 8, 37.7694, -122.4862, ARRAY['/api/placeholder/400/300', '/api/placeholder/300/400'], ARRAY['Professional guide', 'Park map', 'Light snacks', 'Water bottle'], ARRAY['Comfortable walking shoes', 'Weather-appropriate clothing', 'Camera'], true),

('bbbb2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440002', 'Authentic Italian Pasta Making', 'Learn to make fresh pasta from scratch in a professional kitchen. You''ll master the techniques for creating perfect dough and shaping various pasta types.', 'Little Italy, New York, NY', 85.00, 4, 6, 40.7589, -73.9851, ARRAY['/api/placeholder/500/350', '/api/placeholder/350/500'], ARRAY['All ingredients', 'Cooking equipment', 'Recipe cards', 'Apron', 'Take-home pasta'], ARRAY['Appetite for learning', 'Closed-toe shoes'], true),

('cccc3333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440003', 'Beginner Pottery Workshop', 'Create your own ceramic masterpiece in this hands-on pottery class. Perfect for beginners - no experience needed!', 'Pearl District, Portland, OR', 65.00, 2, 4, 45.5152, -122.6784, ARRAY['/api/placeholder/400/400'], ARRAY['Clay and glazes', 'Tools and equipment', 'Studio time', 'Firing service', 'Tea and cookies'], ARRAY['Clothes you don''t mind getting dirty', 'Hair tie if needed'], true),

('dddd4444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440004', 'Urban Photography Tour', 'Capture the soul of the city through your lens. Learn composition, lighting, and storytelling techniques while exploring vibrant neighborhoods.', 'Mission District, San Francisco, CA', 75.00, 5, 5, 37.7599, -122.4148, ARRAY['/api/placeholder/600/400'], ARRAY['Photography tips guide', 'Location map', 'Photo editing basics'], ARRAY['Camera (phone OK)', 'Extra batteries/charger', 'Comfortable shoes'], true)
ON CONFLICT (id) DO NOTHING;

-- Create availability slots for experiences
INSERT INTO availability (id, experience_id, start_time, end_time, available_spots) VALUES
('av111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', '2024-01-20 09:00:00+00', '2024-01-20 12:00:00+00', 8),
('av222222-2222-2222-2222-222222222222', 'aaaa1111-1111-1111-1111-111111111111', '2024-01-21 14:00:00+00', '2024-01-21 17:00:00+00', 8),
('av333333-3333-3333-3333-333333333333', 'bbbb2222-2222-2222-2222-222222222222', '2024-01-22 18:00:00+00', '2024-01-22 22:00:00+00', 6),
('av444444-4444-4444-4444-444444444444', 'cccc3333-3333-3333-3333-333333333333', '2024-01-23 15:00:00+00', '2024-01-23 17:00:00+00', 4),
('av555555-5555-5555-5555-555555555555', 'dddd4444-4444-4444-4444-444444444444', '2024-01-24 10:00:00+00', '2024-01-24 15:00:00+00', 5)
ON CONFLICT (id) DO NOTHING;

-- Create sample bookings
INSERT INTO bookings (id, experience_id, availability_id, guest_id, booking_date, guest_count, total_price, status, special_requests) VALUES
('book1111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', 'av111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '2024-01-20 09:00:00+00', 2, 90.00, 'confirmed', 'Vegetarian snacks preferred'),
('book2222-2222-2222-2222-222222222222', 'bbbb2222-2222-2222-2222-222222222222', 'av333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', '2024-01-22 18:00:00+00', 1, 85.00, 'confirmed', NULL),
('book3333-3333-3333-3333-333333333333', 'cccc3333-3333-3333-3333-333333333333', 'av444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', '2024-01-23 15:00:00+00', 2, 130.00, 'pending', 'First time pottery student')
ON CONFLICT (id) DO NOTHING;

-- Create sample reviews
INSERT INTO reviews (id, experience_id, booking_id, guest_id, rating, comment) VALUES
('rev11111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', 'book1111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 5, 'Amazing experience! Maria was knowledgeable and the hidden spots were breathtaking.'),
('rev22222-2222-2222-2222-222222222222', 'bbbb2222-2222-2222-2222-222222222222', 'book2222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 4, 'Great pasta making class. James taught excellent techniques and the food was delicious!')
ON CONFLICT (id) DO NOTHING;

-- Create sample saved experiences
INSERT INTO saved_experiences (id, user_id, experience_id) VALUES
('save1111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'cccc3333-3333-3333-3333-333333333333'),
('save2222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'dddd4444-4444-4444-4444-444444444444'),
('save3333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'aaaa1111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- Create sample chat conversations
INSERT INTO chat_conversations (id, guest_id, host_id, experience_id) VALUES
('chat1111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111'),
('chat2222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'bbbb2222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;

-- Create sample chat messages
INSERT INTO chat_messages (id, conversation_id, sender_id, content) VALUES
('msg11111-1111-1111-1111-111111111111', 'chat1111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'Hi Maria! I''m excited about the nature walk. What should I expect?'),
('msg22222-2222-2222-2222-222222222222', 'chat1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Hello Alex! We''ll explore some amazing hidden spots. The weather looks perfect for Saturday!'),
('msg33333-3333-3333-3333-333333333333', 'chat2222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'Hi James! Any prep I should do before the pasta class?'),
('msg44444-4444-4444-4444-444444444444', 'chat2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Just come hungry and ready to learn! We''ll cover everything from basics.')
ON CONFLICT (id) DO NOTHING;

-- Create sample notifications
INSERT INTO notifications (id, user_id, type, title, message, data) VALUES
('notif111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'booking_confirmed', 'Booking Confirmed!', 'Your booking for Golden Gate Park Nature Walk has been confirmed.', '{"booking_id": "book1111-1111-1111-1111-111111111111"}'),
('notif222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'new_booking', 'New Booking Received', 'You have a new booking for Golden Gate Park Nature Walk.', '{"booking_id": "book1111-1111-1111-1111-111111111111"}'),
('notif333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 'message_received', 'New Message', 'You have a new message from James about your pasta class.', '{"conversation_id": "chat2222-2222-2222-2222-222222222222"}')
ON CONFLICT (id) DO NOTHING;