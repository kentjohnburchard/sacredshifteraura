/*
  # Frequency Blueprint Enhancements

  1. New Tables
    - `frequency_signatures` - Stores user frequency analysis results
    - `archetype_activations` - Stores tarot archetype activations
    - `soul_journey_sessions` - Records soul journey meditation sessions
  
  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
*/

-- Create frequency signatures table
CREATE TABLE IF NOT EXISTS frequency_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dominant_frequency numeric NOT NULL,
  harmonic_pattern jsonb NOT NULL DEFAULT '{}',
  chakra_alignment jsonb NOT NULL DEFAULT '{}',
  resonance_score integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE frequency_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own frequency signatures"
  ON frequency_signatures
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create archetype activations table
CREATE TABLE IF NOT EXISTS archetype_activations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  archetype_key text NOT NULL,
  archetype_name text NOT NULL,
  activation_date timestamptz DEFAULT now(),
  frequency_hz numeric,
  chakra_resonance text,
  activation_notes text,
  wisdom_received text,
  integration_level integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE archetype_activations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own archetype activations"
  ON archetype_activations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create soul journey sessions table
CREATE TABLE IF NOT EXISTS soul_journey_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  journey_type text NOT NULL,
  frequencies_used numeric[] DEFAULT '{}'::numeric[],
  duration_minutes integer NOT NULL DEFAULT 0,
  consciousness_expansion_level integer,
  insights_gained text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE soul_journey_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own soul journey sessions"
  ON soul_journey_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Add trigger for updated_at functionality
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_frequency_signatures_updated_at
BEFORE UPDATE ON frequency_signatures
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();