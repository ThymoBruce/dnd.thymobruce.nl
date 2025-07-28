import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Character {
  id: string;
  user_id?: string;
  name: string;
  race: string;
  class: string;
  level: number;
  background?: string;
  alignment?: string;
  hp: number;
  max_hp: number;
  ac: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  experience_points: number;
  proficiency_bonus: number;
  skills: Record<string, boolean>;
  saving_throws: Record<string, boolean>;
  equipment: any[];
  spells_known?: string[];
  portrait_url?: string;
  created_at?: string;
  player?: string; // For display purposes
  notes?: string; // For display purposes
}

export interface Campaign {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  status: string;
  created_at?: string;
  dmName?: string; // For display purposes
  mapWidth?: number;
  mapHeight?: number;
  isActive?: boolean; // For display purposes
}

export interface NPC {
  id: string;
  user_id?: string;
  name: string;
  race?: string;
  occupation?: string;
  location?: string;
  description?: string;
  attitude: string;
  notes?: string;
  created_at?: string;
  disposition?: string; // For display purposes
}

export interface Item {
  id: string;
  user_id?: string;
  name: string;
  type: string;
  rarity: string;
  description?: string;
  properties: string[];
  value: number;
  weight: number;
  magical: boolean;
  created_at?: string;
}

export interface Location {
  id: string;
  user_id?: string;
  campaign_id?: string;
  name: string;
  type: string;
  description?: string;
  population?: number;
  government?: string;
  notable_features?: string[];
  connected_locations?: string[];
  map_url?: string;
  notes?: string;
  created_at?: string;
}

export interface Monster {
  id: string;
  user_id?: string;
  name: string;
  type: string;
  size: string;
  cr: string;
  ac: number;
  hp: number;
  speed: string;
  environment?: string;
  abilities?: string[];
  resistances?: string[];
  vulnerabilities?: string[];
  created_at?: string;
}

export interface SessionNote {
  id: string;
  user_id?: string;
  campaign_id?: string;
  title: string;
  content: string;
  type: string;
  tags?: string[];
  is_private: boolean;
  created_at?: string;
  updated_at?: string;
  date?: string; // For display purposes
  participants?: string[]; // For display purposes
}