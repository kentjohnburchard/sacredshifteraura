/*
  # Module State Cloud Sync Schema

  1. New Tables
    - `module_states`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `module_id` (text, module identifier)
      - `enabled` (boolean, module enabled state)
      - `settings` (jsonb, module-specific settings)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_preferences`
      - `id` (uuid, primary key)  
      - `user_id` (uuid, foreign key to auth.users)
      - `preference_key` (text, preference identifier)
      - `preference_value` (jsonb, preference data)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `module_analytics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users) 
      - `module_id` (text, module identifier)
      - `event_type` (text, analytics event type)
      - `event_data` (jsonb, event payload)
      - `timestamp` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
    - Add policies for analytics collection

  3. Real-time Features  
    - Enable real-time subscriptions for module_states
    - Enable real-time subscriptions for user_preferences
*/

-- Module States Table
CREATE TABLE IF NOT EXISTS module_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_key text NOT NULL,
  preference_value jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, preference_key)
);

-- Module Analytics Table
CREATE TABLE IF NOT EXISTS module_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id text NOT NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  timestamp timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE module_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_analytics ENABLE ROW LEVEL SECURITY;

-- Module States Policies
CREATE POLICY "Users can manage their own module states"
  ON module_states
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- User Preferences Policies  
CREATE POLICY "Users can manage their own preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Analytics Policies
CREATE POLICY "Users can insert their own analytics"
  ON module_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own analytics"
  ON module_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_module_states_user_id ON module_states(user_id);
CREATE INDEX IF NOT EXISTS idx_module_states_module_id ON module_states(module_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(preference_key);
CREATE INDEX IF NOT EXISTS idx_module_analytics_user_id ON module_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_module_analytics_module_id ON module_analytics(module_id);
CREATE INDEX IF NOT EXISTS idx_module_analytics_timestamp ON module_analytics(timestamp);

-- Updated timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_module_states_updated_at
  BEFORE UPDATE ON module_states
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences  
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();