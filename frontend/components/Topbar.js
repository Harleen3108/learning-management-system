'use client';
import { 
  Search, 
  Bell, 
  HelpCircle, 
  ChevronDown,
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  Settings,
  LogOut,
  Menu,
  CheckCircle2,
  Award,
  CreditCard,
  MessageSquare,
  History,
  Ticket,
  Receipt,
  Monitor,
  ShoppingCart,
  BarChart2,
  Wrench,
  Library,
  Video
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '@/services/api';
import { useCartStore } from '@/store/useCartStore';

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  
  const exploreRef = useRef(null);
  const profileRef = useRef(null);
  const managementRef = useRef(null);
  const { items } = useCartStore();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setAllCategories(res.data.data);
            // Filter to show only top-level categories that are marked for visibility
            const filtered = res.data.data.filter(cat => !cat.parentId && cat.isVisibleOnHome);
            setCategories(filtered);
            if (filtered.length > 0) setHoveredCategory(filtered[0]._id);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };
    fetchMe();
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exploreRef.current && !exploreRef.current.contains(event.target)) setIsExploreOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
      if (managementRef.current && !managementRef.current.contains(event.target)) setIsManagementOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const role = user?.role?.toLowerCase() || 'student';
  const isAdmin = role === 'admin' || role === 'super-admin';

  const studentLinks = [
    { label: 'Explore', href: '/dashboard/explore' },
    { label: 'My Learning', href: '/dashboard/student/my-courses' },
    { label: 'Live Classes', href: '/dashboard/student/live' },
  ];

  const instructorLinks = [
    { label: 'Courses', href: '/dashboard/instructor/courses', icon: BookOpen },
    { label: 'Communication', href: '/dashboard/instructor/communication', icon: MessageSquare },
    { label: 'Performance', href: '/dashboard/instructor/performance', icon: BarChart2 },
    { label: 'Tools', href: '/dashboard/instructor/tools', icon: Wrench },
    { label: 'Resources', href: '/dashboard/instructor/resources', icon: Library },
  ];

  const adminNavLinks = [
    { label: 'Analytics', href: '/dashboard/admin/analytics', icon: LayoutDashboard },
    { label: 'Categories', href: '/dashboard/admin/categories', icon: BookOpen },
    { label: 'Instructors', href: '/dashboard/admin/instructors', icon: Users },
    { label: 'Users', href: '/dashboard/admin/users', icon: GraduationCap },
    { label: 'Courses', href: '/dashboard/admin/courses', icon: CheckCircle2 },
  ];

  const adminManagementLinks = [
    { label: 'Reviews', href: '/dashboard/admin/reviews', icon: MessageSquare },
    { label: 'Certificates', href: '/dashboard/admin/certificates', icon: Award },
    { label: 'Content Monitor', href: '/dashboard/admin/content', icon: Monitor },
    { label: 'Activity Logs', href: '/dashboard/admin/logs', icon: History },
    { label: 'Transactions', href: '/dashboard/admin/transactions', icon: CreditCard },
    { label: 'Coupons', href: '/dashboard/admin/coupons', icon: Ticket },
    { label: 'Payment Logs', href: '/dashboard/admin/payments/logs', icon: Receipt },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      router.push('/login');
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center px-6 sticky top-0 z-[100] gap-8">
      {/* Brand Logo - Hidden for Instructor (since sidebar has it) */}
      {role !== 'instructor' && (
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="text-xl font-semibold text-[#071739] tracking-tighter">EduFlow</span>
        </Link>
      )}

      {/* Explore Dropdown (Udemy Inspired Mega Menu) */}
      {role !== 'instructor' && (
        <div className="relative" ref={exploreRef}>
        <button 
          onMouseEnter={() => setIsExploreOpen(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-primary transition-colors"
        >
          Explore
        </button>

        <AnimatePresence>
          {isExploreOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              onMouseLeave={() => setIsExploreOpen(false)}
              className="absolute top-full left-0 mt-[1px] flex bg-white shadow-[0_4px_16px_rgba(0,0,0,0.2)] border border-slate-200 overflow-hidden min-w-[560px] z-[200] rounded-sm"
            >
              {/* Left Column: Categories List */}
              <div className="w-[280px] border-r border-slate-100 py-2 bg-white">
                <div className="px-4 py-2 text-[12px] font-semibold text-slate-500 uppercase tracking-tight">
                    Browse Categories
                </div>
                <div className="space-y-0.5">
                  {categories.length > 0 ? categories.map((cat) => (
                    <div 
                        key={cat._id}
                        onMouseEnter={() => setHoveredCategory(cat._id)}
                        className={clsx(
                            "flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors group",
                            hoveredCategory === cat._id ? "bg-slate-50 text-primary" : "text-slate-700 hover:bg-slate-50"
                        )}
                    >
                        <Link 
                            href={`/explore?category=${cat._id}`}
                            onClick={() => setIsExploreOpen(false)}
                            className="text-sm font-semibold flex-1"
                        >
                            {cat.name}
                        </Link>
                        <ChevronDown size={14} className={clsx("-rotate-90 transition-opacity", hoveredCategory === cat._id ? "opacity-100" : "opacity-40")} />
                    </div>
                  )) : (
                      <div className="px-4 py-3 text-sm text-slate-400 italic">
                          No categories found
                      </div>
                  )}
                </div>
                
                {/* Optional: Add "Popular Goals" like Udemy */}
                <div className="mt-4 pt-4 border-t border-slate-100 px-4 py-2 text-[12px] font-semibold text-slate-500 uppercase tracking-tight">
                    Explore by Goal
                </div>
                <div className="space-y-0.5">
                    {['Learn AI', 'Launch a new career', 'Prepare for certification'].map(goal => (
                        <div key={goal} className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors group">
                            <span>{goal}</span>
                            <ChevronDown size={14} className="-rotate-90 opacity-40 group-hover:opacity-100" />
                        </div>
                    ))}
                </div>
              </div>

              {/* Right Column: Subcategories List */}
              <div className="flex-1 bg-white py-4 px-6 min-h-[450px]">
                {hoveredCategory ? (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-50">
                                {categories.find(c => c._id === hoveredCategory)?.name} Specializations
                            </h4>
                            <div className="grid grid-cols-1 gap-1">
                                {allCategories
                                    .filter(sub => sub.parentId === hoveredCategory)
                                    .map(sub => (
                                        <Link 
                                            key={sub._id}
                                            href={`/explore?subcategory=${sub._id}`}
                                            onClick={() => setIsExploreOpen(false)}
                                            className="py-2 text-sm font-semibold text-slate-600 hover:text-primary transition-all flex items-center gap-2"
                                        >
                                            {sub.name}
                                        </Link>
                                    ))
                                }
                                {allCategories.filter(sub => sub.parentId === hoveredCategory).length === 0 && (
                                    <div className="space-y-3">
                                        <p className="text-sm text-slate-400">Master the basics of {categories.find(c => c._id === hoveredCategory)?.name} through our curated curriculum.</p>
                                        <Link 
                                            href={`/explore?category=${hoveredCategory}`}
                                            className="inline-block text-primary text-sm font-semibold hover:underline"
                                        >
                                            View All {categories.find(c => c._id === hoveredCategory)?.name} Courses
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-4 bg-slate-50 rounded-full">
                            <BookOpen size={40} className="text-slate-300" />
                        </div>
                        <p className="text-sm text-slate-500 font-semibold">Select a category to explore <br/> specialized learning paths.</p>
                    </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}

      {/* Search Bar - Visible for Student and Instructor */}
      {role !== 'admin' && (
        <div className="hidden md:flex items-center flex-1 max-w-lg relative">
          <Search className="absolute left-4 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="What do you want to learn today?" 
            className="w-full bg-slate-100 border-2 border-transparent focus:border-[#071739]/20 focus:bg-white rounded-2xl py-2.5 pl-12 pr-4 text-sm font-semibold transition-all outline-none placeholder:text-slate-400 placeholder:font-normal"
          />
        </div>
      )}

      {/* Primary Navigation Links */}
      <nav className="hidden lg:flex items-center gap-1">
        {/* Navigation links hidden for Instructor (now in Sidebar) */}
        {role === 'student' && studentLinks.map(link => (
          <Link key={link.href} href={link.href} className={clsx(
            "px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-slate-50",
            pathname === link.href ? "text-[#071739]" : "text-slate-600"
          )}>
            {link.label}
          </Link>
        ))}
        {isAdmin && adminNavLinks.map(link => (
          <Link key={link.href} href={link.href} className={clsx(
            "px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-slate-50",
            pathname === link.href ? "text-[#071739]" : "text-slate-600"
          )}>
            {link.label}
          </Link>
        ))}

        {/* Management Dropdown for Admin */}
        {isAdmin && (
          <div className="relative" ref={managementRef}>
            <button 
              onClick={() => setIsManagementOpen(!isManagementOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-tight"
            >
              Management
              <ChevronDown size={16} className={clsx("transition-transform", isManagementOpen && "rotate-180")} />
            </button>
            <AnimatePresence>
              {isManagementOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden p-2"
                >
                  <p className="px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-2">Administrative Tools</p>
                  <div className="grid grid-cols-1 gap-1">
                    {adminManagementLinks.map(link => (
                      <Link 
                        key={link.href} 
                        href={link.href}
                        onClick={() => setIsManagementOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 group transition-all"
                      >
                        <link.icon size={18} className="text-slate-400 group-hover:text-[#071739]" />
                        <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 tracking-tight">{link.label}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </nav>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3 ml-auto shrink-0">
        {role === 'student' && (
          <Link href="/dashboard/cart" className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all relative group">
            <ShoppingCart size={20} className="group-hover:text-[#071739] transition-colors" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#071739] text-white text-[9px] font-semibold rounded-full flex items-center justify-center border border-white">
                {items.length}
              </span>
            )}
          </Link>
        )}

        {role === 'instructor' && (
          <div className="flex items-center gap-2">
            <Link href="/dashboard/instructor/live" className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all group relative" title="Live Sessions">
              <Video size={20} className="group-hover:text-[#071739] transition-colors" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
            </Link>
            <Link href="/dashboard/settings" className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all group" title="Settings">
              <Settings size={20} className="group-hover:text-[#071739] transition-colors" />
            </Link>
          </div>
        )}

        <button className="hidden sm:flex p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#071739] rounded-full border-2 border-white"></span>
        </button>

        <div className="h-6 w-px bg-slate-100 mx-2 hidden lg:block"></div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 hover:bg-slate-50 p-1 rounded-2xl transition-all border border-transparent hover:border-slate-100"
          >
            <div className="w-10 h-10 rounded-xl bg-[#071739] overflow-hidden ring-4 ring-white shadow-lg shadow-slate-900/10">
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=071739&color=fff`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <ChevronDown size={16} className={clsx("text-slate-400 transition-transform", isProfileOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden p-2"
              >
                <div className="px-4 py-4 border-b border-slate-50 mb-2">
                  <p className="text-sm font-semibold text-slate-900 leading-none">{user?.name}</p>
                  <p className="text-[10px] text-slate-400 font-normal uppercase tracking-widest mt-1">{user?.email}</p>
                </div>
                <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 transition-all">
                  <Settings size={18} />
                  <span className="text-sm font-semibold">Account Settings</span>
                </Link>
                <Link href="/dashboard/support" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 transition-all">
                  <HelpCircle size={18} />
                  <span className="text-sm font-semibold">Get Support</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-50 text-rose-500 transition-all mt-1"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-semibold">Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
