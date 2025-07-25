/*
  # D&D Campaign Management Database Schema

  1. New Tables
    - `users` - User accounts with roles (player, dungeon_master, writer)
    - `characters` - Player characters with full D&D stats and equipment
    - `campaigns` - Campaign information and settings
    - `campaign_members` - Many-to-many relationship between users and campaigns
    - `npcs` - Non-player characters with disposition and notes
    - `monsters` - Monster stat blocks and encounter information
    - `items` - Equipment, weapons, armor, and magical items
    - `spells` - Spell database with descriptions and mechanics
    - `locations` - Cities, dungeons, and important places
    - `encounters` - Combat encounters with initiative tracking
    - `quests` - Quest tracking with objectives and rewards
    - `notes` - Session notes and campaign documentation
    - `races` - Character races (official and homebrew)
    - `classes` - Character classes with features and abilities
    - `feats` - Character feats and abilities
    - `conditions` - Status effects and conditions

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Campaign-based access control
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('player', 'dungeon_master', 'writer')),
  created_at timestamptz DEFAULT now(),
  avatar text
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Characters table with full D&D stats
CREATE TABLE IF NOT EXISTS characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  race text NOT NULL,
  class text NOT NULL,
  level integer DEFAULT 1,
  background text,
  alignment text,
  hp integer DEFAULT 0,
  max_hp integer DEFAULT 0,
  ac integer DEFAULT 10,
  strength integer DEFAULT 10,
  dexterity integer DEFAULT 10,
  constitution integer DEFAULT 10,
  intelligence integer DEFAULT 10,
  wisdom integer DEFAULT 10,
  charisma integer DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  experience_points integer DEFAULT 0,
  proficiency_bonus integer DEFAULT 2,
  skills jsonb DEFAULT '{}',
  saving_throws jsonb DEFAULT '{}',
  equipment jsonb DEFAULT '[]',
  spells_known uuid[],
  portrait_url text
);

ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Campaign members (many-to-many)
CREATE TABLE IF NOT EXISTS campaign_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role text DEFAULT 'player' CHECK (role IN ('player', 'co_dm')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id, user_id)
);

ALTER TABLE campaign_members ENABLE ROW LEVEL SECURITY;

-- NPCs table
CREATE TABLE IF NOT EXISTS npcs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  race text,
  occupation text,
  location text,
  description text,
  attitude text DEFAULT 'neutral',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE npcs ENABLE ROW LEVEL SECURITY;

-- Monsters table
CREATE TABLE IF NOT EXISTS monsters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  size text NOT NULL,
  cr text NOT NULL,
  ac integer NOT NULL,
  hp integer NOT NULL,
  speed text NOT NULL,
  environment text,
  abilities text[],
  resistances text[],
  vulnerabilities text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE monsters ENABLE ROW LEVEL SECURITY;

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  rarity text DEFAULT 'common',
  description text,
  properties text[],
  value integer DEFAULT 0,
  weight numeric DEFAULT 0,
  magical boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Spells table
CREATE TABLE IF NOT EXISTS spells (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  school text NOT NULL,
  level integer NOT NULL,
  casting_time text NOT NULL,
  range text NOT NULL,
  components text[],
  duration text NOT NULL,
  description text NOT NULL,
  classes text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE spells ENABLE ROW LEVEL SECURITY;

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text DEFAULT 'settlement' CHECK (type IN ('settlement', 'dungeon', 'wilderness', 'landmark', 'region')),
  description text,
  population integer,
  government text,
  notable_features text[],
  connected_locations uuid[],
  map_url text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Encounters table
CREATE TABLE IF NOT EXISTS encounters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
  current_round integer DEFAULT 0,
  current_turn integer DEFAULT 0,
  initiative_order jsonb DEFAULT '[]',
  participants jsonb DEFAULT '[]',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;

-- Quests table
CREATE TABLE IF NOT EXISTS quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  objectives text[],
  rewards text[],
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'abandoned')),
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'deadly')),
  experience_reward integer DEFAULT 0,
  gold_reward integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  type text DEFAULT 'general' CHECK (type IN ('general', 'session', 'character', 'plot', 'world')),
  tags text[],
  is_private boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Races table (official and homebrew)
CREATE TABLE IF NOT EXISTS races (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  size text DEFAULT 'Medium',
  speed integer DEFAULT 30,
  ability_score_increases jsonb DEFAULT '{}',
  traits text[],
  languages text[],
  proficiencies text[],
  is_official boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE races ENABLE ROW LEVEL SECURITY;

-- Classes table (official and homebrew)
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  hit_die integer DEFAULT 8,
  primary_ability text[],
  saving_throw_proficiencies text[],
  skill_proficiencies text[],
  armor_proficiencies text[],
  weapon_proficiencies text[],
  tool_proficiencies text[],
  class_features jsonb DEFAULT '{}',
  spellcasting_ability text,
  is_official boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Feats table
CREATE TABLE IF NOT EXISTS feats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  prerequisites text,
  ability_score_improvement boolean DEFAULT false,
  benefits text[],
  is_official boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feats ENABLE ROW LEVEL SECURITY;

-- Conditions table
CREATE TABLE IF NOT EXISTS conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  effects text[],
  duration_type text DEFAULT 'temporary',
  is_official boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_members_campaign_id ON campaign_members(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_members_user_id ON campaign_members(user_id);
CREATE INDEX IF NOT EXISTS idx_locations_campaign_id ON locations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_encounters_campaign_id ON encounters(campaign_id);
CREATE INDEX IF NOT EXISTS idx_quests_campaign_id ON quests(campaign_id);
CREATE INDEX IF NOT EXISTS idx_notes_campaign_id ON notes(campaign_id);
CREATE INDEX IF NOT EXISTS idx_races_user_id ON races(user_id);
CREATE INDEX IF NOT EXISTS idx_classes_user_id ON classes(user_id);
CREATE INDEX IF NOT EXISTS idx_feats_user_id ON feats(user_id);
CREATE INDEX IF NOT EXISTS idx_conditions_user_id ON conditions(user_id);

-- Row Level Security Policies

-- Users can manage their own data
CREATE POLICY "Users can manage their own data" ON characters
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own campaigns" ON campaigns
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notes" ON notes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own encounters" ON encounters
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own quests" ON quests
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own locations" ON locations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own races" ON races
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view official races" ON races
  FOR SELECT USING (is_official = true);

CREATE POLICY "Users can manage their own classes" ON classes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view official classes" ON classes
  FOR SELECT USING (is_official = true);

CREATE POLICY "Users can manage their own feats" ON feats
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view official feats" ON feats
  FOR SELECT USING (is_official = true);

CREATE POLICY "Users can manage their own conditions" ON conditions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view official conditions" ON conditions
  FOR SELECT USING (is_official = true);

-- Campaign members policies
CREATE POLICY "Campaign owners can manage members" ON campaign_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_members.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own memberships" ON campaign_members
  FOR SELECT USING (auth.uid() = user_id);