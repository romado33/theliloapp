// Payment-related types for Stripe integration

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_product_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  price_id: string; // Stripe price ID - will be filled when Stripe is added
  product_id: string; // Stripe product ID - will be filled when Stripe is added
}

// Define subscription tiers - price_id and product_id will be set when Stripe is connected
export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  host_basic: {
    id: 'host_basic',
    name: 'Host Basic',
    description: 'Essential tools for new hosts',
    price: 9.99,
    interval: 'month',
    features: [
      'List up to 3 experiences',
      'Basic analytics',
      'Email support',
    ],
    price_id: '', // TODO: Add Stripe price ID
    product_id: '', // TODO: Add Stripe product ID
  },
  host_pro: {
    id: 'host_pro',
    name: 'Host Pro',
    description: 'Advanced features for growing hosts',
    price: 29.99,
    interval: 'month',
    features: [
      'Unlimited experiences',
      'Advanced analytics',
      'Priority support',
      'Featured listings',
      'Custom branding',
    ],
    price_id: '', // TODO: Add Stripe price ID
    product_id: '', // TODO: Add Stripe product ID
  },
};

export interface PaymentSession {
  url: string;
  session_id?: string;
}

export interface CheckoutRequest {
  price_id: string;
  mode: 'payment' | 'subscription';
  booking_id?: string; // For one-time booking payments
}
