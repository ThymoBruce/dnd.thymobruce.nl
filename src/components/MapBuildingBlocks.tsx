import React, { useState } from 'react';
import { Plus, Grid, Mountain, Trees, Home, Castle, Waves, Skull } from 'lucide-react';

interface BuildingBlock {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'terrain' | 'structures' | 'natural' | 'hazards';
  color: string;
  description: string;
}

interface MapBuildingBlocksProps {
  onAddBlock: (block: BuildingBlock, x: number, y: number) => void;
  isActive: boolean;
}

const MapBuildingBlocks: React.FC<MapBuildingBlocksProps> = ({ onAddBlock, isActive }) => {
  const [selectedBlock, setSelectedBlock] = useState<BuildingBlock | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const buildingBlocks: BuildingBlock[] = [
    // Terrain
    { id: 'forest', name: 'Forest', icon: Trees, category: 'terrain', color: 'bg-green-600', description: 'Dense woodland area' },
    { id: 'mountain', name: 'Mountain', icon: Mountain, category: 'terrain', color: 'bg-gray-600', description: 'Rocky mountain peak' },
    { id: 'water', name: 'Water', icon: Waves, category: 'natural', color: 'bg-blue-600', description: 'River, lake, or sea' },
    
    // Structures
    { id: 'village', name: 'Village', icon: Home, category: 'structures', color: 'bg-yellow-600', description: 'Small settlement' },
    { id: 'castle', name: 'Castle', icon: Castle, category: 'structures', color: 'bg-purple-600', description: 'Fortified structure' },
    
    // Hazards
    { id: 'danger', name: 'Danger Zone', icon: Skull, category: 'hazards', color: 'bg-red-600', description: 'Hazardous area' },
  ];

  const categories = [
    { id: 'all', name: 'All Blocks', count: buildingBlocks.length },
    { id: 'terrain', name: 'Terrain', count: buildingBlocks.filter(b => b.category === 'terrain').length },
    { id: 'structures', name: 'Structures', count: buildingBlocks.filter(b => b.category === 'structures').length },
    { id: 'natural', name: 'Natural', count: buildingBlocks.filter(b => b.category === 'natural').length },
    { id: 'hazards', name: 'Hazards', count: buildingBlocks.filter(b => b.category === 'hazards').length },
  ];

  const filteredBlocks = selectedCategory === 'all' 
    ? buildingBlocks 
    : buildingBlocks.filter(block => block.category === selectedCategory);

  if (!isActive) return null;

  return (
    <div className="bg-slate-800 border-l border-slate-700 w-80 p-4 overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
          <Grid className="h-5 w-5 mr-2 text-green-400" />
          Building Blocks
        </h3>
        <p className="text-sm text-slate-400">
          {selectedBlock ? 'Click on the map to place the selected block' : 'Select a building block to place on your map'}
        </p>
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
            </div>
          </div>
          <p className="text-xs text-green-400">✓ Selected - Click on map to place</p>
        </div>
      )}

      {/* Building Blocks Grid */}
      <div className="space-y-2">
        {filteredBlocks.map(block => {
          const Icon = block.icon;
          const isSelected = selectedBlock?.id === block.id;
          
          return (
            <button
              key={block.id}
              onClick={() => setSelectedBlock(isSelected ? null : block)}
              className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-green-500 bg-slate-700'
                  : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${block.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-white text-sm">{block.name}</p>
                  <p className="text-xs text-slate-400">{block.description}</p>
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
          <li>1. Select a building block from the list</li>
          <li>2. Click anywhere on the map to place it</li>
          <li>3. Repeat to add more elements</li>
          <li>4. Save your map when finished</li>
        </ol>
      </div>
    </div>
  );
};

export default MapBuildingBlocks;