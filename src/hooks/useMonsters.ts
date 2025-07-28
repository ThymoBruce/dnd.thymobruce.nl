import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Monster {
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

export const useMonsters = () => {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMonsters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('monsters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMonsters(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addMonster = async (monster: Omit<Monster, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('monsters')
        .insert([{
          name: monster.name,
          type: monster.type,
          size: monster.size,
          cr: monster.cr,
          ac: monster.ac,
          hp: monster.hp,
          speed: monster.speed,
          environment: monster.environment,
          abilities: monster.abilities,
          resistances: monster.resistances,
          vulnerabilities: monster.vulnerabilities
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setMonsters(prev => [data, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add monster');
      throw err;
    }
  };

  const updateMonster = async (id: string, updates: Partial<Monster>) => {
    try {
      const { data, error } = await supabase
        .from('monsters')
        .update({
          name: updates.name,
          type: updates.type,
          size: updates.size,
          cr: updates.cr,
          ac: updates.ac,
          hp: updates.hp,
          speed: updates.speed,
          environment: updates.environment,
          abilities: updates.abilities,
          resistances: updates.resistances,
          vulnerabilities: updates.vulnerabilities
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setMonsters(prev => prev.map(monster => 
          monster.id === id ? data : monster
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update monster');
      throw err;
    }
  };

  const deleteMonster = async (id: string) => {
    try {
      const { error } = await supabase
        .from('monsters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMonsters(prev => prev.filter(monster => monster.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete monster');
      throw err;
    }
  };

  useEffect(() => {
    fetchMonsters();
  }, []);

  return {
    monsters,
    loading,
    error,
    addMonster,
    updateMonster,
    deleteMonster,
    refetch: fetchMonsters,
  };
};