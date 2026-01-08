import { SubscriptionCard } from '@/components/payment/SubscriptionCard';
import { SubscriptionStatus } from '@/components/payment/SubscriptionStatus';
import { SUBSCRIPTION_TIERS } from '@/types/payment';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Pricing = () => {
  const { user } = useAuth();
  const { subscriptionTier } = useSubscription();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Host Subscription Plans</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the perfect plan to grow your hosting business. Upgrade anytime to unlock more features.
          </p>
        </div>

        {user && (
          <div className="max-w-md mx-auto mb-12">
            <SubscriptionStatus />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {Object.values(SUBSCRIPTION_TIERS).map((tier) => (
            <SubscriptionCard
              key={tier.id}
              tier={tier}
              isCurrentPlan={subscriptionTier === tier.id}
            />
          ))}
        </div>

        <div className="text-center mt-12 text-muted-foreground">
          <p className="text-sm">
            All plans include a 14-day free trial. Cancel anytime.
          </p>
          <p className="text-sm mt-2">
            Need a custom plan? <a href="/support" className="text-primary underline">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
