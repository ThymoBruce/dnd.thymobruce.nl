import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Quest {
  id: string;
  user_id?: string;
  campaign_id?: string;
  name: string;
  description?: string;
  objectives?: string[];
  rewards?: string[];
  status: 'active' | 'completed' | 'failed' | 'abandoned';
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  experience_reward: number;
  gold_reward: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const useQuests = () => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQuests(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addQuest = async (quest: Omit<Quest, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('quests')
        .insert([{
          name: quest.name,
          description: quest.description,
          objectives: quest.objectives,
          rewards: quest.rewards,
          status: quest.status || 'active',
          difficulty: quest.difficulty || 'medium',
          experience_reward: quest.experience_reward || 0,
          gold_reward: quest.gold_reward || 0,
          notes: quest.notes,
          campaign_id: quest.campaign_id
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setQuests(prev => [data, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add quest');
      throw err;
    }
  };

  const updateQuest = async (id: string, updates: Partial<Quest>) => {
    try {
      const { data, error } = await supabase
        .from('quests')
        .update({
          name: updates.name,
          description: updates.description,
          objectives: updates.objectives,
          rewards: updates.rewards,
          status: updates.status,
          difficulty: updates.difficulty,
          experience_reward: updates.experience_reward,
          gold_reward: updates.gold_reward,
          notes: updates.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setQuests(prev => prev.map(quest => 
          quest.id === id ? data : quest
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quest');
      throw err;
    }
  };

  const deleteQuest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('quests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setQuests(prev => prev.filter(quest => quest.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete quest');
      throw err;
    }
  };

  useEffect(() => {
    fetchQuests();
  }, []);

  return {
    quests,
    loading,
    error,
    addQuest,
    updateQuest,
    deleteQuest,
    refetch: fetchQuests,
  };
};