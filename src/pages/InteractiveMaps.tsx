import React, { useState, useRef } from 'react';
import { useLocations } from '../hooks/useLocations';
import { Plus, Map, MapPin, Trash2, Edit, Upload, Save, X } from 'lucide-react';

interface MapMarker {
  id: string;
  x: number;
  y: number;
  label: string;
  linked_entity_id?: string;
  linked_entity_type?: string;
  description?: string;
}

const InteractiveMaps = () => {
  const { locations, updateLocation, loading, error } = useLocations();
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [newMarker, setNewMarker] = useState<Partial<MapMarker>>({});
  const mapRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const locationsWithMaps = locations.filter(loc => loc.map_image_url);

  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location);
    setMarkers(location.map_markers || []);
    setIsEditing(false);
    setIsAddingMarker(false);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingMarker || !mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setNewMarker({
      id: Date.now().toString(),
      x,
      y,
      label: '',
      description: ''
    });
  };

  const handleMarkerSave = () => {
    if (!newMarker.label) return;

    const marker: MapMarker = {
      id: newMarker.id || Date.now().toString(),
      x: newMarker.x || 0,
      y: newMarker.y || 0,
      label: newMarker.label,
      description: newMarker.description,
      linked_entity_id: newMarker.linked_entity_id,
      linked_entity_type: newMarker.linked_entity_type
    };

    setMarkers(prev => [...prev, marker]);
    setNewMarker({});
    setIsAddingMarker(false);
  };

  const handleMarkerDelete = (markerId: string) => {
    setMarkers(prev => prev.filter(m => m.id !== markerId));
  };

  const handleSaveMap = async () => {
    if (!selectedLocation) return;

    try {
      await updateLocation(selectedLocation.id, {
        map_markers: markers
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save map:', err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedLocation) return;

    // In a real implementation, you would upload to Supabase Storage
    // For now, we'll use a placeholder URL
    const imageUrl = URL.createObjectURL(file);
    
    try {
      await updateLocation(selectedLocation.id, {
        map_image_url: imageUrl
      });
      setSelectedLocation(prev => ({ ...prev, map_image_url: imageUrl }));
    } catch (err) {
      console.error('Failed to upload image:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading maps...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
        <p className="text-red-400">Error loading maps: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Map className="h-8 w-8 text-green-400" />
          <h1 className="text-3xl font-bold">Interactive Maps</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Location List */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Locations with Maps</h3>
            {locationsWithMaps.length === 0 ? (
              <p className="text-slate-400 text-sm">No locations with maps yet. Add map images to your locations first.</p>
            ) : (
              <div className="space-y-2">
                {locationsWithMaps.map(location => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location)}
                    className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                      selectedLocation?.id === location.id
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    }`}
                  >
                    <div className="font-medium">{location.name}</div>
                    <div className="text-xs opacity-75">{location.type}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map Display */}
        <div className="lg:col-span-3">
          {selectedLocation ? (
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedLocation.name}</h2>
                <div className="flex space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload Map</span>
                  </button>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveMap}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setIsAddingMarker(false);
                          setNewMarker({});
                        }}
                        className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="mb-4 p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-300">
                      {isAddingMarker ? 'Click on the map to place a marker' : 'Click "Add Marker" then click on the map'}
                    </p>
                    <button
                      onClick={() => setIsAddingMarker(!isAddingMarker)}
                      className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 ${
                        isAddingMarker
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                      <span>{isAddingMarker ? 'Cancel' : 'Add Marker'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Map Container */}
              <div className="relative">
                <div
                  ref={mapRef}
                  className={`relative w-full h-96 bg-slate-700 rounded-lg overflow-hidden ${
                    isAddingMarker ? 'cursor-crosshair' : 'cursor-default'
                  }`}
                  onClick={handleMapClick}
                >
                  {selectedLocation.map_image_url ? (
                    <img
                      src={selectedLocation.map_image_url}
                      alt={selectedLocation.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Map className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-400">No map image uploaded</p>
                      </div>
                    </div>
                  )}

                  {/* Existing Markers */}
                  {markers.map(marker => (
                    <div
                      key={marker.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                      style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                    >
                      <div className="relative">
                        <MapPin className="h-6 w-6 text-red-500 drop-shadow-lg" />
                        {isEditing && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkerDelete(marker.id);
                            }}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            ×
                          </button>
                        )}
                        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                          {marker.label}
                          {marker.description && (
                            <div className="text-slate-300 text-xs mt-1">{marker.description}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* New Marker Preview */}
                  {newMarker.x !== undefined && newMarker.y !== undefined && (
                    <div
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${newMarker.x}%`, top: `${newMarker.y}%` }}
                    >
                      <MapPin className="h-6 w-6 text-yellow-500 drop-shadow-lg animate-pulse" />
                    </div>
                  )}
                </div>
              </div>

              {/* New Marker Form */}
              {newMarker.x !== undefined && (
                <div className="mt-4 p-4 bg-slate-700 rounded-lg">
                  <h4 className="text-lg font-semibold mb-3">Add Marker</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Label
                      </label>
                      <input
                        type="text"
                        value={newMarker.label || ''}
                        onChange={(e) => setNewMarker(prev => ({ ...prev, label: e.target.value }))}
                        className="w-full bg-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Marker name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={newMarker.description || ''}
                        onChange={(e) => setNewMarker(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Optional description"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={handleMarkerSave}
                      disabled={!newMarker.label}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      Save Marker
                    </button>
                    <button
                      onClick={() => {
                        setNewMarker({});
                        setIsAddingMarker(false);
                      }}
                      className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Markers List */}
              {markers.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-3">Map Markers</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {markers.map(marker => (
                      <div key={marker.id} className="bg-slate-700 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-white">{marker.label}</h5>
                            {marker.description && (
                              <p className="text-slate-400 text-sm">{marker.description}</p>
                            )}
                          </div>
                          {isEditing && (
                            <button
                              onClick={() => handleMarkerDelete(marker.id)}
                              className="text-slate-400 hover:text-red-400 transition-colors duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-800 rounded-lg p-12 text-center">
              <Map className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <p className="text-xl text-slate-300 mb-2">Select a location to view its map</p>
              <p className="text-slate-400">Choose a location from the list to start working with interactive maps</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveMaps;