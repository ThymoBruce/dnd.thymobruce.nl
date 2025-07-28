import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface MapMarker {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'location' | 'poi' | 'danger' | 'treasure' | 'npc';
  description?: string;
}

interface GameMap {
  id: string;
  user_id?: string;
  campaign_id?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  scale?: string;
  gridSize: number;
  markers: MapMarker[];
  created_at?: string;
}

export const useMaps = () => {
  const [maps, setMaps] = useState<GameMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaps = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('maps')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match the expected format
      const transformedData = data?.map(map => ({
        ...map,
        imageUrl: map.image_url,
        gridSize: map.grid_size || 50,
        markers: map.markers || []
      })) || [];

      setMaps(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addMap = async (map: Omit<GameMap, 'id' | 'created_at'>) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('maps')
        .insert([{
          user_id: user.id,
          name: map.name,
          description: map.description,
          image_url: map.imageUrl,
          scale: map.scale,
          grid_size: map.gridSize,
          markers: map.markers || []
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newMap = {
          ...data,
          imageUrl: data.image_url,
          gridSize: data.grid_size || 50,
          markers: data.markers || []
        };
        setMaps(prev => [newMap, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add map');
      throw err;
    }
  };

  const updateMap = async (id: string, updates: Partial<GameMap>) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('maps')
        .update({
          name: updates.name,
          description: updates.description,
          image_url: updates.imageUrl,
          scale: updates.scale,
          grid_size: updates.gridSize,
          markers: updates.markers
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const updatedMap = {
          ...data,
          imageUrl: data.image_url,
          gridSize: data.grid_size || 50,
          markers: data.markers || []
        };
        setMaps(prev => prev.map(map => 
          map.id === id ? updatedMap : map
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update map');
      throw err;
    }
  };

  const deleteMap = async (id: string) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('maps')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setMaps(prev => prev.filter(map => map.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete map');
      throw err;
    }
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  return {
    maps,
    loading,
    error,
    addMap,
    updateMap,
    deleteMap,
    refetch: fetchMaps,
  };
};