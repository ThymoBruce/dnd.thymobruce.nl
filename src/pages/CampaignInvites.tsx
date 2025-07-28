import React, { useState } from 'react';
import { useCampaignInvites } from '../hooks/useCampaignInvites';
import { useCampaigns } from '../hooks/useCampaigns';
import { Mail, Send, Check, X, Clock, Users, Plus } from 'lucide-react';

const CampaignInvites = () => {
  const { invites, sendInvite, respondToInvite, loading, error } = useCampaignInvites();
  const { campaigns } = useCampaigns();
  const [isInviting, setIsInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    campaignId: '',
    email: ''
  });
  const [message, setMessage] = useState<string | null>(null);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!inviteForm.campaignId || !inviteForm.email) {
      setMessage('Please select a campaign and enter an email address');
      return;
    }

    const { error } = await sendInvite(inviteForm.campaignId, inviteForm.email);
    
    if (!error) {
      setMessage('Invite sent successfully!');
      setInviteForm({ campaignId: '', email: '' });
      setIsInviting(false);
    }
  };

  const handleRespond = async (inviteId: string, status: 'accepted' | 'declined') => {
    const { error } = await respondToInvite(inviteId, status);
    
    if (!error) {
      setMessage(status === 'accepted' ? 'Invite accepted! You are now part of the campaign.' : 'Invite declined.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'accepted': return 'text-green-400';
      case 'declined': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'accepted': return Check;
      case 'declined': return X;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading invites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl font-bold">Campaign Invites</h1>
        </div>
        <button
          onClick={() => setIsInviting(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Invite Player</span>
        </button>
      </div>

      {/* Send Invite Form */}
      {isInviting && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Invite Player to Campaign</h3>
          <form onSubmit={handleSendInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Campaign
              </label>
              <select
                value={inviteForm.campaignId}
                onChange={(e) => setInviteForm(prev => ({ ...prev, campaignId: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Choose a campaign...</option>
                {campaigns.map(campaign => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Player Email
              </label>
              <input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="player@example.com"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
              >
                <Send className="h-4 w-4" />
                <span>Send Invite</span>
              </button>
              <button
                type="button"
                onClick={() => setIsInviting(false)}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Messages */}
      {(error || message) && (
        <div className={`p-4 rounded-lg ${
          error ? 'bg-red-900/20 border border-red-500/50 text-red-400' : 
          'bg-green-900/20 border border-green-500/50 text-green-400'
        }`}>
          {error || message}
        </div>
      )}

      {/* Invites List */}
      {invites.length === 0 && !isInviting ? (
        <div className="text-center py-12">
          <Mail className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl text-slate-300 mb-2">No campaign invites</p>
          <p className="text-slate-400 mb-6">Invite players to join your campaigns or check for pending invites</p>
          <button
            onClick={() => setIsInviting(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Send First Invite
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {invites.map(invite => {
            const StatusIcon = getStatusIcon(invite.status);
            
            return (
              <div key={invite.id} className="bg-slate-800 rounded-lg p-6 hover:bg-slate-750 transition-colors duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {invite.campaign?.name || 'Unknown Campaign'}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <StatusIcon className={`h-4 w-4 ${getStatusColor(invite.status)}`} />
                        <span className={`text-sm font-medium capitalize ${getStatusColor(invite.status)}`}>
                          {invite.status}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-slate-300 mb-2">
                      {invite.campaign?.description || 'No description available'}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <span>To: {invite.invitee_email}</span>
                      {invite.inviter && (
                        <span>From: {invite.inviter.name}</span>
                      )}
                      <span>
                        {new Date(invite.created_at || '').toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {invite.status === 'pending' && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleRespond(invite.id, 'accepted')}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors duration-200"
                      >
                        <Check className="h-3 w-3" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleRespond(invite.id, 'declined')}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors duration-200"
                      >
                        <X className="h-3 w-3" />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CampaignInvites;