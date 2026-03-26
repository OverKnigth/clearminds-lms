import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { mockUser } from '../utils/mockData';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar user={mockUser} />
      <Outlet />
    </div>
  );
}
