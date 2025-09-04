import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Users, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import QuickBookModal from "@/components/QuickBookModal";

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

  const handleCardClick = () => {
    navigate(`/experience/${id}`);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking heart
    // TODO: Implement save functionality
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
          src={image}
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isNew && (
          <Badge className="absolute top-3 left-3 bg-accent hover:bg-accent">
            New
          </Badge>
        )}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{rating}</span>
          <span className="text-muted-foreground">({reviewCount})</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSaveClick}
          className="absolute top-3 left-3 h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90 border-0 shadow-sm"
        >
          <Heart className="h-4 w-4" />
        </Button>
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