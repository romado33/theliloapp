import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';

export interface Experience {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  duration_hours: number;
  max_guests: number;
  image_urls: string[];
  host_id: string;
  category_id: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

export interface RecommendationReason {
  type: 'location' | 'category' | 'price_range' | 'past_booking' | 'popular' | 'new';
  description: string;
}

export interface RecommendedExperience extends Experience {
  recommendation_score: number;
  reasons: RecommendationReason[];
}

export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState<RecommendedExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const generateRecommendations = async () => {
    if (!user) return;

    // Skip recommendations for dev bypass users (they have no data)
    if (window.__DEV_BYPASS_ENABLED) {
      setRecommendations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get user profile and preferences
      const { data: profile } = await supabase
        .from('profiles')
        .select('location')
        .eq('id', user.id)
        .single();

      // Get user's booking history
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          experience_id,
          experiences!inner (
            category_id,
            price,
            location,
            latitude,
            longitude
          )
        `)
        .eq('guest_id', user.id);

      // Get user's saved experiences
      const { data: savedExperiences } = await supabase
        .from('saved_experiences')
        .select(`
          experience_id,
          experiences!inner (
            category_id,
            price,
            location
          )
        `)
        .eq('user_id', user.id);

      // Get active experiences with only essential columns (reduces egress)
      const { data: allExperiences } = await supabase
        .from('experiences')
        .select(`
          id,
          title,
          description,
          location,
          price,
          duration_hours,
          max_guests,
          image_urls,
          host_id,
          category_id,
          latitude,
          longitude,
          created_at
        `)
        .eq('is_active', true)
        .limit(50);

      if (!allExperiences) return;

      // Calculate user preferences
      const userPreferences = calculateUserPreferences(bookings, savedExperiences);

      // Generate recommendations with scoring
      const recommendedExperiences = allExperiences
        .map(experience => {
          const score = calculateRecommendationScore(
            experience,
            userPreferences,
            profile?.location,
            bookings?.map(b => b.experience_id) || [],
            savedExperiences?.map(s => s.experience_id) || []
          );

          const reasons = generateRecommendationReasons(
            experience,
            userPreferences,
            profile?.location,
            bookings,
            savedExperiences
          );

          return {
            ...experience,
            recommendation_score: score,
            reasons
          };
        })
        .filter(exp => exp.recommendation_score > 0)
        .sort((a, b) => b.recommendation_score - a.recommendation_score)
        .slice(0, 10);

      setRecommendations(recommendedExperiences);

    } catch (error) {
      logger.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  interface BookingWithExperience {
    experience_id: string;
    experiences?: {
      category_id?: string;
      price?: number;
      location?: string;
      latitude?: number;
      longitude?: number;
    };
  }

  interface SavedExperienceWithDetails {
    experience_id: string;
    experiences?: {
      category_id?: string;
      price?: number;
      location?: string;
    };
  }

  const calculateUserPreferences = (bookings: BookingWithExperience[] | null, savedExperiences: SavedExperienceWithDetails[] | null) => {
    const preferences = {
      categoryIds: new Set<string>(),
      priceRanges: [] as number[],
      locations: new Set<string>(),
      avgLatitude: 0,
      avgLongitude: 0,
      coordinatesCount: 0
    };

    // Analyze bookings
    bookings?.forEach(booking => {
      if (booking.experiences?.category_id) {
        preferences.categoryIds.add(booking.experiences.category_id);
      }
      if (booking.experiences?.price) {
        preferences.priceRanges.push(booking.experiences.price);
      }
      if (booking.experiences?.location) {
        preferences.locations.add(booking.experiences.location);
      }
      if (booking.experiences?.latitude && booking.experiences?.longitude) {
        preferences.avgLatitude += booking.experiences.latitude;
        preferences.avgLongitude += booking.experiences.longitude;
        preferences.coordinatesCount++;
      }
    });

    // Analyze saved experiences
    savedExperiences?.forEach(saved => {
      if (saved.experiences?.category_id) {
        preferences.categoryIds.add(saved.experiences.category_id);
      }
      if (saved.experiences?.price) {
        preferences.priceRanges.push(saved.experiences.price);
      }
      if (saved.experiences?.location) {
        preferences.locations.add(saved.experiences.location);
      }
    });

    // Calculate average coordinates
    if (preferences.coordinatesCount > 0) {
      preferences.avgLatitude /= preferences.coordinatesCount;
      preferences.avgLongitude /= preferences.coordinatesCount;
    }

    return preferences;
  };

  interface UserPreferences {
    categoryIds: Set<string>;
    priceRanges: number[];
    locations: Set<string>;
    avgLatitude: number;
    avgLongitude: number;
    coordinatesCount: number;
  }

  const calculateRecommendationScore = (
    experience: Experience,
    preferences: UserPreferences,
    userLocation?: string,
    bookedExperienceIds: string[] = [],
    savedExperienceIds: string[] = []
  ): number => {
    let score = 0;

    // Don't recommend already booked or saved experiences
    if (bookedExperienceIds.includes(experience.id) || 
        savedExperienceIds.includes(experience.id)) {
      return 0;
    }

    // Category preference match (high weight)
    if (preferences.categoryIds.has(experience.category_id)) {
      score += 40;
    }

    // Price range match (medium weight)
    if (preferences.priceRanges.length > 0) {
        const avgPrice = preferences.priceRanges.reduce((a: number, b: number) => a + b, 0) / preferences.priceRanges.length;
      const priceDiff = Math.abs(experience.price - avgPrice);
      const priceScore = Math.max(0, 30 - (priceDiff / avgPrice) * 30);
      score += priceScore;
    }

    // Location preference match (medium weight)
    if (userLocation && experience.location.toLowerCase().includes(userLocation.toLowerCase())) {
      score += 25;
    }

    // Geographic proximity (if coordinates available)
    if (preferences.coordinatesCount > 0 && experience.latitude && experience.longitude) {
      const distance = calculateDistance(
        preferences.avgLatitude,
        preferences.avgLongitude,
        experience.latitude,
        experience.longitude
      );
      const proximityScore = Math.max(0, 20 - distance); // Within 20km gets full points
      score += proximityScore;
    }

    // Popularity boost (based on recent creation - newer experiences get slight boost)
    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(experience.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceCreated <= 7) {
      score += 10; // New experience bonus
    }

    // Random factor to ensure variety
    score += Math.random() * 10;

    return Math.round(score);
  };

  const generateRecommendationReasons = (
    experience: Experience,
    preferences: UserPreferences,
    userLocation?: string,
    bookings?: BookingWithExperience[] | null,
    savedExperiences?: SavedExperienceWithDetails[] | null
  ): RecommendationReason[] => {
    const reasons: RecommendationReason[] = [];

    if (preferences.categoryIds.has(experience.category_id)) {
      reasons.push({
        type: 'category',
        description: 'Based on your past bookings in this category'
      });
    }

    if (userLocation && experience.location.toLowerCase().includes(userLocation.toLowerCase())) {
      reasons.push({
        type: 'location',
        description: 'Near your location'
      });
    }

    if (preferences.priceRanges.length > 0) {
      const avgPrice = preferences.priceRanges.reduce((a: number, b: number) => a + b, 0) / preferences.priceRanges.length;
      if (Math.abs(experience.price - avgPrice) < avgPrice * 0.5) {
        reasons.push({
          type: 'price_range',
          description: 'Matches your usual spending range'
        });
      }
    }

    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(experience.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceCreated <= 7) {
      reasons.push({
        type: 'new',
        description: 'Newly added experience'
      });
    }

    if (reasons.length === 0) {
      reasons.push({
        type: 'popular',
        description: 'Popular in your area'
      });
    }

    return reasons;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (user) {
      generateRecommendations();
    }
  }, [user]);

  return {
    recommendations,
    loading,
    refreshRecommendations: generateRecommendations
  };
};