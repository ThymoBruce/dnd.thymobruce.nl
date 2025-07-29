import React, { useState } from 'react';
import { useLocations } from '../hooks/useLocations';
import { Plus, MapPin, Trash2, Pencil } from 'lucide-react';

const Locations = () => {
  const { locations, addLocation, updateLocation, deleteLocation, loading, error } = useLocations();
  const [isCreating, setIsCreating] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    population: '',
    government: '',
    notes: ''
  });

  const locationTypes = ['City', 'Town', 'Village', 'Dungeon', 'Wilderness', 'Tavern', 'Shop', 'Temple', 'Castle', 'Other'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const locationData = {
      ...formData,
      population: formData.population ? parseInt(formData.population) : undefined
    };
    addLocation(locationData)
      .then(() => {
        setFormData({ name: '', type: '', description: '', population: '', government: '', notes: '' });
        setIsCreating(false);
      })
      .catch(err => console.error('Failed to create location:', err));
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;
    const locationData = {
      ...formData,
      population: formData.population ? parseInt(formData.population) : undefined
    };
    updateLocation(editingLocation.id, locationData)
      .then(() => {
        setEditingLocation(null);
        setFormData({ name: '', type: '', description: '', population: '', government: '', notes: '' });
      })
      .catch(err => console.error('Failed to update location:', err));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await deleteLocation(id);
      } catch (err) {
        console.error('Failed to delete location:', err);
      }
    }
  };

  const handleEdit = (location: any) => {
    setEditingLocation(location);
    setIsCreating(false);
    setFormData({
      name: location.name,
      type: location.type,
      description: location.description || '',
      population: location.population?.toString() || '',
      government: location.government || '',
      notes: location.notes || ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading locations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
        <p className="text-red-400">Error loading locations: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MapPin className="h-8 w-8 text-green-400" />
          <h1 className="text-2xl sm:text-3xl font-bold">Locations</h1>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingLocation(null);
            setFormData({ name: '', type: '', description: '', population: '', government: '', notes: '' });
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Location</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Edit Location Form */}
      {editingLocation && (
        <div className="bg-slate-800 rounded-lg p-4 sm:p-6">
          <h3 className="text-xl font-semibold mb-4">Edit Location</h3>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Location Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select type...</option>
                  {locationTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
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
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Population (optional)
                </label>
                <input
                  type="number"
                  value={formData.population}
                  onChange={(e) => setFormData(prev => ({ ...prev, population: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Government (optional)
                </label>
                <input
                  type="text"
                  value={formData.government}
                  onChange={(e) => setFormData(prev => ({ ...prev, government: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Monarchy, Council, etc."
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
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Important details, plot hooks, etc."
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingLocation(null);
                  setFormData({ name: '', type: '', description: '', population: '', government: '', notes: '' });
                }}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {isCreating && (
        <div className="bg-slate-800 rounded-lg p-4 sm:p-6">
          <h3 className="text-xl font-semibold mb-4">Add New Location</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Location Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select type...</option>
                  {locationTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
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
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Population (optional)
                </label>
                <input
                  type="number"
                  value={formData.population}
                  onChange={(e) => setFormData(prev => ({ ...prev, population: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Government (optional)
                </label>
                <input
                  type="text"
                  value={formData.government}
                  onChange={(e) => setFormData(prev => ({ ...prev, government: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Monarchy, Council, etc."
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
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Important details, plot hooks, etc."
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Add Location
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setFormData({ name: '', type: '', description: '', population: '', government: '', notes: '' });
                }}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {locations.length === 0 && !isCreating && !editingLocation ? (
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl text-slate-300 mb-2">No locations yet</p>
          <p className="text-slate-400 mb-6">Add cities, dungeons, and important places to your world</p>
          <button
            onClick={() => {
              setIsCreating(true);
              setEditingLocation(null);
              setFormData({ name: '', type: '', description: '', population: '', government: '', notes: '' });
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Add First Location
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map(location => (
            <div key={location.id} className="bg-slate-800 rounded-lg p-4 sm:p-6 hover:bg-slate-750 transition-colors duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-1">{location.name}</h3>
                  <p className="text-green-400 text-sm font-medium mb-2">{location.type}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(location)}
                    className="text-slate-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(location.id)}
                    className="text-slate-400 hover:text-red-400 transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-slate-300 mb-4">{location.description}</p>
              
              <div className="space-y-2 mb-4">
                {location.population && (
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="text-slate-400">Population:</span>
                    <span className="text-white">{Number(location.population).toLocaleString()}</span>
                  </div>
                )}
                {location.government && (
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="text-slate-400">Government:</span>
                    <span className="text-white">{location.government}</span>
                  </div>
                )}
              </div>
              
              {location.notes && (
                <div className="border-t border-slate-700 pt-4">
                  <p className="text-sm text-slate-400 mb-1">Notes:</p>
                  <p className="text-slate-300 text-sm">{location.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Locations;