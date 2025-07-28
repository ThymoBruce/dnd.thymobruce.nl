import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navigation from './components/Navigation';
import AuthModal from './components/AuthModal';
import Dashboard from './pages/Dashboard';
import Characters from './pages/Characters';
import Campaigns from './pages/Campaigns';
import Quests from './pages/Quests';
import Items from './pages/Items';
import Locations from './pages/Locations';
import NPCs from './pages/NPCs';
import Monsters from './pages/Monsters';
import Encounters from './pages/Encounters';
import Inventory from './pages/Inventory';
import SessionNotes from './pages/SessionNotes';
import CampaignInvites from './pages/CampaignInvites';
import { CampaignProvider } from './context/CampaignContext';

function App() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="h-12 w-12 bg-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-slate-900 font-bold text-xl">⚔️</span>
              </div>
              <h1 className="text-3xl font-bold text-amber-500">Campaign Manager</h1>
            </div>
            <p className="text-slate-300 text-lg mb-2">Welcome to your D&D Campaign Hub</p>
            <p className="text-slate-400">Manage characters, quests, campaigns, and adventures all in one place</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200"
            >
              Get Started
            </button>
            <p className="text-slate-400 text-sm">
              Create an account or sign in to start managing your campaigns
            </p>
          </div>
        </div>
        
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  return (
    <CampaignProvider>
      <Router>
        <div className="min-h-screen bg-slate-900 text-slate-100">
          <Navigation />
          <main className="container mx-auto px-4 py-8 max-w-7xl">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/characters" element={<Characters />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/quests" element={<Quests />} />
              <Route path="/items" element={<Items />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/npcs" element={<NPCs />} />
              <Route path="/monsters" element={<Monsters />} />
              <Route path="/encounters" element={<Encounters />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/session-notes" element={<SessionNotes />} />
              <Route path="/invites" element={<CampaignInvites />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CampaignProvider>
  );
}

export default App;