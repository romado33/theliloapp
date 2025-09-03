-- Insert test categories (using ON CONFLICT DO NOTHING to avoid duplicates)
INSERT INTO public.categories (id, name, description, icon) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Cooking Classes', 'Learn to cook delicious meals with expert chefs', '👨‍🍳'),
('550e8400-e29b-41d4-a716-446655440002', 'Art & Crafts', 'Creative workshops and artistic experiences', '🎨'),
('550e8400-e29b-41d4-a716-446655440003', 'Outdoor Adventures', 'Explore nature and outdoor activities', '🏞️'),
('550e8400-e29b-41d4-a716-446655440004', 'Wellness & Fitness', 'Health and wellness focused activities', '🧘‍♀️'),
('550e8400-e29b-41d4-a716-446655440005', 'Music & Dance', 'Musical and dance learning experiences', '🎵'),
('550e8400-e29b-41d4-a716-446655440006', 'Culinary Experiences', 'Culinary experiences and tastings', '🍷')
ON CONFLICT (name) DO NOTHING;

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