import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
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
  AlertCircle
} from 'lucide-react';

// Mock experience data
const mockExperience = {
  id: "1",
  title: "Family Farm Visit & Animal Feeding Experience",
  description: "Join us for an authentic farm experience where your family can meet and feed our friendly animals including goats, chickens, rabbits, and miniature horses. Learn about sustainable farming practices while your children create lasting memories with our gentle farm animals.",
  longDescription: `This hands-on farm experience is designed specifically for families with young children aged 2-12. You'll start with a brief introduction to our farm and safety guidelines, then move on to feeding time with our animals.\n\nWhat makes our farm special:\n• All animals are gentle and used to children\n• Small group sizes ensure personal attention\n• Educational component about animal care\n• Photo opportunities throughout\n• Weather-appropriate activities (indoor backup available)\n\nOur farm has been family-owned for over 30 years and we're passionate about sharing the joy of farm life with the next generation.`,
  images: [
    "/placeholder-farm-1.jpg",
    "/placeholder-farm-2.jpg", 
    "/placeholder-farm-3.jpg"
  ],
  category: "Nature & Animals",
  price: 25,
  duration: "2 hours",
  rating: 4.9,
  reviewCount: 156,
  location: "Kanata, Ottawa",
  address: "123 Farm Road, Kanata, ON K2K 1A1",
  hostName: "Sarah Johnson",
  hostJoinDate: "2019",
  maxGuests: 8,
  whatIncluded: [
    "Animal feeding experience",
    "Farm tour with educational content", 
    "Safety equipment provided",
    "Fresh apple cider tasting",
    "Take-home farm activity booklet"
  ],
  whatToBring: [
    "Comfortable walking shoes",
    "Weather-appropriate clothing",
    "Camera for photos",
    "Hand sanitizer (optional)"
  ],
  cancellationPolicy: "Free cancellation up to 24 hours before the experience. 50% refund for cancellations within 24 hours.",
  availability: [
    { date: "2025-01-15", time: "10:00 AM", spots: 6 },
    { date: "2025-01-15", time: "2:00 PM", spots: 3 },
    { date: "2025-01-16", time: "10:00 AM", spots: 8 },
    { date: "2025-01-17", time: "10:00 AM", spots: 5 },
  ]
};

const ExperienceDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [guestCount, setGuestCount] = useState(2);

  // Mock reviews
  const reviews = [
    {
      id: 1,
      author: "Jennifer M.",
      rating: 5,
      date: "2 weeks ago",
      comment: "Amazing experience! Sarah was so welcoming and knowledgeable. My 4-year-old is still talking about feeding the goats. Highly recommend!"
    },
    {
      id: 2,
      author: "Mark R.", 
      rating: 5,
      date: "1 month ago",
      comment: "Perfect family activity. Well organized, safe, and educational. The kids learned so much about farm life."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-6">
        <span>Home</span> → <span>Search</span> → <span className="text-foreground">{mockExperience.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge variant="secondary" className="mb-2">
                  {mockExperience.category}
                </Badge>
                <h1 className="text-3xl font-bold text-brand-navy mb-2">
                  {mockExperience.title}
                </h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{mockExperience.rating}</span>
                    <span>({mockExperience.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{mockExperience.location}</span>
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
                  src={mockExperience.images[selectedImage]}
                  alt="Experience"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {mockExperience.images.map((image, index) => (
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
            </div>
          </div>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About This Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {mockExperience.description}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-soft-blue" />
                  <span className="text-sm">{mockExperience.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-soft-green" />
                  <span className="text-sm">Up to {mockExperience.maxGuests} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-golden-yellow" />
                  <span className="text-sm">{mockExperience.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-brand-navy" />
                  <span className="text-sm">${mockExperience.price} per person</span>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-2">Full Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {mockExperience.longDescription}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* What's Included */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  What's Included
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {mockExperience.whatIncluded.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  What to Bring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {mockExperience.whatToBring.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Host Information */}
          <Card>
            <CardHeader>
              <CardTitle>Meet Your Host</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-gradient-brand text-white text-lg">
                    {mockExperience.hostName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{mockExperience.hostName}</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    Host since {mockExperience.hostJoinDate}
                  </p>
                  <p className="text-sm">
                    "I'm passionate about sharing the joy of farm life with families. Our farm has been in my family for generations, and I love seeing children's faces light up when they meet our animals for the first time."
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
                Reviews ({mockExperience.reviewCount})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.map(review => (
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
                <span>${mockExperience.price}</span>
                <span className="text-sm font-normal text-muted-foreground">per person</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Choose Date & Time</label>
                <div className="space-y-2">
                  {mockExperience.availability.map((slot, index) => (
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
                      onClick={() => setGuestCount(Math.min(mockExperience.maxGuests, guestCount + 1))}
                      disabled={guestCount >= mockExperience.maxGuests}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span>${mockExperience.price} × {guestCount} guest{guestCount > 1 ? 's' : ''}</span>
                  <span>${mockExperience.price * guestCount}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${mockExperience.price * guestCount}</span>
                </div>
              </div>

              {/* Book Button */}
              <Button 
                variant="brand" 
                className="w-full"
                disabled={!selectedTimeSlot || !user}
              >
                {user ? 'Book Experience' : 'Sign in to Book'}
              </Button>

              {!user && (
                <p className="text-xs text-muted-foreground text-center">
                  You'll be redirected to sign in before booking
                </p>
              )}

              {/* Cancellation Policy */}
              <div className="pt-4 border-t border-border">
                <h4 className="font-medium text-sm mb-1">Cancellation Policy</h4>
                <p className="text-xs text-muted-foreground">
                  {mockExperience.cancellationPolicy}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetails;