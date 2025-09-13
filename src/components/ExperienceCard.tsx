import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import QuickBookModal from "@/components/QuickBookModal";
import SaveExperienceButton from './SaveExperienceButton';
import { getImageFromUrl } from '@/lib/imageMap';
import { useExperienceRatings } from '@/hooks/useReviews';

interface ExperienceCardProps {
  id: string;
  title: string;
  image: string;
  category: string;
  price: number;
  duration: string;
  rating: number;
  reviewCount: number;
  location: string;
  hostName: string;
  maxGuests: number;
  isNew?: boolean;
}

const ExperienceCard = ({ 
  id,
  title, 
  image, 
  category, 
  price, 
  duration, 
  rating, 
  reviewCount, 
  location, 
  hostName,
  maxGuests,
  isNew = false
}: ExperienceCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showQuickBook, setShowQuickBook] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Get real ratings data
  const { ratings, loading: ratingsLoading } = useExperienceRatings([id]);
  const experienceRating = ratings[id];
  
  // Use real data if available, otherwise fallback to props
  const displayRating = experienceRating?.rating || rating;
  const displayReviewCount = experienceRating?.count || reviewCount;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = JSON.parse(localStorage.getItem('savedExperiences') || '[]') as string[];
      setIsSaved(saved.includes(id));
    } catch {
      setIsSaved(false);
    }
  }, [id]);

  const handleCardClick = () => {
    navigate(`/experience/${id}`);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === 'undefined') return;
    try {
      const saved = JSON.parse(localStorage.getItem('savedExperiences') || '[]') as string[];
      let updated: string[];
      if (saved.includes(id)) {
        updated = saved.filter((expId) => expId !== id);
        setIsSaved(false);
      } else {
        updated = [...saved, id];
        setIsSaved(true);
      }
      localStorage.setItem('savedExperiences', JSON.stringify(updated));
    } catch {
      /* ignore localStorage errors */
    }
  };

  const handleQuickBook = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking book button
    if (!user) {
      navigate('/auth');
      return;
    }
    setShowQuickBook(true);
  };

  return (
    <Card className="group overflow-hidden border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 bg-gradient-card cursor-pointer" onClick={handleCardClick}>
      <div className="relative">
        <img 
          src={getImageFromUrl(image)}
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isNew && (
          <Badge className="absolute top-3 left-3 bg-accent hover:bg-accent">
            New
          </Badge>
        )}
        {displayReviewCount > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{displayRating}</span>
            <span className="text-muted-foreground">({displayReviewCount})</span>
          </div>
        )}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <SaveExperienceButton 
            experienceId={id}
            variant="outline"
            size="icon"
            className="bg-white/90 hover:bg-white"
          />
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
          <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">Hosted by {hostName}</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>Up to {maxGuests}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold">${price}</span>
            <span className="text-sm text-muted-foreground">per person</span>
          </div>
          <Button 
            size="sm" 
            className="bg-primary hover:bg-primary-dark"
            onClick={handleQuickBook}
          >
            Quick Book
          </Button>
        </div>
      </CardContent>
      
      <QuickBookModal
        isOpen={showQuickBook}
        onClose={() => setShowQuickBook(false)}
        experienceId={id}
        experienceTitle={title}
        experiencePrice={price}
        experienceLocation={location}
      />
    </Card>
  );
};

export default ExperienceCard;