ALTER TABLE public.families ADD COLUMN plan text NOT NULL DEFAULT 'free';

-- Add a column to track the Stripe payment session for the upgrade
ALTER TABLE public.families ADD COLUMN stripe_payment_id text;