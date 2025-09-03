-- Insert additional categories (using ON CONFLICT DO NOTHING to avoid duplicates)
INSERT INTO public.categories (id, name, description, icon) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Cooking Classes', 'Learn to cook delicious meals with expert chefs', '👨‍🍳'),
('550e8400-e29b-41d4-a716-446655440002', 'Art & Crafts', 'Creative workshops and artistic experiences', '🎨'),
('550e8400-e29b-41d4-a716-446655440003', 'Outdoor Adventures', 'Explore nature and outdoor activities', '🏞️'),
('550e8400-e29b-41d4-a716-446655440004', 'Wellness & Fitness', 'Health and wellness focused activities', '🧘‍♀️'),
('550e8400-e29b-41d4-a716-446655440005', 'Music & Dance', 'Musical and dance learning experiences', '🎵'),
('550e8400-e29b-41d4-a716-446655440006', 'Culinary Adventures', 'Culinary experiences and tastings', '🍷')
ON CONFLICT (name) DO NOTHING;