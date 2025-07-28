import React, { useState } from 'react';
import { Plus, Grid, Mountain, Trees, Home, Castle, Waves, Skull, Flame, Shield, Gem, Swords, Church, Tent, Anchor, Pickaxe, Eye, Zap, Snowflake, Sun } from 'lucide-react';

interface BuildingBlock {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'rooms' | 'corridors' | 'terrain' | 'water' | 'walls' | 'doors' | 'furniture' | 'special';
  color: string;
  description: string;
  tileSize: { width: number; height: number }; // in grid squares
  imageUrl?: string;
}

interface MapBuildingBlocksProps {
  onAddBlock: (block: BuildingBlock) => void;
  isActive: boolean;
  onCreateBlankMap?: () => void;
  selectedBlock?: BuildingBlock | null;
}

const MapBuildingBlocks: React.FC<MapBuildingBlocksProps> = ({ onAddBlock, isActive, onCreateBlankMap, selectedBlock }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const buildingBlocks: BuildingBlock[] = [
    // Dungeon Rooms
    { id: 'room_small', name: 'Small Room', icon: Home, category: 'rooms', color: 'bg-stone-600', description: '10x10 stone room', tileSize: { width: 2, height: 2 } },
    { id: 'room_medium', name: 'Medium Room', icon: Home, category: 'rooms', color: 'bg-stone-600', description: '15x15 stone room', tileSize: { width: 3, height: 3 } },
    { id: 'room_large', name: 'Large Room', icon: Home, category: 'rooms', color: 'bg-stone-600', description: '20x20 great hall', tileSize: { width: 4, height: 4 } },
    { id: 'room_round', name: 'Round Room', icon: Home, category: 'rooms', color: 'bg-stone-700', description: 'Circular chamber', tileSize: { width: 3, height: 3 } },
    { id: 'throne_room', name: 'Throne Room', icon: Castle, category: 'rooms', color: 'bg-purple-700', description: 'Royal chamber', tileSize: { width: 4, height: 3 } },
    { id: 'treasury', name: 'Treasury', icon: Gem, category: 'rooms', color: 'bg-yellow-600', description: 'Treasure vault', tileSize: { width: 2, height: 2 } },
    { id: 'armory', name: 'Armory', icon: Shield, category: 'rooms', color: 'bg-gray-600', description: 'Weapon storage', tileSize: { width: 2, height: 3 } },
    { id: 'library', name: 'Library', icon: ScrollText, category: 'rooms', color: 'bg-blue-700', description: 'Ancient library', tileSize: { width: 3, height: 2 } },

    // Corridors & Passages
    { id: 'corridor_straight', name: 'Straight Corridor', icon: Grid, category: 'corridors', color: 'bg-stone-500', description: '5ft wide hallway', tileSize: { width: 1, height: 4 } },
    { id: 'corridor_corner', name: 'Corner Corridor', icon: Grid, category: 'corridors', color: 'bg-stone-500', description: 'L-shaped passage', tileSize: { width: 2, height: 2 } },
    { id: 'corridor_t', name: 'T-Junction', icon: Grid, category: 'corridors', color: 'bg-stone-500', description: 'Three-way junction', tileSize: { width: 3, height: 2 } },
    { id: 'corridor_cross', name: 'Crossroads', icon: Grid, category: 'corridors', color: 'bg-stone-500', description: 'Four-way intersection', tileSize: { width: 3, height: 3 } },
    { id: 'stairs_up', name: 'Stairs Up', icon: Mountain, category: 'corridors', color: 'bg-stone-400', description: 'Ascending staircase', tileSize: { width: 2, height: 3 } },
    { id: 'stairs_down', name: 'Stairs Down', icon: Mountain, category: 'corridors', color: 'bg-stone-800', description: 'Descending staircase', tileSize: { width: 2, height: 3 } },

    // Terrain Features
    { id: 'grass_field', name: 'Grass Field', icon: Trees, category: 'terrain', color: 'bg-green-500', description: 'Open grassland', tileSize: { width: 4, height: 4 } },
    { id: 'forest_dense', name: 'Dense Forest', icon: Trees, category: 'terrain', color: 'bg-green-700', description: 'Thick woodland', tileSize: { width: 3, height: 3 } },
    { id: 'forest_light', name: 'Light Forest', icon: Trees, category: 'terrain', color: 'bg-green-600', description: 'Sparse trees', tileSize: { width: 3, height: 3 } },
    { id: 'hill', name: 'Hill', icon: Mountain, category: 'terrain', color: 'bg-green-600', description: 'Rolling hill', tileSize: { width: 2, height: 2 } },
    { id: 'mountain', name: 'Mountain', icon: Mountain, category: 'terrain', color: 'bg-gray-600', description: 'Rocky peak', tileSize: { width: 3, height: 3 } },
    { id: 'desert', name: 'Desert', icon: Sun, category: 'terrain', color: 'bg-yellow-600', description: 'Sandy dunes', tileSize: { width: 4, height: 4 } },
    { id: 'swamp', name: 'Swamp', icon: Waves, category: 'terrain', color: 'bg-green-800', description: 'Murky wetlands', tileSize: { width: 3, height: 3 } },

    // Water Features
    { id: 'river_straight', name: 'River (Straight)', icon: Waves, category: 'water', color: 'bg-blue-500', description: 'Flowing river', tileSize: { width: 1, height: 4 } },
    { id: 'river_bend', name: 'River (Bend)', icon: Waves, category: 'water', color: 'bg-blue-500', description: 'Curved river', tileSize: { width: 3, height: 3 } },
    { id: 'lake_small', name: 'Small Lake', icon: Waves, category: 'water', color: 'bg-blue-600', description: 'Pond or small lake', tileSize: { width: 2, height: 2 } },
    { id: 'lake_large', name: 'Large Lake', icon: Waves, category: 'water', color: 'bg-blue-600', description: 'Large body of water', tileSize: { width: 4, height: 3 } },
    { id: 'waterfall', name: 'Waterfall', icon: Waves, category: 'water', color: 'bg-blue-400', description: 'Cascading water', tileSize: { width: 2, height: 2 } },
    { id: 'bridge_stone', name: 'Stone Bridge', icon: Home, category: 'water', color: 'bg-gray-500', description: 'Stone bridge over water', tileSize: { width: 1, height: 3 } },

    // Walls & Barriers
    { id: 'wall_stone', name: 'Stone Wall', icon: Shield, category: 'walls', color: 'bg-gray-700', description: 'Solid stone wall', tileSize: { width: 1, height: 3 } },
    { id: 'wall_wooden', name: 'Wooden Wall', icon: Shield, category: 'walls', color: 'bg-amber-700', description: 'Wooden palisade', tileSize: { width: 1, height: 3 } },
    { id: 'wall_corner', name: 'Wall Corner', icon: Shield, category: 'walls', color: 'bg-gray-700', description: 'Corner wall piece', tileSize: { width: 1, height: 1 } },
    { id: 'gate', name: 'Gate', icon: Shield, category: 'walls', color: 'bg-amber-600', description: 'Fortified entrance', tileSize: { width: 2, height: 1 } },
    { id: 'tower_round', name: 'Round Tower', icon: Castle, category: 'walls', color: 'bg-gray-800', description: 'Defensive tower', tileSize: { width: 2, height: 2 } },
    { id: 'tower_square', name: 'Square Tower', icon: Castle, category: 'walls', color: 'bg-gray-800', description: 'Square watchtower', tileSize: { width: 2, height: 2 } },

    // Doors & Entrances
    { id: 'door_wooden', name: 'Wooden Door', icon: Home, category: 'doors', color: 'bg-amber-600', description: 'Simple wooden door', tileSize: { width: 1, height: 1 } },
    { id: 'door_iron', name: 'Iron Door', icon: Shield, category: 'doors', color: 'bg-gray-600', description: 'Reinforced iron door', tileSize: { width: 1, height: 1 } },
    { id: 'door_secret', name: 'Secret Door', icon: Eye, category: 'doors', color: 'bg-stone-600', description: 'Hidden passage', tileSize: { width: 1, height: 1 } },
    { id: 'portcullis', name: 'Portcullis', icon: Shield, category: 'doors', color: 'bg-gray-700', description: 'Heavy gate', tileSize: { width: 2, height: 1 } },
    { id: 'archway', name: 'Archway', icon: Home, category: 'doors', color: 'bg-stone-500', description: 'Stone archway', tileSize: { width: 2, height: 1 } },

    // Furniture & Objects
    { id: 'altar', name: 'Altar', icon: Church, category: 'furniture', color: 'bg-purple-600', description: 'Stone altar', tileSize: { width: 2, height: 1 } },
    { id: 'throne', name: 'Throne', icon: Castle, category: 'furniture', color: 'bg-purple-700', description: 'Royal throne', tileSize: { width: 1, height: 1 } },
    { id: 'table_long', name: 'Long Table', icon: Home, category: 'furniture', color: 'bg-amber-700', description: 'Dining table', tileSize: { width: 3, height: 1 } },
    { id: 'chest', name: 'Treasure Chest', icon: Gem, category: 'furniture', color: 'bg-yellow-600', description: 'Wooden chest', tileSize: { width: 1, height: 1 } },
    { id: 'bookshelf', name: 'Bookshelf', icon: ScrollText, category: 'furniture', color: 'bg-amber-800', description: 'Tall bookshelf', tileSize: { width: 1, height: 1 } },
    { id: 'bed', name: 'Bed', icon: Home, category: 'furniture', color: 'bg-red-700', description: 'Simple bed', tileSize: { width: 2, height: 1 } },
    { id: 'anvil', name: 'Anvil', icon: Pickaxe, category: 'furniture', color: 'bg-gray-700', description: 'Blacksmith anvil', tileSize: { width: 1, height: 1 } },
    { id: 'cauldron', name: 'Cauldron', icon: Flame, category: 'furniture', color: 'bg-gray-800', description: 'Large cauldron', tileSize: { width: 1, height: 1 } },

    // Special Features
    { id: 'trap_pit', name: 'Pit Trap', icon: Skull, category: 'special', color: 'bg-red-600', description: 'Hidden pit trap', tileSize: { width: 1, height: 1 } },
    { id: 'trap_spikes', name: 'Spike Trap', icon: Skull, category: 'special', color: 'bg-red-700', description: 'Spiked floor trap', tileSize: { width: 2, height: 1 } },
    { id: 'portal', name: 'Magic Portal', icon: Zap, category: 'special', color: 'bg-purple-500', description: 'Teleportation circle', tileSize: { width: 2, height: 2 } },
    { id: 'shrine', name: 'Shrine', icon: Church, category: 'special', color: 'bg-gold-500', description: 'Sacred shrine', tileSize: { width: 1, height: 1 } },
    { id: 'statue', name: 'Statue', icon: Castle, category: 'special', color: 'bg-stone-600', description: 'Stone statue', tileSize: { width: 1, height: 1 } },
    { id: 'fountain', name: 'Fountain', icon: Waves, category: 'special', color: 'bg-blue-400', description: 'Decorative fountain', tileSize: { width: 2, height: 2 } },
    { id: 'campfire', name: 'Campfire', icon: Flame, category: 'special', color: 'bg-orange-600', description: 'Outdoor campfire', tileSize: { width: 1, height: 1 } },
    { id: 'well', name: 'Well', icon: Waves, category: 'special', color: 'bg-stone-600', description: 'Stone well', tileSize: { width: 1, height: 1 } },
  ];

  const categories = [
    { id: 'all', name: 'All Blocks', count: buildingBlocks.length },
    { id: 'rooms', name: 'Rooms', count: buildingBlocks.filter(b => b.category === 'rooms').length },
    { id: 'corridors', name: 'Corridors', count: buildingBlocks.filter(b => b.category === 'corridors').length },
    { id: 'terrain', name: 'Terrain', count: buildingBlocks.filter(b => b.category === 'terrain').length },
    { id: 'water', name: 'Water', count: buildingBlocks.filter(b => b.category === 'water').length },
    { id: 'walls', name: 'Walls', count: buildingBlocks.filter(b => b.category === 'walls').length },
    { id: 'doors', name: 'Doors', count: buildingBlocks.filter(b => b.category === 'doors').length },
    { id: 'furniture', name: 'Furniture', count: buildingBlocks.filter(b => b.category === 'furniture').length },
    { id: 'special', name: 'Special', count: buildingBlocks.filter(b => b.category === 'special').length },
  ];

  const filteredBlocks = selectedCategory === 'all' 
    ? buildingBlocks 
    : buildingBlocks.filter(block => block.category === selectedCategory);

  // Remove the handleMapClick function as it's not needed

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, block: BuildingBlock) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(block));
    e.dataTransfer.effectAllowed = 'copy';
  };
  if (!isActive) return null;

  return (
    <div className="bg-slate-800 border-l border-slate-700 w-80 p-4 overflow-y-auto max-h-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
          <Grid className="h-5 w-5 mr-2 text-amber-400" />
          Map Tiles
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          {selectedBlock ? 'Click on the map to place the selected block, or drag blocks directly onto the map' : 'Select a building block or drag them directly onto the map'}
        </p>
        
        {/* Create Blank Map Button */}
        {onCreateBlankMap && (
          <button
            onClick={onCreateBlankMap}
            className="w-full mb-4 bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Grid Map</span>
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
                  ? 'bg-amber-600 text-white'
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
        <div className="mb-4 p-3 bg-slate-700 rounded-lg border-2 border-amber-500/50">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-2 rounded-lg ${selectedBlock.color}`}>
              <selectedBlock.icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-white">{selectedBlock.name}</p>
              <p className="text-xs text-slate-400">{selectedBlock.description}</p>
              {selectedBlock.tileSize && (
                <p className="text-xs text-amber-400">Size: {selectedBlock.tileSize.width}×{selectedBlock.tileSize.height} squares</p>
              )}
            </div>
          </div>
          <p className="text-xs text-amber-400">✓ Selected - Click on map to place</p>
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
              onClick={() => onAddBlock(block)}
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
                  {block.tileSize && (
                    <p className="text-xs text-amber-400">{block.tileSize.width}×{block.tileSize.height}</p>
                  )}
                </div>
                {isSelected && (
                  <div className="text-amber-400">
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
        <h4 className="text-sm font-semibold text-slate-300 mb-2">How to Build:</h4>
        <ol className="text-xs text-slate-400 space-y-1">
          <li>1. Create a grid map or open existing map</li>
          <li>2. Drag map tiles directly onto the grid</li>
          <li>3. Or select a tile and click to place</li>
          <li>4. Build rooms, corridors, and terrain</li>
          <li>5. Add furniture and special features</li>
          <li>6. Save your battle map when finished</li>
        </ol>
      </div>

      {/* Quick Tips */}
      <div className="mt-4 p-3 bg-amber-900/20 rounded-lg border border-amber-500/30">
        <h4 className="text-sm font-semibold text-amber-300 mb-2">🗺️ Map Building Tips:</h4>
        <ul className="text-xs text-slate-300 space-y-1">
          <li>• Start with rooms and corridors for dungeons</li>
          <li>• Use terrain tiles for outdoor encounters</li>
          <li>• Add walls and doors to define spaces</li>
          <li>• Place furniture and special features last</li>
          <li>• Each tile shows its grid size (e.g., 2×3)</li>
        </ul>
      </div>
    </div>
  );
};

export default MapBuildingBlocks;