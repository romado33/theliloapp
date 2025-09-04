import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Mail, 
  Phone,
  ArrowLeft,
  Download
} from 'lucide-react';

interface BookingDetails {
  id: string;
  experience_id: string;
  guest_count: number;
  total_price: number;
  booking_date: string;
  status: string;
  guest_contact_info: any;
  special_requests: string;
  created_at: string;
  experience: {
    title: string;
    location: string;
    address: string;
    duration_hours: number;
  };
}

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId, user, navigate]);

  const fetchBooking = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          experience:experiences (
            title,
            location,
            address,
            duration_hours
          )
        `)
        .eq('id', bookingId)
        .eq('guest_id', user?.id)
        .single();

      if (error) throw error;
      setBooking(data);
    } catch (error) {
      console.error('Error fetching booking:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending Confirmation';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">Booking not found</p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { date, time } = formatDateTime(booking.booking_date);
  const endTime = new Date(new Date(booking.booking_date).getTime() + booking.experience.duration_hours * 60 * 60 * 1000);
  const endTimeStr = endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-muted-foreground">
            Your experience has been successfully booked
          </p>
        </div>

        {/* Booking Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{booking.experience.title}</CardTitle>
              <Badge variant={getStatusColor(booking.status)}>
                {getStatusText(booking.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-medium">{date}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  {time} - {endTimeStr}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-medium">{booking.experience.location}</p>
                {booking.experience.address && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {booking.experience.address}
                  </p>
                )}
              </div>
            </div>

            {/* Guest Count */}
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <span className="font-medium">
                {booking.guest_count} guest{booking.guest_count > 1 ? 's' : ''}
              </span>
            </div>

            <Separator />

            {/* Contact Information */}
            <div>
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{booking.guest_contact_info.email}</span>
                </div>
                {booking.guest_contact_info.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{booking.guest_contact_info.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Special Requests */}
            {booking.special_requests && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Special Requests</h3>
                  <p className="text-sm text-muted-foreground">
                    {booking.special_requests}
                  </p>
                </div>
              </>
            )}

            <Separator />

            {/* Price Breakdown */}
            <div>
              <h3 className="font-semibold mb-3">Price Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    ${(booking.total_price / booking.guest_count).toFixed(0)} × {booking.guest_count} guest{booking.guest_count > 1 ? 's' : ''}
                  </span>
                  <span>${booking.total_price}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total Paid</span>
                  <span>${booking.total_price}</span>
                </div>
              </div>
            </div>

            {/* Booking ID */}
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
              <p className="font-mono text-sm">{booking.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
          <Button 
            onClick={() => navigate('/dashboard')} 
            className="flex-1"
          >
            View My Bookings
          </Button>
        </div>

        {/* What's Next */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <p className="text-sm text-muted-foreground">
                You'll receive a confirmation email with all the details
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <p className="text-sm text-muted-foreground">
                The host will contact you 24 hours before your experience
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <p className="text-sm text-muted-foreground">
                Arrive 10 minutes early at the specified location
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingConfirmation;