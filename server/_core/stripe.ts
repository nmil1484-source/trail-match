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
 * Create a Stripe subscription for shop premium listing
 */
export async function createShopSubscription(
  shopId: number,
  userId: number,
  tier: 'featured' | 'premium',
  customerEmail: string
): Promise<{ subscriptionId: string; clientSecret: string }> {
  // Price IDs - these need to be created in Stripe Dashboard
  const priceIds = {
    featured: process.env.STRIPE_FEATURED_PRICE_ID || 'price_featured_monthly',
    premium: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium_monthly',
  };

  // Create or retrieve customer
  const customers = await stripe.customers.list({
    email: customerEmail,
    limit: 1,
  });

  let customer;
  if (customers.data.length > 0) {
    customer = customers.data[0];
  } else {
    customer = await stripe.customers.create({
      email: customerEmail,
      metadata: {
        userId: userId.toString(),
        shopId: shopId.toString(),
      },
    });
  }

  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceIds[tier] }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
    metadata: {
      shopId: shopId.toString(),
      userId: userId.toString(),
      tier,
    },
  });

  const invoice = subscription.latest_invoice as Stripe.Invoice;
  const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

  return {
    subscriptionId: subscription.id,
    clientSecret: paymentIntent.client_secret!,
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

