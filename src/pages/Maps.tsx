import React, { useState, useRef, useEffect } from 'react';
import { useMaps } from '../hooks/useMaps';
import { Plus, Map, Trash2, Pencil, MapPin, Eye, EyeOff, Save, X, Grid, Zap } from 'lucide-react';
import MapBuildingBlocks from '../components/MapBuildingBlocks';

interface MapMarker {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'location' | 'poi' | 'danger' | 'treasure' | 'npc' | 'tile';
  description?: string;
  imageUrl?: string;
  tileSize?: { width: number; height: number };
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
  const [aiPixelArt, setAiPixelArt] = useState(false);
  const [aiMapWidth, setAiMapWidth] = useState(800);
  const [aiMapHeight, setAiMapHeight] = useState(600);
  const [aiGridSize, setAiGridSize] = useState(50);
  const [showBuildingBlocks, setShowBuildingBlocks] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedBuildingBlock, setSelectedBuildingBlock] = useState<any>(null);
  const [activeTool, setActiveTool] = useState<'place' | 'erase'>('place');
  const [hitTestFunction, setHitTestFunction] = useState<((x: number, y: number) => string | null) | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    scale: '',
    gridSize: 50,
    mapWidth: 800,
    mapHeight: 600
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
      gridSize: formData.gridSize || 50,
      mapWidth: formData.mapWidth || 800,
      mapHeight: formData.mapHeight || 600
    };
    addMap(mapData)
      .then(() => {
        setFormData({ name: '', description: '', imageUrl: '', scale: '', gridSize: 50, mapWidth: 800, mapHeight: 600 });
        setIsCreating(false);
      })
      .catch(err => console.error('Failed to create map:', err));
  };

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || !aiMapName.trim()) return;

    try {
      await generateMapWithAI(aiPrompt, aiMapName, undefined, aiPixelArt, aiMapWidth, aiMapHeight, aiGridSize);
      setAiPrompt('');
      setAiMapName('');
      setAiPixelArt(false);
      setAiMapWidth(800);
      setAiMapHeight(600);
      setAiGridSize(50);
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
      gridSize: formData.gridSize || 50,
      mapWidth: formData.mapWidth || 800,
      mapHeight: formData.mapHeight || 600
    };
    updateMap(editingMap.id, mapData)
      .then(() => {
        setEditingMap(null);
        setFormData({ name: '', description: '', imageUrl: '', scale: '', gridSize: 50, mapWidth: 800, mapHeight: 600 });
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
      gridSize: map.gridSize || 50,
      mapWidth: map.mapWidth || 800,
      mapHeight: map.mapHeight || 600
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
      type: 'tile',
      description: block.description,
      imageUrl: block.imageUrl,
      tileSize: block.tileSize
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
      type: 'tile',
      description: block.description,
      imageUrl: block.imageUrl,
      tileSize: block.tileSize
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
      alert('Please enter edit mode first by clicking "Edit Markers" to place map tiles');
      return;
    }
    
    // Set the selected tile for click placement
    setSelectedBuildingBlock(block);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const handleCanvasClick = (x: number, y: number) => {
      if (!isEditingMarkers) return;

      if (activeTool === 'erase') {
        // Handle eraser tool
        if (hitTestFunction) {
          const markerId = hitTestFunction(x, y);
          if (markerId) {
            setMarkers(prev => prev.filter(m => m.id !== markerId));
          }
        }
      } else if (activeTool === 'place') {
        // Handle placement tool
        const xPercent = (x / (viewingMap?.mapWidth || 800)) * 100;
        const yPercent = (y / (viewingMap?.mapHeight || 600)) * 100;

        if (selectedBuildingBlock) {
          // Place building block
          const newMarker: MapMarker = {
            id: Date.now().toString(),
            x: xPercent,
            y: yPercent,
            label: `${selectedBuildingBlock.name} (${selectedBuildingBlock.tileSize.width}×${selectedBuildingBlock.tileSize.height})`,
            type: 'tile',
            description: selectedBuildingBlock.description,
            imageUrl: selectedBuildingBlock.imageUrl,
            tileSize: selectedBuildingBlock.tileSize
          };
          setMarkers(prev => [...prev, newMarker]);
        } else {
          // Place regular marker
          const label = prompt('Enter marker label:');
          if (!label) return;

          const description = prompt('Enter marker description (optional):') || '';

          const newMarker: MapMarker = {
            id: Date.now().toString(),
            x: xPercent,
            y: yPercent,
            label,
            type: selectedMarkerType,
            description
          };
          setMarkers(prev => [...prev, newMarker]);
        }
      }
    };
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
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 ${
                showGrid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-600 hover:bg-slate-700'
              } text-white`}
            >
              <Grid className="h-4 w-4" />
              <span>Grid</span>
            </button>
            
            {/* Tool Selection */}
            <div className="flex bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setActiveTool('place')}
                className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
                  activeTool === 'place' 
                    ? 'bg-green-600 text-white' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                🖌️ Place
              </button>
              <button
                onClick={() => setActiveTool('erase')}
                className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
                  activeTool === 'erase' 
                    ? 'bg-red-600 text-white' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                🗑️ Erase
              </button>
            </div>

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
              <Grid className="h-4 w-4" />
              <span>Map Tiles</span>
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
              <MapCanvas
                width={viewingMap.mapWidth || 800}
                height={viewingMap.mapHeight || 600}
                backgroundImage={viewingMap.imageUrl}
                markers={markers}
                onCanvasClick={handleCanvasClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                showGrid={showGrid}
                gridSize={viewingMap.gridSize || 50}
                isEditing={isEditingMarkers}
                onHitTest={setHitTestFunction}
              />
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
            <div className="text-slate-300 text-sm text-center flex items-center justify-center space-x-4">
              <span>
                {activeTool === 'place' 
                  ? `🖌️ Place Mode: Click to add ${selectedBuildingBlock ? 'tiles' : 'markers'}`
                  : '🗑️ Erase Mode: Click on elements to remove them'
                }
              </span>
              {selectedBuildingBlock && (
                <span className="text-amber-400">• Selected: {selectedBuildingBlock.name} ({selectedBuildingBlock.tileSize.width}×{selectedBuildingBlock.tileSize.height})</span>
              )}
            </div>
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
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setIsCreating(true);
              setIsGenerating(false);
              setEditingMap(null);
              setFormData({ name: '', description: '', imageUrl: '', scale: '', gridSize: 50, mapWidth: 800, mapHeight: 600 });
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Map Width (pixels)
                </label>
                <input
                  type="number"
                  min="400"
                  max="2000"
                  value={aiMapWidth}
                  onChange={(e) => setAiMapWidth(parseInt(e.target.value) || 800)}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Map Height (pixels)
                </label>
                <input
                  type="number"
                  min="400"
                  max="2000"
                  value={aiMapHeight}
                  onChange={(e) => setAiMapHeight(parseInt(e.target.value) || 600)}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Grid Size (pixels)
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={aiGridSize}
                  onChange={(e) => setAiGridSize(parseInt(e.target.value) || 50)}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
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
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="pixelArt"
                checked={aiPixelArt}
                onChange={(e) => setAiPixelArt(e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="pixelArt" className="text-sm font-medium text-slate-300">
                Generate in 2D Pixel Art Style 🎨
              </label>
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
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Grid Size (pixels)
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={formData.gridSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, gridSize: parseInt(e.target.value) || 50 }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Map Width (pixels)
                </label>
                <input
                  type="number"
                  min="400"
                  max="2000"
                  value={formData.mapWidth}
                  onChange={(e) => setFormData(prev => ({ ...prev, mapWidth: parseInt(e.target.value) || 800 }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Map Height (pixels)
                </label>
                <input
                  type="number"
                  min="400"
                  max="2000"
                  value={formData.mapHeight}
                  onChange={(e) => setFormData(prev => ({ ...prev, mapHeight: parseInt(e.target.value) || 800 }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  setFormData({ name: '', description: '', imageUrl: '', scale: '', gridSize: 50, mapWidth: 800, mapHeight: 600 });
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
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Grid Size (pixels)
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={formData.gridSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, gridSize: parseInt(e.target.value) || 50 }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Map Width (pixels)
                </label>
                <input
                  type="number"
                  min="400"
                  max="2000"
                  value={formData.mapWidth}
                  onChange={(e) => setFormData(prev => ({ ...prev, mapWidth: parseInt(e.target.value) || 800 }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Map Height (pixels)
                </label>
                <input
                  type="number"
                  min="400"
                  max="2000"
                  value={formData.mapHeight}
                  onChange={(e) => setFormData(prev => ({ ...prev, mapHeight: parseInt(e.target.value) || 800 }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  <div className="text-right">
                    <div>{map.mapWidth || 800}×{map.mapHeight || 600}px</div>
                    <div>Created {new Date(map.created_at).toLocaleDateString()}</div>
                  </div>
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