-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  date_of_birth DATE,
  location TEXT,
  is_host BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create experiences table
CREATE TABLE public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id),
  price DECIMAL(10,2) NOT NULL,
  duration_hours INTEGER NOT NULL,
  max_guests INTEGER NOT NULL DEFAULT 1,
  location TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  image_urls TEXT[],
  what_included TEXT[],
  what_to_bring TEXT[],
  cancellation_policy TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on experiences
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

-- Create availability table
CREATE TABLE public.availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  available_spots INTEGER NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on availability
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  availability_id UUID NOT NULL REFERENCES public.availability(id) ON DELETE CASCADE,
  guest_count INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
  special_requests TEXT,
  guest_contact_info JSONB,
  payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(booking_id)
);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create messages table for host-guest communication
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Insert some sample categories
INSERT INTO public.categories (name, description, icon) VALUES
('Food & Drink', 'Culinary experiences and tastings', '🍽️'),
('Arts & Crafts', 'Creative workshops and artistic activities', '🎨'),
('Outdoor & Sports', 'Adventure and fitness activities', '🏃'),
('Wellness', 'Health, mindfulness and relaxation', '🧘'),
('Tours & Culture', 'Guided tours and cultural experiences', '🏛️'),
('Music & Entertainment', 'Performances and musical activities', '🎵'),
('Learning', 'Educational workshops and classes', '📚'),
('Family & Kids', 'Family-friendly activities', '👨‍👩‍👧‍👦');

-- Profiles RLS Policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Experiences RLS Policies
CREATE POLICY "Anyone can view active experiences" ON public.experiences
  FOR SELECT USING (is_active = true);

CREATE POLICY "Hosts can manage their own experiences" ON public.experiences
  FOR ALL USING (auth.uid() = host_id);

-- Availability RLS Policies  
CREATE POLICY "Anyone can view availability for active experiences" ON public.availability
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.experiences 
      WHERE experiences.id = availability.experience_id 
      AND experiences.is_active = true
    )
  );

CREATE POLICY "Hosts can manage their experience availability" ON public.availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.experiences 
      WHERE experiences.id = availability.experience_id 
      AND experiences.host_id = auth.uid()
    )
  );

-- Bookings RLS Policies
CREATE POLICY "Users can view their own bookings as guest" ON public.bookings
  FOR SELECT USING (auth.uid() = guest_id);

CREATE POLICY "Hosts can view bookings for their experiences" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.experiences 
      WHERE experiences.id = bookings.experience_id 
      AND experiences.host_id = auth.uid()
    )
  );

CREATE POLICY "Users can create bookings as guest" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = guest_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = guest_id);

CREATE POLICY "Hosts can update bookings for their experiences" ON public.bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.experiences 
      WHERE experiences.id = bookings.experience_id 
      AND experiences.host_id = auth.uid()
    )
  );

-- Reviews RLS Policies
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Guests can create reviews for their bookings" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = guest_id);

CREATE POLICY "Guests can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = guest_id);

-- Messages RLS Policies
CREATE POLICY "Users can view messages they sent or received" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received (mark as read)" ON public.messages
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_experiences_updated_at
  BEFORE UPDATE ON public.experiences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();