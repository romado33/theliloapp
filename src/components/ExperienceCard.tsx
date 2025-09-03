import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Users } from "lucide-react";

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
  return (
    <Card className="group overflow-hidden border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 bg-gradient-card">
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
      </div>
      
      <div className="p-4 space-y-3">
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
          <Button size="sm" className="bg-primary hover:bg-primary-dark">
            Book Now
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ExperienceCard;