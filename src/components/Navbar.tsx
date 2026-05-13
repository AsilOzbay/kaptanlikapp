import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Sun, Moon, LogIn, UserPlus, Anchor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAuthPage = location === '/login' || location === '/register' || location === '/forgot-password';
  if (isAuthPage) return null;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-navy-900/95 backdrop-blur-md border-b border-navy-700/30'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Anchor className="w-6 h-6 text-gold-500 transition-transform group-hover:rotate-12" />
          <span className="text-gold-400 font-bold text-lg tracking-tight">
            KaptanlikApp
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-400 hover:text-gold-400 hover:bg-navy-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {!user ? (
            <>
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-100 hover:text-gold-400 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Giris
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-400 transition-colors shadow-glow"
              >
                <UserPlus className="w-4 h-4" />
                Kayit
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
