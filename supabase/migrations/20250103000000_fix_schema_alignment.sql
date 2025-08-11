-- Simple schema alignment migration
-- Creates missing tables and columns safely

-- Create update function first
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  bio text,
  website_url text,
  light_points bigint DEFAULT 0,
  light_level integer DEFAULT 1,
  ascension_title text DEFAULT 'Seeker',
  last_level_up timestamptz,
  consciousness_level integer DEFAULT 1,
  current_chakra_focus text DEFAULT 'heart',
  journey_stage text DEFAULT 'explorer',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sacred_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS sacred_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  event_type text NOT NULL DEFAULT 'gathering',
  scheduled_start timestamptz NOT NULL,
  scheduled_end timestamptz,
  location_type text DEFAULT 'virtual',
  location_details jsonb DEFAULT '{}',
  max_participants integer,
  current_participants integer DEFAULT 0,
  is_public boolean DEFAULT true,
  requires_approval boolean DEFAULT false,
  frequency_alignment numeric DEFAULT 528,
  chakra_focus text DEFAULT 'heart',
  sacred_geometry text DEFAULT 'circle',
  preparation_notes text,
  integration_notes text,
  event_status text DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create event_participants table if it doesn't exist
CREATE TABLE IF NOT EXISTS event_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES sacred_events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  participation_status text DEFAULT 'registered',
  registration_date timestamptz DEFAULT now(),
  attendance_confirmed_at timestamptz,
  feedback_rating integer CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_text text,
  UNIQUE(event_id, user_id)
);

-- Add missing columns to circles table
DO $$
BEGIN
  -- Add is_direct_message column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'circles' AND column_name = 'is_direct_message') THEN
    ALTER TABLE circles ADD COLUMN is_direct_message boolean DEFAULT false;
  END IF;
  
  -- Add direct_message_participants column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'circles' AND column_name = 'direct_message_participants') THEN
    ALTER TABLE circles ADD COLUMN direct_message_participants uuid[] DEFAULT '{}';
  END IF;
  
  -- Add other missing columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'circles' AND column_name = 'max_members') THEN
    ALTER TABLE circles ADD COLUMN max_members integer DEFAULT 100;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'circles' AND column_name = 'current_members') THEN
    ALTER TABLE circles ADD COLUMN current_members integer DEFAULT 1;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'circles' AND column_name = 'chakra_alignment') THEN
    ALTER TABLE circles ADD COLUMN chakra_alignment text DEFAULT 'heart';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'circles' AND column_name = 'frequency_resonance') THEN
    ALTER TABLE circles ADD COLUMN frequency_resonance numeric DEFAULT 639;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'circles' AND column_name = 'circle_type') THEN
    ALTER TABLE circles ADD COLUMN circle_type text DEFAULT 'general';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'circles' AND column_name = 'sacred_geometry') THEN
    ALTER TABLE circles ADD COLUMN sacred_geometry text DEFAULT 'circle';
  END IF;
END $$;

-- Create circle_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS circle_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid REFERENCES circles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now(),
  UNIQUE(circle_id, user_id)
);

-- Create sacred_blueprints table if it doesn't exist
CREATE TABLE IF NOT EXISTS sacred_blueprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  core_frequency numeric NOT NULL DEFAULT 528,
  elemental_resonance text NOT NULL DEFAULT 'balanced',
  chakra_signature numeric[] NOT NULL DEFAULT '{50,50,50,50,50,50,50}',
  emotional_profile text,
  shadow_frequencies text,
  blueprint_text jsonb NOT NULL DEFAULT '{}',
  astrological_synthesis text,
  evolutionary_stage text DEFAULT 'awakening',
  integration_level integer DEFAULT 0,
  last_analysis_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create LLM tables
CREATE TABLE IF NOT EXISTS llm_usage_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id text NOT NULL,
  model_used text NOT NULL,
  prompt_tokens integer DEFAULT 0,
  completion_tokens integer DEFAULT 0,
  total_tokens integer DEFAULT 0,
  request_type text NOT NULL,
  consciousness_alignment_score numeric(3,2),
  response_quality_score numeric(3,2),
  processing_time_ms integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS llm_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id text NOT NULL,
  model_used text NOT NULL,
  prompt_tokens integer DEFAULT 0,
  completion_tokens integer DEFAULT 0,
  total_tokens integer DEFAULT 0,
  request_metadata jsonb DEFAULT '{}',
  response_metadata jsonb DEFAULT '{}',
  error_details text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consciousness_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  context_name text NOT NULL,
  consciousness_level integer DEFAULT 1,
  current_chakra_focus text DEFAULT 'heart',
  journey_stage text DEFAULT 'explorer',
  recent_insights text[] DEFAULT '{}',
  current_intention text,
  shadow_work_progress integer DEFAULT 0,
  frequency_signature jsonb DEFAULT '{}',
  emotional_state jsonb DEFAULT '{}',
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_enhanced_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id text NOT NULL,
  enhancement_type text NOT NULL,
  input_data jsonb NOT NULL DEFAULT '{}',
  ai_response text NOT NULL,
  structured_insights jsonb DEFAULT '{}',
  consciousness_alignment_score numeric(3,2),
  resonance_frequency numeric,
  chakra_activation jsonb DEFAULT '{}',
  user_rating integer CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback text,
  is_bookmarked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_practice_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  practice_type text NOT NULL,
  practice_content text NOT NULL,
  duration_minutes integer,
  difficulty_level text DEFAULT 'beginner',
  chakra_focus text,
  frequency_alignment numeric,
  consciousness_context jsonb DEFAULT '{}',
  completion_count integer DEFAULT 0,
  average_rating numeric(3,2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacred_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacred_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE consciousness_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_enhanced_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_practice_recommendations ENABLE ROW LEVEL SECURITY;

-- Create basic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles FOR ALL TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage their own events" ON sacred_events;
CREATE POLICY "Users can manage their own events" ON sacred_events FOR ALL TO authenticated USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Users can manage their own participation" ON event_participants;
CREATE POLICY "Users can manage their own participation" ON event_participants FOR ALL TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own circle membership" ON circle_members;
CREATE POLICY "Users can manage their own circle membership" ON circle_members FOR ALL TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own blueprints" ON sacred_blueprints;
CREATE POLICY "Users can manage their own blueprints" ON sacred_blueprints FOR ALL TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own LLM data" ON llm_usage_metrics;
CREATE POLICY "Users can manage their own LLM data" ON llm_usage_metrics FOR ALL TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own LLM logs" ON llm_usage_logs;
CREATE POLICY "Users can manage their own LLM logs" ON llm_usage_logs FOR ALL TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own contexts" ON consciousness_contexts;
CREATE POLICY "Users can manage their own contexts" ON consciousness_contexts FOR ALL TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own insights" ON ai_enhanced_insights;
CREATE POLICY "Users can manage their own insights" ON ai_enhanced_insights FOR ALL TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own practices" ON ai_practice_recommendations;
CREATE POLICY "Users can manage their own practices" ON ai_practice_recommendations FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_sacred_events_creator ON sacred_events(creator_id);
CREATE INDEX IF NOT EXISTS idx_sacred_events_start ON sacred_events(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_circle ON circle_members(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_user ON circle_members(user_id);
CREATE INDEX IF NOT EXISTS idx_sacred_blueprints_user ON sacred_blueprints(user_id);
CREATE INDEX IF NOT EXISTS idx_llm_usage_user ON llm_usage_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_llm_logs_user ON llm_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_consciousness_user ON consciousness_contexts(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user ON ai_enhanced_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_practices_user ON ai_practice_recommendations(user_id);

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sacred_events_updated_at ON sacred_events;
CREATE TRIGGER update_sacred_events_updated_at BEFORE UPDATE ON sacred_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sacred_blueprints_updated_at ON sacred_blueprints;
CREATE TRIGGER update_sacred_blueprints_updated_at BEFORE UPDATE ON sacred_blueprints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_consciousness_contexts_updated_at ON consciousness_contexts;
CREATE TRIGGER update_consciousness_contexts_updated_at BEFORE UPDATE ON consciousness_contexts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_insights_updated_at ON ai_enhanced_insights;
CREATE TRIGGER update_ai_insights_updated_at BEFORE UPDATE ON ai_enhanced_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_practices_updated_at ON ai_practice_recommendations;
CREATE TRIGGER update_ai_practices_updated_at BEFORE UPDATE ON ai_practice_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
