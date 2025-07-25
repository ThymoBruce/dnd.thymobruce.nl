import React, { useState } from 'react';
import { useCampaigns } from '../hooks/useCampaigns';
import { Plus, BookOpen, Play, Users, Pencil, Trash2 } from 'lucide-react';

const Campaigns = () => {
  const { campaigns, addCampaign, updateCampaign, deleteCampaign, loading, error } = useCampaigns();
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dmName: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCampaign(formData)
      .then(() => {
        setFormData({ name: '', description: '', dmName: '' });
        setIsCreating(false);
      })
      .catch(err => console.error('Failed to create campaign:', err));
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;
    updateCampaign(editingCampaign.id, formData)
      .then(() => {
        setEditingCampaign(null);
        setFormData({ name: formData.name, description: formData.description, dmName: formData.dmName });
      })
      .catch(err => console.error('Failed to update campaign:', err));
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
        <p className="text-red-400">Error loading campaigns: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl font-bold">Campaigns</h1>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setFormData({ name: '', description: '', dmName: '' });
            setEditingCampaign(null);
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Edit Campaign Form */}
      {editingCampaign && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Edit Campaign</h3>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Dungeon Master
              </label>
              <input
                type="text"
                value={formData.dmName}
                onChange={(e) => setFormData(prev => ({ ...prev, dmName: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingCampaign(null);
                  setFormData({ name: '', description: '', dmName: '' });
                }}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Campaign Form */}
      {isCreating && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Create New Campaign</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Dungeon Master
              </label>
              <input
                type="text"
                value={formData.dmName}
                onChange={(e) => setFormData(prev => ({ ...prev, dmName: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Create Campaign
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {campaigns.length === 0 && !isCreating && !editingCampaign ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl text-slate-300 mb-2">No campaigns yet</p>
          <p className="text-slate-400 mb-6">Create your first campaign to start your adventure</p>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map(campaign => (
            <div
              key={campaign.id}
              className={`bg-slate-800 rounded-lg p-6 hover:bg-slate-750 transition-colors duration-200 ${activeCampaign?.id === campaign.id ? 'ring-2 ring-amber-500' : ''
                }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">{campaign.name}</h3>
                  <p className="text-slate-300 mb-3">{campaign.description}</p>
                  <p className="text-sm text-slate-400">DM: {campaign.dmName}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {activeCampaign?.id === campaign.id && (
                    <div className="bg-amber-500 text-slate-900 px-2 py-1 rounded text-xs font-medium mb-1">
                      Active
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingCampaign(campaign);
                        setIsCreating(false);
                        setFormData({
                          name: campaign.name,
                          description: campaign.description,
                          dmName: campaign.dmName,
                        });
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs flex items-center space-x-1 transition-colors duration-200"
                    >
                      <Pencil className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${campaign.name}"?`)) {
                          deleteCampaign(campaign.id);
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs flex items-center space-x-1 transition-colors duration-200"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Created {new Date(campaign.created_at || campaign.createdAt).toLocaleDateString()}
                </p>
                {activeCampaign?.id !== campaign.id && (
                  <button
                    onClick={() => setActiveCampaign(campaign)}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors duration-200"
                  >
                    <Play className="h-3 w-3" />
                    <span>Set Active</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Campaigns;