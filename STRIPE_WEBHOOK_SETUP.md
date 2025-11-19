# Stripe Webhook Setup Guide

## Overview
The automated subscription system is now deployed and needs the Stripe webhook configured to handle subscription events.

## Steps to Complete Setup

### 1. Create Webhook in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. Click **Add endpoint**
4. Enter the endpoint URL:
   ```
   https://www.trail-match.com/api/stripe/webhook
   ```

### 2. Select Events to Listen For

Select the following events:

- ✅ `checkout.session.completed` - When customer completes checkout
- ✅ `customer.subscription.created` - When subscription is created
- ✅ `customer.subscription.updated` - When subscription status changes
- ✅ `customer.subscription.deleted` - When subscription is canceled
- ✅ `invoice.payment_succeeded` - When recurring payment succeeds
- ✅ `invoice.payment_failed` - When recurring payment fails

### 3. Get the Webhook Signing Secret

1. After creating the webhook, Stripe will show you the **Signing secret**
2. It will look like: `whsec_...`
3. **Copy this secret** - you'll need it for the next step

### 4. Add Webhook Secret to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your **trail-match** web service
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   - **Key**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: `whsec_...` (paste the signing secret from Stripe)
6. Click **Save Changes**

The service will automatically redeploy with the new environment variable.

## Testing the Webhook

### Test in Stripe Dashboard

1. In Stripe Dashboard → Webhooks
2. Click on your webhook endpoint
3. Click **Send test webhook**
4. Select an event like `customer.subscription.created`
5. Click **Send test webhook**
6. Check the response - should see `200 OK`

### Test with Real Subscription

1. Go to https://www.trail-match.com/shops
2. Sign in with your account
3. Click **Upgrade Your Shop** button
4. Select a shop to upgrade
5. Click **Subscribe to Featured** ($5/month)
6. Complete the Stripe Checkout flow
7. After payment, you should be redirected back to the shops page
8. The shop should now have the premium badge displayed

## Verifying Everything Works

### Check Database
After a successful subscription:
```sql
SELECT id, name, premiumTier, subscriptionStatus, stripeCustomerId, stripeSubscriptionId 
FROM shops 
WHERE premiumTier != 'none';
```

### Check Stripe Dashboard
1. Go to **Customers** - should see new customer created
2. Go to **Subscriptions** - should see active subscription
3. Go to **Webhooks** → Your endpoint → **Recent events** - should see successful events

### Check Render Logs
1. Go to Render Dashboard → Your service → **Logs**
2. Look for webhook event logs:
   ```
   [Webhook] Received event: checkout.session.completed
   [Webhook] Shop 123 upgraded to featured tier
   ```

## Troubleshooting

### Webhook Returns 400 Error
- Check that `STRIPE_WEBHOOK_SECRET` is correctly set in Render
- Verify the webhook URL is exactly `https://www.trail-match.com/api/stripe/webhook`
- Check Render logs for error details

### Subscription Created But Shop Not Upgraded
- Check Render logs for webhook processing errors
- Verify database connection is working
- Check that metadata (shopId, tier) is included in checkout session

### Payment Succeeds But No Redirect
- Check that success_url and cancel_url are correctly configured
- Verify the base URL matches your domain

## Environment Variables Checklist

Ensure all these are set in Render:

- ✅ `STRIPE_SECRET_KEY` - Your Stripe secret key
- ✅ `STRIPE_FEATURED_PRICE_ID` - Price ID for Featured tier (price_1SV2oM3EJ3nEOGMVyFOi6tkn)
- ✅ `STRIPE_PREMIUM_PRICE_ID` - Price ID for Premium tier (price_1SV2px3EJ3nEOGMViDayL1E4)
- ✅ `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (whsec_...)

## Next Steps After Setup

1. **Test the complete flow** with a real payment (use Stripe test mode)
2. **Verify badge display** on the shops listing page
3. **Test subscription cancellation** through Stripe Dashboard
4. **Monitor webhook events** for the first few days
5. **Start promoting** the premium shop listings to potential customers

## Support

If you encounter issues:
1. Check Render deployment logs
2. Check Stripe webhook event logs
3. Verify all environment variables are set
4. Test with Stripe test mode first before going live
