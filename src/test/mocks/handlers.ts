import { http, HttpResponse } from 'msw';
import type { Experience, BookingDetails, Profile } from '@/types';

// Mock data
export const mockExperiences: Experience[] = [
  {
    id: 'exp-1',
    title: 'Pottery Workshop',
    description: 'Learn pottery making',
    location: 'Ottawa',
    address: '123 Main St',
    price: 65,
    duration_hours: 2,
    max_guests: 8,
    image_urls: ['/placeholder-pottery.jpg'],
    host_id: 'host-1',
    category_id: 'cat-1',
    latitude: 45.4215,
    longitude: -75.6972,
    status: 'approved',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    what_included: ['Materials', 'Instruction'],
    what_to_bring: ['Clothes'],
    cancellation_policy: '48 hours',
    search_terms: null,
    embedding: null,
  },
];

export const mockBookings: BookingDetails[] = [
  {
    id: 'booking-1',
    experience_id: 'exp-1',
    guest_id: 'guest-1',
    availability_id: 'avail-1',
    booking_date: new Date().toISOString(),
    guest_count: 2,
    total_price: 130,
    status: 'confirmed',
    special_requests: null,
    payment_intent_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    guest_contact_info: { email: 'guest@test.com' },
    experience: {
      title: 'Pottery Workshop',
      location: 'Ottawa',
      address: '123 Main St',
      duration_hours: 2,
    },
  },
];

export const mockProfile: Profile = {
  id: 'user-1',
  email: 'user@test.com',
  first_name: 'Test',
  last_name: 'User',
  is_host: false,
  onboarded: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  avatar_url: null,
  phone: null,
  bio: null,
  location: null,
  date_of_birth: null,
  admin_role: null,
};

// MSW handlers for API mocking
export const handlers = [
  // Experiences
  http.get('/api/experiences', () => {
    return HttpResponse.json({ data: mockExperiences, error: null });
  }),

  http.get('/api/experiences/:id', ({ params }) => {
    const experience = mockExperiences.find((exp) => exp.id === params.id);
    return HttpResponse.json({ data: experience || null, error: null });
  }),

  // Bookings
  http.get('/api/bookings', () => {
    return HttpResponse.json({ data: mockBookings, error: null });
  }),

  http.post('/api/bookings', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: { id: 'new-booking', ...body },
      error: null,
    });
  }),

  // Profile
  http.get('/api/profiles/:id', ({ params }) => {
    if (params.id === 'user-1') {
      return HttpResponse.json({ data: mockProfile, error: null });
    }
    return HttpResponse.json({ data: null, error: { message: 'Not found' } });
  }),
];





