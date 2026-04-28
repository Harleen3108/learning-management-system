'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, User, Globe, Menu, X, ShoppingCart, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import api from '@/services/api';

import AnnouncementBar from './AnnouncementBar';

export default function HomeNavbar() {
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);
  const { items } = useCartStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    // Check if user is logged in
    const fetchUser = async () => {
        try {
            const res = await api.get('/auth/me');
            if (res.data.success) {
                setUser(res.data.data);
            }
        } catch (err) {
            // Not logged in or token expired
            console.log('Not authenticated');
        }
    };

    window.addEventListener('scroll', handleScroll);
    fetchUser();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300 bg-white border-b border-slate-100 shadow-sm">
      <AnnouncementBar isVisible={isAnnouncementVisible} setIsVisible={setIsAnnouncementVisible} />
      <div className={`max-w-[1600px] mx-auto px-6 flex items-center gap-6 transition-all duration-300 ${
        isScrolled ? 'py-3' : 'py-5'
      }`}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-bold text-slate-800 tracking-tighter">EduFlow</span>
        </Link>

        {/* Explore */}
        <Link href="/explore" className="hidden lg:block text-[14px] font-medium text-slate-700 hover:text-[#071739] transition-colors">
          Explore
        </Link>

        {/* Subscribe */}
        <Link href="#" className="hidden lg:block text-[14px] font-medium text-slate-700 hover:text-[#071739] transition-colors">
          Subscribe
        </Link>

        {/* Search Bar */}
        <div className="hidden xl:flex items-center flex-1 max-w-md relative">
          <input 
            type="text" 
            placeholder="Search for anything" 
            className="w-full bg-slate-100/50 border border-slate-200 focus:border-[#071739]/20 focus:bg-white rounded-full py-2.5 px-6 pr-12 text-sm font-normal transition-all outline-none shadow-sm"
          />
          <div className="absolute right-2 p-1.5 bg-[#071739] rounded-full text-white cursor-pointer hover:bg-[#020a1a] transition-colors">
            <Search size={18} />
          </div>
        </div>

        {/* Teach on EduFlow */}
        <Link href="/dashboard/instructor" className="hidden lg:block text-[14px] font-medium text-slate-700 hover:text-[#071739] transition-colors">
          Teach on EduFlow
        </Link>

        {/* Right Side Actions */}
        <div className="ml-auto flex items-center gap-3">
          <Link href="/login" className="hidden md:block text-[14px] font-medium text-slate-700 hover:text-[#071739] px-4 py-2 transition-colors">
            Login
          </Link>

          <Link 
            href="/register" 
            className="hidden md:flex bg-[#071739] hover:bg-[#020a1a] text-white px-6 py-2.5 rounded-lg text-[14px] font-bold transition-all shadow-lg shadow-slate-900/10"
          >
            Sign up
          </Link>

          <Link href="/dashboard/cart" className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 relative group">
            <ShoppingCart size={20} className="group-hover:text-[#071739] transition-colors" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#071739] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {items.length}
              </span>
            )}
          </Link>

          {/* Language Icon Only */}
          <button className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-all border border-slate-200">
            <Globe size={20} />
          </button>

          {/* User Profile - Directs to respective panel if logged in */}
          {user && (
              <Link 
                href={user.role === 'admin' || user.role === 'super-admin' ? '/dashboard/admin' : 
                      user.role === 'instructor' ? '/dashboard/instructor' : '/dashboard/student'}
                className="w-10 h-10 bg-[#071739]/10 rounded-full flex items-center justify-center text-[#071739] cursor-pointer hover:bg-[#071739] hover:text-white transition-all border border-[#071739]/20 overflow-hidden relative group/profile"
              >
                {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center">
                        <User size={18} />
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/profile:opacity-100 transition-opacity whitespace-nowrap">
                            {user.role?.toUpperCase()} PANEL
                        </span>
                    </div>
                )}
              </Link>
          )}

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[110] bg-white lg:hidden flex flex-col"
          >
            <div className="p-6 flex justify-between items-center border-b">
              <span className="text-xl font-bold text-slate-800">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2"><X size={28} /></button>
            </div>
            <div className="p-6 space-y-4">
              <Link href="/explore" className="block text-lg font-medium text-slate-800 border-b border-slate-50 pb-2">Explore</Link>
              <Link href="#" className="block text-lg font-medium text-slate-800 border-b border-slate-50 pb-2">Subscribe</Link>
              <Link href="/dashboard/instructor" className="block text-lg font-medium text-slate-800 border-b border-slate-50 pb-2">Teach on EduFlow</Link>
              <div className="pt-8 flex flex-col gap-4">
                <Link href="/login" className="w-full text-center py-4 rounded-xl font-medium border border-slate-200">Login</Link>
                <Link href="/register" className="w-full bg-primary text-white text-center py-4 rounded-xl font-bold shadow-xl">Sign up</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
