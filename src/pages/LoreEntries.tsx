import React, { useState } from 'react';
import { useLoreEntries } from '../hooks/useLoreEntries';
import { useCampaigns } from '../hooks/useCampaigns';
import { Plus, BookOpen, Trash2, Pencil, Eye, EyeOff, Users, Globe, Search, Filter } from 'lucide-react';

const LoreEntries = () => {
  const { loreEntries, addLoreEntry, updateLoreEntry, deleteLoreEntry, loading, error } = useLoreEntries();
  const { campaigns } = useCampaigns();
  const [isCreating, setIsCreating] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCampaign, setFilterCampaign] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    tags: '',
    campaign_id: '',
    is_private: true,
    is_player_visible: false
  });

  const loreTypes = [
    'general', 'history', 'culture', 'religion', 'geography', 'politics', 
    'organizations', 'legends', 'magic', 'technology', 'languages', 'customs'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entryData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      campaign_id: formData.campaign_id || undefined
    };
    addLoreEntry(entryData)
      .then(() => {
        setFormData({
          title: '', content: '', type: 'general', tags: '', campaign_id: '',
          is_private: true, is_player_visible: false
        });
        setIsCreating(false);
      })
      .catch(err => console.error('Failed to create lore entry:', err));
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;
    const entryData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      campaign_id: formData.campaign_id || undefined
    };
    updateLoreEntry(editingEntry.id, entryData)
      .then(() => {
        setEditingEntry(null);
        setFormData({
          title: '', content: '', type: 'general', tags: '', campaign_id: '',
          is_private: true, is_player_visible: false
        });
      })
      .catch(err => console.error('Failed to update lore entry:', err));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this lore entry?')) {
      try {
        await deleteLoreEntry(id);
      } catch (err) {
        console.error('Failed to delete lore entry:', err);
      }
    }
  };

  const handleEdit = (entry: any) => {
    setEditingEntry(entry);
    setIsCreating(false);
    setFormData({
      title: entry.title,
      content: entry.content,
      type: entry.type,
      tags: Array.isArray(entry.tags) ? entry.tags.join(', ') : '',
      campaign_id: entry.campaign_id || '',
      is_private: entry.is_private,
      is_player_visible: entry.is_player_visible
    });
  };

  const filteredEntries = loreEntries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || entry.type === filterType;
    const matchesCampaign = filterCampaign === 'all' || 
                           (filterCampaign === 'none' && !entry.campaign_id) ||
                           entry.campaign_id === filterCampaign;
    return matchesSearch && matchesType && matchesCampaign;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading lore entries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
        <p className="text-red-400">Error loading lore entries: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-8 w-8 text-amber-400" />
          <h1 className="text-3xl font-bold">World Lore</h1>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingEntry(null);
            setFormData({
              title: '', content: '', type: 'general', tags: '', campaign_id: '',
              is_private: true, is_player_visible: false
            });
          }}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Lore Entry</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search lore..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Types</option>
            {loreTypes.map(type => (
              <option key={type} value={type} className="capitalize">{type}</option>
            ))}
          </select>
          <select
            value={filterCampaign}
            onChange={(e) => setFilterCampaign(e.target.value)}
            className="bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Campaigns</option>
            <option value="none">General Lore</option>
            {campaigns.map(campaign => (
              <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
            ))}
          </select>
          <div className="text-slate-400 text-sm flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            {filteredEntries.length} entries
          </div>
        </div>
      </div>

      {/* Edit Entry Form */}
      {editingEntry && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Edit Lore Entry</h3>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {loreTypes.map(type => (
                    <option key={type} value={type} className="capitalize">{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Campaign (optional)
                </label>
                <select
                  value={formData.campaign_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, campaign_id: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">General World Lore</option>
                  {campaigns.map(campaign => (
                    <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="ancient, magic, kingdom"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Write your lore content here..."
                required
              />
            </div>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!formData.is_private}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_private: !e.target.checked }))}
                  className="rounded"
                />
                <span className="text-slate-300">Make public</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_player_visible}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_player_visible: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-slate-300">Visible to players</span>
              </label>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingEntry(null);
                  setFormData({
                    title: '', content: '', type: 'general', tags: '', campaign_id: '',
                    is_private: true, is_player_visible: false
                  });
                }}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Entry Form */}
      {isCreating && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Add New Lore Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="The Great War of Dragons"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {loreTypes.map(type => (
                    <option key={type} value={type} className="capitalize">{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Campaign (optional)
                </label>
                <select
                  value={formData.campaign_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, campaign_id: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">General World Lore</option>
                  {campaigns.map(campaign => (
                    <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="ancient, magic, kingdom"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Write your lore content here..."
                required
              />
            </div>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!formData.is_private}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_private: !e.target.checked }))}
                  className="rounded"
                />
                <span className="text-slate-300">Make public</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_player_visible}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_player_visible: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-slate-300">Visible to players</span>
              </label>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Add Lore Entry
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

      {/* Lore Entries List */}
      {filteredEntries.length === 0 && !isCreating && !editingEntry ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl text-slate-300 mb-2">No lore entries yet</p>
          <p className="text-slate-400 mb-6">Start building your world's history and lore</p>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Create First Entry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map(entry => (
            <div key={entry.id} className="bg-slate-800 rounded-lg p-6 hover:bg-slate-750 transition-colors duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">{entry.title}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-amber-700/50 text-amber-300 px-2 py-1 rounded text-xs capitalize">
                      {entry.type}
                    </span>
                    {entry.campaign_id && (
                      <span className="bg-purple-700/50 text-purple-300 px-2 py-1 rounded text-xs">
                        Campaign
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    {entry.is_private ? (
                      <Eye className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Globe className="h-4 w-4 text-green-400" />
                    )}
                    {entry.is_player_visible && (
                      <Users className="h-4 w-4 text-blue-400" />
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="text-slate-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-slate-400 hover:text-red-400 transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-slate-300 mb-4 text-sm line-clamp-3">
                {entry.content.substring(0, 150)}...
              </p>
              
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {entry.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {entry.tags.length > 3 && (
                    <span className="text-xs text-slate-400">
                      +{entry.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoreEntries;