/*
  # Add missing columns to maps table

  1. New Columns
    - `image_url` (text) - URL for map background image
    - `scale` (text) - Map scale description (e.g., "1 square = 5 feet")
    - `grid_size` (integer) - Size of grid squares in pixels, default 50
    - `map_width` (integer) - Map canvas width in pixels, default 800
    - `map_height` (integer) - Map canvas height in pixels, default 600
    - `markers` (jsonb) - Array of map markers and tiles, default empty array

  2. Safety
    - Uses IF NOT EXISTS checks to prevent errors if columns already exist
    - Provides sensible default values for existing records
*/

-- Add image_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'maps' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE maps ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- Add scale column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'maps' AND column_name = 'scale'
  ) THEN
    ALTER TABLE maps ADD COLUMN scale TEXT;
  END IF;
END $$;

-- Add grid_size column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'maps' AND column_name = 'grid_size'
  ) THEN
    ALTER TABLE maps ADD COLUMN grid_size INTEGER DEFAULT 50;
  END IF;
END $$;

-- Add map_width column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'maps' AND column_name = 'map_width'
  ) THEN
    ALTER TABLE maps ADD COLUMN map_width INTEGER DEFAULT 800;
  END IF;
END $$;

-- Add map_height column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'maps' AND column_name = 'map_height'
  ) THEN
    ALTER TABLE maps ADD COLUMN map_height INTEGER DEFAULT 600;
  END IF;
END $$;

-- Add markers column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'maps' AND column_name = 'markers'
  ) THEN
    ALTER TABLE maps ADD COLUMN markers JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;