import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface TimelineEvent {
  id: string;
  user_id?: string;
  campaign_id?: string;
  title: string;
  description?: string;
  event_date: string;
  event_year?: number;
  linked_lore_id?: string;
  is_private: boolean;
  created_at?: string;
}

export const useTimelineEvents = () => {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimelineEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .order('event_year', { ascending: true });

      if (error) throw error;

      setTimelineEvents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addTimelineEvent = async (event: Omit<TimelineEvent, 'id' | 'created_at'>) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('timeline_events')
        .insert([{
          user_id: user.id,
          title: event.title,
          description: event.description,
          event_date: event.event_date,
          event_year: event.event_year,
          campaign_id: event.campaign_id,
          linked_lore_id: event.linked_lore_id,
          is_private: event.is_private !== undefined ? event.is_private : true
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setTimelineEvents(prev => [...prev, data].sort((a, b) => (a.event_year || 0) - (b.event_year || 0)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add timeline event');
      throw err;
    }
  };

  const updateTimelineEvent = async (id: string, updates: Partial<TimelineEvent>) => {
    try {
      const { data, error } = await supabase
        .from('timeline_events')
        .update({
          title: updates.title,
          description: updates.description,
          event_date: updates.event_date,
          event_year: updates.event_year,
          campaign_id: updates.campaign_id,
          linked_lore_id: updates.linked_lore_id,
          is_private: updates.is_private
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setTimelineEvents(prev => prev.map(event => 
          event.id === id ? data : event
        ).sort((a, b) => (a.event_year || 0) - (b.event_year || 0)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update timeline event');
      throw err;
    }
  };

  const deleteTimelineEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('timeline_events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTimelineEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete timeline event');
      throw err;
    }
  };

  useEffect(() => {
    fetchTimelineEvents();
  }, []);

  return {
    timelineEvents,
    loading,
    error,
    addTimelineEvent,
    updateTimelineEvent,
    deleteTimelineEvent,
    refetch: fetchTimelineEvents,
  };
};