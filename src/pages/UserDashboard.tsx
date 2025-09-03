import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Calendar, 
  MessageCircle, 
  Heart, 
  Settings, 
  MapPin,
  Clock,
  Star,
  Users
} from 'lucide-react';

// Mock data for user bookings
const mockBookings = [
  {
    id: "1",
    experienceTitle: "Family Farm Visit & Animal Feeding",
    hostName: "Sarah Johnson",
    date: "2025-01-15",
    time: "10:00 AM",
    guests: 4,
    status: "confirmed",
    price: 100,
    location: "Kanata, Ottawa",
    image: "/placeholder-farm.jpg"
  },
  {
    id: "2", 
    experienceTitle: "Pottery Making for Kids",
    hostName: "Michael Chen",
    date: "2025-01-22",
    time: "2:00 PM", 
    guests: 3,
    status: "pending",
    price: 105,
    location: "Downtown Ottawa",
    image: "/placeholder-pottery.jpg"
  }
];

// Mock saved experiences
const mockSaved = [
  {
    id: "3",
    title: "Maple Syrup Making Workshop",
    hostName: "David Miller",
    price: 30,
    rating: 4.8,
    location: "Almonte, ON",
    image: "/placeholder-maple.jpg"
  }
];

const UserDashboard = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("bookings");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800'; 
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Awaiting Host Approval';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-gradient-brand text-white text-xl">
                {profile?.first_name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-brand-navy">
                Welcome back, {profile?.first_name || 'User'}!
              </h1>
              <p className="text-muted-foreground">
                Manage your bookings and discover new experiences
              </p>
            </div>
          </div>
          
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Account Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-soft-green/20 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-brand-soft-green" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-muted-foreground text-sm">Upcoming Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-soft-blue/20 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-brand-soft-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-muted-foreground text-sm">Saved Experiences</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-golden-yellow/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-brand-golden-yellow" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-muted-foreground text-sm">Unread Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="bookings" className="gap-2">
            <Calendar className="w-4 h-4" />
            My Bookings
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-2">
            <Heart className="w-4 h-4" />
            Saved
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Bookings</h2>
            {mockBookings.length > 0 ? (
              <div className="space-y-4">
                {mockBookings.map((booking) => (
                  <Card key={booking.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-48 h-48 md:h-auto bg-muted">
                          <img 
                            src={booking.image} 
                            alt={booking.experienceTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg mb-1">
                                {booking.experienceTitle}
                              </h3>
                              <p className="text-muted-foreground text-sm">
                                Hosted by {booking.hostName}
                              </p>
                            </div>
                            <Badge className={getStatusColor(booking.status)}>
                              {getStatusText(booking.status)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{new Date(booking.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{booking.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span>{booking.guests} guests</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span>{booking.location}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-lg font-semibold">
                              Total: ${booking.price}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Contact Host
                              </Button>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start exploring local experiences to make your first booking
                </p>
                <Button variant="brand">
                  Browse Experiences
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Saved Experiences</h2>
            {mockSaved.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockSaved.map((experience) => (
                  <Card key={experience.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted">
                      <img 
                        src={experience.image}
                        alt={experience.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1">{experience.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        by {experience.hostName}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{experience.rating}</span>
                        </div>
                        <span className="font-semibold">${experience.price}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{experience.location}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No saved experiences</h3>
                <p className="text-muted-foreground mb-4">
                  Save experiences you're interested in to book them later
                </p>
                <Button variant="brand">
                  Browse Experiences
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Messages</h2>
            <Card className="p-12 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-muted-foreground">
                Messages from hosts will appear here
              </p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;