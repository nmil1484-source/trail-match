# Premium Shop Advertising - Pricing & Payment Guide

## Overview
Trail Match offers premium shop listings to help off-road shops get more visibility and attract more customers.

## Premium Tiers

### 1. **Verified** (Free)
- Blue checkmark badge ✓
- Builds trust with customers
- Manual approval by admin
- **How to get it:** Shop owners email you requesting verification, you review and approve

### 2. **Featured** ($XX/month)
- Orange border around listing
- Appears before regular listings (after Premium)
- All Verified benefits
- **Recommended pricing:** $25-50/month

### 3. **Premium** ($XX/month)
- Gold crown badge 👑
- Gold border around listing
- Top placement (appears first)
- All Verified benefits
- **Recommended pricing:** $75-150/month

## Payment Workflow Options

### Option 1: Simple Email + Manual Payment (Recommended for Start)
**Pros:** Easy to set up, no technical integration needed
**Cons:** Manual work for each transaction

**Process:**
1. Shop owner clicks "Contact Us for Pricing" button on shops page
2. Email opens to: `contact@trail-match.com` with subject "Premium Shop Listing Inquiry"
3. You respond with pricing and payment options:
   - Venmo
   - PayPal
   - Zelle
   - Check/Cash
4. Once paid, you manually upgrade them in the admin panel
5. Set expiration date (e.g., 30 days from payment)

**Email Template to Send:**
```
Hi [Shop Name],

Thanks for your interest in premium shop listings on Trail Match!

Here are our pricing tiers:

**Featured Listing - $XX/month**
- Orange border highlighting
- Priority placement (appears before regular shops)
- Verified badge

**Premium Listing - $XX/month**
- Gold crown badge
- Gold border highlighting
- TOP placement (appears first)
- Verified badge

Payment options:
- Venmo: @your-venmo
- PayPal: your@email.com
- Zelle: your@email.com

Once payment is received, I'll upgrade your listing within 24 hours!

Let me know if you have any questions.

Best,
[Your Name]
Trail Match
```

### Option 2: Stripe Payment Links (Semi-Automated)
**Pros:** Professional, automatic payment processing
**Cons:** Stripe fees (2.9% + $0.30 per transaction)

**Setup:**
1. Create Stripe account (you already have Stripe keys in the app)
2. Create Payment Links in Stripe dashboard:
   - Featured Monthly: $XX/month recurring
   - Premium Monthly: $XX/month recurring
3. Update the banner button to link to Stripe payment page
4. After payment, customer emails you their shop name
5. You manually upgrade them in admin panel

**Future:** Could automate with webhooks to auto-upgrade after payment

### Option 3: Full Stripe Integration (Future Enhancement)
**Pros:** Fully automated, professional
**Cons:** Requires development work

**Features:**
- Shop owners can upgrade directly from their shop page
- Automatic tier assignment after payment
- Automatic expiration and renewal
- Email notifications
- Invoice generation

## Managing Premium Shops

### In Admin Panel (already built):
1. Go to `/admin/shops`
2. Find the shop
3. Click "Set Premium" or "Toggle Verified"
4. For Premium/Featured:
   - Select tier (Featured or Premium)
   - Set expiration date (e.g., 30 days from today)
5. Click Save

### Tracking Renewals:
- Keep a spreadsheet with:
  - Shop name
  - Tier
  - Payment date
  - Expiration date
  - Payment method
  - Amount paid
- Set calendar reminders 7 days before expiration to send renewal emails

## Suggested Pricing Strategy

### Market Research:
- Yelp Ads: $300-1000/month
- Google Business Profile Ads: $50-500/month
- Local directory listings: $20-100/month

### Recommended Trail Match Pricing:
- **Featured:** $35/month ($350/year if paid annually)
- **Premium:** $99/month ($999/year if paid annually)

### Discounts:
- 10% off for 6-month prepay
- 15% off for annual prepay
- First month free for early adopters

## Contact Information to Update

Update the email in the banner to your preferred contact email:
- Currently set to: `contact@trail-match.com`
- Update in: `/trail-match/client/src/pages/Shops.tsx` line 141

## Next Steps

1. **Decide on pricing** - Update "$XX/month" in the banner
2. **Set up payment method** - Choose Venmo/PayPal/Stripe
3. **Create email template** - Save for quick responses
4. **Test the flow** - Have someone click the button and go through the process
5. **Promote to existing shops** - Email shops already listed to offer upgrade
6. **Track in spreadsheet** - Monitor renewals and revenue

## Future Enhancements

- Automated Stripe integration
- Self-service upgrade portal
- Analytics dashboard for shop owners
- A/B testing different pricing
- Promotional codes/discounts
- Referral program (shop refers shop, both get discount)
