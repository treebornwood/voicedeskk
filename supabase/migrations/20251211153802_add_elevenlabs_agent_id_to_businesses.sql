/*
  # Add ElevenLabs Agent ID to Businesses

  1. Changes
    - Add `elevenlabs_agent_id` column to `businesses` table
    - This allows each business to have its own AI voice agent

  2. Details
    - Column is optional (nullable) so existing businesses work
    - Stores the ElevenLabs agent ID string
*/

ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS elevenlabs_agent_id text;

COMMENT ON COLUMN businesses.elevenlabs_agent_id IS 'ElevenLabs Conversational AI agent ID for this business';
