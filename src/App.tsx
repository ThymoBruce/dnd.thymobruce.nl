import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Characters from './pages/Characters';
import Campaigns from './pages/Campaigns';
import Items from './pages/Items';
import Locations from './pages/Locations';
import NPCs from './pages/NPCs';
import Monsters from './pages/Monsters';
import SessionNotes from './pages/SessionNotes';
import { CampaignProvider } from './context/CampaignContext';

function App() {
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
              <Route path="/items" element={<Items />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/npcs" element={<NPCs />} />
              <Route path="/monsters" element={<Monsters />} />
              <Route path="/session-notes" element={<SessionNotes />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CampaignProvider>
  );
}

export default App;