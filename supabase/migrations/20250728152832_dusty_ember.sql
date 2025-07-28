/*
  # Add character inventory table

  1. New Tables
    - `character_inventory`
      - `id` (uuid, primary key)
      - `character_id` (uuid, foreign key to characters)
      - `item_id` (uuid, foreign key to items)
      - `item_name` (text, cached item name)
      - `item_type` (text, cached item type)
      - `quantity` (integer, default 1)
      - `notes` (text, optional notes about the item)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `character_inventory` table
    - Add policy for users to manage inventory of their own characters

  3. Indexes
    - Add index on character_id for efficient queries
    - Add index on item_id for lookups
*/

CREATE TABLE IF NOT EXISTS character_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  item_type text NOT NULL,
  quantity integer DEFAULT 1 NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE character_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage inventory of their own characters"
  ON character_inventory
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM characters 
      WHERE characters.id = character_inventory.character_id 
      AND characters.user_id = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_character_inventory_character_id 
  ON character_inventory(character_id);

CREATE INDEX IF NOT EXISTS idx_character_inventory_item_id 
  ON character_inventory(item_id);