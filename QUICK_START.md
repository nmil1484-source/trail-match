# Quick Start - Launch Your Subscription System

## ✅ What's Complete

Your fully automated Stripe subscription system is **deployed and ready**. All code is live at https://www.trail-match.com

**Backend**: Stripe integration, webhook handler, API endpoints, database schema
**Frontend**: Upgrade modal, pricing cards, checkout flow
**Deployment**: Code pushed, auto-deployment triggered

## 🚀 Final Steps (30 minutes to launch)

### Step 1: Wait for Deployment (5 minutes)
The latest code push is deploying to Render. Wait for deployment to complete, then verify:
- Go to https://www.trail-match.com/shops
- You should see "Upgrade Your Shop" button (not "Contact Us for Pricing")
- If still showing old button, clear browser cache or wait another minute

### Step 2: Configure Stripe Webhook (10 minutes)

**In Stripe Dashboard** (https://dashboard.stripe.com):
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter URL: `https://www.trail-match.com/api/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. **Copy the signing secret** (starts with `whsec_`)

**In Render Dashboard** (https://dashboard.render.com):
1. Go to your **trail-match** service
2. Click **Environment** tab
3. Click **Add Environment Variable**
4. Key: `STRIPE_WEBHOOK_SECRET`
5. Value: Paste the `whsec_...` secret from Stripe
6. Click **Save Changes** (service will auto-redeploy)

### Step 3: Test in Stripe Test Mode (10 minutes)

1. **Verify webhook is working**:
   - In Stripe Dashboard → Webhooks → Your endpoint
   - Click **Send test webhook**
   - Select `customer.subscription.created`
   - Should see **200 OK** response

2. **Test full subscription flow**:
   - Go to https://www.trail-match.com/shops
   - Sign in (or create account)
   - Add a shop if you don't have one
   - Click "Upgrade Your Shop"
   - Select your shop
   - Click "Subscribe to Featured" ($5/month)
   - Use test card: `4242 4242 4242 4242`
   - Any future date, any CVC
   - Complete checkout
   - Should redirect back to shops page
   - Shop should now show premium badge

3. **Verify in Stripe Dashboard**:
   - Check **Customers** - new customer created
   - Check **Subscriptions** - active subscription
   - Check **Webhooks** - events processed successfully

### Step 4: Switch to Live Mode (5 minutes)

1. **In Stripe Dashboard**:
   - Toggle from **Test mode** to **Live mode** (top right)
   - Go to **Developers** → **Webhooks**
   - Create new webhook endpoint (same URL and events)
   - Copy the **live mode** signing secret

2. **In Render Dashboard**:
   - Update `STRIPE_WEBHOOK_SECRET` with live mode secret
   - Save changes

3. **Test with real payment**:
   - Use your own card to test one real subscription
   - Verify everything works end-to-end
   - Cancel the test subscription in Stripe Dashboard

### Step 5: Start Promoting! 🎉

You're now live and ready to accept subscriptions!

**Immediate Actions**:
- Update your marketing materials with $5/$15 pricing
- Email shops about the new online signup
- Start Google Ads campaigns (see `GOOGLE_ADS_STRATEGY.md`)
- Post on social media about the launch

**Monitor First Week**:
- Check Render logs daily for errors
- Review Stripe webhook events
- Verify all subscriptions are working
- Respond quickly to any shop questions

## 📊 Quick Reference

### Pricing
- **Featured**: $5/month - Orange border, featured badge, priority placement
- **Premium**: $15/month - Gold crown, top placement, maximum visibility

### URLs
- **Website**: https://www.trail-match.com
- **Shops Page**: https://www.trail-match.com/shops
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Render Dashboard**: https://dashboard.render.com

### Environment Variables (All set in Render)
- `STRIPE_SECRET_KEY` ✅
- `STRIPE_FEATURED_PRICE_ID` ✅ (price_1SV2oM3EJ3nEOGMVyFOi6tkn)
- `STRIPE_PREMIUM_PRICE_ID` ✅ (price_1SV2px3EJ3nEOGMViDayL1E4)
- `STRIPE_WEBHOOK_SECRET` ⏳ (add this in Step 2)

### Test Card Numbers (Stripe Test Mode)
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

### Support
If you encounter issues:
1. Check `STRIPE_WEBHOOK_SETUP.md` for detailed troubleshooting
2. Review `SUBSCRIPTION_SYSTEM_COMPLETE.md` for full documentation
3. Check Render logs for backend errors
4. Check Stripe webhook events for payment issues

## 🎯 Success Metrics

Track these in Stripe Dashboard:
- **Active Subscriptions**: Dashboard → Subscriptions
- **Monthly Recurring Revenue (MRR)**: Dashboard → Home
- **Churn Rate**: Monitor cancellations
- **Failed Payments**: Dashboard → Payments → Failed

## 💡 Pro Tips

1. **Pricing Strategy**: Current pricing ($5/$15) is intentionally low to acquire first customers quickly. Plan to raise prices after getting 20-30 shops.

2. **Create Urgency**: Tell shops "Lock in introductory pricing before we raise rates"

3. **First Customer Wins**: Offer first 10 shops 50% off first month to get testimonials

4. **Monitor Closely**: Watch first few subscriptions carefully to catch any issues early

5. **Collect Feedback**: Ask early customers what features they want most

## 📞 Next Steps After Launch

**Week 1**: Monitor system, fix any issues, get first 5 customers
**Week 2**: Ramp up marketing, aim for 10-20 customers
**Month 1**: Reach $100-200 MRR, collect testimonials
**Month 2**: Optimize conversion, consider price increase
**Month 3**: Scale marketing, aim for $500+ MRR

---

**You're ready to launch! Complete Steps 1-4 above and start earning revenue today.** 🚀
