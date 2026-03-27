import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

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
    <div className="min-h-screen bg-slate-900">
      <Navbar user={user || undefined} />
      <div className="pt-16">
        <Outlet />
      </div>
    </div>
  );
}
