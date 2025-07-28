import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface InventoryItem {
  id: string;
  character_id: string;
  item_id: string;
  item_name: string;
  item_type: string;
  quantity: number;
  notes?: string;
  created_at?: string;
}

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('character_inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInventory(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('character_inventory')
        .insert([{
          character_id: item.character_id,
          item_id: item.item_id,
          item_name: item.item_name,
          item_type: item.item_type,
          quantity: item.quantity,
          notes: item.notes
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setInventory(prev => [data, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add inventory item');
      throw err;
    }
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const { data, error } = await supabase
        .from('character_inventory')
        .update({
          quantity: updates.quantity,
          notes: updates.notes
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setInventory(prev => prev.map(item => 
          item.id === id ? data : item
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update inventory item');
      throw err;
    }
  };

  const deleteInventoryItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('character_inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setInventory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete inventory item');
      throw err;
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return {
    inventory,
    loading,
    error,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    refetch: fetchInventory,
  };
};