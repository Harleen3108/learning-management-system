'use client';
import { 
  Search, 
  Bell, 
  HelpCircle, 
  ChevronDown 
} from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/services/api';

export default function Topbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    fetchMe();
  }, []);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search courses, mentors, or skills..." 
            className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-600/20 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <button className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
            <HelpCircle size={20} />
          </button>
        </div>

        <div className="h-8 w-px bg-slate-100"></div>

        <button className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name || 'Loading...'}</p>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{user?.role || 'User'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden ring-2 ring-white">
            <img 
              src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0D8ABC&color=fff`} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <ChevronDown size={16} className="text-slate-400" />
        </button>
      </div>
    </header>
  );
}
