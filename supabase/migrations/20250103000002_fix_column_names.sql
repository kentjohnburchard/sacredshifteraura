-- Fix column name mismatches in tables

-- Fix archetype_activations table - the application expects these exact column names
ALTER TABLE archetype_activations 
  ALTER COLUMN activation_notes TYPE text,
  ALTER COLUMN wisdom_received TYPE text;

-- Ensure all expected columns exist with correct names
DO $$
BEGIN
  -- Check if activation_date column exists, if not add it
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'archetype_activations' AND column_name = 'activation_date') THEN
    ALTER TABLE archetype_activations ADD COLUMN activation_date timestamptz DEFAULT now();
  END IF;
END $$;

-- Update the RLS policy to be more permissive for archetype_activations
DROP POLICY IF EXISTS "Users can manage their own archetype activations" ON archetype_activations;
CREATE POLICY "Users can manage their own archetype activations" 
  ON archetype_activations FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Also ensure the frequency_signatures table has the right structure
-- The application expects chakra_alignment and harmonic_pattern as jsonb
ALTER TABLE frequency_signatures 
  ALTER COLUMN chakra_alignment TYPE jsonb USING chakra_alignment::jsonb,
  ALTER COLUMN harmonic_pattern TYPE jsonb USING harmonic_pattern::jsonb;

-- Update soul_journey_sessions to match expected structure
-- The application expects frequencies_used as numeric array
ALTER TABLE soul_journey_sessions 
  ALTER COLUMN frequencies_used TYPE numeric[] USING frequencies_used::numeric[];

-- Add any missing indexes
CREATE INDEX IF NOT EXISTS idx_archetype_activations_archetype_key ON archetype_activations(archetype_key);
CREATE INDEX IF NOT EXISTS idx_frequency_signatures_dominant_frequency ON frequency_signatures(dominant_frequency);
CREATE INDEX IF NOT EXISTS idx_soul_journey_sessions_journey_type ON soul_journey_sessions(journey_type);
