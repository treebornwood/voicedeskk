/*
  # VoiceDesk Platform Schema

  ## Overview
  Creates the complete database schema for VoiceDesk - a platform where businesses create 
  AI voice agents for customer interaction and appointment booking.

  ## Tables Created

  1. **businesses**
     - Stores business profiles and configuration
     - Links to Clerk authentication
     - Includes Google Calendar integration settings
     - Contains ElevenLabs agent configuration
     - Fields: id, clerk_user_id, business_name, business_type, description, phone, email, 
       address, slug, google_calendar_connected, google_calendar_id, google_refresh_token,
       elevenlabs_agent_id, created_at, updated_at

  2. **business_content**
     - Stores uploaded documents, URLs, and text content
     - Tracks processing status and extracted data
     - Links to parent business
     - Fields: id, business_id, content_type, original_filename, file_url, extracted_text,
       extracted_json, processed, created_at

  3. **business_knowledge**
     - Compiled knowledge base for each business agent
     - Combines all processed content into single source
     - Used by voice agent for responses
     - Fields: id, business_id, knowledge_json, last_compiled

  4. **bookings**
     - Stores appointment bookings made through voice agents
     - Links to Google Calendar events
     - Tracks customer information and booking status
     - Fields: id, business_id, customer_name, customer_phone, customer_email, 
       service_requested, appointment_datetime, google_event_id, status, 
       conversation_transcript, created_at

  5. **conversations**
     - Logs all customer-agent conversations
     - Used for analytics and improvement
     - Links to bookings if appointment was made
     - Fields: id, business_id, started_at, ended_at, transcript, booking_made, booking_id

  ## Security
  - RLS enabled on all tables
  - Businesses can only access their own data
  - Public read access for business profiles (for customer directory)
  - Authenticated-only write access for business owners
  - Anonymous read access for customer-facing content

  ## Indexes
  - Added on frequently queried fields for performance
  - Includes slug for fast business lookups
  - clerk_user_id for auth matching
*/

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT NOT NULL,
  business_name TEXT NOT NULL,
  business_type TEXT,
  description TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  slug TEXT UNIQUE NOT NULL,
  google_calendar_connected BOOLEAN DEFAULT FALSE,
  google_calendar_id TEXT,
  google_refresh_token TEXT,
  elevenlabs_agent_id TEXT,
  is_live BOOLEAN DEFAULT FALSE,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create business_content table
CREATE TABLE IF NOT EXISTS business_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT NOT NULL,
  original_filename TEXT,
  file_url TEXT,
  extracted_text TEXT,
  extracted_json JSONB,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create business_knowledge table
CREATE TABLE IF NOT EXISTS business_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE NOT NULL,
  knowledge_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_compiled TIMESTAMPTZ DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  service_requested TEXT NOT NULL,
  appointment_datetime TIMESTAMPTZ NOT NULL,
  google_event_id TEXT,
  status TEXT DEFAULT 'confirmed',
  conversation_transcript TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  transcript TEXT,
  booking_made BOOLEAN DEFAULT FALSE,
  booking_id UUID REFERENCES bookings(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_clerk_user_id ON businesses(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_business_content_business_id ON business_content(business_id);
CREATE INDEX IF NOT EXISTS idx_bookings_business_id ON bookings(business_id);
CREATE INDEX IF NOT EXISTS idx_bookings_datetime ON bookings(appointment_datetime);
CREATE INDEX IF NOT EXISTS idx_conversations_business_id ON conversations(business_id);

-- Enable Row Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for businesses table
-- Public can view live businesses (for directory)
CREATE POLICY "Anyone can view live businesses"
  ON businesses FOR SELECT
  USING (is_live = true);

-- Business owners can view their own business
CREATE POLICY "Business owners can view own business"
  ON businesses FOR SELECT
  TO authenticated
  USING (clerk_user_id = auth.jwt()->>'sub');

-- Business owners can insert their own business
CREATE POLICY "Business owners can create own business"
  ON businesses FOR INSERT
  TO authenticated
  WITH CHECK (clerk_user_id = auth.jwt()->>'sub');

-- Business owners can update their own business
CREATE POLICY "Business owners can update own business"
  ON businesses FOR UPDATE
  TO authenticated
  USING (clerk_user_id = auth.jwt()->>'sub')
  WITH CHECK (clerk_user_id = auth.jwt()->>'sub');

-- RLS Policies for business_content table
CREATE POLICY "Business owners can view own content"
  ON business_content FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = business_content.business_id 
      AND businesses.clerk_user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Business owners can insert own content"
  ON business_content FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = business_content.business_id 
      AND businesses.clerk_user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Business owners can update own content"
  ON business_content FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = business_content.business_id 
      AND businesses.clerk_user_id = auth.jwt()->>'sub'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = business_content.business_id 
      AND businesses.clerk_user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Business owners can delete own content"
  ON business_content FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = business_content.business_id 
      AND businesses.clerk_user_id = auth.jwt()->>'sub'
    )
  );

-- RLS Policies for business_knowledge table
CREATE POLICY "Business owners can view own knowledge"
  ON business_knowledge FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = business_knowledge.business_id 
      AND businesses.clerk_user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Business owners can insert own knowledge"
  ON business_knowledge FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = business_knowledge.business_id 
      AND businesses.clerk_user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Business owners can update own knowledge"
  ON business_knowledge FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = business_knowledge.business_id 
      AND businesses.clerk_user_id = auth.jwt()->>'sub'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = business_knowledge.business_id 
      AND businesses.clerk_user_id = auth.jwt()->>'sub'
    )
  );

-- RLS Policies for bookings table
CREATE POLICY "Business owners can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = bookings.business_id 
      AND businesses.clerk_user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Business owners can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = bookings.business_id 
      AND businesses.clerk_user_id = auth.jwt()->>'sub'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = bookings.business_id 
      AND businesses.clerk_user_id = auth.jwt()->>'sub'
    )
  );

-- RLS Policies for conversations table
CREATE POLICY "Business owners can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = conversations.business_id 
      AND businesses.clerk_user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Anyone can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (true);