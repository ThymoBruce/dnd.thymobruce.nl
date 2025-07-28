import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UserTemplate {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  template_schema: any;
  is_public: boolean;
  created_at?: string;
}

interface UserContent {
  id: string;
  user_id?: string;
  campaign_id?: string;
  template_id: string;
  title: string;
  content_data: any;
  is_private: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useUserTemplates = () => {
  const [templates, setTemplates] = useState<UserTemplate[]>([]);
  const [userContent, setUserContent] = useState<UserContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserContent = async () => {
    try {
      const { data, error } = await supabase
        .from('user_content')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setUserContent(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const addTemplate = async (template: Omit<UserTemplate, 'id' | 'created_at'>) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_templates')
        .insert([{
          user_id: user.id,
          name: template.name,
          description: template.description,
          template_schema: template.template_schema,
          is_public: template.is_public || false
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setTemplates(prev => [data, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add template');
      throw err;
    }
  };

  const addUserContent = async (content: Omit<UserContent, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_content')
        .insert([{
          user_id: user.id,
          campaign_id: content.campaign_id,
          template_id: content.template_id,
          title: content.title,
          content_data: content.content_data,
          is_private: content.is_private !== undefined ? content.is_private : true
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setUserContent(prev => [data, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add content');
      throw err;
    }
  };

  const updateUserContent = async (id: string, updates: Partial<UserContent>) => {
    try {
      const { data, error } = await supabase
        .from('user_content')
        .update({
          title: updates.title,
          content_data: updates.content_data,
          campaign_id: updates.campaign_id,
          is_private: updates.is_private,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setUserContent(prev => prev.map(content => 
          content.id === id ? data : content
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update content');
      throw err;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTemplates(prev => prev.filter(template => template.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      throw err;
    }
  };

  const deleteUserContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUserContent(prev => prev.filter(content => content.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete content');
      throw err;
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchUserContent();
  }, []);

  return {
    templates,
    userContent,
    loading,
    error,
    addTemplate,
    addUserContent,
    updateUserContent,
    deleteTemplate,
    deleteUserContent,
    refetch: () => {
      fetchTemplates();
      fetchUserContent();
    },
  };
};