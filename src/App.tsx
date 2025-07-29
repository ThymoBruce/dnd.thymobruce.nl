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
import LoreEntries from './pages/LoreEntries';
import Timeline from './pages/Timeline';
import InteractiveMaps from './pages/InteractiveMaps';
import Templates from './pages/Templates';
import { CampaignProvider } from './context/CampaignContext';
import { 
  Home, 
  Users, 
  BookOpen, 
  Sword, 
  MapPin, 
  UserCheck, 
  ScrollText,
  Skull,
  Shield,
  Scroll,
  Menu,
  X,
  LogIn,
  LogOut,
  Mail,
  ChevronDown,
  Gamepad2,
  Settings,
  Swords,
  Package,
  FileText,
  Clock,
  Map,
  Heart,
  CheckCircle
} from 'lucide-react';

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
      <div className="min-h-screen bg-slate-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-slate-900 to-purple-900/20"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f59e0b" fill-opacity="0.05"%3E%3Cpath d="M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
          
          <div className="relative z-10 container mx-auto px-4 py-20 max-w-6xl">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3 mb-8">
                <div className="h-16 w-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-slate-900 font-bold text-2xl">⚔️</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                  Campaign Manager
                </h1>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                Your Ultimate D&D Campaign Companion
              </h2>
              
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Transform your tabletop adventures with our comprehensive suite of tools. 
                Create memorable characters, craft epic quests, build immersive worlds, 
                and manage every aspect of your D&D campaigns in one powerful platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white py-4 px-8 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-amber-500/25"
                >
                  Start Your Adventure
                </button>
                <p className="text-slate-400">
                  Free to use • No credit card required
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Showcase */}
        <div className="py-20 bg-slate-800/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Unleash Your Imagination</h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Everything you need to run epic D&D campaigns, from character creation to world building
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Users,
                  title: "Character Management",
                  description: "Create detailed character sheets with stats, backstories, relationships, and progression tracking. Manage player characters and NPCs with ease.",
                  color: "from-blue-500 to-blue-600"
                },
                {
                  icon: BookOpen,
                  title: "Campaign Organization",
                  description: "Structure your campaigns with comprehensive tools for session planning, story arcs, and player management. Keep everything organized in one place.",
                  color: "from-purple-500 to-purple-600"
                },
                {
                  icon: Scroll,
                  title: "Quest & Adventure Tracking",
                  description: "Design epic quests with objectives, rewards, and difficulty ratings. Track progress and manage multiple storylines simultaneously.",
                  color: "from-amber-500 to-amber-600"
                },
                {
                  icon: MapPin,
                  title: "World Building Tools",
                  description: "Create rich locations, detailed lore entries, and interactive maps. Build immersive worlds with interconnected places and histories.",
                  color: "from-green-500 to-green-600"
                },
                {
                  icon: Swords,
                  title: "Combat & Encounters",
                  description: "Design balanced encounters with initiative tracking, monster management, and real-time combat tools for seamless gameplay.",
                  color: "from-red-500 to-red-600"
                },
                {
                  icon: Package,
                  title: "Inventory & Items",
                  description: "Manage character inventories, create custom items, and track equipment across your entire campaign with detailed item databases.",
                  color: "from-teal-500 to-teal-600"
                }
              ].map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="group bg-slate-800 rounded-xl p-6 hover:bg-slate-750 transition-all duration-300 hover:transform hover:scale-105 border border-slate-700 hover:border-slate-600">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-300 leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="py-20 bg-slate-900">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
              <p className="text-xl text-slate-300">Get started in minutes with our intuitive workflow</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  step: "1",
                  icon: UserCheck,
                  title: "Sign Up",
                  description: "Create your free account and access the full suite of campaign management tools"
                },
                {
                  step: "2",
                  icon: BookOpen,
                  title: "Create Campaign",
                  description: "Set up your campaign with descriptions, settings, and invite your players to join"
                },
                {
                  step: "3",
                  icon: Users,
                  title: "Build Characters",
                  description: "Create detailed character sheets, NPCs, and populate your world with memorable personalities"
                },
                {
                  step: "4",
                  icon: Gamepad2,
                  title: "Start Playing",
                  description: "Use our tools during sessions for combat tracking, note-taking, and immersive gameplay"
                }
              ].map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div key={index} className="text-center group">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center border-2 border-amber-500">
                        <span className="text-amber-400 font-bold text-sm">{step.step}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-slate-300">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Visual Preview Section */}
        <div className="py-20 bg-slate-800/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">See It In Action</h2>
              <p className="text-xl text-slate-300">Get a preview of our intuitive interface</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Mock Interface */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-2xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Character Sheet</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-white">Thorin Ironforge</h4>
                      <p className="text-blue-400 text-sm">Level 5 Mountain Dwarf Fighter</p>
                    </div>
                    <img 
                      src="https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=100" 
                      alt="Character" 
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <Heart className="h-4 w-4 text-red-400 mx-auto mb-1" />
                      <p className="text-xs text-slate-400">HP</p>
                      <p className="text-sm font-bold text-white">45/45</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <Shield className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                      <p className="text-xs text-slate-400">AC</p>
                      <p className="text-sm font-bold text-white">18</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <Sword className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
                      <p className="text-xs text-slate-400">STR</p>
                      <p className="text-sm font-bold text-white">16</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-2">
                    {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((stat, index) => (
                      <div key={stat} className="text-center">
                        <p className="text-xs text-slate-400">{stat}</p>
                        <p className="text-sm font-bold text-white">{[16, 14, 15, 10, 13, 12][index]}</p>
                        <p className="text-xs text-amber-400">+{[3, 2, 2, 0, 1, 1][index]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Features List */}
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-white mb-6">Powerful Features</h3>
                
                {[
                  {
                    icon: ScrollText,
                    title: "Session Notes & Tracking",
                    description: "Keep detailed records of your adventures, track important events, and never lose track of your story."
                  },
                  {
                    icon: Map,
                    title: "Interactive Maps",
                    description: "Upload custom maps, place markers, and create immersive visual experiences for your players."
                  },
                  {
                    icon: Clock,
                    title: "Timeline Management",
                    description: "Track world events, historical moments, and campaign progression with detailed timelines."
                  },
                  {
                    icon: FileText,
                    title: "Custom Templates",
                    description: "Create reusable templates for any content type and streamline your world-building process."
                  }
                ].map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                        <p className="text-slate-300">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="py-20 bg-gradient-to-r from-amber-900/20 via-slate-900 to-purple-900/20">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Elevate Your Campaigns?</h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of Dungeon Masters who trust our platform to bring their worlds to life
            </p>
            
            <div className="space-y-6">
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white py-4 px-12 rounded-lg font-bold text-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-amber-500/25"
              >
                Create Your Free Account
              </button>
              
              <div className="flex flex-col sm:flex-row gap-8 justify-center items-center text-slate-400">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Free forever</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Start in minutes</span>
                </div>
              </div>
            </div>
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
              <Route path="/lore" element={<LoreEntries />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/maps" element={<InteractiveMaps />} />
              <Route path="/templates" element={<Templates />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CampaignProvider>
  );
}

export default App;