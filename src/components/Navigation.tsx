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
  Mail,
  ChevronDown,
  Gamepad2,
  Settings
} from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

  const menuGroups = [
    {
      id: 'main',
      label: 'Main',
      icon: Home,
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: Home }
      ]
    },
    {
      id: 'campaign',
      label: 'Campaign',
      icon: BookOpen,
      items: [
        { path: '/campaigns', label: 'Campaigns', icon: BookOpen },
        { path: '/quests', label: 'Quests', icon: Scroll },
        { path: '/session-notes', label: 'Session Notes', icon: ScrollText },
        { path: '/invites', label: 'Invites', icon: Mail }
      ]
    },
    {
      id: 'characters',
      label: 'Characters',
      icon: Users,
      items: [
        { path: '/characters', label: 'Characters', icon: Users }
      ]
    },
    {
      id: 'world',
      label: 'World',
      icon: Gamepad2,
      items: [
        { path: '/locations', label: 'Locations', icon: MapPin },
        { path: '/npcs', label: 'NPCs', icon: UserCheck },
        { path: '/monsters', label: 'Monsters', icon: Skull },
        { path: '/items', label: 'Items', icon: Sword }
      ]
    }
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleDropdown = (groupId: string) => {
    setOpenDropdown(openDropdown === groupId ? null : groupId);
  };

  const isActiveGroup = (group: any) => {
    return group.items.some((item: any) => location.pathname === item.path);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Shield className="h-7 w-7 text-amber-500" />
              <h1 className="text-lg font-bold text-amber-500 hidden sm:block">Campaign Manager</h1>
              <h1 className="text-lg font-bold text-amber-500 sm:hidden">CM</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {menuGroups.map((group) => {
                if (group.items.length === 1) {
                  // Single item - render as direct link
                  const item = group.items[0];
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        isActivePath(item.path)
                          ? 'bg-amber-600 text-white shadow-lg'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                } else {
                  // Multiple items - render as dropdown
                  return (
                    <div key={group.id} className="relative">
                      <button
                        onClick={() => toggleDropdown(group.id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          isActiveGroup(group) || openDropdown === group.id
                            ? 'bg-slate-700 text-white'
                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <group.icon className="h-4 w-4" />
                        <span>{group.label}</span>
                        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${
                          openDropdown === group.id ? 'rotate-180' : ''
                        }`} />
                      </button>
                      
                      {openDropdown === group.id && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
                          {group.items.map((item) => (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setOpenDropdown(null)}
                              className={`flex items-center space-x-3 px-4 py-3 text-sm transition-all duration-200 first:rounded-t-lg last:rounded-b-lg ${
                                isActivePath(item.path)
                                  ? 'bg-amber-600 text-white'
                                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                              }`}
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
              })}
            </div>

            {/* Desktop Auth Section */}
            <div className="hidden lg:flex items-center space-x-3">
              {user ? (
                <>
                  <span className="text-slate-300 text-sm">
                    {user.user_metadata?.name || user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors duration-200"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-slate-700 py-4">
              {user ? (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <span className="text-slate-300 text-sm">
                      {user.user_metadata?.name || user.email}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                  
                  {menuGroups.map((group) => (
                    <div key={group.id} className="space-y-1">
                      {group.items.length === 1 ? (
                        <Link
                          to={group.items[0].path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                            isActivePath(group.items[0].path)
                              ? 'bg-amber-600 text-white shadow-lg'
                              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                          }`}
                        >
                          <group.items[0].icon className="h-5 w-5" />
                          <span>{group.items[0].label}</span>
                        </Link>
                      ) : (
                        <>
                          <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                            {group.label}
                          </div>
                          {group.items.map((item) => (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all duration-200 ${
                                isActivePath(item.path)
                                  ? 'bg-amber-600 text-white shadow-lg'
                                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                              }`}
                            >
                              <item.icon className="h-5 w-5" />
                              <span>{item.label}</span>
                            </Link>
                          ))}
                        </>
                      )}
                    </div>
                  ))}
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
            </div>
          )}
        </div>
      </nav>

      {/* Backdrop for dropdowns */}
      {openDropdown && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setOpenDropdown(null)}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default Navigation;