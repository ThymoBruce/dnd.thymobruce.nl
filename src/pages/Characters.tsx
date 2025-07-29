import React, { useState } from 'react';
import { useCharacters } from '../hooks/useCharacters';
import { Plus, Users, Edit, Trash2, Eye, Sword, Shield, Heart } from 'lucide-react';
import EnhancedCharacterModal from '../components/EnhancedCharacterModal';
import CharacterSelectionScreen from '../components/CharacterSelectionScreen';

const Characters = () => {
  const { characters, loading, error, deleteCharacter } = useCharacters();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectionOpen, setIsSelectionOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<any>(null);

  const handleEdit = (character: any) => {
    setEditingCharacter(character);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this character?')) {
      try {
        await deleteCharacter(id);
      } catch (err) {
        console.error('Failed to delete character:', err);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCharacter(null);
  };

  const handleSelectCharacter = (character: any) => {
    console.log('Selected character:', character);
    setIsSelectionOpen(false);
  };

  const getStatModifier = (stat: number) => {
    return Math.floor((stat - 10) / 2);
  };

  const formatModifier = (modifier: number) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading characters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
        <p className="text-red-400">Error loading characters: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-400" />
          <h1 className="text-2xl sm:text-3xl font-bold">Characters</h1>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          {/* <button
            onClick={() => setIsSelectionOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Character Selection</span>
          </button> */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Character</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {characters.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl text-slate-300 mb-2">No characters yet</p>
          <p className="text-slate-400 mb-6">Create your first character to begin your adventure</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Create First Character
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map(character => (
            <div key={character.id} className="bg-slate-800 rounded-lg p-4 sm:p-6 hover:bg-slate-750 transition-colors duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {character.portrait_url && (
                      <img
                        src={character.portrait_url}
                        alt={character.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-full border-2 border-blue-500"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">{character.name}</h3>
                  <p className="text-blue-400 text-sm mb-2">
                    Level {character.level} {character.race} {character.class}
                  </p>
                      <p className="text-slate-400 text-sm">{character.background}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => handleEdit(character)}
                    className="text-slate-400 hover:text-blue-400 transition-colors duration-200 p-1"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(character.id)}
                    className="text-slate-400 hover:text-red-400 transition-colors duration-200 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Core Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-700/50 rounded-lg p-2 sm:p-3 text-center">
                  <Heart className="h-4 w-4 text-red-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">HP</p>
                  <p className="text-sm sm:text-base font-bold text-white">{character.hp}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2 sm:p-3 text-center">
                  <Shield className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">AC</p>
                  <p className="text-sm sm:text-base font-bold text-white">{character.ac}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2 sm:p-3 text-center">
                  <Sword className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">STR</p>
                  <p className="text-sm sm:text-base font-bold text-white">{character.strength}</p>
                </div>
              </div>
              
              {/* Ability Scores */}
              <div className="border-t border-slate-700 pt-4">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Ability Scores</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-2">
                  {Object.entries(character.stats || {}).map(([stat, value]) => (
                    <div key={stat} className="text-center">
                      <p className="text-xs text-slate-400 uppercase">
                        {stat.substring(0, 3)}
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-white">{value as number}</p>
                      <p className="text-xs text-amber-400">
                        {formatModifier(getStatModifier(value as number))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Character Modal */}
      {isModalOpen && (
        <EnhancedCharacterModal
          character={editingCharacter}
          onClose={handleCloseModal}
        />
      )}

      {/* Character Selection Screen */}
      {isSelectionOpen && (
        <CharacterSelectionScreen
          onClose={() => setIsSelectionOpen(false)}
          onSelectCharacter={handleSelectCharacter}
        />
      )}
    </div>
  );
};

export default Characters;