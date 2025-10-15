import type { FC } from 'react';
import { Star, MapPin, Clock, Users, Sparkles } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RecommendedExperience } from '@/hooks/useRecommendations';
import { useNavigate } from 'react-router-dom';

interface RecommendationCardProps {
  experience: RecommendedExperience;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ experience }) => {
  const navigate = useNavigate();

  const getReasonIcon = (type: string) => {
    switch (type) {
      case 'location': return '📍';
      case 'category': return '🎯';
      case 'price_range': return '💰';
      case 'past_booking': return '📚';
      case 'popular': return '🔥';
      case 'new': return '✨';
      default: return '⭐';
    }
  };

  const getReasonColor = (type: string) => {
    switch (type) {
      case 'location': return 'bg-blue-100 text-blue-800';
      case 'category': return 'bg-green-100 text-green-800';
      case 'price_range': return 'bg-yellow-100 text-yellow-800';
      case 'past_booking': return 'bg-purple-100 text-purple-800';
      case 'popular': return 'bg-red-100 text-red-800';
      case 'new': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 relative">
      {/* Recommendation badge */}
      <div className="absolute top-3 left-3 z-10">
        <Badge className="bg-primary/90 text-white flex items-center gap-1 text-xs">
          <Sparkles className="w-3 h-3" />
          Recommended
        </Badge>
      </div>

      <CardHeader className="p-0">
        <div className="relative h-48 overflow-hidden">
          <img
            src={experience.image_urls?.[0] || '/placeholder.svg'}
            alt={experience.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg leading-tight mb-1 line-clamp-2">
              {experience.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {experience.description}
            </p>
          </div>

          {/* Experience details */}
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="text-xs">{experience.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{experience.duration_hours}h</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span className="text-xs">Max {experience.max_guests}</span>
            </div>
          </div>

          {/* Recommendation reasons */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Why we recommend this:</p>
            <div className="flex flex-wrap gap-1">
              {experience.reasons.slice(0, 2).map((reason, index) => (
                <Badge 
                  key={index}
                  variant="secondary" 
                  className={`text-xs px-2 py-1 ${getReasonColor(reason.type)}`}
                >
                  <span className="mr-1">{getReasonIcon(reason.type)}</span>
                  {reason.description}
                </Badge>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-2xl font-bold">${experience.price}</span>
              <span className="text-sm text-muted-foreground"> per person</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={() => navigate(`/experience/${experience.id}`)}
          className="w-full"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};