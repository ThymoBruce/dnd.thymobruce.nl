import React, { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { useCharacters } from '../hooks/useCharacters';
import { useItems } from '../hooks/useItems';
import { Plus, Package, Trash2, Users, Sword, ArrowRight, ArrowLeft } from 'lucide-react';

const Inventory = () => {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, loading, error } = useInventory();
  const { characters } = useCharacters();
  const { items } = useItems();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [formData, setFormData] = useState({
    characterId: '',
    itemId: '',
    quantity: 1,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = items.find(i => i.id === formData.itemId);
    if (!item) return;

    const inventoryData = {
      character_id: formData.characterId,
      item_id: formData.itemId,
      item_name: item.name,
      item_type: item.type,
      quantity: formData.quantity,
      notes: formData.notes
    };

    addInventoryItem(inventoryData)
      .then(() => {
        setFormData({ characterId: '', itemId: '', quantity: 1, notes: '' });
        setIsAdding(false);
      })
      .catch(err => console.error('Failed to add inventory item:', err));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this item from inventory?')) {
      try {
        await deleteInventoryItem(id);
      } catch (err) {
        console.error('Failed to delete inventory item:', err);
      }
    }
  };

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    try {
      await updateInventoryItem(id, { quantity: newQuantity });
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const getCharacterInventory = (characterId: string) => {
    return inventory.filter(item => item.character_id === characterId);
  };

  const getCharacterName = (characterId: string) => {
    const character = characters.find(c => c.id === characterId);
    return character?.name || 'Unknown Character';
  };

  const getItemDetails = (itemId: string) => {
    return items.find(i => i.id === itemId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
        <p className="text-red-400">Error loading inventory: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Package className="h-8 w-8 text-green-400" />
          <h1 className="text-3xl font-bold">Character Inventory</h1>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedCharacter}
            onChange={(e) => setSelectedCharacter(e.target.value)}
            className="bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Characters</option>
            {characters.map(character => (
              <option key={character.id} value={character.id}>
                {character.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Add Item Form */}
      {isAdding && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Add Item to Inventory</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Character
                </label>
                <select
                  value={formData.characterId}
                  onChange={(e) => setFormData(prev => ({ ...prev, characterId: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select character...</option>
                  {characters.map(character => (
                    <option key={character.id} value={character.id}>
                      {character.name} (Lv.{character.level})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Item
                </label>
                <select
                  value={formData.itemId}
                  onChange={(e) => setFormData(prev => ({ ...prev, itemId: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select item...</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Condition, enchantments, etc."
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Add to Inventory
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Character Inventories */}
      {characters.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl text-slate-300 mb-2">No characters available</p>
          <p className="text-slate-400">Create characters first to manage their inventories</p>
        </div>
      ) : (
        <div className="space-y-6">
          {characters
            .filter(character => !selectedCharacter || character.id === selectedCharacter)
            .map(character => {
              const characterItems = getCharacterInventory(character.id);
              
              return (
                <div key={character.id} className="bg-slate-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Users className="h-6 w-6 text-blue-400" />
                      <h2 className="text-xl font-semibold text-white">{character.name}</h2>
                      <span className="text-slate-400 text-sm">Level {character.level} {character.race} {character.class}</span>
                    </div>
                    <span className="text-slate-400 text-sm">
                      {characterItems.length} items
                    </span>
                  </div>

                  {characterItems.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-300 mb-1">No items in inventory</p>
                      <p className="text-slate-400 text-sm">Add items to this character's inventory</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {characterItems.map(inventoryItem => {
                        const itemDetails = getItemDetails(inventoryItem.item_id);
                        
                        return (
                          <div key={inventoryItem.id} className="bg-slate-700 rounded-lg p-4 hover:bg-slate-650 transition-colors duration-200">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="text-white font-medium mb-1">{inventoryItem.item_name}</h3>
                                <p className="text-slate-400 text-sm">{inventoryItem.item_type}</p>
                                {itemDetails && (
                                  <p className="text-slate-300 text-xs mt-1">{itemDetails.description}</p>
                                )}
                              </div>
                              <button
                                onClick={() => handleDelete(inventoryItem.id)}
                                className="text-slate-400 hover:text-red-400 transition-colors duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => updateQuantity(inventoryItem.id, inventoryItem.quantity - 1)}
                                  className="w-6 h-6 bg-slate-600 hover:bg-slate-500 text-white rounded flex items-center justify-center transition-colors duration-200"
                                  disabled={inventoryItem.quantity <= 1}
                                >
                                  -
                                </button>
                                <span className="text-white font-medium px-2">
                                  {inventoryItem.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(inventoryItem.id, inventoryItem.quantity + 1)}
                                  className="w-6 h-6 bg-slate-600 hover:bg-slate-500 text-white rounded flex items-center justify-center transition-colors duration-200"
                                >
                                  +
                                </button>
                              </div>
                              
                              {itemDetails && (
                                <div className="flex flex-wrap gap-1">
                                  {itemDetails.properties.slice(0, 2).map((property, index) => (
                                    <span
                                      key={index}
                                      className="bg-green-700/50 text-green-300 px-2 py-1 rounded text-xs"
                                    >
                                      {property}
                                    </span>
                                  ))}
                                  {itemDetails.properties.length > 2 && (
                                    <span className="text-xs text-slate-400">
                                      +{itemDetails.properties.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {inventoryItem.notes && (
                              <div className="mt-3 pt-3 border-t border-slate-600">
                                <p className="text-slate-300 text-xs">{inventoryItem.notes}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
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

export default Inventory;