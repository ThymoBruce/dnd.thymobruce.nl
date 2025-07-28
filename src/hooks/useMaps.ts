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
  const [generating, setGenerating] = useState(false);

  const fetchMaps = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('maps')
        .select('*')
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
      const { data, error } = await supabase
        .from('maps')
        .insert([{
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
      const { error } = await supabase
        .from('maps')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMaps(prev => prev.filter(map => map.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete map');
      throw err;
    }
  };

  const generateMapWithAI = async (prompt: string, mapName: string, description?: string) => {
    try {
      setGenerating(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-map`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt,
          style: 'fantasy map',
          size: '1024x1024'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate map');
      }

      const data = await response.json();
      
      if (!data.imageUrl) {
        throw new Error('No image URL received from AI service');
      }

      // Create a new map with the AI-generated image
      const newMap = {
        name: mapName,
        description: description || `AI-generated map: ${prompt}`,
        imageUrl: data.imageUrl,
        scale: '1 square = 5 feet',
        gridSize: 50,
        markers: []
      };

      await addMap(newMap);
      
      return {
        success: true,
        imageUrl: data.imageUrl,
        message: data.message
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate map';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  return {
    maps,
    loading,
    generating,
    error,
    addMap,
    updateMap,
    deleteMap,
    generateMapWithAI,
    refetch: fetchMaps,
  };
};