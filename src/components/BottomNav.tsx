import { useLocation } from 'wouter';
import { Home, Package, Timer, BarChart3, User } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Anasayfa', icon: Home },
  { path: '/packages', label: 'Paketler', icon: Package },
  { path: '/simulation', label: 'Simulasyon', icon: Timer },
  { path: '/stats', label: 'Istatistikler', icon: BarChart3 },
  { path: '/profile', label: 'Profil', icon: User },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-navy-800/95 backdrop-blur-md border-t border-navy-700/40 sm:hidden">
      <div className="grid grid-cols-5 h-full max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-90 ${
                active ? 'text-gold-500' : 'text-gray-400 hover:text-gray-200'
              }`}
              style={{ minHeight: 56 }}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {active && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold-500 shadow-glow" />
                )}
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                active ? 'text-gold-500' : ''
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
