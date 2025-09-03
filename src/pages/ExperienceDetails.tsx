import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  Calendar,
  DollarSign,
  Heart,
  Share2,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

interface Experience {
  id: string;
  title: string;
  description: string;
  location: string;
  address: string;
  price: number;
  duration_hours: number;
  max_guests: number;
  image_urls: string[];
  what_included: string[];
  what_to_bring: string[];
  cancellation_policy: string;
  status: string;
  is_active: boolean;
  created_at: string;
  categories: {
    name: string;
  };
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

const ExperienceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [guestCount, setGuestCount] = useState(2);

  useEffect(() => {
    if (!id) return;
    
    const fetchExperience = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('experiences')
          .select(`
            *,
            categories (
              name
            ),
            profiles (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('id', id)
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;
        
        if (!data) {
          setError('Experience not found');
          return;
        }

        setExperience(data);
      } catch (error: any) {
        console.error('Error fetching experience:', error);
        setError(error.message);
        toast({
          title: "Error loading experience",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
  }, [id, toast]);

  // Mock availability data - this would come from a real availability table
  const mockAvailability = [
    { date: "2025-01-15", time: "10:00 AM", spots: 6 },
    { date: "2025-01-15", time: "2:00 PM", spots: 3 },
    { date: "2025-01-16", time: "10:00 AM", spots: 8 },
    { date: "2025-01-17", time: "10:00 AM", spots: 5 },
  ];

  // Mock reviews - this would come from a real reviews table
  const mockReviews = [
    {
      id: 1,
      author: "Jennifer M.",
      rating: 5,
      date: "2 weeks ago",
      comment: "Amazing experience! The host was so welcoming and knowledgeable. My kids loved every minute of it!"
    },
    {
      id: 2,
      author: "Mark R.", 
      rating: 5,
      date: "1 month ago",
      comment: "Perfect family activity. Well organized, safe, and educational. Highly recommend!"
    }
  ];

  const handleBooking = async () => {
    if (!user) {
      navigate('/auth', { 
        state: { returnTo: `/experience/${id}` }
      });
      return;
    }

    if (!selectedTimeSlot) {
      toast({
        title: "Please select a time slot",
        description: "Choose your preferred date and time to continue with booking.",
        variant: "destructive"
      });
      return;
    }

    // TODO: Implement actual booking logic
    toast({
      title: "Booking initiated",
      description: "This would redirect to the booking flow."
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <Card className="p-12 text-center">
          <CardContent>
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Experience Not Found</h3>
            <p className="text-muted-foreground mb-4">
              {error || 'This experience may have been removed or is no longer available.'}
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/search')}
            >
              Browse Other Experiences
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hostName = experience.profiles 
    ? `${experience.profiles.first_name} ${experience.profiles.last_name}` 
    : 'Unknown Host';

  const images = experience.image_urls && experience.image_urls.length > 0 
    ? experience.image_urls 
    : ['/placeholder-experience.jpg'];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <button onClick={() => navigate('/')} className="hover:text-foreground">
          Home
        </button>
        <span>→</span>
        <button onClick={() => navigate('/search')} className="hover:text-foreground">
          Search
        </button>
        <span>→</span>
        <span className="text-foreground">{experience.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge variant="secondary" className="mb-2">
                  {experience.categories?.name || 'Experience'}
                </Badge>
                <h1 className="text-3xl font-bold text-brand-navy mb-2">
                  {experience.title}
                </h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">4.9</span>
                    <span>(156 reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{experience.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img 
                  src={images[selectedImage]}
                  alt="Experience"
                  className="w-full h-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-brand-soft-green' : 'border-transparent'
                      }`}
                    >
                      <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About This Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {experience.description}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-soft-blue" />
                  <span className="text-sm">{experience.duration_hours} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-soft-green" />
                  <span className="text-sm">Up to {experience.max_guests} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-golden-yellow" />
                  <span className="text-sm">{experience.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-brand-navy" />
                  <span className="text-sm">${experience.price} per person</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's Included */}
          {(experience.what_included?.length > 0 || experience.what_to_bring?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {experience.what_included?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      What's Included
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {experience.what_included.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {experience.what_to_bring?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                      What to Bring
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {experience.what_to_bring.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Host Information */}
          <Card>
            <CardHeader>
              <CardTitle>Meet Your Host</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  {experience.profiles?.avatar_url ? (
                    <img src={experience.profiles.avatar_url} alt={hostName} />
                  ) : (
                    <AvatarFallback className="bg-gradient-brand text-white text-lg">
                      {experience.profiles?.first_name?.[0] || 'H'}
                      {experience.profiles?.last_name?.[0] || ''}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{hostName}</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    Host since {new Date(experience.created_at).getFullYear()}
                  </p>
                  <p className="text-sm">
                    "I'm passionate about sharing local experiences with families and creating memorable moments for children."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Reviews (156)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockReviews.map(review => (
                <div key={review.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{review.author[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{review.author}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${
                                i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>${experience.price}</span>
                <span className="text-sm font-normal text-muted-foreground">per person</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Choose Date & Time</label>
                <div className="space-y-2">
                  {mockAvailability.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTimeSlot(`${slot.date}-${slot.time}`)}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        selectedTimeSlot === `${slot.date}-${slot.time}`
                          ? 'border-brand-soft-green bg-brand-soft-green/10'
                          : 'border-border hover:border-brand-soft-green/50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">
                            {new Date(slot.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">{slot.time}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {slot.spots} spots left
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Guest Count */}
              <div>
                <label className="text-sm font-medium mb-2 block">Number of Guests</label>
                <div className="flex items-center justify-between border border-border rounded-lg p-3">
                  <span className="text-sm">Adults & Children</span>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                      disabled={guestCount <= 1}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{guestCount}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setGuestCount(Math.min(experience.max_guests, guestCount + 1))}
                      disabled={guestCount >= experience.max_guests}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span>${experience.price} × {guestCount} guest{guestCount > 1 ? 's' : ''}</span>
                  <span>${experience.price * guestCount}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${experience.price * guestCount}</span>
                </div>
              </div>

              {/* Book Button */}
              <Button 
                variant="brand" 
                className="w-full"
                onClick={handleBooking}
                disabled={!selectedTimeSlot}
              >
                {user ? 'Book Experience' : 'Sign in to Book'}
              </Button>

              {!user && (
                <p className="text-xs text-muted-foreground text-center">
                  You'll be redirected to sign in before booking
                </p>
              )}

              {/* Cancellation Policy */}
              {experience.cancellation_policy && (
                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium text-sm mb-1">Cancellation Policy</h4>
                  <p className="text-xs text-muted-foreground">
                    {experience.cancellation_policy}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetails;