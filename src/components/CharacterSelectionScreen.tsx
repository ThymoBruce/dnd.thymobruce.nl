import React, { useState } from 'react';
import { useCampaign } from '../context/CampaignContext';
import { X, Sword, Shield, Heart, Zap, Eye, MessageCircle } from 'lucide-react';

interface CharacterSelectionScreenProps {
  onClose: () => void;
  onSelectCharacter: (character: any) => void;
}

const CharacterSelectionScreen: React.FC<CharacterSelectionScreenProps> = ({ onClose, onSelectCharacter }) => {
  const { characters } = useCampaign();
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);

  const getStatModifier = (stat: number) => {
    return Math.floor((stat - 10) / 2);
  };

  const formatModifier = (modifier: number) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  const getCharacterImage = (character: any) => {
    // Using placeholder images from Pexels for fantasy characters
    const images = [
      'https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=400'
    ];
    return images[parseInt(character.id) % images.length];
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 md:p-6 border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/80">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-amber-400">Select Your Character</h1>
          <p className="text-slate-400 text-sm md:text-base">Choose your hero for this adventure</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Character Grid */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {characters.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Sword className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <p className="text-xl text-slate-300 mb-2">No characters available</p>
                <p className="text-slate-400">Create your first character to get started</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {characters.map(character => (
                <div
                  key={character.id}
                  onClick={() => setSelectedCharacter(character)}
                  className={`group relative bg-slate-800/80 backdrop-blur-sm rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 ${
                    selectedCharacter?.id === character.id 
                      ? 'border-amber-500 shadow-amber-500/20' 
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {/* Character Image */}
                  <div className="relative h-48 md:h-56 overflow-hidden">
                    <img
                      src={getCharacterImage(character)}
                      alt={character.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                    
                    {/* Level Badge */}
                    <div className="absolute top-3 right-3 bg-amber-600 text-white px-2 py-1 rounded-lg text-sm font-bold">
                      Lv. {character.level}
                    </div>
                  </div>

                  {/* Character Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-1 truncate">{character.name}</h3>
                    <p className="text-amber-400 text-sm mb-2">{character.race} {character.class}</p>
                    <p className="text-slate-400 text-xs mb-3 truncate">Played by {character.player}</p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-700/50 rounded-lg p-2">
                        <Heart className="h-4 w-4 text-red-400 mx-auto mb-1" />
                        <p className="text-xs text-slate-400">HP</p>
                        <p className="text-sm font-bold text-white">{character.hitPoints}</p>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-2">
                        <Shield className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                        <p className="text-xs text-slate-400">AC</p>
                        <p className="text-sm font-bold text-white">{character.armorClass}</p>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-2">
                        <Zap className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
                        <p className="text-xs text-slate-400">STR</p>
                        <p className="text-sm font-bold text-white">{character.stats.strength}</p>
                      </div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedCharacter?.id === character.id && (
                    <div className="absolute inset-0 border-2 border-amber-500 rounded-xl pointer-events-none">
                      <div className="absolute top-2 left-2 bg-amber-500 text-slate-900 px-2 py-1 rounded-lg text-xs font-bold">
                        SELECTED
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Character Details Panel */}
        {selectedCharacter && (
          <div className="lg:w-96 bg-slate-800/90 backdrop-blur-sm border-l border-slate-700/50 p-4 md:p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Character Header */}
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <img
                    src={getCharacterImage(selectedCharacter)}
                    alt={selectedCharacter.name}
                    className="w-full h-full object-cover rounded-full border-4 border-amber-500"
                  />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedCharacter.name}</h2>
                <p className="text-amber-400 mb-1">Level {selectedCharacter.level} {selectedCharacter.race} {selectedCharacter.class}</p>
                <p className="text-slate-400 text-sm">{selectedCharacter.background}</p>
              </div>

              {/* Core Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <Heart className="h-5 w-5 text-red-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Hit Points</p>
                  <p className="text-xl font-bold text-white">{selectedCharacter.hitPoints}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <Shield className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Armor Class</p>
                  <p className="text-xl font-bold text-white">{selectedCharacter.armorClass}</p>
                </div>
              </div>

              {/* Ability Scores */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-purple-400" />
                  Ability Scores
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedCharacter.stats).map(([stat, value]) => (
                    <div key={stat} className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                        {stat.substring(0, 3)}
                      </p>
                      <p className="text-lg font-bold text-white">{value as number}</p>
                      <p className="text-xs text-amber-400">
                        {formatModifier(getStatModifier(value as number))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              {selectedCharacter.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2 text-green-400" />
                    Character Notes
                  </h3>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-slate-300 text-sm leading-relaxed">{selectedCharacter.notes}</p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => onSelectCharacter(selectedCharacter)}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-amber-500/25"
              >
                Choose {selectedCharacter.name}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterSelectionScreen;