import Stripe from 'stripe';
import { ENV } from './env';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

/**
 * Create a Stripe payment intent for premium trip listing
 */
export async function createTripPaymentIntent(
  amount: number, // in cents (99 or 199)
  tripId: number,
  userId: number,
  tier: 'featured' | 'premium'
): Promise<Stripe.PaymentIntent> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    metadata: {
      tripId: tripId.toString(),
      userId: userId.toString(),
      tier,
    },
    description: `Premium ${tier} listing for trip #${tripId}`,
  });

  return paymentIntent;
}

/**
 * Verify payment was successful
 */
export async function verifyPayment(paymentIntentId: string): Promise<boolean> {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return paymentIntent.status === 'succeeded';
}

/**
 * Create a Stripe Checkout Session for shop subscription
 */
export async function createShopSubscription(
  shopId: number,
  userId: number,
  tier: 'featured' | 'premium',
  customerEmail: string
): Promise<{ sessionId: string; url: string }> {
  // Price IDs - these need to be created in Stripe Dashboard
  const priceIds = {
    featured: process.env.STRIPE_FEATURED_PRICE_ID || 'price_featured_monthly',
    premium: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium_monthly',
  };

  // Get the base URL for redirects
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://www.trail-match.com'
    : 'http://localhost:3000';

  // Create Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: customerEmail,
    line_items: [
      {
        price: priceIds[tier],
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/shops?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/shops?subscription=canceled`,
    metadata: {
      shopId: shopId.toString(),
      userId: userId.toString(),
      tier,
    },
  });

  return {
    sessionId: session.id,
    url: session.url!,
  };
}

/**
 * Cancel a shop subscription
 */
export async function cancelShopSubscription(
  subscriptionId: string
): Promise<boolean> {
  try {
    await stripe.subscriptions.cancel(subscriptionId);
    return true;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return false;
  }
}

/**
 * Get subscription status
 */
export async function getSubscriptionStatus(
  subscriptionId: string
): Promise<Stripe.Subscription.Status> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription.status;
}

