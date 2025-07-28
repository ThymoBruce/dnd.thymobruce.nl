/*
  # Add authentication and quest management tables

  1. New Tables
    - `campaign_invites` - For inviting players to campaigns
      - `id` (uuid, primary key)
      - `campaign_id` (uuid, foreign key to campaigns)
      - `inviter_id` (uuid, foreign key to users)
      - `invitee_email` (text)
      - `status` (text, enum: pending/accepted/declined)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for campaign invites
    - Update existing policies as needed

  3. Indexes
    - Add indexes for performance on foreign keys and email lookups
*/

-- Campaign invites table
CREATE TABLE IF NOT EXISTS campaign_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  inviter_id uuid REFERENCES users(id) ON DELETE CASCADE,
  invitee_email text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE campaign_invites ENABLE ROW LEVEL SECURITY;

-- Policies for campaign invites
CREATE POLICY "Campaign owners can manage invites"
  ON campaign_invites
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_invites.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view invites sent to them"
  ON campaign_invites
  FOR SELECT
  TO authenticated
  USING (invitee_email = auth.email());

CREATE POLICY "Users can respond to their invites"
  ON campaign_invites
  FOR UPDATE
  TO authenticated
  USING (invitee_email = auth.email());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaign_invites_campaign_id ON campaign_invites(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_invites_inviter_id ON campaign_invites(inviter_id);
CREATE INDEX IF NOT EXISTS idx_campaign_invites_invitee_email ON campaign_invites(invitee_email);
CREATE INDEX IF NOT EXISTS idx_campaign_invites_status ON campaign_invites(status);

-- Update users table to ensure it works with auth
DO $$
BEGIN
  -- Add avatar column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'avatar'
  ) THEN
    ALTER TABLE users ADD COLUMN avatar text;
  END IF;
END $$;

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Enable RLS on other tables if not already enabled
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE npcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE monsters ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;