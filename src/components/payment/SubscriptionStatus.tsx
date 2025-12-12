import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSubscription } from '@/hooks/useSubscription';
import { SUBSCRIPTION_TIERS } from '@/types/payment';
import { RefreshCw, CreditCard, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const SubscriptionStatus = () => {
  const { subscription, loading, isSubscribed, subscriptionTier, subscriptionEnd, checkSubscription } = useSubscription();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const tierInfo = subscriptionTier 
    ? Object.values(SUBSCRIPTION_TIERS).find(t => t.product_id === subscriptionTier)
    : null;

  const statusColors: Record<string, string> = {
    active: 'bg-green-500',
    trialing: 'bg-blue-500',
    past_due: 'bg-yellow-500',
    canceled: 'bg-red-500',
    incomplete: 'bg-gray-500',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Status
          </CardTitle>
          <CardDescription>
            {isSubscribed 
              ? 'Your subscription is active' 
              : 'You do not have an active subscription'}
          </CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={checkSubscription}
          title="Refresh subscription status"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {subscription ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className={statusColors[subscription.status] || 'bg-gray-500'}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </Badge>
            </div>
            
            {tierInfo && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="font-medium">{tierInfo.name}</span>
              </div>
            )}
            
            {subscriptionEnd && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {subscription.cancel_at_period_end ? 'Ends on' : 'Renews on'}
                </span>
                <span className="font-medium">
                  {format(new Date(subscriptionEnd), 'MMM d, yyyy')}
                </span>
              </div>
            )}

            {/* TODO: Add Manage Subscription button when Stripe customer portal is connected */}
            <Button variant="outline" className="w-full mt-4" disabled>
              Manage Subscription (Coming Soon)
            </Button>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              Upgrade to a subscription to unlock premium features
            </p>
            {/* TODO: Link to pricing page when ready */}
            <Button variant="outline" disabled>
              View Plans (Coming Soon)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
