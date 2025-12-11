import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Default client for public/unauthenticated requests
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create an authenticated Supabase client with Clerk JWT token
export function createAuthenticatedClient(clerkToken: string): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
  });
}

export type Business = {
  id: string;
  clerk_user_id: string;
  business_name: string;
  business_type: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  slug: string;
  google_calendar_connected: boolean;
  google_calendar_id: string | null;
  google_refresh_token: string | null;
  elevenlabs_agent_id: string | null;
  is_live: boolean;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type BusinessContent = {
  id: string;
  business_id: string;
  content_type: string;
  original_filename: string | null;
  file_url: string | null;
  extracted_text: string | null;
  extracted_json: Record<string, any> | null;
  processed: boolean;
  created_at: string;
};

export type BusinessKnowledge = {
  id: string;
  business_id: string;
  knowledge_json: Record<string, any>;
  last_compiled: string;
};

export type Booking = {
  id: string;
  business_id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  service_requested: string;
  appointment_datetime: string;
  google_event_id: string | null;
  status: string;
  conversation_transcript: string | null;
  created_at: string;
};

export type Conversation = {
  id: string;
  business_id: string;
  started_at: string;
  ended_at: string | null;
  transcript: string | null;
  booking_made: boolean;
  booking_id: string | null;
};
