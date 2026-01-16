import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { isDevBypassEnabled } from '@/lib/devUtils';

export interface DashboardStats {
  upcomingBookings: number;
  savedExperiences: number;
  unreadMessages: number;
  totalBookings: number;
  completedBookings: number;
}

export interface BookingWithDetails {
  id: string;
  experience_id: string;
  availability_id: string;
  booking_date: string;
  guest_count: number;
  total_price: number;
  status: string;
  special_requests?: string;
  created_at: string;
  experience: {
    title: string;
    description: string;
    location: string;
    image_urls?: string[];
    host_id: string;
    max_guests: number;
  };
  host_profile: {
    first_name: string;
    last_name: string;
  };
}

export interface SavedExperienceWithDetails {
  id: string;
  created_at: string;
  experience: {
    id: string;
    title: string;
    description: string;
    location: string;
    price: number;
    image_urls?: string[];
    host_id: string;
  };
  host_profile: {
    first_name: string;
    last_name: string;
  };
}

export interface ActivityLogEntry {
  id: string;
  activity_type: string;
  activity_description: string;
  created_at: string;
  related_id?: string;
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    upcomingBookings: 0,
    savedExperiences: 0,
    unreadMessages: 0,
    totalBookings: 0,
    completedBookings: 0,
  });
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [savedExperiences, setSavedExperiences] = useState<SavedExperienceWithDetails[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLogEntry[]>([]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;

    // Skip database queries for dev bypass users (they have no data)
    if (isDevBypassEnabled()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch all data in parallel for better performance
      const [
        bookingsResult,
        savedResult,
        unreadCountResult,
        activityResult
      ] = await Promise.all([
        // Fetch bookings with experience details
        supabase
          .from('bookings')
          .select(`
            *,
            experiences (
              id,
              title,
              description,
              location,
              image_urls,
              host_id,
              max_guests
            )
          `)
          .eq('guest_id', user.id)
          .order('booking_date', { ascending: false }),
        
        // Fetch saved experiences
        supabase
          .from('saved_experiences')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        
        // Fetch unread messages count
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', user.id)
          .eq('is_read', false),
        
        // Fetch recent activity
        supabase
          .from('activity_log')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      if (bookingsResult.error) {
        console.error('Error fetching bookings:', bookingsResult.error);
      }

      // Get unique host IDs from bookings
      const bookingHostIds = [...new Set(
        bookingsResult.data?.map(b => b.experiences?.host_id).filter(Boolean) || []
      )];

      // Fetch experience details for saved experiences
      let experiencesData = null;
      let savedHostIds: string[] = [];
      
      if (savedResult.data && savedResult.data.length > 0) {
        const experienceIds = savedResult.data.map(s => s.experience_id);
        
        const experiencesResult = await supabase
          .from('experiences')
          .select(`
            id,
            title,
            description,
            location,
            price,
            image_urls,
            host_id
          `)
          .in('id', experienceIds);
        
        experiencesData = experiencesResult.data;
        savedHostIds = [...new Set(experiencesData?.map(exp => exp.host_id).filter(Boolean) || [])];
      }

      // Fetch all unique host profiles in parallel
      const allHostIds = [...new Set([...bookingHostIds, ...savedHostIds])];
      const hostProfilesPromises = allHostIds.map(hostId =>
        supabase.rpc('get_safe_host_profile', { host_user_id: hostId })
      );
      
      const hostProfilesResults = await Promise.all(hostProfilesPromises);
      
      // Create a map of host profiles
      const hostProfiles = new Map();
      hostProfilesResults.forEach((result, index) => {
        if (result.data && result.data.length > 0) {
          hostProfiles.set(allHostIds[index], result.data[0]);
        }
      });

      // Transform bookings data
      const transformedBookings: BookingWithDetails[] = (bookingsResult.data || []).map(booking => {
        const hostProfile = hostProfiles.get(booking.experiences?.host_id);
        return {
          ...booking,
          experience: {
            title: booking.experiences?.title || 'Unknown Experience',
            description: booking.experiences?.description || '',
            location: booking.experiences?.location || 'Unknown Location',
            image_urls: booking.experiences?.image_urls || [],
            host_id: booking.experiences?.host_id || '',
            max_guests: booking.experiences?.max_guests || 1,
          },
          host_profile: {
            first_name: hostProfile?.first_name || 'Unknown',
            last_name: hostProfile?.first_name ? '' : 'Host'
          }
        };
      });

      // Transform saved experiences data
      const transformedSaved: SavedExperienceWithDetails[] = (savedResult.data || []).map(saved => {
        const experience = experiencesData?.find(exp => exp.id === saved.experience_id);
        const hostProfile = hostProfiles.get(experience?.host_id);
        return {
          ...saved,
          experience: {
            id: experience?.id || '',
            title: experience?.title || 'Unknown Experience',
            description: experience?.description || '',
            location: experience?.location || 'Unknown Location',
            price: experience?.price || 0,
            image_urls: experience?.image_urls || [],
            host_id: experience?.host_id || '',
          },
          host_profile: {
            first_name: hostProfile?.first_name || 'Unknown',
            last_name: hostProfile?.first_name ? '' : 'Host'
          }
        };
      });

      setBookings(transformedBookings);
      setSavedExperiences(transformedSaved);
      setRecentActivity(activityResult.data || []);

      // Calculate stats
      const now = new Date();
      const upcomingBookings = transformedBookings.filter(b => 
        new Date(b.booking_date) > now && b.status === 'confirmed'
      ).length;
      
      const completedBookings = transformedBookings.filter(b => 
        new Date(b.booking_date) < now && b.status === 'confirmed'
      ).length;

      setStats({
        upcomingBookings,
        savedExperiences: transformedSaved.length,
        unreadMessages: unreadCountResult.count || 0,
        totalBookings: transformedBookings.length,
        completedBookings,
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  const refreshData = () => {
    fetchDashboardData();
  };

  return {
    loading,
    stats,
    bookings,
    savedExperiences,
    recentActivity,
    refreshData,
  };
};