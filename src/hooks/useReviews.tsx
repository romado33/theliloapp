import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  guest_id: string;
  experience_id: string;
  booking_id: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: { [key: number]: number };
}

interface UseReviewsReturn {
  reviews: Review[];
  stats: ReviewStats;
  loading: boolean;
  error: string | null;
  submitReview: (reviewData: {
    rating: number;
    comment: string;
    experienceId: string;
    bookingId: string;
  }) => Promise<boolean>;
  canUserReview: (bookingId: string) => Promise<boolean>;
  refreshReviews: () => Promise<void>;
}

export const useReviews = (experienceId?: string): UseReviewsReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    if (!experienceId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles!reviews_guest_id_fkey (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('experience_id', experienceId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setReviews(data || []);
      calculateStats(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsData: Review[]) => {
    if (reviewsData.length === 0) {
      setStats({
        averageRating: 0,
        totalReviews: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
      return;
    }

    const total = reviewsData.length;
    const sum = reviewsData.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / total;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviewsData.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });

    setStats({
      averageRating: parseFloat(average.toFixed(1)),
      totalReviews: total,
      distribution
    });
  };

  const submitReview = async (reviewData: {
    rating: number;
    comment: string;
    experienceId: string;
    bookingId: string;
  }): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to submit a review',
        variant: 'destructive'
      });
      return false;
    }

    try {
      // Check if user can review this booking
      const canReview = await canUserReview(reviewData.bookingId);
      if (!canReview) {
        toast({
          title: 'Cannot submit review',
          description: 'You can only review completed bookings that you made',
          variant: 'destructive'
        });
        return false;
      }

      // Check if review already exists
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('booking_id', reviewData.bookingId)
        .eq('guest_id', user.id)
        .single();

      if (existingReview) {
        toast({
          title: 'Review already exists',
          description: 'You have already reviewed this experience',
          variant: 'destructive'
        });
        return false;
      }

      const { error } = await supabase
        .from('reviews')
        .insert({
          rating: reviewData.rating,
          comment: reviewData.comment || null,
          experience_id: reviewData.experienceId,
          booking_id: reviewData.bookingId,
          guest_id: user.id
        });

      if (error) throw error;

      toast({
        title: 'Review submitted!',
        description: 'Thank you for your feedback'
      });

      // Refresh reviews
      await fetchReviews();
      return true;

    } catch (err) {
      console.error('Error submitting review:', err);
      toast({
        title: 'Failed to submit review',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive'
      });
      return false;
    }
  };

  const canUserReview = async (bookingId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Check if the booking belongs to the user and is completed
      const { data: booking } = await supabase
        .from('bookings')
        .select('guest_id, status, booking_date')
        .eq('id', bookingId)
        .eq('guest_id', user.id)
        .single();

      if (!booking) return false;

      // Check if booking is completed (date has passed)
      const now = new Date();
      const bookingDate = new Date(booking.booking_date);
      return bookingDate < now && booking.status === 'confirmed';

    } catch (err) {
      console.error('Error checking review permission:', err);
      return false;
    }
  };

  const refreshReviews = async () => {
    await fetchReviews();
  };

  useEffect(() => {
    if (experienceId) {
      fetchReviews();
    }
  }, [experienceId]);

  return {
    reviews,
    stats,
    loading,
    error,
    submitReview,
    canUserReview,
    refreshReviews
  };
};

// Global ratings cache - shared across all hook instances
const ratingsCache = new Map<string, { rating: number; count: number; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache
const pendingFetches = new Map<string, Promise<void>>(); // Prevent duplicate requests

// Batch ratings hook - fetches all ratings in ONE request
export const useBatchRatings = (experienceIds: string[]) => {
  const [ratings, setRatings] = useState<{ [key: string]: { rating: number; count: number } }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (experienceIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchRatings = async () => {
      const now = Date.now();
      const cachedRatings: { [key: string]: { rating: number; count: number } } = {};
      const uncachedIds: string[] = [];

      // Check cache first
      experienceIds.forEach(id => {
        const cached = ratingsCache.get(id);
        if (cached && (now - cached.timestamp) < CACHE_TTL) {
          cachedRatings[id] = { rating: cached.rating, count: cached.count };
        } else {
          uncachedIds.push(id);
        }
      });

      // If all cached, return immediately
      if (uncachedIds.length === 0) {
        setRatings(cachedRatings);
        setLoading(false);
        return;
      }

      try {
        // Single batch request for ALL uncached IDs
        const { data, error } = await supabase
          .from('reviews')
          .select('experience_id, rating')
          .in('experience_id', uncachedIds);

        if (error) throw error;

        const ratingsMap: { [key: string]: { rating: number; count: number } } = { ...cachedRatings };
        
        // Initialize all uncached IDs with 0
        uncachedIds.forEach(id => {
          ratingsMap[id] = { rating: 0, count: 0 };
        });

        // Aggregate ratings
        data?.forEach(review => {
          if (!ratingsMap[review.experience_id]) {
            ratingsMap[review.experience_id] = { rating: 0, count: 0 };
          }
          ratingsMap[review.experience_id].rating += review.rating;
          ratingsMap[review.experience_id].count++;
        });

        // Calculate averages and update cache
        Object.keys(ratingsMap).forEach(experienceId => {
          const ratingData = ratingsMap[experienceId];
          if (ratingData.count > 0) {
            ratingData.rating = parseFloat((ratingData.rating / ratingData.count).toFixed(1));
          }
          // Cache the result
          ratingsCache.set(experienceId, { ...ratingData, timestamp: now });
        });

        setRatings(ratingsMap);
      } catch (err) {
        console.error('Error fetching batch ratings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [JSON.stringify(experienceIds.sort())]); // Stable dependency

  return { ratings, loading };
};

// Legacy hook - kept for backward compatibility but uses batch under the hood
export const useExperienceRatings = (experienceIds: string[]) => {
  return useBatchRatings(experienceIds);
};