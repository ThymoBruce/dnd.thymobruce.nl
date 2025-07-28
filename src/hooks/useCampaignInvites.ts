import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface CampaignInvite {
  id: string;
  campaign_id: string;
  inviter_id: string;
  invitee_email: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at?: string;
  campaign?: {
    name: string;
    description: string;
  };
  inviter?: {
    name: string;
    email: string;
  };
}

export const useCampaignInvites = () => {
  const [invites, setInvites] = useState<CampaignInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setInvites([]);
        return;
      }

      const { data, error } = await supabase
        .from('campaign_invites')
        .select(`
          *,
          campaigns:campaign_id (name, description),
          users:inviter_id (name, email)
        `)
        .eq('invitee_email', user.email)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = data?.map(invite => ({
        ...invite,
        campaign: invite.campaigns,
        inviter: invite.users
      })) || [];

      setInvites(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async (campaignId: string, inviteeEmail: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to send invites');
      }

      const { data, error } = await supabase
        .from('campaign_invites')
        .insert([{
          campaign_id: campaignId,
          inviter_id: user.id,
          invitee_email: inviteeEmail,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send invite';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const respondToInvite = async (inviteId: string, status: 'accepted' | 'declined') => {
    try {
      const { data, error } = await supabase
        .from('campaign_invites')
        .update({ status })
        .eq('id', inviteId)
        .select()
        .single();

      if (error) throw error;

      if (status === 'accepted' && data) {
        // Add user to campaign members
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          await supabase
            .from('campaign_members')
            .insert([{
              campaign_id: data.campaign_id,
              user_id: user.id,
              role: 'player'
            }]);
        }
      }

      // Update local state
      setInvites(prev => prev.map(invite => 
        invite.id === inviteId ? { ...invite, status } : invite
      ));

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to respond to invite';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  return {
    invites,
    loading,
    error,
    sendInvite,
    respondToInvite,
    refetch: fetchInvites,
  };
};