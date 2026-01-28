import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, Users, MapPin, Mail, Phone, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useChat } from '@/hooks/useChat';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface Booking {
  id: string;
  experience_id: string;
  guest_id: string;
  booking_date: string;
  guest_count: number;
  total_price: number;
  status: string;
  special_requests: string | null;
  created_at: string;
  guest_contact_info: {
    email: string;
    phone?: string;
  } | null;
  experience: {
    title: string;
    location: string;
    duration_hours: number;
  };
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

export const BookingManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createConversation } = useChat();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // First, get the host's experience IDs
      const { data: experiences } = await supabase
        .from('experiences')
        .select('id')
        .eq('host_id', user?.id);
      
      const experienceIds = experiences?.map(exp => exp.id) || [];
      
      if (experienceIds.length === 0) {
        setBookings([]);
        setLoading(false);
        return;
      }
      
      // Then fetch bookings for those experiences
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          experience:experiences(title, location, duration_hours),
          profiles!bookings_guest_id_fkey(first_name, last_name, avatar_url)
        `)
        .in('experience_id', experienceIds)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our Booking interface
      const transformedBookings = data?.map(booking => ({
        ...booking,
        guest_contact_info: booking.guest_contact_info as { email: string; phone?: string } | null
      })) as Booking[] || [];
      
      setBookings(transformedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      // Send email notification based on status change
      if (booking?.guest_contact_info?.email) {
        const emailType = newStatus === 'confirmed' ? 'booking_confirmation' 
                        : newStatus === 'cancelled' ? 'booking_cancellation' 
                        : null;
        
        if (emailType) {
          try {
            await supabase.functions.invoke('send-email', {
              body: {
                type: emailType,
                to: booking.guest_contact_info.email,
                data: {
                  guestName: booking.profiles?.first_name || 'Guest',
                  experienceTitle: booking.experience.title,
                  hostName: user?.user_metadata?.first_name || 'Host',
                  bookingDate: booking.booking_date,
                  guestCount: booking.guest_count,
                  totalPrice: booking.total_price,
                  location: booking.experience.location,
                  bookingId: booking.id,
                },
              },
            });
          } catch (emailError) {
            console.warn('Failed to send email notification:', emailError);
          }
        }
      }

      await fetchBookings();
      toast({
        title: "Success",
        description: `Booking ${newStatus} successfully`
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive"
      });
    }
  };

  const handleMessageGuest = async (booking: Booking) => {
    try {
      const conversationId = await createConversation(
        user!.id, // host_id
        booking.guest_id, // guest_id
        booking.experience_id
      );
      
      if (conversationId) {
        navigate('/messages');
        toast({
          title: 'Conversation opened',
          description: `You can now message ${booking.profiles?.first_name}`,
        });
      }
    } catch (error) {
      console.error('Error opening conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to open conversation',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-primary/10 text-primary border-primary/20';
      case 'pending': return 'bg-accent/10 text-accent-foreground border-accent/20';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'completed': return 'bg-secondary/10 text-secondary-foreground border-secondary/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const filteredBookings = selectedStatus === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === selectedStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Booking Management</h3>
        <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground text-center">
              {selectedStatus === 'all' 
                ? "Once guests book your experiences, they'll appear here"
                : `No ${selectedStatus} bookings found`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={booking.profiles?.avatar_url || ''} />
                      <AvatarFallback>
                        {booking.profiles?.first_name?.[0]}{booking.profiles?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">
                        {booking.profiles?.first_name} {booking.profiles?.last_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Booked {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(booking.status)}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h5 className="font-medium text-primary">Experience Details</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{booking.experience.title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {format(new Date(booking.booking_date), 'EEEE, MMMM dd, yyyy \'at\' h:mm a')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{booking.experience.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{booking.guest_count} guest{booking.guest_count > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-medium text-primary">Booking Information</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="font-medium">${booking.total_price}</span>
                      </div>
                      {booking.guest_contact_info?.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate">{booking.guest_contact_info.email}</span>
                        </div>
                      )}
                      {booking.guest_contact_info?.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{booking.guest_contact_info.phone}</span>
                        </div>
                      )}
                      {booking.special_requests && (
                        <div>
                          <span className="text-muted-foreground">Special Requests:</span>
                          <p className="text-sm mt-1 p-2 bg-muted rounded">
                            {booking.special_requests}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {booking.status === 'pending' && (
                  <div className="flex space-x-2 mt-6 pt-4 border-t">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                    >
                      Accept Booking
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                      onClick={() => handleMessageGuest(booking)}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Message Guest
                    </Button>
                  </div>
                )}

                {booking.status === 'confirmed' && (
                  <div className="flex space-x-2 mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                    >
                      Mark Complete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                      onClick={() => handleMessageGuest(booking)}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Message Guest
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};