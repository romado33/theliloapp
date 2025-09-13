import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSavedExperiences } from '@/hooks/useSavedExperiences';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  MapPin,
  Clock,
  Star,
  DollarSign,
  Trash2,
  Eye,
  BookOpen,
} from 'lucide-react';
import { getImageFromUrl } from '@/lib/imageMap';
import { formatDistanceToNow } from 'date-fns';

const SavedExperiences = () => {
  const auth = useSecureAuth();
  const navigate = useNavigate();
  const { savedExperiences, loading, removeSavedExperience } = useSavedExperiences();

  const handleRemove = async (experienceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeSavedExperience(experienceId);
  };

  const handleViewExperience = (experienceId: string) => {
    navigate(`/experience/${experienceId}`);
  };

  if (!auth.user) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Saved Experiences</h1>
          <p className="text-muted-foreground">
            Your favorite experiences to book later
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-1/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (savedExperiences.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Saved Experiences</h1>
          <p className="text-muted-foreground">
            Your favorite experiences to book later
          </p>
        </div>

        <Card className="p-12 text-center">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <CardHeader>
            <CardTitle>No saved experiences yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Start exploring and save experiences you'd like to book later
            </p>
            <Button onClick={() => navigate('/search')}>
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Experiences
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Saved Experiences</h1>
        <p className="text-muted-foreground">
          {savedExperiences.length} saved experience{savedExperiences.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedExperiences.map((savedExp) => {
          if (!savedExp.experience) return null;

          const experience = savedExp.experience;
          const primaryImage = experience.image_urls?.[0] 
            ? getImageFromUrl(experience.image_urls[0])
            : '/placeholder.svg';

          return (
            <Card 
              key={savedExp.id} 
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
              onClick={() => handleViewExperience(experience.id)}
            >
              <div className="relative">
                <div className="aspect-video bg-muted overflow-hidden">
                  <img
                    src={primaryImage}
                    alt={experience.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Action buttons overlay */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="bg-white/90 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewExperience(experience.id);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="bg-white/90 hover:bg-white text-red-500 hover:text-red-600"
                    onClick={(e) => handleRemove(experience.id, e)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Saved indicator */}
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="bg-white/90">
                    <Heart className="w-3 h-3 mr-1 fill-current text-red-500" />
                    Saved
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {experience.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      by {experience.host_name}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{experience.average_rating}</span>
                    <span className="text-muted-foreground">
                      ({experience.review_count} reviews)
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{experience.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{experience.duration_hours}h</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-lg">${experience.price}</span>
                      <span className="text-sm text-muted-foreground">per person</span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      Saved {formatDistanceToNow(new Date(savedExp.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SavedExperiences;