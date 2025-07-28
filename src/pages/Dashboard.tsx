import React from 'react';
import { useCharacters } from '../hooks/useCharacters';
import { useCampaigns } from '../hooks/useCampaigns';
import { useQuests } from '../hooks/useQuests';
import { useItems } from '../hooks/useItems';
import { useLocations } from '../hooks/useLocations';
import { useNPCs } from '../hooks/useNPCs';
import { useMonsters } from '../hooks/useMonsters';
import { useSessionNotes } from '../hooks/useSessionNotes';
import { Users, BookOpen, Sword, MapPin, UserCheck, Skull, ScrollText, Scroll } from 'lucide-react';

const Dashboard = () => {
  const { characters } = useCharacters();
  const { campaigns } = useCampaigns();
  const { quests } = useQuests();
  const { items } = useItems();
  const { locations } = useLocations();
  const { npcs } = useNPCs();
  const { monsters } = useMonsters();
  const { sessionNotes } = useSessionNotes();
  
  // For now, we'll use the first active campaign or null
  const activeCampaign = campaigns.find(c => c.status === 'active') || null;

  const stats = [
    { label: 'Characters', count: characters.length, icon: Users, color: 'bg-blue-600' },
    { label: 'Campaigns', count: campaigns.length, icon: BookOpen, color: 'bg-purple-600' },
    { label: 'Quests', count: quests.length, icon: Scroll, color: 'bg-amber-600' },
    { label: 'Items', count: items.length, icon: Sword, color: 'bg-red-600' },
    { label: 'Locations', count: locations.length, icon: MapPin, color: 'bg-green-600' },
    { label: 'NPCs', count: npcs.length, icon: UserCheck, color: 'bg-yellow-600' },
    { label: 'Monsters', count: monsters.length, icon: Skull, color: 'bg-purple-600' },
    { label: 'Session Notes', count: sessionNotes.length, icon: ScrollText, color: 'bg-indigo-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-amber-500 mb-4">Campaign Dashboard</h1>
        {activeCampaign ? (
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-2">Active Campaign</h2>
            <p className="text-3xl font-bold text-amber-400 mb-2">{activeCampaign.name}</p>
            <p className="text-slate-300 mb-2">{activeCampaign.description}</p>
            <p className="text-sm text-slate-400">DM: {activeCampaign.dmName || 'DM'}</p>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-xl text-slate-300">No active campaign selected</p>
            <p className="text-slate-400 mt-2">Create or select a campaign to get started</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map(({ label, count, icon: Icon, color }) => (
          <div key={label} className="bg-slate-800 rounded-lg p-6 hover:bg-slate-750 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide">{label}</p>
                <p className="text-3xl font-bold text-white mt-2">{count}</p>
              </div>
              <div className={`${color} p-3 rounded-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-400" />
            Recent Characters
          </h3>
          {characters.length > 0 ? (
            <div className="space-y-3">
              {characters.slice(0, 3).map(character => (
                <div key={character.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium">{character.name}</p>
                    <p className="text-sm text-slate-400">Level {character.level} {character.race} {character.class}</p>
                  </div>
                  <p className="text-sm text-slate-400">{character.player || character.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No characters created yet</p>
          )}
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Scroll className="h-5 w-5 mr-2 text-amber-400" />
            Recent Quests
          </h3>
          {quests.length > 0 ? (
            <div className="space-y-3">
              {quests.slice(0, 3).map(quest => (
                <div key={quest.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium">{quest.name}</p>
                    <p className="text-sm text-slate-400 capitalize">{quest.difficulty} • {quest.status}</p>
                  </div>
                  <div className="text-right text-sm text-slate-400">
                    {quest.experience_reward > 0 && <p>{quest.experience_reward} XP</p>}
                    {quest.gold_reward > 0 && <p>{quest.gold_reward} GP</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No quests created yet</p>
          )}
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <ScrollText className="h-5 w-5 mr-2 text-indigo-400" />
            Recent Session Notes
          </h3>
          {sessionNotes.length > 0 ? (
            <div className="space-y-3">
              {sessionNotes.slice(0, 3).map(note => (
                <div key={note.id} className="p-3 bg-slate-700 rounded-lg">
                  <p className="font-medium">{note.title}</p>
                  <p className="text-sm text-slate-400">{note.date}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No session notes yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;