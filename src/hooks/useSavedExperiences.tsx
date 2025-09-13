import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';

export interface SavedExperience {
  id: string;
  experience_id: string;
  user_id: string;
  created_at: string;
  experience?: {
    id: string;
    title: string;
    description: string;
    location: string;
    price: number;
    duration_hours: number;
    image_urls: string[];
    host_name?: string;
    average_rating?: number;
    review_count?: number;
  };
}

export const useSavedExperiences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedExperiences, setSavedExperiences] = useState<SavedExperience[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's saved experiences
  const fetchSavedExperiences = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_experiences')
        .select(`
          *,
          experiences (
            id,
            title,
            description,
            location,
            price,
            duration_hours,
            image_urls,
            profiles!fk_experiences_host_id (
              first_name,
              last_name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to include host name and mock ratings
      const transformedData: SavedExperience[] = data.map((item: any) => ({
        id: item.id,
        experience_id: item.experience_id,
        user_id: item.user_id,
        created_at: item.created_at,
        experience: item.experiences ? {
          id: item.experiences.id,
          title: item.experiences.title,
          description: item.experiences.description,
          location: item.experiences.location,
          price: item.experiences.price,
          duration_hours: item.experiences.duration_hours,
          image_urls: item.experiences.image_urls || [],
          host_name: item.experiences.profiles 
            ? `${item.experiences.profiles.first_name} ${item.experiences.profiles.last_name}`.trim()
            : 'Unknown Host',
          average_rating: 4.8, // Mock rating - would come from reviews aggregation
          review_count: Math.floor(Math.random() * 50) + 10, // Mock count
        } : undefined,
      }));

      setSavedExperiences(transformedData);
    } catch (error) {
      console.error('Error fetching saved experiences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load saved experiences',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if an experience is saved
  const isExperienceSaved = (experienceId: string): boolean => {
    return savedExperiences.some(saved => saved.experience_id === experienceId);
  };

  // Toggle save/unsave experience
  const toggleSaveExperience = async (experienceId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to save experiences',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const isSaved = isExperienceSaved(experienceId);
      
      if (isSaved) {
        // Remove from saved
        const { error } = await supabase
          .from('saved_experiences')
          .delete()
          .eq('user_id', user.id)
          .eq('experience_id', experienceId);

        if (error) throw error;

        setSavedExperiences(prev => 
          prev.filter(saved => saved.experience_id !== experienceId)
        );

        toast({
          title: 'Removed from saved',
          description: 'Experience has been removed from your saved list',
        });
      } else {
        // Add to saved
        const { error } = await supabase
          .from('saved_experiences')
          .insert({
            user_id: user.id,
            experience_id: experienceId,
          });

        if (error) throw error;

        await fetchSavedExperiences(); // Refresh to get the experience details

        toast({
          title: 'Saved successfully',
          description: 'Experience has been added to your saved list',
        });
      }

      return true;
    } catch (error) {
      console.error('Error toggling save experience:', error);
      toast({
        title: 'Error',
        description: 'Failed to update saved experience',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Remove saved experience
  const removeSavedExperience = async (experienceId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('saved_experiences')
        .delete()
        .eq('user_id', user.id)
        .eq('experience_id', experienceId);

      if (error) throw error;

      setSavedExperiences(prev => 
        prev.filter(saved => saved.experience_id !== experienceId)
      );

      toast({
        title: 'Removed from saved',
        description: 'Experience has been removed from your saved list',
      });

      return true;
    } catch (error) {
      console.error('Error removing saved experience:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove saved experience',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSavedExperiences();
  }, [user]);

  return {
    savedExperiences,
    loading,
    isExperienceSaved,
    toggleSaveExperience,
    removeSavedExperience,
    refetch: fetchSavedExperiences,
  };
};