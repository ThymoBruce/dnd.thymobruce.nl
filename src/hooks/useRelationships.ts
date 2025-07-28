import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Relationship {
  id: string;
  user_id?: string;
  entity1_id: string;
  entity1_type: string;
  entity2_id: string;
  entity2_type: string;
  relationship_type: string;
  description?: string;
  created_at?: string;
}

export const useRelationships = () => {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRelationships = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('relationships')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRelationships(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addRelationship = async (relationship: Omit<Relationship, 'id' | 'created_at'>) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('relationships')
        .insert([{
          user_id: user.id,
          entity1_id: relationship.entity1_id,
          entity1_type: relationship.entity1_type,
          entity2_id: relationship.entity2_id,
          entity2_type: relationship.entity2_type,
          relationship_type: relationship.relationship_type,
          description: relationship.description
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setRelationships(prev => [data, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add relationship');
      throw err;
    }
  };

  const deleteRelationship = async (id: string) => {
    try {
      const { error } = await supabase
        .from('relationships')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRelationships(prev => prev.filter(rel => rel.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete relationship');
      throw err;
    }
  };

  const getEntityRelationships = (entityId: string, entityType: string) => {
    return relationships.filter(rel => 
      (rel.entity1_id === entityId && rel.entity1_type === entityType) ||
      (rel.entity2_id === entityId && rel.entity2_type === entityType)
    );
  };

  useEffect(() => {
    fetchRelationships();
  }, []);

  return {
    relationships,
    loading,
    error,
    addRelationship,
    deleteRelationship,
    getEntityRelationships,
    refetch: fetchRelationships,
  };
};