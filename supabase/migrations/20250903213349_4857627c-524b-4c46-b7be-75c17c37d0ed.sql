-- Insert test categories
INSERT INTO public.categories (id, name, description, icon) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Cooking Classes', 'Learn to cook delicious meals with expert chefs', '👨‍🍳'),
('550e8400-e29b-41d4-a716-446655440002', 'Art & Crafts', 'Creative workshops and artistic experiences', '🎨'),
('550e8400-e29b-41d4-a716-446655440003', 'Outdoor Adventures', 'Explore nature and outdoor activities', '🏞️'),
('550e8400-e29b-41d4-a716-446655440004', 'Wellness & Fitness', 'Health and wellness focused activities', '🧘‍♀️'),
('550e8400-e29b-41d4-a716-446655440005', 'Music & Dance', 'Musical and dance learning experiences', '🎵'),
('550e8400-e29b-41d4-a716-446655440006', 'Food & Drink', 'Culinary experiences and tastings', '🍷');

-- Insert test user profiles (these would be created when users sign up)
INSERT INTO public.profiles (id, email, first_name, last_name, bio, location, is_host, phone, avatar_url) VALUES 
('550e8400-e29b-41d4-a716-446655440101', 'maria.chef@example.com', 'Maria', 'Rodriguez', 'Professional chef with 15 years of experience in Italian cuisine. I love sharing my passion for cooking with others!', 'San Francisco, CA', true, '+1-555-0101', 'https://images.unsplash.com/photo-1494790108755-2616c78ea953?w=400'),
('550e8400-e29b-41d4-a716-446655440102', 'david.artist@example.com', 'David', 'Chen', 'Contemporary artist and pottery instructor. I create unique ceramic pieces and teach traditional techniques.', 'Portland, OR', true, '+1-555-0102', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
('550e8400-e29b-41d4-a716-446655440103', 'sarah.hiker@example.com', 'Sarah', 'Johnson', 'Nature enthusiast and certified hiking guide. I know all the best trails and secret spots in the mountains.', 'Denver, CO', true, '+1-555-0103', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'),
('550e8400-e29b-41d4-a716-446655440104', 'yoga.maya@example.com', 'Maya', 'Patel', 'Certified yoga instructor and wellness coach. I believe in the healing power of mindful movement.', 'Austin, TX', true, '+1-555-0104', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'),
('550e8400-e29b-41d4-a716-446655440105', 'wine.expert@example.com', 'Antoine', 'Dubois', 'Sommelier and wine educator with expertise in French wines. I create memorable tasting experiences.', 'Napa Valley, CA', true, '+1-555-0105', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'),
('550e8400-e29b-41d4-a716-446655440106', 'guest1@example.com', 'Emma', 'Wilson', 'Food lover and adventure seeker always looking for new experiences.', 'Seattle, WA', false, '+1-555-0106', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'),
('550e8400-e29b-41d4-a716-446655440107', 'guest2@example.com', 'Alex', 'Thompson', 'Art enthusiast and weekend adventurer who enjoys learning new skills.', 'New York, NY', false, '+1-555-0107', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'),
('550e8400-e29b-41d4-a716-446655440108', 'guest3@example.com', 'Lisa', 'Garcia', 'Wellness advocate who loves trying new fitness activities and cooking classes.', 'Los Angeles, CA', false, '+1-555-0108', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400');

-- Insert test experiences
INSERT INTO public.experiences (id, host_id, category_id, title, description, location, address, price, duration_hours, max_guests, image_urls, what_included, what_to_bring, cancellation_policy, latitude, longitude) VALUES 
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', 'Authentic Italian Pasta Making', 'Learn to make fresh pasta from scratch in my cozy kitchen. We''ll prepare three different pasta shapes and two classic sauces. Perfect for beginners and pasta lovers alike!', 'San Francisco, CA', '123 Mission Street, San Francisco, CA 94105', 85.00, 3, 6, ARRAY['https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800'], ARRAY['All ingredients and equipment', 'Recipe cards to take home', 'Wine tasting', 'Full meal to enjoy'], ARRAY['Apron (optional)', 'Camera for photos'], 'Free cancellation up to 24 hours before the experience', 37.7749, -122.4194),

('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440002', 'Pottery Wheel Throwing Workshop', 'Create your own ceramic bowl or mug on the pottery wheel. I''ll guide you through the entire process from centering clay to shaping your piece. No experience needed!', 'Portland, OR', '456 Alberta Street, Portland, OR 97211', 75.00, 2, 4, ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'], ARRAY['All clay and tools', 'Glazing and firing included', 'Refreshments'], ARRAY['Clothes you don''t mind getting dirty', 'Hair tie if you have long hair'], '48 hours cancellation policy', 45.5152, -122.6784),

('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440003', 'Hidden Waterfall Hiking Adventure', 'Discover a secret waterfall just 30 minutes from downtown Denver. This moderate 4-mile hike offers stunning mountain views and ends at a beautiful swimming hole.', 'Denver, CO', 'Morrison, CO 80465', 45.00, 4, 8, ARRAY['https://images.unsplash.com/photo-1551632811-561732d1e306?w=800'], ARRAY['Professional guide', 'Safety equipment', 'Snacks and water', 'Photography tips'], ARRAY['Hiking boots', 'Water bottle', 'Sun protection', 'Swimwear (optional)'], 'Weather dependent - full refund if cancelled due to conditions', 39.6403, -105.0781),

('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440004', 'Sunset Yoga & Meditation', 'Join me for a peaceful yoga session as the sun sets over the city. We''ll practice gentle flows followed by guided meditation. Perfect for all levels.', 'Austin, TX', 'Zilker Park, Austin, TX 78746', 35.00, 1, 12, ARRAY['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'], ARRAY['Yoga mats provided', 'Meditation guidance', 'Herbal tea after class'], ARRAY['Comfortable clothing', 'Water bottle', 'Blanket for meditation'], 'Free cancellation up to 2 hours before class', 30.2672, -97.7431),

('550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440006', 'French Wine Tasting Experience', 'Explore the world of French wines with a certified sommelier. We''ll taste 6 different wines paired with artisanal cheeses and learn about terroir and tasting techniques.', 'Napa Valley, CA', '789 Vineyard Lane, Napa, CA 94558', 120.00, 2, 10, ARRAY['https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800'], ARRAY['6 wine tastings', 'Cheese pairings', 'Tasting notes', 'Professional sommelier'], ARRAY['Designated driver or transportation'], 'Must be 21+. 24-hour cancellation policy', 38.2975, -122.2869),

('550e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', 'Spanish Tapas Cooking Class', 'Learn to make traditional Spanish tapas including patatas bravas, gambas al ajillo, and tortilla española. We''ll cook together and enjoy our creations with sangria!', 'San Francisco, CA', '321 Valencia Street, San Francisco, CA 94103', 95.00, 3, 8, ARRAY['https://images.unsplash.com/photo-1559847844-5315695dadae?w=800'], ARRAY['All ingredients', 'Recipes to take home', 'Sangria', 'Shared meal'], ARRAY['Comfortable shoes', 'Apron if preferred'], 'Free cancellation 24 hours prior', 37.7649, -122.4203),

('550e8400-e29b-41d4-a716-446655440207', '550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440002', 'Abstract Painting Workshop', 'Express your creativity through abstract art! No experience necessary - I''ll teach you color theory, composition, and techniques to create your own masterpiece.', 'Portland, OR', '678 Pearl District, Portland, OR 97209', 65.00, 2, 6, ARRAY['https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800'], ARRAY['Canvas and paints', 'Brushes and tools', 'Easel rental', 'Light refreshments'], ARRAY['Clothes you don''t mind getting paint on'], '24-hour cancellation policy', 45.5244, -122.6742),

('550e8400-e29b-41d4-a716-446655440208', '550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440003', 'Photography Walk in Nature', 'Improve your photography skills while exploring beautiful natural landscapes. Learn composition, lighting, and editing techniques from a professional photographer.', 'Denver, CO', 'Rocky Mountain Arsenal, Commerce City, CO 80022', 55.00, 3, 6, ARRAY['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'], ARRAY['Professional guidance', 'Photo editing tips', 'Digital copies of example shots'], ARRAY['Camera (smartphone OK)', 'Comfortable walking shoes'], 'Weather permitting - alternative indoor location available', 39.8087, -104.8319),

('550e8400-e29b-41d4-a716-446655440209', '550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440004', 'Sound Bath Meditation', 'Relax and rejuvenate with healing sound vibrations from Tibetan singing bowls, crystal bowls, and chimes. This deeply restorative experience helps reduce stress and anxiety.', 'Austin, TX', '234 East 6th Street, Austin, TX 78701', 40.00, 1, 15, ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'], ARRAY['All instruments', 'Meditation cushions', 'Eye pillows', 'Herbal tea'], ARRAY['Comfortable clothing', 'Water bottle', 'Blanket (optional)'], 'Free cancellation up to 2 hours before', 30.2669, -97.7428),

('550e8400-e29b-41d4-a716-446655440210', '550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440006', 'Farm-to-Table Cooking Experience', 'Visit a local organic farm and cook a seasonal meal with fresh ingredients we harvest together. Learn about sustainable farming and enjoy dinner with wine pairings.', 'Napa Valley, CA', '567 Farm Road, Calistoga, CA 94515', 150.00, 4, 8, ARRAY['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800'], ARRAY['Farm tour', 'Ingredient harvesting', 'Cooking instruction', 'Full meal with wine'], ARRAY['Sun hat', 'Comfortable shoes', 'Camera'], '48-hour cancellation policy', 38.5791, -122.5820);

-- Insert availability for each experience (next 30 days, various times)
INSERT INTO public.availability (id, experience_id, start_time, end_time, available_spots) VALUES
-- Maria's pasta class (weekends)
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440201', '2025-09-06 14:00:00+00', '2025-09-06 17:00:00+00', 6),
('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440201', '2025-09-07 14:00:00+00', '2025-09-07 17:00:00+00', 6),
('550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440201', '2025-09-13 14:00:00+00', '2025-09-13 17:00:00+00', 4),

-- David's pottery (most days)
('550e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440202', '2025-09-05 10:00:00+00', '2025-09-05 12:00:00+00', 4),
('550e8400-e29b-41d4-a716-446655440305', '550e8400-e29b-41d4-a716-446655440202', '2025-09-08 15:00:00+00', '2025-09-08 17:00:00+00', 4),
('550e8400-e29b-41d4-a716-446655440306', '550e8400-e29b-41d4-a716-446655440202', '2025-09-12 10:00:00+00', '2025-09-12 12:00:00+00', 3),

-- Sarah's hiking (weekends, weather permitting)
('550e8400-e29b-41d4-a716-446655440307', '550e8400-e29b-41d4-a716-446655440203', '2025-09-07 08:00:00+00', '2025-09-07 12:00:00+00', 8),
('550e8400-e29b-41d4-a716-446655440308', '550e8400-e29b-41d4-a716-446655440203', '2025-09-14 08:00:00+00', '2025-09-14 12:00:00+00', 8),

-- Maya's yoga (multiple times per week)
('550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440204', '2025-09-04 18:30:00+00', '2025-09-04 19:30:00+00', 12),
('550e8400-e29b-41d4-a716-446655440310', '550e8400-e29b-41d4-a716-446655440204', '2025-09-06 18:30:00+00', '2025-09-06 19:30:00+00', 10),
('550e8400-e29b-41d4-a716-446655440311', '550e8400-e29b-41d4-a716-446655440204', '2025-09-11 18:30:00+00', '2025-09-11 19:30:00+00', 12),

-- Antoine's wine tasting (weekends)
('550e8400-e29b-41d4-a716-446655440312', '550e8400-e29b-41d4-a716-446655440205', '2025-09-07 16:00:00+00', '2025-09-07 18:00:00+00', 10),
('550e8400-e29b-41d4-a716-446655440313', '550e8400-e29b-41d4-a716-446655440205', '2025-09-14 16:00:00+00', '2025-09-14 18:00:00+00', 8);

-- Insert some test bookings (past ones so we can have reviews)
INSERT INTO public.bookings (id, guest_id, experience_id, availability_id, booking_date, guest_count, total_price, status, guest_contact_info) VALUES
('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440106', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440301', '2025-08-20 14:00:00+00', 2, 170.00, 'completed', '{"email": "emma.wilson@example.com", "phone": "+1-555-0106"}'),
('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440107', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440304', '2025-08-25 10:00:00+00', 1, 75.00, 'completed', '{"email": "alex.thompson@example.com", "phone": "+1-555-0107"}'),
('550e8400-e29b-41d4-a716-446655440403', '550e8400-e29b-41d4-a716-446655440108', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440307', '2025-08-28 08:00:00+00', 3, 135.00, 'completed', '{"email": "lisa.garcia@example.com", "phone": "+1-555-0108"}'),
('550e8400-e29b-41d4-a716-446655440404', '550e8400-e29b-41d4-a716-446655440106', '550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440312', '2025-08-30 16:00:00+00', 2, 240.00, 'completed', '{"email": "emma.wilson@example.com", "phone": "+1-555-0106"}');

-- Insert reviews for the completed bookings
INSERT INTO public.reviews (id, guest_id, experience_id, booking_id, rating, comment) VALUES
('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440106', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440401', 5, 'Absolutely amazing! Maria is such a wonderful teacher and the pasta we made was incredible. I''ve already tried making it at home with the recipes she gave us. Highly recommend!'),
('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440107', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440402', 5, 'David was so patient and encouraging! I never thought I could make something so beautiful on the pottery wheel. The studio has such a peaceful vibe and I can''t wait to pick up my finished piece.'),
('550e8400-e29b-41d4-a716-446655440503', '550e8400-e29b-41d4-a716-446655440108', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440403', 4, 'Great hike with stunning views! Sarah knows all the best spots and the waterfall was gorgeous. It was a bit more challenging than I expected but totally worth it. Bring good hiking shoes!'),
('550e8400-e29b-41d4-a716-446655440504', '550e8400-e29b-41d4-a716-446655440106', '550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440404', 5, 'Antoine''s knowledge of French wines is incredible! The tasting was educational and fun, and the cheese pairings were perfect. Learned so much about terroir and will definitely book another session.'),
('550e8400-e29b-41d4-a716-446655440505', '550e8400-e29b-41d4-a716-446655440107', '550e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440401', 4, 'Loved learning to make tapas! The sangria was delicious and Maria created such a fun, social atmosphere. Perfect for a date night or friends outing.');

-- Update availability to reflect bookings
UPDATE public.availability SET available_spots = available_spots - 2 WHERE id = '550e8400-e29b-41d4-a716-446655440301';
UPDATE public.availability SET available_spots = available_spots - 1 WHERE id = '550e8400-e29b-41d4-a716-446655440304';
UPDATE public.availability SET available_spots = available_spots - 3 WHERE id = '550e8400-e29b-41d4-a716-446655440307';