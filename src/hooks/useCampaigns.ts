import { useState, useEffect } from 'react';
import { supabase, Campaign } from '../lib/supabase';

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns(); 
  }, []);
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match the expected format
      const transformedData = data?.map(campaign => ({
        ...campaign,
        dmName: campaign.dmName || 'Default', // Placeholder since we don't have DM name in database
        isActive: campaign.status === 'active',
        createdAt: campaign.created_at,
        
      })) || [];

      setCampaigns(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addCampaign = async (campaign: Omit<Campaign, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([{
          name: campaign.name,
          description: campaign.description,
          status: 'active',
          dmName: campaign.dmName || 'Default DM' // Default to 'DM' if not provided
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newCampaign = {
          ...data,
          dmName: data.dmName || 'Default',
          isActive: data.status === 'active',
          createdAt: data.created_at,
        };
        setCampaigns(prev => [newCampaign, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add campaign');
      throw err;
    }
  };

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .update({
          name: updates.name,
          description: updates.description,
          status: updates.status,
          dmName: updates.dmName
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const updatedCampaign = {
          ...data,
          dmName: data.dmName || 'Default',
          isActive: data.status === 'active',
          createdAt: data.created_at
        };
        setCampaigns(prev => prev.map(campaign => 
          campaign.id === id ? updatedCampaign : campaign
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update campaign');
      throw err;
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete campaign');
      throw err;
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return {
    campaigns,
    loading,
    error,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    refetch: fetchCampaigns,
  };
};