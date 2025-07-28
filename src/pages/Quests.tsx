import React, { useState } from 'react';
import { useQuests } from '../hooks/useQuests';
import { Plus, Scroll, Trash2, Pencil, Trophy, Coins, Star, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const Quests = () => {
  const { quests, addQuest, updateQuest, deleteQuest, loading, error } = useQuests();
  const [isCreating, setIsCreating] = useState(false);
  const [editingQuest, setEditingQuest] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    objectives: '',
    rewards: '',
    status: 'active' as const,
    difficulty: 'medium' as const,
    experience_reward: 0,
    gold_reward: 0,
    notes: ''
  });

  const difficulties = [
    { value: 'easy', label: 'Easy', color: 'text-green-400', icon: '🟢' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-400', icon: '🟡' },
    { value: 'hard', label: 'Hard', color: 'text-orange-400', icon: '🟠' },
    { value: 'deadly', label: 'Deadly', color: 'text-red-400', icon: '🔴' }
  ];

  const statuses = [
    { value: 'active', label: 'Active', color: 'text-blue-400', icon: Clock },
    { value: 'completed', label: 'Completed', color: 'text-green-400', icon: CheckCircle },
    { value: 'failed', label: 'Failed', color: 'text-red-400', icon: XCircle },
    { value: 'abandoned', label: 'Abandoned', color: 'text-gray-400', icon: AlertTriangle }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const questData = {
      ...formData,
      objectives: formData.objectives.split('\n').map(o => o.trim()).filter(o => o),
      rewards: formData.rewards.split('\n').map(r => r.trim()).filter(r => r)
    };
    addQuest(questData)
      .then(() => {
        setFormData({
          name: '', description: '', objectives: '', rewards: '', status: 'active',
          difficulty: 'medium', experience_reward: 0, gold_reward: 0, notes: ''
        });
        setIsCreating(false);
      })
      .catch(err => console.error('Failed to create quest:', err));
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuest) return;
    const questData = {
      ...formData,
      objectives: formData.objectives.split('\n').map(o => o.trim()).filter(o => o),
      rewards: formData.rewards.split('\n').map(r => r.trim()).filter(r => r)
    };
    updateQuest(editingQuest.id, questData)
      .then(() => {
        setEditingQuest(null);
        setFormData({
          name: '', description: '', objectives: '', rewards: '', status: 'active',
          difficulty: 'medium', experience_reward: 0, gold_reward: 0, notes: ''
        });
      })
      .catch(err => console.error('Failed to update quest:', err));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this quest?')) {
      try {
        await deleteQuest(id);
      } catch (err) {
        console.error('Failed to delete quest:', err);
      }
    }
  };

  const handleEdit = (quest: any) => {
    setEditingQuest(quest);
    setIsCreating(false);
    setFormData({
      name: quest.name,
      description: quest.description || '',
      objectives: Array.isArray(quest.objectives) ? quest.objectives.join('\n') : '',
      rewards: Array.isArray(quest.rewards) ? quest.rewards.join('\n') : '',
      status: quest.status,
      difficulty: quest.difficulty,
      experience_reward: quest.experience_reward || 0,
      gold_reward: quest.gold_reward || 0,
      notes: quest.notes || ''
    });
  };

  const getDifficultyInfo = (difficulty: string) => {
    return difficulties.find(d => d.value === difficulty) || difficulties[1];
  };

  const getStatusInfo = (status: string) => {
    return statuses.find(s => s.value === status) || statuses[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading quests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
        <p className="text-red-400">Error loading quests: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Scroll className="h-8 w-8 text-amber-400" />
          <h1 className="text-3xl font-bold">Quests & Adventures</h1>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingQuest(null);
            setFormData({
              name: '', description: '', objectives: '', rewards: '', status: 'active',
              difficulty: 'medium', experience_reward: 0, gold_reward: 0, notes: ''
            });
          }}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Quest</span>
        </button>
      </div>

      {/* Edit Quest Form */}
      {editingQuest && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Edit Quest</h3>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Quest Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {difficulties.map(diff => (
                    <option key={diff.value} value={diff.value}>{diff.icon} {diff.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  XP Reward
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.experience_reward}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience_reward: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Gold Reward
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.gold_reward}
                  onChange={(e) => setFormData(prev => ({ ...prev, gold_reward: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Describe the quest..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Objectives (one per line)
                </label>
                <textarea
                  value={formData.objectives}
                  onChange={(e) => setFormData(prev => ({ ...prev, objectives: e.target.value }))}
                  rows={4}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Find the ancient artifact&#10;Defeat the dragon&#10;Return to the village"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Rewards (one per line)
                </label>
                <textarea
                  value={formData.rewards}
                  onChange={(e) => setFormData(prev => ({ ...prev, rewards: e.target.value }))}
                  rows={4}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Magic sword&#10;Bag of holding&#10;Noble title"
                />
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
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Additional notes for the DM..."
              />
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
                  setEditingQuest(null);
                  setFormData({
                    name: '', description: '', objectives: '', rewards: '', status: 'active',
                    difficulty: 'medium', experience_reward: 0, gold_reward: 0, notes: ''
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

      {/* Create Quest Form */}
      {isCreating && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Add New Quest</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Quest Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {difficulties.map(diff => (
                    <option key={diff.value} value={diff.value}>{diff.icon} {diff.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  XP Reward
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.experience_reward}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience_reward: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Gold Reward
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.gold_reward}
                  onChange={(e) => setFormData(prev => ({ ...prev, gold_reward: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Describe the quest..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Objectives (one per line)
                </label>
                <textarea
                  value={formData.objectives}
                  onChange={(e) => setFormData(prev => ({ ...prev, objectives: e.target.value }))}
                  rows={4}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Find the ancient artifact&#10;Defeat the dragon&#10;Return to the village"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Rewards (one per line)
                </label>
                <textarea
                  value={formData.rewards}
                  onChange={(e) => setFormData(prev => ({ ...prev, rewards: e.target.value }))}
                  rows={4}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Magic sword&#10;Bag of holding&#10;Noble title"
                />
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
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Additional notes for the DM..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Add Quest
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

      {quests.length === 0 && !isCreating && !editingQuest ? (
        <div className="text-center py-12">
          <Scroll className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl text-slate-300 mb-2">No quests yet</p>
          <p className="text-slate-400 mb-6">Create epic adventures for your players</p>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Create First Quest
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quests.map(quest => {
            const difficultyInfo = getDifficultyInfo(quest.difficulty);
            const statusInfo = getStatusInfo(quest.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div key={quest.id} className="bg-slate-800 rounded-lg p-6 hover:bg-slate-750 transition-colors duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{quest.name}</h3>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-1">
                        <span className={`text-sm font-medium ${difficultyInfo.color}`}>
                          {difficultyInfo.icon} {difficultyInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                        <span className={`text-sm font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(quest)}
                      className="text-slate-400 hover:text-blue-400 transition-colors duration-200"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(quest.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {quest.description && (
                  <p className="text-slate-300 mb-4 text-sm">{quest.description}</p>
                )}
                
                {/* Objectives */}
                {quest.objectives && quest.objectives.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-slate-400 mb-2">Objectives:</p>
                    <ul className="space-y-1">
                      {quest.objectives.map((objective, index) => (
                        <li key={index} className="text-slate-300 text-sm flex items-start">
                          <span className="text-amber-400 mr-2">•</span>
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Rewards */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    {quest.experience_reward > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-blue-400" />
                        <span className="text-blue-400">{quest.experience_reward} XP</span>
                      </div>
                    )}
                    {quest.gold_reward > 0 && (
                      <div className="flex items-center space-x-1">
                        <Coins className="h-4 w-4 text-yellow-400" />
                        <span className="text-yellow-400">{quest.gold_reward} GP</span>
                      </div>
                    )}
                  </div>
                  <span className="text-slate-400">
                    {new Date(quest.created_at || '').toLocaleDateString()}
                  </span>
                </div>
                
                {/* Item Rewards */}
                {quest.rewards && quest.rewards.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">Item Rewards:</p>
                    <div className="flex flex-wrap gap-1">
                      {quest.rewards.slice(0, 3).map((reward, index) => (
                        <span
                          key={index}
                          className="bg-amber-700/50 text-amber-300 px-2 py-1 rounded text-xs"
                        >
                          {reward}
                        </span>
                      ))}
                      {quest.rewards.length > 3 && (
                        <span className="text-xs text-slate-400">
                          +{quest.rewards.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Quests;