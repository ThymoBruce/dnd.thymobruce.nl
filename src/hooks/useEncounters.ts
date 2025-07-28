import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Encounter {
  id: string;
  user_id?: string;
  campaign_id?: string;
  name: string;
  description?: string;
  status: 'planned' | 'active' | 'completed';
  current_round: number;
  current_turn: number;
  initiative_order: any[];
  participants: any[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const useEncounters = () => {
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEncounters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('encounters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEncounters(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addEncounter = async (encounter: Omit<Encounter, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('encounters')
        .insert([{
          user_id: user.id,
          name: encounter.name,
          description: encounter.description,
          status: encounter.status || 'planned',
          current_round: encounter.current_round || 0,
          current_turn: encounter.current_turn || 0,
          initiative_order: encounter.initiative_order || [],
          participants: encounter.participants || [],
          notes: encounter.notes,
          campaign_id: encounter.campaign_id
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setEncounters(prev => [data, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add encounter');
      throw err;
    }
  };

  const updateEncounter = async (id: string, updates: Partial<Encounter>) => {
    try {
      const { data, error } = await supabase
        .from('encounters')
        .update({
          name: updates.name,
          description: updates.description,
          status: updates.status,
          current_round: updates.current_round,
          current_turn: updates.current_turn,
          initiative_order: updates.initiative_order,
          participants: updates.participants,
          notes: updates.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setEncounters(prev => prev.map(encounter => 
          encounter.id === id ? data : encounter
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update encounter');
      throw err;
    }
  };

  const deleteEncounter = async (id: string) => {
    try {
      const { error } = await supabase
        .from('encounters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEncounters(prev => prev.filter(encounter => encounter.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete encounter');
      throw err;
    }
  };

  useEffect(() => {
    fetchEncounters();
  }, []);

  return {
    encounters,
    loading,
    error,
    addEncounter,
    updateEncounter,
    deleteEncounter,
    refetch: fetchEncounters,
  };
};