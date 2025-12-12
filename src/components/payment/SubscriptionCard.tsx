import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { CheckoutButton } from './CheckoutButton';
import type { SubscriptionTier } from '@/types/payment';
import { cn } from '@/lib/utils';

interface SubscriptionCardProps {
  tier: SubscriptionTier;
  isCurrentPlan?: boolean;
  onSubscribe?: () => void;
}

export const SubscriptionCard = ({
  tier,
  isCurrentPlan = false,
}: SubscriptionCardProps) => {
  return (
    <Card className={cn(
      'relative flex flex-col',
      isCurrentPlan && 'border-primary ring-2 ring-primary'
    )}>
      {isCurrentPlan && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Your Plan
        </Badge>
      )}
      
      <CardHeader>
        <CardTitle className="text-xl">{tier.name}</CardTitle>
        <CardDescription>{tier.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="mb-6">
          <span className="text-4xl font-bold">${tier.price}</span>
          <span className="text-muted-foreground">/{tier.interval}</span>
        </div>
        
        <ul className="space-y-3">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter>
        {isCurrentPlan ? (
          <Badge variant="secondary" className="w-full justify-center py-2">
            Current Plan
          </Badge>
        ) : (
          <CheckoutButton
            priceId={tier.price_id}
            mode="subscription"
            buttonText={`Subscribe to ${tier.name}`}
            className="w-full"
            disabled={!tier.price_id}
          />
        )}
      </CardFooter>
    </Card>
  );
};
