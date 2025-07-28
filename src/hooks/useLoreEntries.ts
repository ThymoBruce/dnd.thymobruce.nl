import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface LoreEntry {
  id: string;
  user_id?: string;
  campaign_id?: string;
  title: string;
  content: string;
  type: string;
  tags: string[];
  is_private: boolean;
  is_player_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useLoreEntries = () => {
  const [loreEntries, setLoreEntries] = useState<LoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoreEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lore_entries')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setLoreEntries(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addLoreEntry = async (entry: Omit<LoreEntry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('lore_entries')
        .insert([{
          user_id: user.id,
          title: entry.title,
          content: entry.content,
          type: entry.type || 'general',
          tags: entry.tags || [],
          campaign_id: entry.campaign_id,
          is_private: entry.is_private !== undefined ? entry.is_private : true,
          is_player_visible: entry.is_player_visible !== undefined ? entry.is_player_visible : false
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setLoreEntries(prev => [data, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add lore entry');
      throw err;
    }
  };

  const updateLoreEntry = async (id: string, updates: Partial<LoreEntry>) => {
    try {
      const { data, error } = await supabase
        .from('lore_entries')
        .update({
          title: updates.title,
          content: updates.content,
          type: updates.type,
          tags: updates.tags,
          campaign_id: updates.campaign_id,
          is_private: updates.is_private,
          is_player_visible: updates.is_player_visible,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setLoreEntries(prev => prev.map(entry => 
          entry.id === id ? data : entry
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lore entry');
      throw err;
    }
  };

  const deleteLoreEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lore_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLoreEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lore entry');
      throw err;
    }
  };

  useEffect(() => {
    fetchLoreEntries();
  }, []);

  return {
    loreEntries,
    loading,
    error,
    addLoreEntry,
    updateLoreEntry,
    deleteLoreEntry,
    refetch: fetchLoreEntries,
  };
};