import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard } from 'lucide-react';

interface CheckoutButtonProps {
  priceId: string;
  mode: 'payment' | 'subscription';
  bookingId?: string;
  buttonText?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  className?: string;
  disabled?: boolean;
}

export const CheckoutButton = ({
  priceId,
  mode,
  bookingId,
  buttonText,
  variant = 'default',
  className,
  disabled = false,
}: CheckoutButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const defaultText = mode === 'subscription' ? 'Subscribe Now' : 'Pay Now';

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to continue with payment.',
        variant: 'destructive',
      });
      return;
    }

    if (!priceId) {
      toast({
        title: 'Configuration Error',
        description: 'Payment is not configured yet. Please try again later.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // TODO: When Stripe is connected, this will call the create-payment or create-checkout edge function
      const functionName = mode === 'subscription' ? 'create-checkout' : 'create-payment';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          price_id: priceId,
          booking_id: bookingId,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Open Stripe Checkout in a new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Failed',
        description: error.message || 'Unable to start checkout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || loading || !priceId}
      variant={variant}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          {buttonText || defaultText}
        </>
      )}
    </Button>
  );
};
