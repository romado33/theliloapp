import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ProfileSection } from '@/components/dashboard/ProfileSection';
import { ActivityHistory } from '@/components/dashboard/ActivityHistory';
import { useLocation, Link } from 'react-router-dom';
import { 
  Calendar, 
  MessageCircle, 
  Heart, 
  Settings, 
  MapPin,
  Clock,
  Star,
  Users,
  TrendingUp,
  Activity,
  User,
  BookOpen,
  BarChart3,
  X,
  Edit
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ModifyBookingDialog } from '@/components/ModifyBookingDialog';
import { CalendarExportButton } from '@/components/CalendarExportButton';
import { getImageFromUrl } from '@/lib/imageMap';
import { getStatusColor, getStatusText, type BookingStatus } from '@/lib/bookingUtils';
import { logger } from '@/lib/logger';

const UserDashboard = () => {
  const { user, profile } = useAuth();
  const location = useLocation();
  const { 
    loading, 
    stats, 
    bookings, 
    savedExperiences, 
    recentActivity,
    refreshData 
  } = useDashboardData();
  
  // Determine initial tab based on route
  const getInitialTab = () => {
    const path = location.pathname;
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/settings')) return 'settings';
    return 'bookings';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [modifyingBooking, setModifyingBooking] = useState<typeof bookings[0] | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: 'Booking cancelled',
        description: 'Your booking has been successfully cancelled.',
      });

      refreshData();
    } catch (error) {
      logger.error('Error cancelling booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCancelingId(null);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-soft-green/20 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-brand-soft-green" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? '...' : stats.upcomingBookings}</p>
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
                <p className="text-2xl font-bold">{loading ? '...' : stats.savedExperiences}</p>
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
                <p className="text-2xl font-bold">{loading ? '...' : stats.unreadMessages}</p>
                <p className="text-muted-foreground text-sm">Unread Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? '...' : stats.completedBookings}</p>
                <p className="text-muted-foreground text-sm">Completed Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-auto">
          <TabsTrigger value="bookings" className="gap-2">
            <Calendar className="w-4 h-4" />
            My Bookings
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-2">
            <Heart className="w-4 h-4" />
            Saved
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="w-4 h-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Bookings</h2>
              <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-muted rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-48 h-48 md:h-auto bg-muted">
                          <img 
                            src={getImageFromUrl(booking.experience.image_urls?.[0] || '/placeholder.svg')} 
                            alt={booking.experience.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg mb-1">
                                {booking.experience.title}
                              </h3>
                              <p className="text-muted-foreground text-sm">
                                Hosted by {booking.host_profile.first_name} {booking.host_profile.last_name}
                              </p>
                            </div>
                            <Badge className={getStatusColor(booking.status as BookingStatus)}>
                              {getStatusText(booking.status as BookingStatus)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{new Date(booking.booking_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span>{booking.guest_count} guests</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span>{booking.experience.location}</span>
                            </div>
                          </div>

                          {booking.special_requests && (
                            <div className="mb-4 p-3 bg-muted rounded-lg">
                              <p className="text-sm">
                                <strong>Special requests:</strong> {booking.special_requests}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="text-lg font-semibold">
                              Total: ${Number(booking.total_price).toFixed(2)}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <CalendarExportButton booking={booking} />
                              <Button variant="outline" size="sm" asChild>
                                <Link to="/messages">Contact Host</Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/experience/${booking.experience_id}`}>View Details</Link>
                              </Button>
                              {booking.status === 'pending' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setModifyingBooking(booking)}
                                  className="gap-1"
                                >
                                  <Edit className="w-3 h-3" />
                                  Modify
                                </Button>
                              )}
                              {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => setCancelingId(booking.id)}
                                  className="gap-1"
                                >
                                  <X className="w-3 h-3" />
                                  Cancel
                                </Button>
                              )}
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
                <Button variant="default" asChild>
                  <Link to="/search">Browse Experiences</Link>
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Saved Experiences</h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-video bg-muted"></div>
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : savedExperiences.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedExperiences.map((saved) => (
                  <Card key={saved.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-muted">
                      <img 
                        src={getImageFromUrl(saved.experience.image_urls?.[0] || '/placeholder.svg')}
                        alt={saved.experience.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1 line-clamp-1">{saved.experience.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        by {saved.host_profile.first_name} {saved.host_profile.last_name}
                      </p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-lg">${Number(saved.experience.price).toFixed(2)}</span>
                        <div className="text-xs text-muted-foreground">
                          Saved {new Date(saved.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{saved.experience.location}</span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" asChild>
                          <Link to={`/experience/${saved.experience.id}`}>View</Link>
                        </Button>
                        <Button size="sm" variant="default" className="flex-1" asChild>
                          <Link to={`/experience/${saved.experience.id}`}>Book Now</Link>
                        </Button>
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
                <Button variant="default" asChild>
                  <Link to="/search">Browse Experiences</Link>
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <ActivityHistory activities={recentActivity} loading={loading} />
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <ProfileSection />
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Messages</h2>
            <Card className="p-12 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-muted-foreground mb-4">
                Messages from hosts will appear here
              </p>
              <Button variant="outline" asChild>
                <Link to="/messages">Go to Messages</Link>
              </Button>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <ModifyBookingDialog
        booking={modifyingBooking}
        open={!!modifyingBooking}
        onOpenChange={(open) => !open && setModifyingBooking(null)}
        onSuccess={refreshData}
      />

      <AlertDialog open={!!cancelingId} onOpenChange={() => setCancelingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => cancelingId && handleCancelBooking(cancelingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserDashboard;