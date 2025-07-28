import React, { useState } from 'react';
import { useTimelineEvents } from '../hooks/useTimelineEvents';
import { useLoreEntries } from '../hooks/useLoreEntries';
import { useCampaigns } from '../hooks/useCampaigns';
import { Plus, Clock, Trash2, Pencil, Link, Calendar } from 'lucide-react';

const Timeline = () => {
  const { timelineEvents, addTimelineEvent, updateTimelineEvent, deleteTimelineEvent, loading, error } = useTimelineEvents();
  const { loreEntries } = useLoreEntries();
  const { campaigns } = useCampaigns();
  const [isCreating, setIsCreating] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_year: '',
    campaign_id: '',
    linked_lore_id: '',
    is_private: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventData = {
      ...formData,
      event_year: formData.event_year ? parseInt(formData.event_year) : undefined,
      campaign_id: formData.campaign_id || undefined,
      linked_lore_id: formData.linked_lore_id || undefined
    };
    addTimelineEvent(eventData)
      .then(() => {
        setFormData({
          title: '', description: '', event_date: '', event_year: '', 
          campaign_id: '', linked_lore_id: '', is_private: true
        });
        setIsCreating(false);
      })
      .catch(err => console.error('Failed to create timeline event:', err));
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    const eventData = {
      ...formData,
      event_year: formData.event_year ? parseInt(formData.event_year) : undefined,
      campaign_id: formData.campaign_id || undefined,
      linked_lore_id: formData.linked_lore_id || undefined
    };
    updateTimelineEvent(editingEvent.id, eventData)
      .then(() => {
        setEditingEvent(null);
        setFormData({
          title: '', description: '', event_date: '', event_year: '', 
          campaign_id: '', linked_lore_id: '', is_private: true
        });
      })
      .catch(err => console.error('Failed to update timeline event:', err));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this timeline event?')) {
      try {
        await deleteTimelineEvent(id);
      } catch (err) {
        console.error('Failed to delete timeline event:', err);
      }
    }
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setIsCreating(false);
    setFormData({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date,
      event_year: event.event_year?.toString() || '',
      campaign_id: event.campaign_id || '',
      linked_lore_id: event.linked_lore_id || '',
      is_private: event.is_private
    });
  };

  const getLinkedLoreTitle = (loreId: string) => {
    const lore = loreEntries.find(l => l.id === loreId);
    return lore?.title || 'Unknown Lore';
  };

  const getCampaignName = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign?.name || 'Unknown Campaign';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading timeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
        <p className="text-red-400">Error loading timeline: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Clock className="h-8 w-8 text-indigo-400" />
          <h1 className="text-3xl font-bold">World Timeline</h1>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingEvent(null);
            setFormData({
              title: '', description: '', event_date: '', event_year: '', 
              campaign_id: '', linked_lore_id: '', is_private: true
            });
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Edit Event Form */}
      {editingEvent && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Edit Timeline Event</h3>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Year (for sorting)
                </label>
                <input
                  type="number"
                  value={formData.event_year}
                  onChange={(e) => setFormData(prev => ({ ...prev, event_year: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 1347"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date Description
              </label>
              <input
                type="text"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 'The 15th day of Mirtul, 1347 DR' or 'Age of Dragons, Year 234'"
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
                rows={4}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe what happened during this event..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Campaign (optional)
                </label>
                <select
                  value={formData.campaign_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, campaign_id: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">General World Event</option>
                  {campaigns.map(campaign => (
                    <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Linked Lore (optional)
                </label>
                <select
                  value={formData.linked_lore_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, linked_lore_id: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">No linked lore</option>
                  {loreEntries.map(lore => (
                    <option key={lore.id} value={lore.id}>{lore.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_private_edit"
                checked={!formData.is_private}
                onChange={(e) => setFormData(prev => ({ ...prev, is_private: !e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="is_private_edit" className="text-slate-300">Make public</label>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingEvent(null);
                  setFormData({
                    title: '', description: '', event_date: '', event_year: '', 
                    campaign_id: '', linked_lore_id: '', is_private: true
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

      {/* Create Event Form */}
      {isCreating && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Add New Timeline Event</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="The Great Dragon War"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Year (for sorting)
                </label>
                <input
                  type="number"
                  value={formData.event_year}
                  onChange={(e) => setFormData(prev => ({ ...prev, event_year: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 1347"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date Description
              </label>
              <input
                type="text"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 'The 15th day of Mirtul, 1347 DR' or 'Age of Dragons, Year 234'"
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
                rows={4}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe what happened during this event..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Campaign (optional)
                </label>
                <select
                  value={formData.campaign_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, campaign_id: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">General World Event</option>
                  {campaigns.map(campaign => (
                    <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Linked Lore (optional)
                </label>
                <select
                  value={formData.linked_lore_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, linked_lore_id: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">No linked lore</option>
                  {loreEntries.map(lore => (
                    <option key={lore.id} value={lore.id}>{lore.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_private"
                checked={!formData.is_private}
                onChange={(e) => setFormData(prev => ({ ...prev, is_private: !e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="is_private" className="text-slate-300">Make public</label>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Add Event
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

      {/* Timeline Events */}
      {timelineEvents.length === 0 && !isCreating && !editingEvent ? (
        <div className="text-center py-12">
          <Clock className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl text-slate-300 mb-2">No timeline events yet</p>
          <p className="text-slate-400 mb-6">Start documenting your world's history</p>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Add First Event
          </button>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-indigo-400"></div>
          
          <div className="space-y-8">
            {timelineEvents.map((event, index) => (
              <div key={event.id} className="relative flex items-start space-x-6">
                {/* Timeline Dot */}
                <div className="flex-shrink-0 w-16 flex justify-center">
                  <div className="w-4 h-4 bg-indigo-400 rounded-full border-4 border-slate-900 relative z-10"></div>
                </div>
                
                {/* Event Content */}
                <div className="flex-1 bg-slate-800 rounded-lg p-6 hover:bg-slate-750 transition-colors duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{event.title}</h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-4 w-4 text-indigo-400" />
                        <span className="text-indigo-300 text-sm">{event.event_date}</span>
                        {event.event_year && (
                          <span className="text-slate-400 text-sm">({event.event_year})</span>
                        )}
                      </div>
                      {event.campaign_id && (
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-purple-700/50 text-purple-300 px-2 py-1 rounded text-xs">
                            {getCampaignName(event.campaign_id)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="text-slate-400 hover:text-blue-400 transition-colors duration-200"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-slate-400 hover:text-red-400 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {event.description && (
                    <p className="text-slate-300 mb-4">{event.description}</p>
                  )}
                  
                  {event.linked_lore_id && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Link className="h-4 w-4 text-amber-400" />
                      <span className="text-amber-300">
                        Linked to: {getLinkedLoreTitle(event.linked_lore_id)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;