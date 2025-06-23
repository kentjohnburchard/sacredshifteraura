/*
  # Module Marketplace Schema

  1. New Tables
    - `marketplace_modules` - Published modules in the store
    - `module_reviews` - User ratings and reviews
    - `module_downloads` - Download tracking
    - `module_settings` - Per-module custom settings
    - `module_updates` - Version management and update tracking
    - `developer_profiles` - Module developer info

  2. Security
    - Enable RLS on all tables
    - Policies for CRUD operations based on user roles

  3. Analytics
    - Enhanced tracking for marketplace interactions
    - Performance metrics collection
*/

-- Developer profiles for module creators
CREATE TABLE IF NOT EXISTS developer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  developer_name text NOT NULL,
  bio text,
  website_url text,
  avatar_url text,
  verified boolean DEFAULT false,
  total_downloads bigint DEFAULT 0,
  total_modules integer DEFAULT 0,
  average_rating numeric(3,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Marketplace modules - the store catalog
CREATE TABLE IF NOT EXISTS marketplace_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id text UNIQUE NOT NULL,
  developer_id uuid REFERENCES developer_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  long_description text,
  version text NOT NULL DEFAULT '1.0.0',
  category text NOT NULL DEFAULT 'general',
  tags text[] DEFAULT '{}',
  capabilities text[] DEFAULT '{}',
  essence_labels text[] DEFAULT '{}',
  
  -- Marketplace specific fields
  price_cents integer DEFAULT 0, -- 0 = free
  is_featured boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  status text DEFAULT 'draft', -- draft, published, suspended
  
  -- Package info
  package_url text, -- URL to downloadable package
  manifest_data jsonb NOT NULL DEFAULT '{}',
  screenshots text[] DEFAULT '{}',
  demo_url text,
  
  -- Stats
  download_count bigint DEFAULT 0,
  rating_count integer DEFAULT 0,
  average_rating numeric(3,2) DEFAULT 0.00,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz,
  
  CONSTRAINT marketplace_modules_status_check CHECK (status IN ('draft', 'published', 'suspended')),
  CONSTRAINT marketplace_modules_category_check CHECK (category IN ('general', 'community', 'meditation', 'analytics', 'tools', 'games', 'productivity'))
);

-- Module reviews and ratings
CREATE TABLE IF NOT EXISTS module_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES marketplace_modules(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(module_id, user_id) -- One review per user per module
);

-- Download tracking
CREATE TABLE IF NOT EXISTS module_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES marketplace_modules(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  version text NOT NULL,
  download_source text DEFAULT 'marketplace', -- marketplace, auto-update, api
  user_agent text,
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

-- Per-module settings and configurations
CREATE TABLE IF NOT EXISTS module_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id text NOT NULL,
  setting_key text NOT NULL,
  setting_value jsonb NOT NULL DEFAULT '{}',
  setting_type text DEFAULT 'user', -- user, system, theme
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, module_id, setting_key)
);

-- Module updates and version management
CREATE TABLE IF NOT EXISTS module_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES marketplace_modules(id) ON DELETE CASCADE,
  version text NOT NULL,
  previous_version text,
  update_type text DEFAULT 'patch', -- major, minor, patch, hotfix
  changelog text,
  release_notes text,
  is_critical boolean DEFAULT false,
  is_auto_installable boolean DEFAULT true,
  package_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT module_updates_type_check CHECK (update_type IN ('major', 'minor', 'patch', 'hotfix'))
);

-- Enhanced analytics for marketplace
CREATE TABLE IF NOT EXISTS marketplace_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id text NOT NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  session_id text,
  page_url text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketplace_modules_category ON marketplace_modules(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_modules_status ON marketplace_modules(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_modules_featured ON marketplace_modules(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_marketplace_modules_rating ON marketplace_modules(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_modules_downloads ON marketplace_modules(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_modules_published_at ON marketplace_modules(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_module_reviews_module_id ON module_reviews(module_id);
CREATE INDEX IF NOT EXISTS idx_module_reviews_rating ON module_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_module_downloads_module_id ON module_downloads(module_id);
CREATE INDEX IF NOT EXISTS idx_module_downloads_created_at ON module_downloads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_module_settings_user_module ON module_settings(user_id, module_id);
CREATE INDEX IF NOT EXISTS idx_module_updates_module_version ON module_updates(module_id, version);
CREATE INDEX IF NOT EXISTS idx_marketplace_analytics_module_event ON marketplace_analytics(module_id, event_type);
CREATE INDEX IF NOT EXISTS idx_marketplace_analytics_created_at ON marketplace_analytics(created_at DESC);

-- Enable Row Level Security
ALTER TABLE developer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for developer_profiles
CREATE POLICY "Developers can manage their own profile"
  ON developer_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view developer profiles"
  ON developer_profiles
  FOR SELECT
  TO public
  USING (true);

-- RLS Policies for marketplace_modules
CREATE POLICY "Developers can manage their own modules"
  ON marketplace_modules
  FOR ALL
  TO authenticated
  USING (developer_id IN (
    SELECT id FROM developer_profiles WHERE user_id = auth.uid()
  ))
  WITH CHECK (developer_id IN (
    SELECT id FROM developer_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Anyone can view published modules"
  ON marketplace_modules
  FOR SELECT
  TO public
  USING (status = 'published');

-- RLS Policies for module_reviews
CREATE POLICY "Users can manage their own reviews"
  ON module_reviews
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view reviews"
  ON module_reviews
  FOR SELECT
  TO public
  USING (true);

-- RLS Policies for module_downloads
CREATE POLICY "Users can view their own downloads"
  ON module_downloads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert downloads"
  ON module_downloads
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for module_settings
CREATE POLICY "Users can manage their own settings"
  ON module_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for module_updates
CREATE POLICY "Anyone can view module updates"
  ON module_updates
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Developers can manage their module updates"
  ON module_updates
  FOR ALL
  TO authenticated
  USING (module_id IN (
    SELECT marketplace_modules.id 
    FROM marketplace_modules 
    JOIN developer_profiles ON marketplace_modules.developer_id = developer_profiles.id
    WHERE developer_profiles.user_id = auth.uid()
  ));

-- RLS Policies for marketplace_analytics
CREATE POLICY "Users can insert their own analytics"
  ON marketplace_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics"
  ON marketplace_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Functions and triggers for maintaining stats
CREATE OR REPLACE FUNCTION update_module_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE marketplace_modules
  SET 
    rating_count = (
      SELECT COUNT(*)
      FROM module_reviews
      WHERE module_id = COALESCE(NEW.module_id, OLD.module_id)
    ),
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM module_reviews
      WHERE module_id = COALESCE(NEW.module_id, OLD.module_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.module_id, OLD.module_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_module_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON module_reviews
  FOR EACH ROW EXECUTE FUNCTION update_module_rating();

-- Update download count trigger
CREATE OR REPLACE FUNCTION update_download_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE marketplace_modules
  SET 
    download_count = download_count + 1,
    updated_at = now()
  WHERE id = NEW.module_id;
  
  -- Update developer stats
  UPDATE developer_profiles
  SET 
    total_downloads = total_downloads + 1,
    updated_at = now()
  WHERE id = (
    SELECT developer_id 
    FROM marketplace_modules 
    WHERE id = NEW.module_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_download_count_trigger
  AFTER INSERT ON module_downloads
  FOR EACH ROW EXECUTE FUNCTION update_download_count();

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_developer_profiles_updated_at
  BEFORE UPDATE ON developer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_modules_updated_at
  BEFORE UPDATE ON marketplace_modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_module_reviews_updated_at
  BEFORE UPDATE ON module_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_module_settings_updated_at
  BEFORE UPDATE ON module_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();