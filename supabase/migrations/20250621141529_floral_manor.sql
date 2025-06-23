-- Divine Timeline tables

-- Timeline nodes table
CREATE TABLE IF NOT EXISTS timeline_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  timeline_position text NOT NULL CHECK (timeline_position IN ('past', 'present', 'future')),
  probability integer NOT NULL CHECK (probability >= 0 AND probability <= 100),
  consciousness_level integer NOT NULL CHECK (consciousness_level >= 0 AND consciousness_level <= 100),
  chakra_focus text NOT NULL,
  time_distance integer NOT NULL, -- Days from present (negative=past, 0=present, positive=future)
  guidance text,
  parent_node_id uuid REFERENCES timeline_nodes(id) ON DELETE SET NULL,
  is_pivot_point boolean NOT NULL DEFAULT false,
  is_activated boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE timeline_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own timeline nodes"
  ON timeline_nodes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_timeline_nodes_user_id ON timeline_nodes(user_id);
CREATE INDEX idx_timeline_nodes_position ON timeline_nodes(timeline_position);
CREATE INDEX idx_timeline_nodes_activated ON timeline_nodes(is_activated);

-- Timeline paths table
CREATE TABLE IF NOT EXISTS timeline_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  nodes uuid[] NOT NULL,
  probability integer NOT NULL CHECK (probability >= 0 AND probability <= 100),
  path_type text NOT NULL CHECK (path_type IN ('optimal', 'challenge', 'shadow', 'transcendent')),
  consciousness_delta integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE timeline_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own timeline paths"
  ON timeline_paths
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_timeline_paths_user_id ON timeline_paths(user_id);
CREATE INDEX idx_timeline_paths_type ON timeline_paths(path_type);

-- Timeline reflections table
CREATE TABLE IF NOT EXISTS timeline_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  node_id uuid REFERENCES timeline_nodes(id) ON DELETE CASCADE NOT NULL,
  reflection_text text NOT NULL,
  consciousness_shift integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE timeline_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own timeline reflections"
  ON timeline_reflections
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_timeline_reflections_user_id ON timeline_reflections(user_id);
CREATE INDEX idx_timeline_reflections_node_id ON timeline_reflections(node_id);

-- Timeline activations table
CREATE TABLE IF NOT EXISTS timeline_activations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  node_id uuid REFERENCES timeline_nodes(id) ON DELETE CASCADE NOT NULL,
  activation_type text NOT NULL CHECK (activation_type IN ('intention', 'meditation', 'synchronicity', 'insight')),
  activation_details text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE timeline_activations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own timeline activations"
  ON timeline_activations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_timeline_activations_user_id ON timeline_activations(user_id);
CREATE INDEX idx_timeline_activations_node_id ON timeline_activations(node_id);