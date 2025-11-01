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

