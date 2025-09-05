import type { Database } from '@/integrations/supabase/types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface GuestContactInfo {
  email: string;
  phone?: string;
}

type BookingRow = Database['public']['Tables']['bookings']['Row'];
export type BookingDetails = Omit<BookingRow, 'guest_contact_info'> & {
  guest_contact_info: GuestContactInfo | null;
  experience: Pick<
    Database['public']['Tables']['experiences']['Row'],
    'title' | 'location' | 'address' | 'duration_hours'
  >;
};

export type Experience = Database['public']['Tables']['experiences']['Row'];

export type SearchResult = Experience & {
  similarity?: number;
};

export type Availability = Database['public']['Tables']['availability']['Row'];
