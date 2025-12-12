import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Subscription, SubscriptionStatus } from '@/types/payment';

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  loading: boolean;
  isSubscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  checkSubscription: () => Promise<void>;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    if (!user?.id) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    // Skip for dev bypass users
    if ((window as any).__DEV_BYPASS_ENABLED) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // First try to get from local database
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        setSubscription(null);
      } else {
        // Type assertion since the database types might not be updated yet
        setSubscription(data as unknown as Subscription | null);
      }

      // TODO: When Stripe is connected, also call check-subscription edge function
      // to sync with Stripe's current state
      
    } catch (error) {
      console.error('Error in checkSubscription:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh subscription status every minute
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      checkSubscription();
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [user?.id, checkSubscription]);

  const isSubscribed = subscription?.status === 'active' || subscription?.status === 'trialing';
  const subscriptionTier = subscription?.stripe_product_id || null;
  const subscriptionEnd = subscription?.current_period_end || null;

  return {
    subscription,
    loading,
    isSubscribed,
    subscriptionTier,
    subscriptionEnd,
    checkSubscription,
  };
};
