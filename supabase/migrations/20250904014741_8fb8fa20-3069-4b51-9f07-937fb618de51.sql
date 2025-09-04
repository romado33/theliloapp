-- Insert the mock experiences with proper column structure
INSERT INTO public.experiences (id, host_id, title, description, category_id, price, duration_hours, max_guests, location, address, latitude, longitude, image_urls, what_included, what_to_bring, cancellation_policy, is_active, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 
 '00000000-0000-0000-0000-000000000000', 
 'Pottery Workshop for Beginners',
 'Learn the ancient art of pottery in this hands-on workshop. Perfect for beginners who want to create their own unique ceramic pieces while learning fundamental techniques from glazing to firing.',
 NULL,
 65,
 2,
 8,
 'Downtown Arts District',
 '123 Clay Street, Downtown',
 40.7128,
 -74.0060,
 ARRAY['/placeholder-pottery.jpg'],
 ARRAY['All pottery materials and tools', 'Professional instruction', 'Glazing and firing services', 'Take home your creation'],
 ARRAY['Comfortable clothes that can get dirty', 'Hair tie if you have long hair', 'Enthusiasm to learn'],
 'Free cancellation up to 24 hours before the experience starts',
 true,
 'submitted'
),
('550e8400-e29b-41d4-a716-446655440002',
 '00000000-0000-0000-0000-000000000000',
 'Farmers Market Food Tour', 
 'Discover the best of local flavors on this guided food tour through our vibrant farmers market. Sample artisanal products, meet local vendors, and learn about sustainable farming practices.',
 NULL,
 45,
 3,
 12,
 'Market District',
 '456 Market Square, Market District',
 40.7589,
 -73.9851,
 ARRAY['/placeholder-market.jpg'],
 ARRAY['Professional guide', 'Sample tastings from 5+ vendors', 'Market map and vendor recommendations', 'Seasonal recipe card'],
 ARRAY['Comfortable walking shoes', 'Light appetite (lots of tastings!)', 'Reusable bag for purchases'],
 'Free cancellation up to 2 hours before the experience starts',
 true,
 'submitted'
),
('550e8400-e29b-41d4-a716-446655440003',
 '00000000-0000-0000-0000-000000000000',
 'Italian Cooking Masterclass',
 'Master the art of Italian cuisine in this immersive cooking experience. Learn to make fresh pasta from scratch, prepare authentic sauces, and create a complete Italian meal to enjoy together.',
 NULL,
 85,
 4,
 6,
 'Little Italy',
 '789 Pasta Lane, Little Italy',
 40.7193,
 -73.9965,
 ARRAY['/placeholder-cooking.jpg'],
 ARRAY['All ingredients and cooking supplies', 'Professional chef instruction', 'Wine pairing with dinner', 'Recipe cards to take home', 'Full meal and dessert'],
 ARRAY['Apron (or wear clothes you don''t mind getting messy)', 'Hair tie if needed', 'Appetite for delicious food!'],
 'Free cancellation up to 48 hours before the experience starts',
 true,
 'submitted'
);

-- Now insert the availability data
INSERT INTO public.availability (experience_id, start_time, end_time, available_spots) VALUES
-- Pottery Workshop (ID: 550e8400-e29b-41d4-a716-446655440001)
('550e8400-e29b-41d4-a716-446655440001', '2025-01-10 14:00:00+00', '2025-01-10 16:00:00+00', 8),
('550e8400-e29b-41d4-a716-446655440001', '2025-01-11 14:00:00+00', '2025-01-11 16:00:00+00', 6),
('550e8400-e29b-41d4-a716-446655440001', '2025-01-12 10:00:00+00', '2025-01-12 12:00:00+00', 8),
('550e8400-e29b-41d4-a716-446655440001', '2025-01-13 14:00:00+00', '2025-01-13 16:00:00+00', 5),

-- Farmers Market Tour (ID: 550e8400-e29b-41d4-a716-446655440002)
('550e8400-e29b-41d4-a716-446655440002', '2025-01-10 09:00:00+00', '2025-01-10 12:00:00+00', 12),
('550e8400-e29b-41d4-a716-446655440002', '2025-01-11 09:00:00+00', '2025-01-11 12:00:00+00', 10),
('550e8400-e29b-41d4-a716-446655440002', '2025-01-12 09:00:00+00', '2025-01-12 12:00:00+00', 12),
('550e8400-e29b-41d4-a716-446655440002', '2025-01-13 09:00:00+00', '2025-01-13 12:00:00+00', 8),

-- Italian Cooking Class (ID: 550e8400-e29b-41d4-a716-446655440003)
('550e8400-e29b-41d4-a716-446655440003', '2025-01-10 18:00:00+00', '2025-01-10 22:00:00+00', 6),
('550e8400-e29b-41d4-a716-446655440003', '2025-01-11 18:00:00+00', '2025-01-11 22:00:00+00', 4),
('550e8400-e29b-41d4-a716-446655440003', '2025-01-12 15:00:00+00', '2025-01-12 19:00:00+00', 6),
('550e8400-e29b-41d4-a716-446655440003', '2025-01-13 18:00:00+00', '2025-01-13 22:00:00+00', 2);