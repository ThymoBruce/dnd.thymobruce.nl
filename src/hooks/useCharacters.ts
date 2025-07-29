import { useState, useEffect } from 'react';
import { supabase, Character } from '../lib/supabase';

export const useCharacters = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match the expected format
      const transformedData = data?.map(char => ({
        ...char,
        player: char.name, // Placeholder for player name
        notes: char.background || '', // Use background as notes for now
        stats: {
          strength: char.strength,
          dexterity: char.dexterity,
          constitution: char.constitution,
          intelligence: char.intelligence,
          wisdom: char.wisdom,
          charisma: char.charisma,
        }
      })) || [];

      setCharacters(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addCharacter = async (character: Omit<Character, 'id' | 'created_at'>) => {
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Try to ensure user exists in public.users table
      try {
        await supabase
          .from('users')
          .upsert([{
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            role: 'player',
            avatar: user.user_metadata?.avatar_url
          }], { onConflict: 'id' });
      } catch (userCreateError) {
        console.warn('Could not create user record:', userCreateError);
      }

      const { data, error } = await supabase
        .from('characters')
        .insert([{
          user_id: user.id,
          name: character.name,
          race: character.race,
          class: character.class,
          level: character.level,
          background: character.background,
          alignment: character.alignment,
          hp: character.hp,
          max_hp: character.hp, // Set max_hp to current hp initially
          ac: character.ac,
          strength: character.strength,
          dexterity: character.dexterity,
          constitution: character.constitution,
          intelligence: character.intelligence,
          wisdom: character.wisdom,
          charisma: character.charisma,
          experience_points: character.experience_points || 0,
          proficiency_bonus: character.proficiency_bonus || 2,
          skills: character.skills || {},
          saving_throws: character.saving_throws || {},
          equipment: character.equipment || [],
          portrait_url: character.portrait_url,
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newCharacter = {
          ...data,
          player: data.name,
          notes: data.background || '',
          stats: {
            strength: data.strength,
            dexterity: data.dexterity,
            constitution: data.constitution,
            intelligence: data.intelligence,
            wisdom: data.wisdom,
            charisma: data.charisma,
          }
        };
        setCharacters(prev => [newCharacter, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add character');
      throw err;
    }
  };

  const updateCharacter = async (id: string, updates: Partial<Character>) => {
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Try to ensure user exists in public.users table
      try {
        await supabase
          .from('users')
          .upsert([{
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            role: 'player',
            avatar: user.user_metadata?.avatar_url
          }], { onConflict: 'id' });
      } catch (userCreateError) {
        console.warn('Could not create user record:', userCreateError);
      }

      const { data, error } = await supabase
        .from('characters')
        .update({
          user_id: user.id,
          name: updates.name,
          race: updates.race,
          class: updates.class,
          level: updates.level,
          background: updates.background,
          alignment: updates.alignment,
          hp: updates.hp,
          max_hp: updates.max_hp || updates.hp,
          ac: updates.ac,
          strength: updates.strength,
          dexterity: updates.dexterity,
          constitution: updates.constitution,
          intelligence: updates.intelligence,
          wisdom: updates.wisdom,
          charisma: updates.charisma,
          experience_points: updates.experience_points,
          proficiency_bonus: updates.proficiency_bonus,
          skills: updates.skills,
          saving_throws: updates.saving_throws,
          equipment: updates.equipment,
          portrait_url: updates.portrait_url,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const updatedCharacter = {
          ...data,
          player: data.name,
          notes: data.background || '',
          stats: {
            strength: data.strength,
            dexterity: data.dexterity,
            constitution: data.constitution,
            intelligence: data.intelligence,
            wisdom: data.wisdom,
            charisma: data.charisma,
          }
        };
        setCharacters(prev => prev.map(char => 
          char.id === id ? updatedCharacter : char
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update character');
      throw err;
    }
  };

  const deleteCharacter = async (id: string) => {
    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCharacters(prev => prev.filter(char => char.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete character');
      throw err;
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  return {
    characters,
    loading,
    error,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    refetch: fetchCharacters,
  };
};