/*
  # Add comprehensive worldbuilding features

  1. New Tables
    - `lore_entries` - General lore and worldbuilding content
    - `timeline_events` - Chronological events tracking
    - `relationships` - Entity relationships system
    - `user_templates` - Custom content templates
    - `user_content` - Content created from templates

  2. Enhanced Tables
    - Add map and relationship fields to existing tables
    - Add privacy and sharing controls

  3. Security
    - Enable RLS on all new tables
    - Add policies for content sharing and campaign access
*/

-- Lore Entries Table
CREATE TABLE IF NOT EXISTS lore_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  type text DEFAULT 'general',
  tags text[] DEFAULT '{}',
  is_private boolean DEFAULT true,
  is_player_visible boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Timeline Events Table
CREATE TABLE IF NOT EXISTS timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  event_date text NOT NULL,
  event_year integer,
  linked_lore_id uuid REFERENCES lore_entries(id) ON DELETE SET NULL,
  is_private boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Relationships Table
CREATE TABLE IF NOT EXISTS relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  entity1_id uuid NOT NULL,
  entity1_type text NOT NULL,
  entity2_id uuid NOT NULL,
  entity2_type text NOT NULL,
  relationship_type text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- User Templates Table
CREATE TABLE IF NOT EXISTS user_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  template_schema jsonb NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- User Content Table (for template-based content)
CREATE TABLE IF NOT EXISTS user_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  template_id uuid REFERENCES user_templates(id) ON DELETE CASCADE,
  title text NOT NULL,
  content_data jsonb NOT NULL,
  is_private boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add map and privacy fields to existing tables
DO $$
BEGIN
  -- Add map fields to locations
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'locations' AND column_name = 'map_image_url') THEN
    ALTER TABLE locations ADD COLUMN map_image_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'locations' AND column_name = 'map_markers') THEN
    ALTER TABLE locations ADD COLUMN map_markers jsonb DEFAULT '[]';
  END IF;
  
  -- Add privacy fields to existing tables
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'is_private') THEN
    ALTER TABLE characters ADD COLUMN is_private boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'is_player_visible') THEN
    ALTER TABLE characters ADD COLUMN is_player_visible boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'npcs' AND column_name = 'is_private') THEN
    ALTER TABLE npcs ADD COLUMN is_private boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'is_private') THEN
    ALTER TABLE items ADD COLUMN is_private boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'monsters' AND column_name = 'is_private') THEN
    ALTER TABLE monsters ADD COLUMN is_private boolean DEFAULT true;
  END IF;
  
  -- Add enhanced character fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'backstory') THEN
    ALTER TABLE characters ADD COLUMN backstory text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'personality_traits') THEN
    ALTER TABLE characters ADD COLUMN personality_traits text[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'ideals') THEN
    ALTER TABLE characters ADD COLUMN ideals text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'bonds') THEN
    ALTER TABLE characters ADD COLUMN bonds text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'flaws') THEN
    ALTER TABLE characters ADD COLUMN flaws text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'languages') THEN
    ALTER TABLE characters ADD COLUMN languages text[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'features_and_traits') THEN
    ALTER TABLE characters ADD COLUMN features_and_traits jsonb DEFAULT '[]';
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lore_entries_user_id ON lore_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_lore_entries_campaign_id ON lore_entries(campaign_id);
CREATE INDEX IF NOT EXISTS idx_lore_entries_type ON lore_entries(type);
CREATE INDEX IF NOT EXISTS idx_lore_entries_tags ON lore_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_timeline_events_user_id ON timeline_events(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_campaign_id ON timeline_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_date ON timeline_events(event_year);
CREATE INDEX IF NOT EXISTS idx_relationships_user_id ON relationships(user_id);
CREATE INDEX IF NOT EXISTS idx_relationships_entity1 ON relationships(entity1_id, entity1_type);
CREATE INDEX IF NOT EXISTS idx_relationships_entity2 ON relationships(entity2_id, entity2_type);
CREATE INDEX IF NOT EXISTS idx_user_templates_user_id ON user_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_content_user_id ON user_content(user_id);
CREATE INDEX IF NOT EXISTS idx_user_content_template_id ON user_content(template_id);

-- Enable RLS
ALTER TABLE lore_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lore_entries
CREATE POLICY "Users can manage their own lore entries"
  ON lore_entries
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view public lore entries"
  ON lore_entries
  FOR SELECT
  TO authenticated
  USING (is_private = false);

CREATE POLICY "Campaign members can view shared lore"
  ON lore_entries
  FOR SELECT
  TO authenticated
  USING (
    campaign_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM campaign_members 
      WHERE campaign_id = lore_entries.campaign_id 
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for timeline_events
CREATE POLICY "Users can manage their own timeline events"
  ON timeline_events
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view public timeline events"
  ON timeline_events
  FOR SELECT
  TO authenticated
  USING (is_private = false);

CREATE POLICY "Campaign members can view shared timeline events"
  ON timeline_events
  FOR SELECT
  TO authenticated
  USING (
    campaign_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM campaign_members 
      WHERE campaign_id = timeline_events.campaign_id 
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for relationships
CREATE POLICY "Users can manage their own relationships"
  ON relationships
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for user_templates
CREATE POLICY "Users can manage their own templates"
  ON user_templates
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view public templates"
  ON user_templates
  FOR SELECT
  TO authenticated
  USING (is_public = true);

-- RLS Policies for user_content
CREATE POLICY "Users can manage their own content"
  ON user_content
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view public content"
  ON user_content
  FOR SELECT
  TO authenticated
  USING (is_private = false);

CREATE POLICY "Campaign members can view shared content"
  ON user_content
  FOR SELECT
  TO authenticated
  USING (
    campaign_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM campaign_members 
      WHERE campaign_id = user_content.campaign_id 
      AND user_id = auth.uid()
    )
  );