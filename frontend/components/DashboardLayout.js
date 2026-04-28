'use client';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import api from '@/services/api';
import { clsx } from 'clsx';

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.data);
      } catch (err) {
        console.error('Failed to fetch user in DashboardLayout:', err);
      }
    };
    fetchUser();
  }, []);

  const role = user?.role?.toLowerCase();
  const showSidebar = role === 'instructor';

  return (
    <div className="bg-slate-50 min-h-screen">
      {showSidebar && <Sidebar />}
      
      {/* Main Content Area */}
      <div className={clsx(
        "flex flex-col min-h-screen transition-all duration-300",
        showSidebar && "lg:pl-64"
      )}>
        <Topbar />
        <main className="p-4 lg:p-8 pb-16 flex-1 max-w-screen-2xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
