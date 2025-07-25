import { useState, useEffect } from 'react';
import { supabase, Item } from '../lib/supabase';

export const useItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setItems(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item: Omit<Item, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('items')
        .insert([{
          name: item.name,
          type: item.type,
          rarity: item.rarity,
          description: item.description,
          properties: item.properties,
          value: item.value || 0,
          weight: item.weight || 0,
          magical: item.magical || false
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setItems(prev => [data, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
      throw err;
    }
  };

  const updateItem = async (id: string, updates: Partial<Item>) => {
    try {
      const { data, error } = await supabase
        .from('items')
        .update({
          name: updates.name,
          type: updates.type,
          rarity: updates.rarity,
          description: updates.description,
          properties: updates.properties,
          value: updates.value,
          weight: updates.weight,
          magical: updates.magical
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setItems(prev => prev.map(item => 
          item.id === id ? data : item
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      throw err;
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refetch: fetchItems,
  };
};