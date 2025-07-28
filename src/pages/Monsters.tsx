import React, { useState } from 'react';
import { useMonsters } from '../hooks/useMonsters';
import { Plus, Skull, Trash2, Pencil } from 'lucide-react';

const Monsters = () => {
  const { monsters, addMonster, updateMonster, deleteMonster, loading, error } = useMonsters();
  const [isCreating, setIsCreating] = useState(false);
  const [editingMonster, setEditingMonster] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    size: '',
    cr: '',
    ac: '',
    hp: '',
    speed: '',
    environment: '',
    abilities: '',
    resistances: '',
    vulnerabilities: ''
  });

  const monsterTypes = [
    'Aberration', 'Beast', 'Celestial', 'Construct', 'Dragon', 'Elemental',
    'Fey', 'Fiend', 'Giant', 'Humanoid', 'Monstrosity', 'Ooze', 'Plant', 'Undead'
  ];

  const sizes = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];

  const challengeRatings = [
    '0', '1/8', '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '30'
  ];

  const getCRColor = (cr: string) => {
    const numCR = cr.includes('/') ? parseFloat(cr.split('/')[0]) / parseFloat(cr.split('/')[1]) : parseFloat(cr);
    if (numCR <= 0.5) return 'text-green-400';
    if (numCR <= 4) return 'text-yellow-400';
    if (numCR <= 10) return 'text-orange-400';
    if (numCR <= 16) return 'text-red-400';
    return 'text-purple-400';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const monsterData = {
      ...formData,
      ac: parseInt(formData.ac) || 10,
      hp: parseInt(formData.hp) || 1,
      abilities: formData.abilities.split(',').map(a => a.trim()).filter(a => a),
      resistances: formData.resistances.split(',').map(r => r.trim()).filter(r => r),
      vulnerabilities: formData.vulnerabilities.split(',').map(v => v.trim()).filter(v => v)
    };
    addMonster(monsterData)
      .then(() => {
        setFormData({
          name: '', type: '', size: '', cr: '', ac: '', hp: '', speed: '',
          environment: '', abilities: '', resistances: '', vulnerabilities: ''
        });
        setIsCreating(false);
      })
      .catch(err => console.error('Failed to create monster:', err));
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMonster) return;
    const monsterData = {
      ...formData,
      ac: parseInt(formData.ac) || 10,
      hp: parseInt(formData.hp) || 1,
      abilities: formData.abilities.split(',').map(a => a.trim()).filter(a => a),
      resistances: formData.resistances.split(',').map(r => r.trim()).filter(r => r),
      vulnerabilities: formData.vulnerabilities.split(',').map(v => v.trim()).filter(v => v)
    };
    updateMonster(editingMonster.id, monsterData)
      .then(() => {
        setEditingMonster(null);
        setFormData({
          name: '', type: '', size: '', cr: '', ac: '', hp: '', speed: '',
          environment: '', abilities: '', resistances: '', vulnerabilities: ''
        });
      })
      .catch(err => console.error('Failed to update monster:', err));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this monster?')) {
      try {
        await deleteMonster(id);
      } catch (err) {
        console.error('Failed to delete monster:', err);
      }
    }
  };

  const handleEdit = (monster: any) => {
    setEditingMonster(monster);
    setIsCreating(false);
    setFormData({
      name: monster.name,
      type: monster.type,
      size: monster.size,
      cr: monster.cr,
      ac: monster.ac.toString(),
      hp: monster.hp.toString(),
      speed: monster.speed,
      environment: monster.environment || '',
      abilities: Array.isArray(monster.abilities) ? monster.abilities.join(', ') : monster.abilities || '',
      resistances: Array.isArray(monster.resistances) ? monster.resistances.join(', ') : monster.resistances || '',
      vulnerabilities: Array.isArray(monster.vulnerabilities) ? monster.vulnerabilities.join(', ') : monster.vulnerabilities || ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading monsters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
        <p className="text-red-400">Error loading monsters: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skull className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl font-bold">Monsters & Creatures</h1>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingMonster(null);
            setFormData({
              name: '', type: '', size: '', cr: '', ac: '', hp: '', speed: '',
              environment: '', abilities: '', resistances: '', vulnerabilities: ''
            });
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Monster</span>
        </button>
      </div>

      {/* Edit Monster Form */}
      {editingMonster && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Edit Monster</h3>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Monster Name
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
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select type...</option>
                  {monsterTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Size
                </label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select size...</option>
                  {sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Challenge Rating
                </label>
                <select
                  value={formData.cr}
                  onChange={(e) => setFormData(prev => ({ ...prev, cr: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select CR...</option>
                  {challengeRatings.map(cr => (
                    <option key={cr} value={cr}>{cr}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Environment
                </label>
                <input
                  type="text"
                  value={formData.environment}
                  onChange={(e) => setFormData(prev => ({ ...prev, environment: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Forest, Dungeon, etc."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Armor Class
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.ac}
                  onChange={(e) => setFormData(prev => ({ ...prev, ac: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Hit Points
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.hp}
                  onChange={(e) => setFormData(prev => ({ ...prev, hp: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Speed
                </label>
                <input
                  type="text"
                  value={formData.speed}
                  onChange={(e) => setFormData(prev => ({ ...prev, speed: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="30 ft., fly 60 ft."
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Special Abilities (comma-separated)
              </label>
              <input
                type="text"
                value={formData.abilities}
                onChange={(e) => setFormData(prev => ({ ...prev, abilities: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Multiattack, Breath Weapon, etc."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Damage Resistances (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.resistances}
                  onChange={(e) => setFormData(prev => ({ ...prev, resistances: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Fire, Cold, Necrotic, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Damage Vulnerabilities (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.vulnerabilities}
                  onChange={(e) => setFormData(prev => ({ ...prev, vulnerabilities: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Radiant, Slashing, etc."
                />
              </div>
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
                  setEditingMonster(null);
                  setFormData({
                    name: '', type: '', size: '', cr: '', ac: '', hp: '', speed: '',
                    environment: '', abilities: '', resistances: '', vulnerabilities: ''
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

      {/* Create Monster Form */}
      {isCreating && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Add New Monster</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Monster Name
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
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select type...</option>
                  {monsterTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Size
                </label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select size...</option>
                  {sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Challenge Rating
                </label>
                <select
                  value={formData.cr}
                  onChange={(e) => setFormData(prev => ({ ...prev, cr: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select CR...</option>
                  {challengeRatings.map(cr => (
                    <option key={cr} value={cr}>{cr}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Environment
                </label>
                <input
                  type="text"
                  value={formData.environment}
                  onChange={(e) => setFormData(prev => ({ ...prev, environment: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Forest, Dungeon, etc."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Armor Class
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.ac}
                  onChange={(e) => setFormData(prev => ({ ...prev, ac: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Hit Points
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.hp}
                  onChange={(e) => setFormData(prev => ({ ...prev, hp: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Speed
                </label>
                <input
                  type="text"
                  value={formData.speed}
                  onChange={(e) => setFormData(prev => ({ ...prev, speed: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="30 ft., fly 60 ft."
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Special Abilities (comma-separated)
              </label>
              <input
                type="text"
                value={formData.abilities}
                onChange={(e) => setFormData(prev => ({ ...prev, abilities: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Multiattack, Breath Weapon, etc."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Damage Resistances (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.resistances}
                  onChange={(e) => setFormData(prev => ({ ...prev, resistances: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Fire, Cold, Necrotic, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Damage Vulnerabilities (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.vulnerabilities}
                  onChange={(e) => setFormData(prev => ({ ...prev, vulnerabilities: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Radiant, Slashing, etc."
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Add Monster
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

      {monsters.length === 0 && !isCreating && !editingMonster ? (
        <div className="text-center py-12">
          <Skull className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl text-slate-300 mb-2">No monsters yet</p>
          <p className="text-slate-400 mb-6">Add fearsome creatures for your players to encounter</p>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Add First Monster
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {monsters.map(monster => (
            <div key={monster.id} className="bg-slate-800 rounded-lg p-6 hover:bg-slate-750 transition-colors duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-1">{monster.name}</h3>
                  <p className="text-slate-400 text-sm mb-2">{monster.size} {monster.type}</p>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-slate-400 text-sm">CR:</span>
                    <span className={`text-sm font-bold ${getCRColor(monster.cr)}`}>
                      {monster.cr}
                    </span>
                  </div>
                  {monster.environment && (
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 text-sm">Environment:</span>
                      <span className="text-white text-sm">{monster.environment}</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDelete(monster.id)}
                    className="text-slate-400 hover:text-red-400 transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(monster)}
                    className="text-slate-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Combat Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-400">AC</p>
                  <p className="text-sm font-bold text-white">{monster.ac}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-400">HP</p>
                  <p className="text-sm font-bold text-white">{monster.hp}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-400">Speed</p>
                  <p className="text-xs font-bold text-white">{monster.speed}</p>
                </div>
              </div>
              
              {/* Special Abilities */}
              {monster.abilities && monster.abilities.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-slate-400 mb-2">Special Abilities:</p>
                  <div className="flex flex-wrap gap-1">
                    {monster.abilities.map((ability, index) => (
                      <span
                        key={index}
                        className="bg-purple-700/50 text-purple-300 px-2 py-1 rounded text-xs"
                      >
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Resistances and Vulnerabilities */}
              <div className="space-y-2">
                {monster.resistances && monster.resistances.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400">Resistances:</p>
                    <div className="flex flex-wrap gap-1">
                      {monster.resistances.map((resistance, index) => (
                        <span
                          key={index}
                          className="bg-green-700/50 text-green-300 px-2 py-1 rounded text-xs"
                        >
                          {resistance}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {monster.vulnerabilities && monster.vulnerabilities.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400">Vulnerabilities:</p>
                    <div className="flex flex-wrap gap-1">
                      {monster.vulnerabilities.map((vulnerability, index) => (
                        <span
                          key={index}
                          className="bg-red-700/50 text-red-300 px-2 py-1 rounded text-xs"
                        >
                          {vulnerability}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Monsters;