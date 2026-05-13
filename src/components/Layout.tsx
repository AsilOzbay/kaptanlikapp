import { useLocation } from 'wouter';
import type { ReactNode } from 'react';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const isLanding = location === '/';
  const isAuthPage = location === '/login' || location === '/register' || location === '/forgot-password';
  const isSimulationPage = location.startsWith('/simulation');
  const showBottomNav = !isLanding && !isAuthPage && !location.startsWith('/admin') && !isSimulationPage;
  const isAdminPage = location.startsWith('/admin');
  return (
    <div className="min-h-[100dvh] bg-navy-900 text-[#F8FAFC]">
      {!isSimulationPage && <Navbar />}

      <main
        className={`${
          isAdminPage || isSimulationPage
            ? ''
            : showBottomNav
            ? 'pb-16 sm:pb-0 pt-14'
            : isLanding
            ? ''
            : 'pt-14'
        }`}
      >
        {children}
      </main>

      {showBottomNav && <BottomNav />}
    </div>
  );
}
