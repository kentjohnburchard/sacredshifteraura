/*
  # Unity Engine Schema

  1. New Tables
    - `unity_vision_nodes` - Stores vision nodes created by users
    - `unity_connections` - Links between vision nodes
    - `unity_interactions` - Cross-pollination interactions between users
    - `unity_coherence_evaluations` - Evaluations of content coherence
    - `unity_resonance_patterns` - Common patterns discovered across the community

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
    - Add policies for reading shared/public content
*/

-- Vision Nodes table
CREATE TABLE IF NOT EXISTS unity_vision_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  frequency_hz numeric DEFAULT 528, -- Default to 528Hz (transformation frequency)
  chakra_alignment text,
  is_public boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  sacred_geometry_pattern text DEFAULT 'flower_of_life',
  media_url text,
  location jsonb DEFAULT '{}',
  resonance_score integer DEFAULT 0, -- 0-100 score
  visualization_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Connections between nodes
CREATE TABLE IF NOT EXISTS unity_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id uuid REFERENCES unity_vision_nodes(id) ON DELETE CASCADE NOT NULL,
  target_node_id uuid REFERENCES unity_vision_nodes(id) ON DELETE CASCADE NOT NULL,
  connection_type text NOT NULL, -- inspiration, evolution, contrast, harmony, etc.
  connection_strength integer DEFAULT 50, -- 0-100
  connection_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(source_node_id, target_node_id)
);

-- Cross-pollination interactions
CREATE TABLE IF NOT EXISTS unity_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  node_id uuid REFERENCES unity_vision_nodes(id) ON DELETE CASCADE NOT NULL,
  interaction_type text NOT NULL, -- resonate, amplify, evolve, question, etc.
  interaction_content text,
  resonance_level integer DEFAULT 0, -- 0-100
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Coherence evaluations
CREATE TABLE IF NOT EXISTS unity_coherence_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id uuid REFERENCES unity_vision_nodes(id) ON DELETE CASCADE NOT NULL,
  evaluator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  unity_score integer DEFAULT 0, -- 0-100 (how much it brings people together)
  authenticity_score integer DEFAULT 0, -- 0-100
  constructiveness_score integer DEFAULT 0, -- 0-100
  overall_coherence_score integer DEFAULT 0, -- 0-100
  evaluation_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Resonance patterns
CREATE TABLE IF NOT EXISTS unity_resonance_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_name text NOT NULL,
  pattern_description text,
  frequency_range jsonb DEFAULT '{"min": 0, "max": 1000}',
  chakras_involved text[] DEFAULT '{}',
  tags_involved text[] DEFAULT '{}',
  node_count integer DEFAULT 0,
  user_count integer DEFAULT 0,
  coherence_score integer DEFAULT 0,
  pattern_visualization jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vision board collections
CREATE TABLE IF NOT EXISTS unity_vision_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  timeline_start timestamptz,
  timeline_end timestamptz,
  is_public boolean DEFAULT false,
  board_theme text DEFAULT 'cosmic',
  board_layout jsonb DEFAULT '{}',
  nodes uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE unity_vision_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE unity_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE unity_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE unity_coherence_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE unity_resonance_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE unity_vision_boards ENABLE ROW LEVEL SECURITY;

-- Policies for vision nodes
CREATE POLICY "Users can manage their own vision nodes"
  ON unity_vision_nodes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view public vision nodes"
  ON unity_vision_nodes
  FOR SELECT
  TO authenticated
  USING (is_public = true);

-- Policies for connections
CREATE POLICY "Users can manage connections to or from their nodes"
  ON unity_connections
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM unity_vision_nodes 
      WHERE id = source_node_id AND user_id = auth.uid()
    ) OR 
    EXISTS (
      SELECT 1 FROM unity_vision_nodes 
      WHERE id = target_node_id AND user_id = auth.uid()
    )
  );

-- Policies for interactions
CREATE POLICY "Users can create their own interactions"
  ON unity_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own interactions"
  ON unity_interactions
  FOR UPDATE OR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view interactions on public nodes"
  ON unity_interactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM unity_vision_nodes 
      WHERE id = node_id AND (is_public = true OR user_id = auth.uid())
    )
  );

-- Policies for coherence evaluations
CREATE POLICY "Anyone can create coherence evaluations"
  ON unity_coherence_evaluations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = evaluator_id);

CREATE POLICY "Anyone can view coherence evaluations"
  ON unity_coherence_evaluations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM unity_vision_nodes 
      WHERE id = node_id AND (is_public = true OR user_id = auth.uid())
    )
  );

-- Policies for resonance patterns
CREATE POLICY "Anyone can view resonance patterns"
  ON unity_resonance_patterns
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for vision boards
CREATE POLICY "Users can manage their own vision boards"
  ON unity_vision_boards
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view public vision boards"
  ON unity_vision_boards
  FOR SELECT
  TO authenticated
  USING (is_public = true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_unity_vision_nodes_user_id ON unity_vision_nodes(user_id);
CREATE INDEX IF NOT EXISTS idx_unity_vision_nodes_frequency ON unity_vision_nodes(frequency_hz);
CREATE INDEX IF NOT EXISTS idx_unity_vision_nodes_chakra ON unity_vision_nodes(chakra_alignment);
CREATE INDEX IF NOT EXISTS idx_unity_vision_nodes_tags ON unity_vision_nodes USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_unity_vision_nodes_public ON unity_vision_nodes(is_public) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_unity_connections_source ON unity_connections(source_node_id);
CREATE INDEX IF NOT EXISTS idx_unity_connections_target ON unity_connections(target_node_id);
CREATE INDEX IF NOT EXISTS idx_unity_connections_type ON unity_connections(connection_type);

CREATE INDEX IF NOT EXISTS idx_unity_interactions_user_id ON unity_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_unity_interactions_node_id ON unity_interactions(node_id);
CREATE INDEX IF NOT EXISTS idx_unity_interactions_type ON unity_interactions(interaction_type);

CREATE INDEX IF NOT EXISTS idx_unity_coherence_node_id ON unity_coherence_evaluations(node_id);
CREATE INDEX IF NOT EXISTS idx_unity_coherence_score ON unity_coherence_evaluations(overall_coherence_score);

CREATE INDEX IF NOT EXISTS idx_unity_vision_boards_user_id ON unity_vision_boards(user_id);
CREATE INDEX IF NOT EXISTS idx_unity_vision_boards_public ON unity_vision_boards(is_public) WHERE is_public = true;

-- Triggers for updated_at
CREATE TRIGGER update_unity_vision_nodes_updated_at
  BEFORE UPDATE ON unity_vision_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_unity_connections_updated_at
  BEFORE UPDATE ON unity_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_unity_interactions_updated_at
  BEFORE UPDATE ON unity_interactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_unity_coherence_updated_at
  BEFORE UPDATE ON unity_coherence_evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_unity_resonance_patterns_updated_at
  BEFORE UPDATE ON unity_resonance_patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_unity_vision_boards_updated_at
  BEFORE UPDATE ON unity_vision_boards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();