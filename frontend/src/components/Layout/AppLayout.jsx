import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calculator, 
  History, 
  Trophy, 
  Users2, 
  Map, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  Leaf, 
  User,
  Sparkles,
  MapPin
} from 'lucide-react';

export default function AppLayout({ children }) {
  const { user, logout, isMock } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Carbon Calculator', path: '/calculator', icon: Calculator },
    { name: 'Activity Log', path: '/tracker', icon: History },
    { name: 'Challenges', path: '/challenges', icon: Trophy },
    { name: 'Community Hub', path: '/community', icon: Users2 },
    { name: 'India Carbon Map', path: '/map', icon: Map },
  ];

  // Admin link (only visible if admin)
  if (user && user.role === 'admin') {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: ShieldCheck });
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-[#edf3ef] flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <header className="md:hidden bg-brand-900 text-white p-4 flex items-center justify-between shadow-md z-30">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-brand-400 fill-brand-400/20" />
          <span className="font-bold text-lg tracking-tight">GreenSteps India</span>
        </div>
        <button onClick={toggleSidebar} className="text-white hover:text-brand-300">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 bg-brand-950 text-slate-100 w-64 p-5 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex md:flex-col justify-between shrink-0 shadow-xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Logo */}
          <div className="hidden md:flex items-center gap-2 mb-8 px-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">GreenSteps</span>
          </div>

          {/* User profile Summary */}
          {user && (
            <div className="bg-brand-900/60 p-4 rounded-xl border border-brand-800/40 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40 flex items-center justify-center font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-semibold text-sm text-slate-200 truncate">{user.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-brand-400 mt-0.5">
                    <MapPin className="w-3 h-3 text-brand-500 shrink-0" />
                    <span className="truncate">{user.city}, {user.state}</span>
                  </div>
                </div>
              </div>

              {/* Point Status */}
              <div className="mt-3.5 pt-3 border-t border-brand-800/50 flex items-center justify-between text-xs">
                <span className="text-slate-400">Green Points</span>
                <span className="font-bold text-amber-400 flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  {user.greenPoints || 0} pts
                </span>
              </div>
            </div>
          )}

          {/* Nav List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-brand-900/40'}
                  `}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="space-y-3 pt-6 border-t border-brand-900">
          {isMock && (
            <div className="px-3 py-2 bg-amber-400/5 border border-amber-400/10 text-amber-500/80 rounded-lg text-2xs flex items-center gap-1.5 leading-tight">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
              <span>Running Offline Mock</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={toggleSidebar} 
          className="fixed inset-0 bg-slate-950/40 z-30 md:hidden backdrop-blur-xs"
        />
      )}
    </div>
  );
}
