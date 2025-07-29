import React, { useState, useEffect } from 'react';
import { useCharacters } from '../hooks/useCharacters';
import { useRelationships } from '../hooks/useRelationships';
import { X, Plus, Trash2, Users, Upload, Camera } from 'lucide-react';

interface EnhancedCharacterModalProps {
  character?: any;
  onClose: () => void;
}

const EnhancedCharacterModal: React.FC<EnhancedCharacterModalProps> = ({ character, onClose }) => {
  const { addCharacter, updateCharacter } = useCharacters();
  const { relationships, addRelationship, deleteRelationship, getEntityRelationships } = useRelationships();
  const isEditing = !!character;

  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'relationships'>('basic');
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    level: 1,
    race: '',
    background: '',
    alignment: '',
    hp: 0,
    ac: 10,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    experience_points: 0,
    proficiency_bonus: 2,
    skills: {},
    saving_throws: {},
    equipment: [],
    portrait_url: '',
    backstory: '',
    personality_traits: [''],
    ideals: '',
    bonds: '',
    flaws: '',
    languages: [''],
    features_and_traits: [],
    is_private: true,
    is_player_visible: false
  });

  const [newRelationship, setNewRelationship] = useState({
    entity2_id: '',
    entity2_type: 'character',
    relationship_type: '',
    description: ''
  });

  const [imageUpload, setImageUpload] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const relationshipTypes = [
    'Family', 'Friend', 'Enemy', 'Ally', 'Mentor', 'Student', 'Rival', 
    'Love Interest', 'Business Partner', 'Guild Member', 'Servant', 'Master'
  ];

  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name || '',
        class: character.class || '',
        level: character.level || 1,
        race: character.race || '',
        background: character.background || '',
        alignment: character.alignment || '',
        hp: character.hp || 0,
        ac: character.ac || 10,
        strength: character.strength || 10,
        dexterity: character.dexterity || 10,
        constitution: character.constitution || 10,
        intelligence: character.intelligence || 10,
        wisdom: character.wisdom || 10,
        charisma: character.charisma || 10,
        experience_points: character.experience_points || 0,
        proficiency_bonus: character.proficiency_bonus || 2,
        skills: character.skills || {},
        saving_throws: character.saving_throws || {},
        equipment: character.equipment || [],
        portrait_url: character.portrait_url || '',
        backstory: character.backstory || '',
        personality_traits: character.personality_traits || [''],
        ideals: character.ideals || '',
        bonds: character.bonds || '',
        flaws: character.flaws || '',
        languages: character.languages || [''],
        features_and_traits: character.features_and_traits || [],
        is_private: character.is_private !== undefined ? character.is_private : true,
        is_player_visible: character.is_player_visible !== undefined ? character.is_player_visible : false
      });
      setImagePreview(character.portrait_url || '');
    }
  }, [character]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageUpload(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, portrait_url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const characterData = {
        ...formData,
        personality_traits: formData.personality_traits.filter(t => t.trim()),
        languages: formData.languages.filter(l => l.trim())
      };

      if (isEditing) {
        await updateCharacter(character.id, characterData);
      } else {
        await addCharacter(characterData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save character:', error);
    }
  };

  const handleArrayFieldChange = (field: 'personality_traits' | 'languages', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field: 'personality_traits' | 'languages') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field: 'personality_traits' | 'languages', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleAddRelationship = async () => {
    if (!newRelationship.entity2_id || !newRelationship.relationship_type) return;

    try {
      await addRelationship({
        entity1_id: character.id,
        entity1_type: 'character',
        entity2_id: newRelationship.entity2_id,
        entity2_type: newRelationship.entity2_type,
        relationship_type: newRelationship.relationship_type,
        description: newRelationship.description
      });
      setNewRelationship({ entity2_id: '', entity2_type: 'character', relationship_type: '', description: '' });
    } catch (error) {
      console.error('Failed to add relationship:', error);
    }
  };

  const characterRelationships = character ? getEntityRelationships(character.id, 'character') : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {isEditing ? 'Edit Character' : 'Create Character'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 bg-slate-700 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('basic')}
            className={`flex-1 py-2 px-2 sm:px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base ${
              activeTab === 'basic' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Basic Info
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-2 px-2 sm:px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base ${
              activeTab === 'details' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Details & Backstory
          </button>
          {isEditing && (
            <button
              onClick={() => setActiveTab('relationships')}
              className={`flex-1 py-2 px-2 sm:px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base ${
                activeTab === 'relationships' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Relationships
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Character Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Character Portrait
                  </label>
                  <div className="space-y-3">
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="flex justify-center">
                        <img
                          src={imagePreview}
                          alt="Character portrait preview"
                          className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-full border-4 border-blue-500"
                        />
                      </div>
                    )}
                    
                    {/* Upload Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Upload Image</label>
                        <label className="flex items-center justify-center w-full bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-3 py-2 cursor-pointer transition-colors duration-200">
                          <Upload className="h-4 w-4 mr-2" />
                          <span className="text-sm">Choose File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Or use URL</label>
                        <input
                          type="url"
                          value={formData.portrait_url}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, portrait_url: e.target.value }));
                            setImagePreview(e.target.value);
                          }}
                          className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Image URL"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Class *
                  </label>
                  <input
                    type="text"
                    value={formData.class}
                    onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
                    className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Race *
                  </label>
                  <input
                    type="text"
                    value={formData.race}
                    onChange={(e) => setFormData(prev => ({ ...prev, race: e.target.value }))}
                    className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Level *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                    className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Background
                  </label>
                  <input
                    type="text"
                    value={formData.background}
                    onChange={(e) => setFormData(prev => ({ ...prev, background: e.target.value }))}
                    className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Alignment
                  </label>
                  <input
                    type="text"
                    value={formData.alignment}
                    onChange={(e) => setFormData(prev => ({ ...prev, alignment: e.target.value }))}
                    className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Hit Points *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.hp}
                    onChange={(e) => setFormData(prev => ({ ...prev, hp: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Armor Class *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.ac}
                    onChange={(e) => setFormData(prev => ({ ...prev, ac: parseInt(e.target.value) || 10 }))}
                    className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Proficiency Bonus
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={formData.proficiency_bonus}
                    onChange={(e) => setFormData(prev => ({ ...prev, proficiency_bonus: parseInt(e.target.value) || 2 }))}
                    className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!formData.is_private}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_private: !e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-slate-300">Make public</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_player_visible}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_player_visible: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-slate-300">Visible to players</span>
                </label>
              </div>
            </>
          )}

          {/* Details & Backstory Tab */}
          {activeTab === 'details' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Backstory
                </label>
                <textarea
                  value={formData.backstory}
                  onChange={(e) => setFormData(prev => ({ ...prev, backstory: e.target.value }))}
                  rows={6}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell the character's story..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Personality Traits
                </label>
                {formData.personality_traits.map((trait, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={trait}
                      onChange={(e) => handleArrayFieldChange('personality_traits', index, e.target.value)}
                      className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Personality trait..."
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayField('personality_traits', index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('personality_traits')}
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Trait</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Ideals
                  </label>
                  <textarea
                    value={formData.ideals}
                    onChange={(e) => setFormData(prev => ({ ...prev, ideals: e.target.value }))}
                    rows={3}
                    className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Bonds
                  </label>
                  <textarea
                    value={formData.bonds}
                    onChange={(e) => setFormData(prev => ({ ...prev, bonds: e.target.value }))}
                    rows={3}
                    className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Flaws
                  </label>
                  <textarea
                    value={formData.flaws}
                    onChange={(e) => setFormData(prev => ({ ...prev, flaws: e.target.value }))}
                    rows={3}
                    className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Languages
                </label>
                {formData.languages.map((language, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={language}
                      onChange={(e) => handleArrayFieldChange('languages', index, e.target.value)}
                      className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Language name..."
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayField('languages', index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('languages')}
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Language</span>
                </button>
              </div>
            </>
          )}

          {/* Relationships Tab */}
          {activeTab === 'relationships' && isEditing && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Character Relationships</h3>
                
                {/* Add New Relationship */}
                <div className="bg-slate-700 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-white mb-3">Add New Relationship</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Relationship Type
                      </label>
                      <select
                        value={newRelationship.relationship_type}
                        onChange={(e) => setNewRelationship(prev => ({ ...prev, relationship_type: e.target.value }))}
                        className="w-full bg-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select type...</option>
                        {relationshipTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Related Entity ID
                      </label>
                      <input
                        type="text"
                        value={newRelationship.entity2_id}
                        onChange={(e) => setNewRelationship(prev => ({ ...prev, entity2_id: e.target.value }))}
                        className="w-full bg-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter entity ID..."
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={newRelationship.description}
                      onChange={(e) => setNewRelationship(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full bg-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the relationship..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRelationship}
                    className="mt-3 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Add Relationship
                  </button>
                </div>

                {/* Existing Relationships */}
                <div className="space-y-3">
                  {characterRelationships.length === 0 ? (
                    <p className="text-slate-400">No relationships defined yet.</p>
                  ) : (
                    characterRelationships.map(rel => (
                      <div key={rel.id} className="bg-slate-700 rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                          <div className="flex-1">
                            <h5 className="text-white font-medium">{rel.relationship_type}</h5>
                            {rel.description && (
                              <p className="text-slate-300 text-sm">{rel.description}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteRelationship(rel.id)}
                            className="text-red-400 hover:text-red-300 self-start sm:self-center"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {isEditing ? 'Update Character' : 'Create Character'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedCharacterModal;