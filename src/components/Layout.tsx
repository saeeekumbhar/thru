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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-paper-dark border-b border-ink/10 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex flex-col">
          <h1 className="font-serif text-2xl font-bold tracking-widest text-ink leading-none">thru</h1>
          <p className="text-[10px] font-typewriter text-ink-light italic">- Go thru the world, the right way</p>
        </div>
        {user && (
          <button onClick={logout} className="text-ink-light hover:text-stamp-red">
            <LogOut size={20} />
          </button>
        )}
      </header>

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-paper-dark border-r border-ink/10 h-screen sticky top-0">
        <div className="p-8">
          <h1 className="font-serif text-4xl font-bold tracking-widest text-ink mb-1">thru</h1>
          <p className="text-[10px] font-typewriter text-ink-light italic mb-4">- Go thru the world, the right way</p>
          <p className="text-xs font-typewriter text-ink-light uppercase tracking-widest border-t border-ink/5 pt-4"></p>
        </div>
        
        {user && (
          <nav className="flex-1 px-4 py-8 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-ink text-paper' 
                      : 'text-ink hover:bg-ink/5'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {user && (
          <div className="p-4 border-t border-ink/10">
            <button 
              onClick={logout}
              className="flex items-center space-x-3 px-4 py-3 w-full text-left text-ink hover:bg-ink/5 rounded-md transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-paper-dark border-t border-ink/10 flex justify-around p-3 z-50 pb-safe">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg ${
                  isActive ? 'text-stamp-red' : 'text-ink-light'
                }`}
              >
                <Icon size={24} />
                <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
      <Assistant />
    </div>
  );
}
