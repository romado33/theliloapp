import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WriteReviewModal } from '@/components/WriteReviewModal';
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Users,
  Mail,
  Phone,
  ArrowLeft,
  Download,
  Loader2,
  Star
} from 'lucide-react';
import type { BookingDetails } from '@/types';

const BookingConfirmation = () => {
  const { bookingId: urlBookingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Get booking ID from URL params or query params
  const bookingId = urlBookingId || searchParams.get('booking_id');
  const sessionId = searchParams.get('session_id');

  // Verify payment if session_id is present (coming from Stripe)
  useEffect(() => {
    const verifyPayment = async () => {
      if (!bookingId || !sessionId) return;
      
      try {
        console.log('Verifying payment with session ID:', sessionId);
        
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: {
            bookingId,
            sessionId
          }
        });

        if (error) {
          throw error;
        }

        if (data.success) {
          setPaymentVerified(true);
          console.log('Payment verified successfully');
          
          toast({
            title: 'Payment Confirmed!',
            description: 'Your booking has been confirmed and a confirmation email has been sent.',
          });
        } else {
          throw new Error('Payment verification failed');
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        setVerificationError(error.message || 'Failed to verify payment');
        
        toast({
          title: 'Payment Verification Error',
          description: 'There was an issue verifying your payment. Please contact support.',
          variant: 'destructive',
        });
      }
    };

    verifyPayment();
  }, [bookingId, sessionId, toast]);

  // Send confirmation email when booking loads (for URL bookings)
  useEffect(() => {
    const sendConfirmationEmail = async () => {
      if (bookingId && !sessionId && !paymentVerified) {
        try {
          await supabase.functions.invoke('send-booking-email', {
            body: {
              bookingId,
              type: 'confirmation'
            }
          });
        } catch (error) {
          console.error('Failed to send confirmation email:', error);
        }
      }
    };

    sendConfirmationEmail();
  }, [bookingId, sessionId, paymentVerified]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const {
    data: booking,
    isLoading,
    error,
  } = useQuery<BookingDetails>({
    queryKey: ['booking', bookingId, user?.id],
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 1,
    queryFn: async () => {
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
        .single<BookingDetails>();
      if (error) throw error;
      return data;
    },
    enabled: !!bookingId && !!user,
  });

  // Check if user can write a review (booking is completed)
  const canWriteReview = booking && 
    booking.status === 'confirmed' && 
    new Date(booking.booking_date) < new Date();

  const handleReviewSubmitted = () => {
    toast({
      title: 'Review submitted!',
      description: 'Thank you for sharing your experience',
    });
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-lg font-semibold mb-2">
              {sessionId ? 'Confirming Your Booking...' : 'Loading Booking Details...'}
            </p>
            <p className="text-muted-foreground text-center text-sm">
              {sessionId 
                ? 'Please wait while we verify your payment and confirm your experience booking.'
                : 'Retrieving your booking information.'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || verificationError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="py-8">
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                {verificationError || 'Error loading booking details'}
              </AlertDescription>
            </Alert>
            <div className="text-center">
              <Button onClick={() => navigate('/')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
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
            {paymentVerified || sessionId ? 'Payment Confirmed!' : 'Booking Confirmed!'}
          </h1>
          <p className="text-muted-foreground">
            {paymentVerified || sessionId 
              ? 'Your payment has been processed and your experience is confirmed'
              : 'Your experience has been successfully booked'
            }
          </p>
          {sessionId && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">
                ✓ Payment processed successfully • Confirmation email sent
              </p>
            </div>
          )}
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
                    <span className="text-sm">{booking.guest_contact_info?.email}</span>
                </div>
                  {booking.guest_contact_info?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{booking.guest_contact_info?.phone}</span>
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
          {canWriteReview ? (
            <Button 
              onClick={() => setShowReviewModal(true)}
              className="flex-1"
            >
              <Star className="w-4 h-4 mr-2" />
              Write Review
            </Button>
          ) : (
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="flex-1"
            >
              View My Bookings
            </Button>
          )}
        </div>

        {/* What's Next */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!canWriteReview ? (
              <>
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
              </>
            ) : (
              <div className="text-center py-4">
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-700 mb-2">
                    ✓ Experience completed successfully!
                  </p>
                  <p className="text-xs text-green-600">
                    Help other guests by sharing your review
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Modal */}
        {booking && (
          <WriteReviewModal
            isOpen={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            bookingId={booking.id}
            experienceId={booking.experience_id}
            experienceTitle={booking.experience.title}
            onReviewSubmitted={handleReviewSubmitted}
          />
        )}
      </div>
    </div>
  );
};

export default BookingConfirmation;