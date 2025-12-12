import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Home, Calendar, ArrowRight } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkSubscription } = useSubscription();
  
  // Get session_id from URL if present (Stripe redirects with this)
  const sessionId = searchParams.get('session_id');
  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    // Refresh subscription status after successful payment
    checkSubscription();
    
    // TODO: When Stripe is connected, verify the payment with verify-payment edge function
    // if (sessionId) {
    //   verifyPayment(sessionId);
    // }
  }, [checkSubscription, sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for your purchase. Your payment has been processed successfully.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {bookingId && (
            <p className="text-sm text-muted-foreground">
              Booking reference: <span className="font-mono">{bookingId}</span>
            </p>
          )}
          
          <div className="flex flex-col gap-3 pt-4">
            {bookingId ? (
              <Button 
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                <Calendar className="mr-2 h-4 w-4" />
                View My Bookings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/host-dashboard')}
                className="w-full"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
