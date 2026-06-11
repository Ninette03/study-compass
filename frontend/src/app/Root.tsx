import { Outlet, useLocation } from 'react-router';
import { Toaster } from './components/ui/sonner';
import { Navbar } from './components/shared/Navbar';
import { DemoSwitcher } from './components/shared/DemoSwitcher';
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