/*
  # Create maps table for interactive campaign maps

  1. New Tables
    - `maps`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `campaign_id` (uuid, foreign key to campaigns, optional)
      - `name` (text, required)
      - `description` (text, optional)
      - `image_url` (text, optional)
      - `scale` (text, optional - e.g., "1 square = 5 feet")
      - `grid_size` (integer, default 50)
      - `markers` (jsonb, default empty array)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `maps` table
    - Add policy for users to manage their own maps
*/

CREATE TABLE IF NOT EXISTS maps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  image_url text,
  scale text,
  grid_size integer DEFAULT 50,
  markers jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own maps"
  ON maps
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_maps_user_id ON maps(user_id);
CREATE INDEX IF NOT EXISTS idx_maps_campaign_id ON maps(campaign_id);