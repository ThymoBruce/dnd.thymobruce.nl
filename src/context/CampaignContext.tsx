import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Character {
  id: string;
  name: string;
  class: string;
  level: number;
  race: string;
  background: string;
  hitPoints: number;
  armorClass: number;
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  player: string;
  notes: string;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  dmName: string;
  isActive: boolean;
  createdAt: string;
}

interface Item {
  id: string;
  name: string;
  type: string;
  rarity: string;
  description: string;
  properties: string[];
}

interface Location {
  id: string;
  name: string;
  type: string;
  description: string;
  population?: number;
  government?: string;
  notes: string;
}

interface NPC {
  id: string;
  name: string;
  race: string;
  occupation: string;
  location: string;
  disposition: string;
  description: string;
  notes: string;
}

interface SessionNote {
  id: string;
  date: string;
  title: string;
  content: string;
  participants: string[];
}

interface CampaignContextType {
  characters: Character[];
  campaigns: Campaign[];
  items: Item[];
  locations: Location[];
  npcs: NPC[];
  sessionNotes: SessionNote[];
  activeCampaign: Campaign | null;
  addCharacter: (character: Character) => void;
  addCampaign: (campaign: Campaign) => void;
  addItem: (item: Item) => void;
  addLocation: (location: Location) => void;
  addNPC: (npc: NPC) => void;
  addSessionNote: (note: SessionNote) => void;
  setActiveCampaign: (campaign: Campaign) => void;
  updateCharacter: (id: string, character: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  deleteItem: (id: string) => void;
  deleteLocation: (id: string) => void;
  deleteNPC: (id: string) => void;
  deleteSessionNote: (id: string) => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const useCampaign = () => {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
};

export const CampaignProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [npcs, setNPCs] = useState<NPC[]>([]);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [activeCampaign, setActiveCampaignState] = useState<Campaign | null>(null);

  const addCharacter = (character: Character) => {
    setCharacters(prev => [...prev, character]);
  };

  const addCampaign = (campaign: Campaign) => {
    setCampaigns(prev => [...prev, campaign]);
  };

  const addItem = (item: Item) => {
    setItems(prev => [...prev, item]);
  };

  const addLocation = (location: Location) => {
    setLocations(prev => [...prev, location]);
  };

  const addNPC = (npc: NPC) => {
    setNPCs(prev => [...prev, npc]);
  };

  const addSessionNote = (note: SessionNote) => {
    setSessionNotes(prev => [...prev, note]);
  };

  const setActiveCampaign = (campaign: Campaign) => {
    setActiveCampaignState(campaign);
  };

  const updateCharacter = (id: string, updatedCharacter: Partial<Character>) => {
    setCharacters(prev => prev.map(char => 
      char.id === id ? { ...char, ...updatedCharacter } : char
    ));
  };

  const deleteCharacter = (id: string) => {
    setCharacters(prev => prev.filter(char => char.id !== id));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const deleteLocation = (id: string) => {
    setLocations(prev => prev.filter(location => location.id !== id));
  };

  const deleteNPC = (id: string) => {
    setNPCs(prev => prev.filter(npc => npc.id !== id));
  };

  const deleteSessionNote = (id: string) => {
    setSessionNotes(prev => prev.filter(note => note.id !== id));
  };

  return (
    <CampaignContext.Provider value={{
      characters,
      campaigns,
      items,
      locations,
      npcs,
      sessionNotes,
      activeCampaign,
      addCharacter,
      addCampaign,
      addItem,
      addLocation,
      addNPC,
      addSessionNote,
      setActiveCampaign,
      updateCharacter,
      deleteCharacter,
      deleteItem,
      deleteLocation,
      deleteNPC,
      deleteSessionNote
    }}>
      {children}
    </CampaignContext.Provider>
  );
};