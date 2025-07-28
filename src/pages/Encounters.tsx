import React, { useState } from 'react';
import { useEncounters } from '../hooks/useEncounters';
import { useCharacters } from '../hooks/useCharacters';
import { useMonsters } from '../hooks/useMonsters';
import { Plus, Swords, Play, Pause, RotateCcw, Users, Skull, Trash2, Pencil, Crown } from 'lucide-react';

const Encounters = () => {
  const { encounters, addEncounter, updateEncounter, deleteEncounter, loading, error } = useEncounters();
  const { characters } = useCharacters();
  const { monsters } = useMonsters();
  const [isCreating, setIsCreating] = useState(false);
  const [editingEncounter, setEditingEncounter] = useState<any>(null);
  const [activeEncounter, setActiveEncounter] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedCharacters: [] as string[],
    selectedMonsters: [] as string[],
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const encounterData = {
      ...formData,
      status: 'planned' as const,
      participants: [
        ...formData.selectedCharacters.map(id => {
          const char = characters.find(c => c.id === id);
          return {
            id,
            name: char?.name || 'Unknown',
            type: 'character',
            hp: char?.hp || 0,
            max_hp: char?.max_hp || char?.hp || 0,
            ac: char?.ac || 10,
            initiative: 0
          };
        }),
        ...formData.selectedMonsters.map(id => {
          const monster = monsters.find(m => m.id === id);
          return {
            id,
            name: monster?.name || 'Unknown',
            type: 'monster',
            hp: monster?.hp || 0,
            max_hp: monster?.hp || 0,
            ac: monster?.ac || 10,
            initiative: 0
          };
        })
      ]
    };

    addEncounter(encounterData)
      .then(() => {
        setFormData({ name: '', description: '', selectedCharacters: [], selectedMonsters: [], notes: '' });
        setIsCreating(false);
      })
      .catch(err => console.error('Failed to create encounter:', err));
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEncounter) return;
    
    const encounterData = {
      ...formData,
      participants: [
        ...formData.selectedCharacters.map(id => {
          const char = characters.find(c => c.id === id);
          return {
            id,
            name: char?.name || 'Unknown',
            type: 'character',
            hp: char?.hp || 0,
            max_hp: char?.max_hp || char?.hp || 0,
            ac: char?.ac || 10,
            initiative: 0
          };
        }),
        ...formData.selectedMonsters.map(id => {
          const monster = monsters.find(m => m.id === id);
          return {
            id,
            name: monster?.name || 'Unknown',
            type: 'monster',
            hp: monster?.hp || 0,
            max_hp: monster?.hp || 0,
            ac: monster?.ac || 10,
            initiative: 0
          };
        })
      ]
    };

    updateEncounter(editingEncounter.id, encounterData)
      .then(() => {
        setEditingEncounter(null);
        setFormData({ name: '', description: '', selectedCharacters: [], selectedMonsters: [], notes: '' });
      })
      .catch(err => console.error('Failed to update encounter:', err));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this encounter?')) {
      try {
        await deleteEncounter(id);
      } catch (err) {
        console.error('Failed to delete encounter:', err);
      }
    }
  };

  const handleEdit = (encounter: any) => {
    setEditingEncounter(encounter);
    setIsCreating(false);
    const characterIds = encounter.participants?.filter((p: any) => p.type === 'character').map((p: any) => p.id) || [];
    const monsterIds = encounter.participants?.filter((p: any) => p.type === 'monster').map((p: any) => p.id) || [];
    
    setFormData({
      name: encounter.name,
      description: encounter.description || '',
      selectedCharacters: characterIds,
      selectedMonsters: monsterIds,
      notes: encounter.notes || ''
    });
  };

  const startEncounter = (encounter: any) => {
    updateEncounter(encounter.id, { status: 'active', current_round: 1, current_turn: 0 });
    setActiveEncounter(encounter);
  };

  const pauseEncounter = (encounter: any) => {
    updateEncounter(encounter.id, { status: 'planned' });
    setActiveEncounter(null);
  };

  const resetEncounter = (encounter: any) => {
    updateEncounter(encounter.id, { 
      status: 'planned', 
      current_round: 0, 
      current_turn: 0,
      participants: encounter.participants?.map((p: any) => ({ ...p, hp: p.max_hp, initiative: 0 }))
    });
    setActiveEncounter(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'text-blue-400';
      case 'active': return 'text-green-400';
      case 'completed': return 'text-gray-400';
      default: return 'text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading encounters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
        <p className="text-red-400">Error loading encounters: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Swords className="h-8 w-8 text-red-400" />
          <h1 className="text-3xl font-bold">Combat Encounters</h1>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingEncounter(null);
            setFormData({ name: '', description: '', selectedCharacters: [], selectedMonsters: [], notes: '' });
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Create Encounter</span>
        </button>
      </div>

      {/* Edit Encounter Form */}
      {editingEncounter && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Edit Encounter</h3>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Encounter Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Describe the encounter setup..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Characters Involved
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto bg-slate-700 rounded-lg p-3">
                  {characters.map(character => (
                    <label key={character.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.selectedCharacters.includes(character.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ 
                              ...prev, 
                              selectedCharacters: [...prev.selectedCharacters, character.id] 
                            }));
                          } else {
                            setFormData(prev => ({ 
                              ...prev, 
                              selectedCharacters: prev.selectedCharacters.filter(id => id !== character.id) 
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-white text-sm">{character.name} (Lv.{character.level})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Monsters/Enemies
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto bg-slate-700 rounded-lg p-3">
                  {monsters.map(monster => (
                    <label key={monster.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.selectedMonsters.includes(monster.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ 
                              ...prev, 
                              selectedMonsters: [...prev.selectedMonsters, monster.id] 
                            }));
                          } else {
                            setFormData(prev => ({ 
                              ...prev, 
                              selectedMonsters: prev.selectedMonsters.filter(id => id !== monster.id) 
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-white text-sm">{monster.name} (CR {monster.cr})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Tactical notes, special conditions, etc."
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingEncounter(null);
                  setFormData({ name: '', description: '', selectedCharacters: [], selectedMonsters: [], notes: '' });
                }}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Encounter Form */}
      {isCreating && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Create New Encounter</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Encounter Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., Goblin Ambush, Dragon's Lair"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Describe the encounter setup..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Characters Involved
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto bg-slate-700 rounded-lg p-3">
                  {characters.length === 0 ? (
                    <p className="text-slate-400 text-sm">No characters available</p>
                  ) : (
                    characters.map(character => (
                      <label key={character.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.selectedCharacters.includes(character.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ 
                                ...prev, 
                                selectedCharacters: [...prev.selectedCharacters, character.id] 
                              }));
                            } else {
                              setFormData(prev => ({ 
                                ...prev, 
                                selectedCharacters: prev.selectedCharacters.filter(id => id !== character.id) 
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-white text-sm">{character.name} (Lv.{character.level})</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Monsters/Enemies
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto bg-slate-700 rounded-lg p-3">
                  {monsters.length === 0 ? (
                    <p className="text-slate-400 text-sm">No monsters available</p>
                  ) : (
                    monsters.map(monster => (
                      <label key={monster.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.selectedMonsters.includes(monster.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ 
                                ...prev, 
                                selectedMonsters: [...prev.selectedMonsters, monster.id] 
                              }));
                            } else {
                              setFormData(prev => ({ 
                                ...prev, 
                                selectedMonsters: prev.selectedMonsters.filter(id => id !== monster.id) 
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-white text-sm">{monster.name} (CR {monster.cr})</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Tactical notes, special conditions, etc."
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Create Encounter
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

      {encounters.length === 0 && !isCreating && !editingEncounter ? (
        <div className="text-center py-12">
          <Swords className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl text-slate-300 mb-2">No encounters yet</p>
          <p className="text-slate-400 mb-6">Create epic battles for your players</p>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Create First Encounter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {encounters.map(encounter => (
            <div key={encounter.id} className="bg-slate-800 rounded-lg p-6 hover:bg-slate-750 transition-colors duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">{encounter.name}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`text-sm font-medium capitalize ${getStatusColor(encounter.status)}`}>
                      {encounter.status}
                    </span>
                    {encounter.status === 'active' && (
                      <span className="text-xs text-slate-400">
                        Round {encounter.current_round || 1}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(encounter)}
                    className="text-slate-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(encounter.id)}
                    className="text-slate-400 hover:text-red-400 transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {encounter.description && (
                <p className="text-slate-300 mb-4 text-sm">{encounter.description}</p>
              )}
              
              {/* Participants */}
              {encounter.participants && encounter.participants.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-slate-400 mb-2">Participants:</p>
                  <div className="space-y-1">
                    {encounter.participants.map((participant: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          {participant.type === 'character' ? (
                            <Users className="h-3 w-3 text-blue-400" />
                          ) : (
                            <Skull className="h-3 w-3 text-red-400" />
                          )}
                          <span className="text-white">{participant.name}</span>
                        </div>
                        <span className="text-slate-400">
                          HP: {participant.hp}/{participant.max_hp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                {encounter.status === 'planned' && (
                  <button
                    onClick={() => startEncounter(encounter)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center space-x-1 transition-colors duration-200"
                  >
                    <Play className="h-3 w-3" />
                    <span>Start</span>
                  </button>
                )}
                {encounter.status === 'active' && (
                  <>
                    <button
                      onClick={() => pauseEncounter(encounter)}
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center space-x-1 transition-colors duration-200"
                    >
                      <Pause className="h-3 w-3" />
                      <span>Pause</span>
                    </button>
                    <button
                      onClick={() => resetEncounter(encounter)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center space-x-1 transition-colors duration-200"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Reset</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Encounters;