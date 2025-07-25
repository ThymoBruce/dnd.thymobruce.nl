import React, { useState } from 'react';
import { useNPCs } from '../hooks/useNPCs';
import { Plus, UserCheck, Trash2 } from 'lucide-react';

const NPCs = () => {
  const { npcs, addNPC, deleteNPC, loading, error } = useNPCs();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    race: '',
    occupation: '',
    location: '',
    disposition: '',
    description: '',
    notes: ''
  });

  const dispositions = ['Friendly', 'Neutral', 'Hostile', 'Helpful', 'Suspicious', 'Indifferent'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addNPC(formData)
      .then(() => {
        setFormData({ name: '', race: '', occupation: '', location: '', disposition: '', description: '', notes: '' });
        setIsCreating(false);
      })
      .catch(err => console.error('Failed to create NPC:', err));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this NPC?')) {
      try {
        await deleteNPC(id);
      } catch (err) {
        console.error('Failed to delete NPC:', err);
      }
    }
  };

  const getDispositionColor = (disposition: string) => {
    switch (disposition) {
      case 'Friendly': return 'text-green-400';
      case 'Helpful': return 'text-blue-400';
      case 'Neutral': return 'text-yellow-400';
      case 'Indifferent': return 'text-gray-400';
      case 'Suspicious': return 'text-orange-400';
      case 'Hostile': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading NPCs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
        <p className="text-red-400">Error loading NPCs: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UserCheck className="h-8 w-8 text-yellow-400" />
          <h1 className="text-3xl font-bold">NPCs</h1>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add NPC</span>
        </button>
      </div>

      {isCreating && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Add New NPC</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Race
                </label>
                <input
                  type="text"
                  value={formData.race}
                  onChange={(e) => setFormData(prev => ({ ...prev, race: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Occupation
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Disposition
              </label>
              <select
                value={formData.disposition}
                onChange={(e) => setFormData(prev => ({ ...prev, disposition: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              >
                <option value="">Select disposition...</option>
                {dispositions.map(disposition => (
                  <option key={disposition} value={disposition}>{disposition}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Physical appearance, personality, mannerisms..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Plot hooks, relationships, secrets..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Add NPC
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

      {npcs.length === 0 && !isCreating ? (
        <div className="text-center py-12">
          <UserCheck className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl text-slate-300 mb-2">No NPCs yet</p>
          <p className="text-slate-400 mb-6">Add memorable characters for your players to interact with</p>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Add First NPC
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {npcs.map(npc => (
            <div key={npc.id} className="bg-slate-800 rounded-lg p-6 hover:bg-slate-750 transition-colors duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-1">{npc.name}</h3>
                  <p className="text-slate-400 text-sm mb-2">{npc.race} • {npc.occupation}</p>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-slate-400 text-sm">Location:</span>
                    <span className="text-white text-sm">{npc.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 text-sm">Disposition:</span>
                    <span className={`text-sm font-medium ${getDispositionColor(npc.disposition)}`}>
                      {npc.disposition}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(npc.id)}
                  className="text-slate-400 hover:text-red-400 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <p className="text-slate-300 mb-4 text-sm">{npc.description}</p>
              
              {npc.notes && (
                <div className="border-t border-slate-700 pt-4">
                  <p className="text-sm text-slate-400 mb-1">Notes:</p>
                  <p className="text-slate-300 text-sm">{npc.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NPCs;