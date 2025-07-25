import { useState, useEffect } from 'react';
import { supabase, Location } from '../lib/supabase';

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLocations(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addLocation = async (location: Omit<Location, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert([{
          name: location.name,
          type: location.type,
          description: location.description,
          population: location.population,
          government: location.government,
          notes: location.notes
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setLocations(prev => [data, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add location');
      throw err;
    }
  };

  const updateLocation = async (id: string, updates: Partial<Location>) => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .update({
          name: updates.name,
          type: updates.type,
          description: updates.description,
          population: updates.population,
          government: updates.government,
          notes: updates.notes
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setLocations(prev => prev.map(location => 
          location.id === id ? data : location
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update location');
      throw err;
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLocations(prev => prev.filter(location => location.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete location');
      throw err;
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return {
    locations,
    loading,
    error,
    addLocation,
    updateLocation,
    deleteLocation,
    refetch: fetchLocations,
  };
};