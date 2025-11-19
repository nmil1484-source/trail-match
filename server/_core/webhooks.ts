import type { Request, Response } from "express";
import Stripe from "stripe";
import { getRawConnection } from "../db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("[Webhook] No stripe-signature header found");
    return res.status(400).send("No signature");
  }

  if (!endpointSecret) {
    console.error("[Webhook] STRIPE_WEBHOOK_SECRET not configured");
    return res.status(500).send("Webhook secret not configured");
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`[Webhook] Signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`[Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error(`[Webhook] Error processing event:`, error);
    res.status(500).send(`Webhook handler failed: ${error.message}`);
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`[Webhook] Checkout completed for session: ${session.id}`);
  
  const shopId = session.metadata?.shopId;
  const tier = session.metadata?.tier as "featured" | "premium";

  if (!shopId || !tier) {
    console.error("[Webhook] Missing shopId or tier in session metadata");
    return;
  }

  const connection = await getRawConnection();
  if (!connection) {
    console.error("[Webhook] Database connection not available");
    return;
  }

  // Update shop with customer and subscription IDs
  await connection.execute(
    `UPDATE shops 
     SET stripeCustomerId = ?, 
         stripeSubscriptionId = ?, 
         subscriptionStatus = 'active',
         premiumTier = ?
     WHERE id = ?`,
    [session.customer, session.subscription, tier, parseInt(shopId)]
  );

  console.log(`[Webhook] Shop ${shopId} upgraded to ${tier} tier`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`[Webhook] Subscription updated: ${subscription.id}, status: ${subscription.status}`);

  const connection = await getRawConnection();
  if (!connection) {
    console.error("[Webhook] Database connection not available");
    return;
  }

  // Find shop by subscription ID
  const result = await connection.execute(
    `SELECT id FROM shops WHERE stripeSubscriptionId = ?`,
    [subscription.id]
  );
  const rows = result[0] as any[];

  if (!rows || rows.length === 0) {
    console.error(`[Webhook] No shop found for subscription: ${subscription.id}`);
    return;
  }

  const shopId = rows[0].id;

  // Determine tier from subscription items
  let tier: "featured" | "premium" | "none" = "none";
  if (subscription.items.data.length > 0) {
    const priceId = subscription.items.data[0].price.id;
    if (priceId === process.env.STRIPE_FEATURED_PRICE_ID) {
      tier = "featured";
    } else if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
      tier = "premium";
    }
  }

  // Map Stripe status to our status
  let status = subscription.status;
  if (status === "trialing") {
    status = "active"; // Treat trial as active
  }

  // Update shop
  await connection.execute(
    `UPDATE shops 
     SET subscriptionStatus = ?,
         premiumTier = ?
     WHERE id = ?`,
    [status, tier, shopId]
  );

  console.log(`[Webhook] Shop ${shopId} subscription updated: ${status}, tier: ${tier}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`[Webhook] Subscription deleted: ${subscription.id}`);

  const connection = await getRawConnection();
  if (!connection) {
    console.error("[Webhook] Database connection not available");
    return;
  }

  // Find shop by subscription ID
  const result = await connection.execute(
    `SELECT id FROM shops WHERE stripeSubscriptionId = ?`,
    [subscription.id]
  );
  const rows = result[0] as any[];

  if (!rows || rows.length === 0) {
    console.error(`[Webhook] No shop found for subscription: ${subscription.id}`);
    return;
  }

  const shopId = rows[0].id;

  // Downgrade shop to free tier
  await connection.execute(
    `UPDATE shops 
     SET subscriptionStatus = 'canceled',
         premiumTier = 'none'
     WHERE id = ?`,
    [shopId]
  );

  console.log(`[Webhook] Shop ${shopId} downgraded to free tier`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`[Webhook] Payment succeeded for invoice: ${invoice.id}`);

  if (!invoice.subscription) {
    return; // Not a subscription payment
  }

  const connection = await getRawConnection();
  if (!connection) {
    console.error("[Webhook] Database connection not available");
    return;
  }

  // Find shop by subscription ID
  const result = await connection.execute(
    `SELECT id FROM shops WHERE stripeSubscriptionId = ?`,
    [invoice.subscription]
  );
  const rows = result[0] as any[];

  if (!rows || rows.length === 0) {
    console.error(`[Webhook] No shop found for subscription: ${invoice.subscription}`);
    return;
  }

  const shopId = rows[0].id;

  // Ensure subscription is active
  await connection.execute(
    `UPDATE shops 
     SET subscriptionStatus = 'active'
     WHERE id = ?`,
    [shopId]
  );

  console.log(`[Webhook] Shop ${shopId} payment succeeded, subscription active`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`[Webhook] Payment failed for invoice: ${invoice.id}`);

  if (!invoice.subscription) {
    return; // Not a subscription payment
  }

  const connection = await getRawConnection();
  if (!connection) {
    console.error("[Webhook] Database connection not available");
    return;
  }

  // Find shop by subscription ID
  const result = await connection.execute(
    `SELECT id FROM shops WHERE stripeSubscriptionId = ?`,
    [invoice.subscription]
  );
  const rows = result[0] as any[];

  if (!rows || rows.length === 0) {
    console.error(`[Webhook] No shop found for subscription: ${invoice.subscription}`);
    return;
  }

  const shopId = rows[0].id;

  // Mark subscription as past_due
  await connection.execute(
    `UPDATE shops 
     SET subscriptionStatus = 'past_due'
     WHERE id = ?`,
    [shopId]
  );

  console.log(`[Webhook] Shop ${shopId} payment failed, subscription past_due`);
}
