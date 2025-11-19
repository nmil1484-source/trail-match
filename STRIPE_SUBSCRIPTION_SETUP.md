# Stripe Subscription Setup Guide for Trail Match

**Status:** Backend functions added, ready for full implementation
**Estimated Time:** 2-3 hours

## What's Already Done

✅ **Beta banner added** - Subtle orange banner at top of site
✅ **Stripe subscription functions created** - Backend logic for subscriptions
✅ **Basic Stripe integration** - Already working for trip payments

## What You Need to Do

### Step 1: Create Products in Stripe Dashboard (15 minutes)

1. **Log in to your Stripe Dashboard:** https://dashboard.stripe.com
2. **Go to Products:** Click "Products" in the left sidebar
3. **Create Featured Product:**
   - Click "+ Add product"
   - Name: "Featured Shop Listing"
   - Description: "Get your shop featured with priority placement and special badge"
   - Pricing: $35.00 USD
   - Billing period: Monthly
   - Click "Save product"
   - **Copy the Price ID** (starts with `price_`) - you'll need this!

4. **Create Premium Product:**
   - Click "+ Add product" again
   - Name: "Premium Shop Listing"
   - Description: "Top placement with premium badge and enhanced visibility"
   - Pricing: $99.00 USD
   - Billing period: Monthly
   - Click "Save product"
   - **Copy the Price ID** (starts with `price_`)

### Step 2: Add Environment Variables to Render (5 minutes)

1. Go to your Render dashboard
2. Click on your "trail-match" service
3. Go to "Environment" tab
4. Add these two new variables:
   ```
   STRIPE_FEATURED_PRICE_ID=price_xxxxxxxxxxxxx
   STRIPE_PREMIUM_PRICE_ID=price_xxxxxxxxxxxxx
   ```
   (Replace with your actual Price IDs from Step 1)
5. Click "Save Changes"

### Step 3: Update Database Schema (10 minutes)

Run this SQL command to add subscription tracking fields to your shops table:

```sql
ALTER TABLE shops 
ADD COLUMN stripeCustomerId VARCHAR(255),
ADD COLUMN stripeSubscriptionId VARCHAR(255),
ADD COLUMN subscriptionStatus VARCHAR(50) DEFAULT 'none';
```

You can run this via:
- Railway dashboard SQL console, OR
- MySQL command line

### Step 4: Set Up Stripe Webhook (20 minutes)

Webhooks allow Stripe to notify your app when subscriptions are renewed, canceled, or payment fails.

1. **In Stripe Dashboard:**
   - Go to "Developers" → "Webhooks"
   - Click "+ Add endpoint"
   - Endpoint URL: `https://trail-match.onrender.com/api/stripe/webhook`
   - Description: "Trail Match subscription events"
   - Select events to listen to:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Click "Add endpoint"
   - **Copy the Signing Secret** (starts with `whsec_`)

2. **Add to Render Environment:**
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### Step 5: Create API Endpoints (Need Help)

This requires adding new routes to your backend. I can help you with this! The endpoints needed are:

- `POST /api/shops/:id/subscribe` - Start a subscription
- `POST /api/shops/:id/cancel-subscription` - Cancel a subscription
- `POST /api/stripe/webhook` - Handle Stripe events
- `GET /api/shops/:id/subscription-status` - Check subscription status

### Step 6: Build Frontend Checkout UI (Need Help)

This requires:
- Installing `@stripe/stripe-js` package
- Creating a checkout component
- Adding "Upgrade to Featured/Premium" buttons to shop detail page
- Handling payment confirmation

## Simplified Alternative: Manual Subscriptions

If you want to start earning money **immediately** without all this complexity, you can:

1. **Use Stripe Payment Links:**
   - Create payment links in Stripe Dashboard for $35 and $99 monthly subscriptions
   - Send these links to shops via email
   - Manually upgrade shops in your admin panel when they pay

2. **Pros:**
   - Can start today
   - No code changes needed
   - Simple to manage initially

3. **Cons:**
   - Manual work for each shop
   - Not scalable long-term
   - No automated billing

## My Recommendation

**For now (next 1-2 weeks):**
- Use Stripe Payment Links for your first 5-10 shops
- Focus on sales and marketing
- Validate that shops will actually pay

**After you have 10+ paying shops:**
- Implement full automated subscriptions
- I can help you complete Steps 5 & 6
- This will save you time and scale better

## What's Next?

Let me know if you want to:
1. **Go full automation now** - I'll help you complete Steps 5 & 6
2. **Start with payment links** - I'll show you how to set those up
3. **Wait and focus on marketing first** - Come back to this later

The beta banner is already live on your site! 🎉
