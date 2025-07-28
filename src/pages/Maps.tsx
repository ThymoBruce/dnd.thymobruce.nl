import React, { useState, useRef, useEffect } from 'react';
import { useMaps } from '../hooks/useMaps';
import { Plus, Map, Trash2, Pencil, MapPin, Eye, EyeOff, Save, X, Grid, Zap } from 'lucide-react';
import MapBuildingBlocks from '../components/MapBuildingBlocks';

interface MapMarker {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'location' | 'poi' | 'danger' | 'treasure' | 'npc';
  description?: string;
}

const Maps = () => {
  const { maps, addMap, updateMap, deleteMap, loading, error, generating, generateMapWithAI } = useMaps();
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingMap, setEditingMap] = useState<any>(null);
  const [viewingMap, setViewingMap] = useState<any>(null);
  const [isEditingMarkers, setIsEditingMarkers] = useState(false);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [selectedMarkerType, setSelectedMarkerType] = useState<MapMarker['type']>('location');
  const [showMarkers, setShowMarkers] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMapName, setAiMapName] = useState('');
  const [showBuildingBlocks, setShowBuildingBlocks] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedBuildingBlock, setSelectedBuildingBlock] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    scale: '',
    gridSize: 50
  });

  const markerTypes = [
    { type: 'location' as const, label: 'Location', color: 'bg-blue-500', icon: '🏛️' },
    { type: 'poi' as const, label: 'Point of Interest', color: 'bg-green-500', icon: '⭐' },
    { type: 'danger' as const, label: 'Danger', color: 'bg-red-500', icon: '⚠️' },
    { type: 'treasure' as const, label: 'Treasure', color: 'bg-yellow-500', icon: '💰' },
    { type: 'npc' as const, label: 'NPC', color: 'bg-purple-500', icon: '👤' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mapData = {
      ...formData,
      markers: [],
      gridSize: formData.gridSize || 50
    };
    addMap(mapData)
      .then(() => {
        setFormData({ name: '', description: '', imageUrl: '', scale: '', gridSize: 50 });
        setIsCreating(false);
      })
      .catch(err => console.error('Failed to create map:', err));
  };

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || !aiMapName.trim()) return;

    try {
      await generateMapWithAI(aiPrompt, aiMapName);
      setAiPrompt('');
      setAiMapName('');
      setIsGenerating(false);
    } catch (err) {
      console.error('Failed to generate AI map:', err);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMap) return;
    const mapData = {
      ...formData,
      markers: editingMap.markers || [],
      gridSize: formData.gridSize || 50
    };
    updateMap(editingMap.id, mapData)
      .then(() => {
        setEditingMap(null);
        setFormData({ name: '', description: '', imageUrl: '', scale: '', gridSize: 50 });
      })
      .catch(err => console.error('Failed to update map:', err));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this map?')) {
      try {
        await deleteMap(id);
      } catch (err) {
        console.error('Failed to delete map:', err);
      }
    }
  };

  const handleEdit = (map: any) => {
    setEditingMap(map);
    setIsCreating(false);
    setFormData({
      name: map.name,
      description: map.description || '',
      imageUrl: map.imageUrl || '',
      scale: map.scale || '',
      gridSize: map.gridSize || 50
    });
  };

  const handleViewMap = (map: any) => {
    setViewingMap(map);
    setMarkers(map.markers || []);
    setIsEditingMarkers(false);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditingMarkers || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const label = prompt('Enter marker label:');
    if (!label) return;

    const description = prompt('Enter marker description (optional):') || '';

    const newMarker: MapMarker = {
      id: Date.now().toString(),
      x,
      y,
      label,
      type: selectedMarkerType,
      description
    };

    setMarkers(prev => [...prev, newMarker]);
  };

  const handleSaveMarkers = async () => {
    if (!viewingMap) return;
    
    try {
      await updateMap(viewingMap.id, {
        ...viewingMap,
        markers
      });
      setIsEditingMarkers(false);
      // Update the local viewingMap state
      setViewingMap(prev => ({ ...prev, markers }));
    } catch (err) {
      console.error('Failed to save markers:', err);
    }
  };

  const handleCancelEditing = () => {
    // Reset markers to the original state
    setMarkers(viewingMap?.markers || []);
    setIsEditingMarkers(false);
  };
  const removeMarker = (markerId: string) => {
    setMarkers(prev => prev.filter(m => m.id !== markerId));
  };

  const handleAddBuildingBlock = (block: any, x: number, y: number) => {
    const newMarker: MapMarker = {
      id: Date.now().toString(),
      x,
      y,
      label: block.name,
      type: 'poi', // Default to POI for building blocks
      description: block.description
    };
    setMarkers(prev => [...prev, newMarker]);
  };

  const handleDrop = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!isEditingMarkers) return;
    
    const blockData = e.dataTransfer.getData('text/plain');
    if (!blockData) return;

    let block;
    try {
      block = JSON.parse(blockData);
    } catch (error) {
      console.error('Failed to parse block data:', error);
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newMarker: MapMarker = {
      id: Date.now().toString(),
      x,
      y,
      label: block.name,
      type: 'poi',
      description: block.description
    };
    
    setMarkers(prev => [...prev, newMarker]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleSelectBuildingBlockFromPanel = (block: any) => {
    if (!isEditingMarkers) {
      alert('Please enter edit mode first by clicking "Edit Markers"');
      return;
    }
    
    // Set the selected block for click placement
    setSelectedBuildingBlock(block);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditingMarkers) return;
    
    // Handle regular marker placement
    if (!selectedBuildingBlock) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const label = prompt('Enter marker label:');
      if (!label) return;

      const description = prompt('Enter marker description (optional):') || '';

      const newMarker: MapMarker = {
        id: Date.now().toString(),
        x,
        y,
        label,
        type: selectedMarkerType,
        description
      };

      setMarkers(prev => [...prev, newMarker]);
      return;
    }

    // Handle building block placement
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newMarker: MapMarker = {
      id: Date.now().toString(),
      x,
      y,
      label: selectedBuildingBlock.name,
      type: 'poi',
      description: selectedBuildingBlock.description
    };

    setMarkers(prev => [...prev, newMarker]);
    setSelectedBuildingBlock(null); // Clear selection after placement
  };

  const getMarkerTypeInfo = (type: MapMarker['type']) => {
    return markerTypes.find(t => t.type === type) || markerTypes[0];
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

  // Map Viewer Modal
  if (viewingMap) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 p-4 flex items-center justify-between border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-white">{viewingMap.name}</h2>
            <p className="text-slate-400 text-sm">{viewingMap.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowMarkers(!showMarkers)}
              className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 ${
                showMarkers ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-600 hover:bg-slate-700'
              } text-white`}
            >
              {showMarkers ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              <span>Markers</span>
            </button>
            {isEditingMarkers ? (
              <>
                <select
                  value={selectedMarkerType}
                  onChange={(e) => setSelectedMarkerType(e.target.value as MapMarker['type'])}
                  className="bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {markerTypes.map(type => (
                    <option key={type.type} value={type.type}>{type.icon} {type.label}</option>
                  ))}
                </select>
                <button
                  onClick={handleSaveMarkers}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancelEditing}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditingMarkers(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
              >
                <Pencil className="h-4 w-4" />
                <span>Edit Markers</span>
              </button>
            )}
            <button
              onClick={() => setShowBuildingBlocks(!showBuildingBlocks)}
              className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 ${
                showBuildingBlocks ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-600 hover:bg-slate-700'
              } text-white`}
            >
              <MapPin className="h-4 w-4" />
              <span>Building Blocks</span>
            </button>
            <button
              onClick={() => setViewingMap(null)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Map Canvas */}
        <div className={`flex-1 ${showBuildingBlocks ? 'flex' : 'flex items-center justify-center'} min-h-0`}>
          <div className={`${showBuildingBlocks ? 'flex-1 flex items-center justify-center' : 'w-full h-full flex items-center justify-center'}`}>
            <div className="relative max-w-full max-h-full">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                onClick={handleMapClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`max-w-full max-h-full border border-slate-600 ${
                  isDragOver 
                    ? 'border-green-500 shadow-lg shadow-green-500/20' 
                    : 'border-slate-600'
                } ${isEditingMarkers ? 'cursor-crosshair' : 'cursor-default'}`}
                style={{
                  backgroundImage: viewingMap.imageUrl ? `url(${viewingMap.imageUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: '#1e293b'
                }}
              />
              
              {/* Drop Zone Indicator */}
              {isDragOver && (
                <div className="absolute inset-0 bg-green-500/10 border-2 border-green-500 border-dashed rounded-lg flex items-center justify-center pointer-events-none">
                  <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                    Drop building block here
                  </div>
                </div>
              )}
              
              {/* Markers */}
              {showMarkers && markers.map(marker => {
                const typeInfo = getMarkerTypeInfo(marker.type);
                return (
                  <div
                    key={marker.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                    style={{
                      left: `${marker.x}%`,
                      top: `${marker.y}%`
                    }}
                  >
                    <div className={`w-6 h-6 rounded-full ${typeInfo.color} flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-110 transition-transform duration-200`}>
                      <span>{typeInfo.icon}</span>
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="bg-slate-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap border border-slate-600">
                        <div className="font-semibold">{marker.label}</div>
                        {marker.description && (
                          <div className="text-slate-300 text-xs">{marker.description}</div>
                        )}
                        <div className="text-slate-400 text-xs">{typeInfo.label}</div>
                      </div>
                    </div>

                    {/* Remove button when editing */}
                    {isEditingMarkers && (
                      <button
                        onClick={() => removeMarker(marker.id)}
                        className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors duration-200"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Building Blocks Panel */}
          {showBuildingBlocks && (
            <div className="w-80 flex-shrink-0">
              <MapBuildingBlocks
                onAddBlock={handleSelectBuildingBlockFromPanel}
                isActive={showBuildingBlocks}
                selectedBlock={selectedBuildingBlock}
              />
            </div>
          )}
        </div>

        {/* Instructions */}
        {isEditingMarkers && (
          <div className="bg-slate-800 p-3 border-t border-slate-700">
            <p className="text-slate-300 text-sm text-center">
              Click on the map to add a {getMarkerTypeInfo(selectedMarkerType).label.toLowerCase()} marker
            </p>
          </div>
        )}
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
        <button
          onClick={() => {
            setIsCreating(true);
            setIsGenerating(false);
            setEditingMap(null);
            setFormData({ name: '', description: '', imageUrl: '', scale: '', gridSize: 50 });
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Map</span>
        </button>
        <button
          onClick={() => {
            setIsGenerating(true);
            setIsCreating(false);
            setEditingMap(null);
            setAiPrompt('');
            setAiMapName('');
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Generate with AI</span>
        </button>
      </div>

      {/* AI Map Generation Form */}
      {isGenerating && (
        <div className="bg-slate-800 rounded-lg p-6 border-2 border-purple-500/50">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <span className="bg-purple-600 text-white px-2 py-1 rounded text-sm mr-3">AI</span>
            Generate Map with AI
          </h3>
          <form onSubmit={handleAIGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Map Name
              </label>
              <input
                type="text"
                value={aiMapName}
                onChange={(e) => setAiMapName(e.target.value)}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter a name for your map..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Describe Your Map
              </label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={4}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Describe the map you want to generate... 

Examples:
• A dark forest with ancient ruins and a mysterious tower
• A bustling medieval town with a market square and castle
• An underground dungeon with multiple chambers and traps
• A coastal village with docks and a lighthouse"
                required
              />
            </div>
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-purple-300 mb-2">💡 Tips for Better Results:</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Be specific about terrain (forest, desert, mountains, etc.)</li>
                <li>• Mention key landmarks (towers, rivers, ruins, settlements)</li>
                <li>• Include the mood or atmosphere (dark, mystical, abandoned)</li>
                <li>• Specify the scale (village, region, dungeon level)</li>
              </ul>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={generating || !aiPrompt.trim() || !aiMapName.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Generate Map</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsGenerating(false)}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Map Form */}
      {editingMap && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Edit Map</h3>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Map Name
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
                  Scale
                </label>
                <input
                  type="text"
                  value={formData.scale}
                  onChange={(e) => setFormData(prev => ({ ...prev, scale: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="1 square = 5 feet"
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
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Describe this map..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="https://example.com/map-image.jpg"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingMap(null);
                  setFormData({ name: '', description: '', imageUrl: '', scale: '', gridSize: 50 });
                }}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Map Form */}
      {isCreating && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Add New Map</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Map Name
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
                  Scale
                </label>
                <input
                  type="text"
                  value={formData.scale}
                  onChange={(e) => setFormData(prev => ({ ...prev, scale: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="1 square = 5 feet"
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
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Describe this map..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="https://example.com/map-image.jpg"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Add Map
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

      {maps.length === 0 && !isCreating && !editingMap && !isGenerating ? (
        <div className="text-center py-12">
          <Map className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl text-slate-300 mb-2">No maps yet</p>
          <p className="text-slate-400 mb-6">Create interactive maps for your campaigns</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setIsCreating(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Create First Map
            </button>
            <button
              onClick={() => setIsGenerating(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Generate with AI</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {maps.map(map => (
            <div key={map.id} className="bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-750 transition-colors duration-200">
              <div className="aspect-video bg-slate-700 relative">
                {map.imageUrl ? (
                  <img
                    src={map.imageUrl}
                    alt={map.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Map className="h-12 w-12 text-slate-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                  <button
                    onClick={() => handleViewMap(map)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Map</span>
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{map.name}</h3>
                    {map.scale && (
                      <p className="text-sm text-green-400 mb-2">{map.scale}</p>
                    )}
                    <p className="text-slate-300 text-sm">{map.description}</p>
                  </div>
                  <div className="flex space-x-2 ml-2">
                    <button
                      onClick={() => handleEdit(map)}
                      className="text-slate-400 hover:text-blue-400 transition-colors duration-200"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(map.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>{(map.markers || []).length} markers</span>
                  <span>Created {new Date(map.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Maps;