/*
  # Allow Multiple Businesses Per User

  ## Changes
  - Removes the UNIQUE constraint from clerk_user_id column on businesses table
  - This allows a single user (identified by clerk_user_id) to own multiple businesses
  - Each business still has its own unique slug for public URLs

  ## Reason
  Users need to be able to manage multiple businesses from a single account,
  with each business having its own AI agent, content, and bookings.
*/

-- Remove the unique constraint on clerk_user_id to allow multiple businesses per user
ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_clerk_user_id_key;
