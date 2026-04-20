'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Search, 
  Calendar, 
  Settings, 
  LifeBuoy,
  LogOut,
  GraduationCap,
  BarChart2,
  MessageSquare,
  Trophy,
  Target,
  Bookmark
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '@/services/api';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
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

  const role = user?.role?.toLowerCase() || 'student';

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: `/dashboard/${role === 'super-admin' ? 'admin' : role}` },
    ...(role === 'student' ? [
        { icon: BookOpen, label: 'My Learning', href: '/dashboard/student/my-courses' },
        { icon: Search, label: 'Explore', href: '/dashboard/explore' },
        { icon: Calendar, label: 'Live Classes', href: '/dashboard/student/live' },
        { icon: Trophy, label: 'Leaderboard', href: '/dashboard/student/leaderboard' },
        { icon: Target, label: 'My Results', href: '/dashboard/student/results' },
        { icon: Bookmark, label: 'Bookmarks', href: '/dashboard/student/bookmarks' },
    ] : [
        { 
            icon: BarChart2, 
            label: 'Analytics', 
            href: '/dashboard/instructor/analytics' 
        },
        { 
            icon: MessageSquare, 
            label: 'Reviews', 
            href: '/dashboard/instructor/reviews' 
        },
        { 
          icon: BookOpen, 
          label: role === 'instructor' || role === 'admin' || role === 'super-admin' ? 'My Courses' : 'Learning', 
          href: role === 'instructor' 
            ? '/dashboard/instructor/courses' 
            : (role === 'admin' || role === 'super-admin' ? '/dashboard/admin/courses' : '/dashboard/student')
        },
        { 
          icon: Search, 
          label: role === 'instructor' ? 'Students' : 'Explore', 
          href: role === 'instructor' ? '/dashboard/instructor/students' : '/dashboard/explore' 
        },
        { 
          icon: Calendar, 
          label: role === 'instructor' ? 'Live Sessions' : 'Live Classes', 
          href: role === 'instructor' ? '/dashboard/instructor/live' : '/dashboard/student/live'
        },
    ])
  ];

  const footerItems = [
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
    { icon: LifeBuoy, label: 'Support', href: '/dashboard/support' },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      router.push('/login');
    }
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-100 flex flex-col fixed left-0 top-0 z-50 overflow-y-auto custom-scrollbar">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-xl text-white">
          <GraduationCap size={24} />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">EduFlow</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Premium Learning</p>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-6">
        <p className="px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Menu</p>
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={twMerge(
                "flex items-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all group",
                pathname === item.href 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon size={20} className={clsx(pathname === item.href ? "text-white" : "text-slate-400 group-hover:text-slate-900")} />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="space-y-1 mb-6">
          {footerItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all group"
            >
              <item.icon size={20} className="text-slate-400 group-hover:text-slate-900" />
              {item.label}
            </Link>
          ))}
        </div>

        {/* User Profile Section at the bottom */}
        <div className="flex items-center gap-3 px-4 py-4 bg-slate-50/50 rounded-2xl border border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-100 border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
            <img 
              src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0D8ABC&color=fff`} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-black text-slate-900 truncate uppercase tracking-tight">
              {user?.name || 'Loading...'}
            </p>
            <p className="text-[9px] text-blue-600 font-bold uppercase tracking-widest truncate">
              {user?.role || 'Guest'}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-rose-50 rounded-lg text-slate-300 hover:text-rose-500 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
