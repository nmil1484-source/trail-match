-- Add Stripe subscription fields to shops table
ALTER TABLE shops 
ADD COLUMN IF NOT EXISTS stripeCustomerId VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripeSubscriptionId VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscriptionStatus VARCHAR(50) DEFAULT 'none';

-- Update existing shops to have 'none' status
UPDATE shops SET subscriptionStatus = 'none' WHERE subscriptionStatus IS NULL;
