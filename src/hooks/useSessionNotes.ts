import { useState, useEffect } from 'react';
import { supabase, SessionNote } from '../lib/supabase';

export const useSessionNotes = () => {
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessionNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('type', 'session')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match the expected format
      const transformedData = data?.map(note => ({
        ...note,
        date: note.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        participants: note.tags || [] // Use tags as participants for now
      })) || [];

      setSessionNotes(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addSessionNote = async (note: Omit<SessionNote, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          title: note.title,
          content: note.content,
          type: 'session',
          tags: note.participants || [],
          is_private: note.is_private !== undefined ? note.is_private : true
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newNote = {
          ...data,
          date: data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          participants: data.tags || []
        };
        setSessionNotes(prev => [newNote, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add session note');
      throw err;
    }
  };

  const updateSessionNote = async (id: string, updates: Partial<SessionNote>) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({
          title: updates.title,
          content: updates.content,
          tags: updates.participants,
          is_private: updates.is_private
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const updatedNote = {
          ...data,
          date: data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          participants: data.tags || []
        };
        setSessionNotes(prev => prev.map(note => 
          note.id === id ? updatedNote : note
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update session note');
      throw err;
    }
  };

  const deleteSessionNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSessionNotes(prev => prev.filter(note => note.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session note');
      throw err;
    }
  };

  useEffect(() => {
    fetchSessionNotes();
  }, []);

  return {
    sessionNotes,
    loading,
    error,
    addSessionNote,
    updateSessionNote,
    deleteSessionNote,
    refetch: fetchSessionNotes,
  };
};