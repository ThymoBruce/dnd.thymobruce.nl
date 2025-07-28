import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';
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
  Mail
} from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/characters', label: 'Characters', icon: Users },
    { path: '/campaigns', label: 'Campaigns', icon: BookOpen },
    { path: '/quests', label: 'Quests', icon: Scroll },
    { path: '/items', label: 'Items', icon: Sword },
    { path: '/locations', label: 'Locations', icon: MapPin },
    { path: '/npcs', label: 'NPCs', icon: UserCheck },
    { path: '/monsters', label: 'Monsters', icon: Skull },
    { path: '/session-notes', label: 'Session Notes', icon: ScrollText },
    { path: '/invites', label: 'Invites', icon: Mail },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-amber-500" />
            <h1 className="text-lg md:text-xl font-bold text-amber-500">Campaign Manager</h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  location.pathname === path
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-200"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-700 py-4">
            <div className="flex items-center space-x-4">
              {/* Desktop Navigation */}
              {user && (
                <div className="hidden lg:flex space-x-1">
                  {navItems.map(({ path, label, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        location.pathname === path
                          ? 'bg-amber-600 text-white shadow-lg'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Auth Section */}
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-slate-300 text-sm hidden md:block">
                    Welcome, {user.user_metadata?.name || user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden md:block">Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors duration-200"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Mobile Menu Button */}
              {user && (
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-200"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              )}
            </div>
          {/* Mobile Navigation */}
          {user && isMobileMenuOpen && (
            <div className="lg:hidden border-t border-slate-700 py-4">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    location.pathname === path
                      ? 'bg-amber-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          )}
          </div>
        )}
      </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default Navigation;