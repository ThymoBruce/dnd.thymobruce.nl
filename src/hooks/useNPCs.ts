import { useState, useEffect } from 'react';
import { supabase, NPC } from '../lib/supabase';

export const useNPCs = () => {
  const [npcs, setNPCs] = useState<NPC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNPCs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('npcs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match the expected format
      const transformedData = data?.map(npc => ({
        ...npc,
        disposition: npc.attitude // Map attitude to disposition for UI compatibility
      })) || [];

      setNPCs(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addNPC = async (npc: Omit<NPC, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('npcs')
        .insert([{
          name: npc.name,
          race: npc.race,
          occupation: npc.occupation,
          location: npc.location,
          description: npc.description,
          attitude: npc.disposition || npc.attitude, // Handle both field names
          notes: npc.notes
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newNPC = {
          ...data,
          disposition: data.attitude
        };
        setNPCs(prev => [newNPC, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add NPC');
      throw err;
    }
  };

  const updateNPC = async (id: string, updates: Partial<NPC>) => {
    try {
      const { data, error } = await supabase
        .from('npcs')
        .update({
          name: updates.name,
          race: updates.race,
          occupation: updates.occupation,
          location: updates.location,
          description: updates.description,
          attitude: updates.disposition || updates.attitude,
          notes: updates.notes
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const updatedNPC = {
          ...data,
          disposition: data.attitude
        };
        setNPCs(prev => prev.map(npc => 
          npc.id === id ? updatedNPC : npc
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update NPC');
      throw err;
    }
  };

  const deleteNPC = async (id: string) => {
    try {
      const { error } = await supabase
        .from('npcs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNPCs(prev => prev.filter(npc => npc.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete NPC');
      throw err;
    }
  };

  useEffect(() => {
    fetchNPCs();
  }, []);

  return {
    npcs,
    loading,
    error,
    addNPC,
    updateNPC,
    deleteNPC,
    refetch: fetchNPCs,
  };
};