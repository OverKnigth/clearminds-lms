import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const storedRole = localStorage.getItem('userRole');

    if (storedName) {
      setUser({
        name: storedName,
        role: storedRole || 'student'
      });
    }
  }, []);

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <Sidebar user={user || undefined} />
      <main className="flex-1 overflow-y-auto bg-slate-900/50">
        <Outlet />
      </main>
    </div>
  );
}
