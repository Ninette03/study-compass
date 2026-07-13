import { Outlet, useLocation } from 'react-router';
import { Toaster } from './components/ui/sonner (1)';
import { Navbar } from './components/shared/Navbar (1).tsx';
import { useEffect, useState } from 'react';

function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  if (!offline) return null;
  return (
    <div className="w-full py-2 px-4 text-center text-[13px]" style={{ backgroundColor: '#FEF9C3', color: '#713F12' }}>
      You appear to be offline — some features may not work.
    </div>
  );
}

export function Root() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <OfflineBanner />
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Toaster position="top-right" />
    </div>
  );
}