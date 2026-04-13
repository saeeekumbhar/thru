import { Outlet, Link, useLocation } from 'react-router-dom';
import { Compass, BookOpen, Map, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../firebase';
import Assistant from './Assistant';

export default function Layout() {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: '/dashboard', icon: Compass, label: 'Explore' },
    { path: '/trips', icon: BookOpen, label: 'Journal' },
    { path: '/map', icon: Map, label: 'Map' },
    { path: '/passport', icon: User, label: 'Passport' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-paper">
      {/* Mobile Header */}
      <header className="md:hidden bg-paper-dark border-b border-ink/10 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex flex-col">
          <h1 className="font-serif text-2xl font-bold tracking-widest text-ink leading-none">thru</h1>
          <p className="text-[10px] font-typewriter text-ink-light italic">- Go thru the world, the right way</p>
        </div>
        {user && (
          <button onClick={logout} className="text-ink-light hover:text-stamp-red transition-colors">
            <LogOut size={20} />
          </button>
        )}
      </header>

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-paper-dark/50 border-r border-ink/10 h-screen sticky top-0 px-2 py-8">
        <div className="px-6 mb-12 relative group">
          {/* Subtle background strip for branding */}
          <div className="absolute inset-x-0 -inset-y-2 bg-ink/5 backdrop-blur-[2px] rounded-r-xl -ml-2 transition-all group-hover:bg-ink/10" />
          
          <div className="flex flex-col relative z-10">
            <h1 className="font-serif text-4xl font-bold tracking-widest text-ink leading-none">thru</h1>
            <p className="text-[10px] font-typewriter text-ink font-bold italic mt-1.5 uppercase tracking-tighter leading-tight opacity-90 drop-shadow-sm">
              - Go thru the world, the right way
            </p>
          </div>
        </div>
        
        {user && (
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-6 py-3 transition-all duration-300 group ${
                    isActive 
                      ? 'bg-ink text-paper shadow-md' 
                      : 'text-ink hover:bg-ink/5'
                  }`}
                >
                  <Icon size={18} className={`${isActive ? 'text-paper' : 'text-ink-light group-hover:text-ink'}`} />
                  <span className={`font-typewriter text-xs uppercase tracking-widest ${isActive ? 'font-bold' : ''}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        )}

        {user && (
          <div className="px-4 mt-auto">
            <button 
              onClick={logout}
              className="flex items-center space-x-3 px-6 py-4 w-full text-left text-ink hover:text-stamp-red transition-colors group"
            >
              <LogOut size={18} className="text-ink-light group-hover:text-stamp-red" />
              <span className="font-typewriter text-[10px] uppercase tracking-widest">Sign Out</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative pb-20 md:pb-0 overflow-x-hidden">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-paper-dark/95 backdrop-blur-sm border-t border-ink/10 flex justify-around p-3 z-50 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
                  isActive ? 'text-stamp-red scale-110' : 'text-ink-light'
                }`}
              >
                <Icon size={20} />
                <span className="text-[8px] font-typewriter uppercase tracking-tighter font-bold">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
      <Assistant />
    </div>
  );
}
