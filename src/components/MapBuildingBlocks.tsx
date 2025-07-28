import React, { useState } from 'react';
import { Plus, Grid, Mountain, Trees, Home, Castle, Waves, Skull, Flame, Shield, Gem, Swords, Church, Tent, Anchor, Pickaxe, Eye, Zap, Snowflake, Sun } from 'lucide-react';

interface BuildingBlock {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'terrain' | 'structures' | 'natural' | 'hazards' | 'dungeons' | 'settlements' | 'landmarks';
  color: string;
  description: string;
  size?: 'small' | 'medium' | 'large';
}

interface MapBuildingBlocksProps {
  onAddBlock: (block: BuildingBlock, x: number, y: number) => void;
  isActive: boolean;
  onCreateBlankMap?: () => void;
}

const MapBuildingBlocks: React.FC<MapBuildingBlocksProps> = ({ onAddBlock, isActive, onCreateBlankMap }) => {
  const [selectedBlock, setSelectedBlock] = useState<BuildingBlock | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const buildingBlocks: BuildingBlock[] = [
    // Terrain
    { id: 'forest', name: 'Forest', icon: Trees, category: 'terrain', color: 'bg-green-600', description: 'Dense woodland area', size: 'large' },
    { id: 'mountain', name: 'Mountain', icon: Mountain, category: 'terrain', color: 'bg-gray-600', description: 'Rocky mountain peak', size: 'large' },
    { id: 'hills', name: 'Hills', icon: Mountain, category: 'terrain', color: 'bg-green-700', description: 'Rolling hills', size: 'medium' },
    { id: 'desert', name: 'Desert', icon: Sun, category: 'terrain', color: 'bg-yellow-600', description: 'Sandy wasteland', size: 'large' },
    { id: 'swamp', name: 'Swamp', icon: Waves, category: 'terrain', color: 'bg-green-800', description: 'Murky wetlands', size: 'medium' },
    { id: 'plains', name: 'Plains', icon: Trees, category: 'terrain', color: 'bg-green-500', description: 'Open grasslands', size: 'large' },
    { id: 'tundra', name: 'Tundra', icon: Snowflake, category: 'terrain', color: 'bg-blue-300', description: 'Frozen wasteland', size: 'large' },

    // Natural Features
    { id: 'river', name: 'River', icon: Waves, category: 'natural', color: 'bg-blue-600', description: 'Flowing water', size: 'medium' },
    { id: 'lake', name: 'Lake', icon: Waves, category: 'natural', color: 'bg-blue-500', description: 'Large body of water', size: 'large' },
    { id: 'waterfall', name: 'Waterfall', icon: Waves, category: 'natural', color: 'bg-blue-400', description: 'Cascading water', size: 'small' },
    { id: 'cave', name: 'Cave', icon: Mountain, category: 'natural', color: 'bg-gray-800', description: 'Natural cave entrance', size: 'small' },
    { id: 'cliff', name: 'Cliff', icon: Mountain, category: 'natural', color: 'bg-gray-700', description: 'Steep rock face', size: 'medium' },
    { id: 'volcano', name: 'Volcano', icon: Flame, category: 'natural', color: 'bg-red-600', description: 'Active volcano', size: 'large' },

    // Structures
    { id: 'village', name: 'Village', icon: Home, category: 'structures', color: 'bg-yellow-600', description: 'Small settlement', size: 'medium' },
    { id: 'city', name: 'City', icon: Castle, category: 'structures', color: 'bg-purple-600', description: 'Large walled city', size: 'large' },
    { id: 'castle', name: 'Castle', icon: Castle, category: 'structures', color: 'bg-purple-700', description: 'Fortified stronghold', size: 'medium' },
    { id: 'tower', name: 'Tower', icon: Castle, category: 'structures', color: 'bg-gray-600', description: 'Tall watchtower', size: 'small' },
    { id: 'bridge', name: 'Bridge', icon: Home, category: 'structures', color: 'bg-brown-600', description: 'River crossing', size: 'small' },
    { id: 'fort', name: 'Fort', icon: Shield, category: 'structures', color: 'bg-gray-700', description: 'Military outpost', size: 'medium' },
    { id: 'lighthouse', name: 'Lighthouse', icon: Eye, category: 'structures', color: 'bg-yellow-500', description: 'Coastal beacon', size: 'small' },

    // Settlements
    { id: 'tavern', name: 'Tavern', icon: Home, category: 'settlements', color: 'bg-orange-600', description: 'Roadside inn', size: 'small' },
    { id: 'temple', name: 'Temple', icon: Church, category: 'settlements', color: 'bg-gold-600', description: 'Religious building', size: 'medium' },
    { id: 'market', name: 'Market', icon: Tent, category: 'settlements', color: 'bg-green-600', description: 'Trading post', size: 'small' },
    { id: 'port', name: 'Port', icon: Anchor, category: 'settlements', color: 'bg-blue-700', description: 'Harbor town', size: 'medium' },
    { id: 'farm', name: 'Farm', icon: Home, category: 'settlements', color: 'bg-yellow-700', description: 'Agricultural land', size: 'medium' },
    { id: 'mine', name: 'Mine', icon: Pickaxe, category: 'settlements', color: 'bg-gray-800', description: 'Mining operation', size: 'small' },

    // Dungeons
    { id: 'dungeon', name: 'Dungeon', icon: Skull, category: 'dungeons', color: 'bg-black', description: 'Underground complex', size: 'medium' },
    { id: 'tomb', name: 'Tomb', icon: Skull, category: 'dungeons', color: 'bg-purple-900', description: 'Ancient burial site', size: 'small' },
    { id: 'ruins', name: 'Ruins', icon: Castle, category: 'dungeons', color: 'bg-gray-500', description: 'Crumbling structures', size: 'medium' },
    { id: 'crypt', name: 'Crypt', icon: Skull, category: 'dungeons', color: 'bg-purple-800', description: 'Underground burial chamber', size: 'small' },
    { id: 'lair', name: 'Monster Lair', icon: Skull, category: 'dungeons', color: 'bg-red-800', description: 'Creature dwelling', size: 'medium' },

    // Hazards
    { id: 'trap', name: 'Trap', icon: Skull, category: 'hazards', color: 'bg-red-600', description: 'Hidden danger', size: 'small' },
    { id: 'quicksand', name: 'Quicksand', icon: Waves, category: 'hazards', color: 'bg-yellow-800', description: 'Treacherous ground', size: 'small' },
    { id: 'poison_gas', name: 'Poison Gas', icon: Skull, category: 'hazards', color: 'bg-green-900', description: 'Toxic area', size: 'medium' },
    { id: 'magical_ward', name: 'Magic Ward', icon: Zap, category: 'hazards', color: 'bg-purple-600', description: 'Magical barrier', size: 'small' },
    { id: 'unstable_ground', name: 'Unstable Ground', icon: Mountain, category: 'hazards', color: 'bg-red-700', description: 'Collapsing terrain', size: 'medium' },

    // Landmarks
    { id: 'monument', name: 'Monument', icon: Castle, category: 'landmarks', color: 'bg-gold-700', description: 'Ancient monument', size: 'medium' },
    { id: 'obelisk', name: 'Obelisk', icon: Castle, category: 'landmarks', color: 'bg-black', description: 'Mysterious pillar', size: 'small' },
    { id: 'portal', name: 'Portal', icon: Zap, category: 'landmarks', color: 'bg-purple-500', description: 'Magical gateway', size: 'small' },
    { id: 'shrine', name: 'Shrine', icon: Church, category: 'landmarks', color: 'bg-gold-500', description: 'Sacred site', size: 'small' },
    { id: 'treasure', name: 'Treasure', icon: Gem, category: 'landmarks', color: 'bg-yellow-500', description: 'Hidden treasure', size: 'small' },
    { id: 'battlefield', name: 'Battlefield', icon: Swords, category: 'landmarks', color: 'bg-red-500', description: 'Site of ancient battle', size: 'large' },
  ];

  const categories = [
    { id: 'all', name: 'All Blocks', count: buildingBlocks.length },
    { id: 'terrain', name: 'Terrain', count: buildingBlocks.filter(b => b.category === 'terrain').length },
    { id: 'natural', name: 'Natural', count: buildingBlocks.filter(b => b.category === 'natural').length },
    { id: 'structures', name: 'Structures', count: buildingBlocks.filter(b => b.category === 'structures').length },
    { id: 'settlements', name: 'Settlements', count: buildingBlocks.filter(b => b.category === 'settlements').length },
    { id: 'dungeons', name: 'Dungeons', count: buildingBlocks.filter(b => b.category === 'dungeons').length },
    { id: 'hazards', name: 'Hazards', count: buildingBlocks.filter(b => b.category === 'hazards').length },
    { id: 'landmarks', name: 'Landmarks', count: buildingBlocks.filter(b => b.category === 'landmarks').length },
  ];

  const filteredBlocks = selectedCategory === 'all' 
    ? buildingBlocks 
    : buildingBlocks.filter(block => block.category === selectedCategory);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedBlock) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    onAddBlock(selectedBlock, x, y);
  };

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, block: BuildingBlock) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(block));
    e.dataTransfer.effectAllowed = 'copy';
  };
  if (!isActive) return null;

  return (
    <div className="bg-slate-800 border-l border-slate-700 w-80 p-4 overflow-y-auto max-h-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
          <Grid className="h-5 w-5 mr-2 text-green-400" />
          Building Blocks
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          {selectedBlock ? 'Click on the map to place the selected block, or drag blocks directly onto the map' : 'Select a building block or drag them directly onto the map'}
        </p>
        
        {/* Create Blank Map Button */}
        {onCreateBlankMap && (
          <button
            onClick={onCreateBlankMap}
            className="w-full mb-4 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Blank Map</span>
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200 ${
                selectedCategory === category.id
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Selected Block Info */}
      {selectedBlock && (
        <div className="mb-4 p-3 bg-slate-700 rounded-lg border-2 border-green-500/50">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-2 rounded-lg ${selectedBlock.color}`}>
              <selectedBlock.icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-white">{selectedBlock.name}</p>
              <p className="text-xs text-slate-400">{selectedBlock.description}</p>
              {selectedBlock.size && (
                <p className="text-xs text-green-400 capitalize">Size: {selectedBlock.size}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-green-400">✓ Selected - Click on map to place</p>
        </div>
      )}

      {/* Building Blocks Grid */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {filteredBlocks.map(block => {
          const Icon = block.icon;
          const isSelected = selectedBlock?.id === block.id;
          
          return (
            <button
              key={block.id}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, block)}
              onClick={() => setSelectedBlock(isSelected ? null : block)}
              className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-green-500 bg-slate-700'
                  : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700 hover:border-slate-500'
              } cursor-grab active:cursor-grabbing`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${block.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-white text-sm">{block.name}</p>
                  <p className="text-xs text-slate-400">{block.description}</p>
                  {block.size && (
                    <p className="text-xs text-green-400 capitalize">Size: {block.size}</p>
                  )}
                </div>
                {isSelected && (
                  <div className="text-green-400">
                    <Plus className="h-4 w-4" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-3 bg-slate-900/50 rounded-lg">
        <h4 className="text-sm font-semibold text-slate-300 mb-2">How to Use:</h4>
        <ol className="text-xs text-slate-400 space-y-1">
          <li>1. Create a blank map or open existing map</li>
          <li>2. Drag building blocks directly onto the map</li>
          <li>3. Or select a block and click on the map</li>
          <li>4. Repeat to add more elements</li>
          <li>5. Save your map when finished</li>
        </ol>
      </div>

      {/* Quick Tips */}
      <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
        <h4 className="text-sm font-semibold text-blue-300 mb-2">💡 Drag & Drop Tips:</h4>
        <ul className="text-xs text-slate-300 space-y-1">
          <li>• Drag blocks directly from the panel to the map</li>
          <li>• Grid background helps with alignment</li>
          <li>• Start with terrain, then add structures</li>
          <li>• Use different categories for variety</li>
          <li>• Combine blocks to create complex areas</li>
        </ul>
      </div>
    </div>
  );
};

export default MapBuildingBlocks;