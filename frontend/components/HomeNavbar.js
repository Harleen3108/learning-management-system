'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, User, Globe, Menu, X, ShoppingCart, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { translations } from '@/utils/translations';
import { useRouter } from 'next/navigation';
import logo from '@/assets/favicon_circle.png';
import { useRef } from 'react';
import { 
    LogOut, 
    Settings, 
    HelpCircle, 
    LayoutDashboard 
} from 'lucide-react';
import api from '@/services/api';
import AnnouncementBar from './AnnouncementBar';
import LanguageModal from './LanguageModal';
import SubscribeModal from './SubscribeModal';

export default function HomeNavbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const { language } = useLanguageStore();
  const t = translations[language] || translations.English;
  const [mounted, setMounted] = useState(false);
  const { items } = useCartStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    setMounted(true);
    
    window.addEventListener('scroll', handleScroll);
    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    logout(router);
    setIsProfileOpen(false);
  };

  const dashboardHref = user?.role === 'admin' || user?.role === 'super-admin' ? '/dashboard/admin' : 
                        user?.role === 'instructor' ? '/dashboard/instructor' : '/dashboard/student';

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300 bg-white border-b border-slate-100 shadow-sm">
      <AnnouncementBar isVisible={isAnnouncementVisible} setIsVisible={setIsAnnouncementVisible} />
      <div className={`max-w-[1600px] mx-auto px-6 flex items-center gap-6 transition-all duration-300 ${
        isScrolled ? 'py-3' : 'py-5'
      }`}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm overflow-hidden group-hover:border-[#071739] transition-all p-1">
            <img src={logo.src} alt="EduFlow" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tighter">EduFlow</span>
        </Link>

        {/* Explore */}
        <Link href="/explore" className="hidden lg:block text-[14px] font-medium text-slate-700 hover:text-[#071739] transition-colors">
          {t.nav.explore}
        </Link>

        {/* Subscribe */}
        <button
          type="button"
          onClick={() => setIsSubscribeOpen(true)}
          className="hidden lg:block text-[14px] font-medium text-slate-700 hover:text-[#071739] transition-colors"
        >
          {t.nav.subscribe}
        </button>

        {/* Search Bar */}
        <div className="hidden xl:flex items-center flex-1 max-w-md relative">
          <input 
            type="text" 
            placeholder={t.nav.searchPlaceholder} 
            className="w-full bg-slate-100/50 border border-slate-200 focus:border-[#071739]/20 focus:bg-white rounded-full py-2.5 px-6 pr-12 text-sm font-normal transition-all outline-none shadow-sm"
          />
          <div className="absolute right-2 p-1.5 bg-[#071739] rounded-full text-white cursor-pointer hover:bg-[#020a1a] transition-colors">
            <Search size={18} />
          </div>
        </div>

        {/* Teach on EduFlow */}
        <Link href="/teach" className="hidden lg:block text-[14px] font-medium text-slate-700 hover:text-[#071739] transition-colors">
          {t.nav.teach}
        </Link>

        {/* Right Side Actions */}
        <div className="ml-auto flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link href="/login" className="hidden md:block text-[14px] font-medium text-slate-700 hover:text-[#071739] px-4 py-2 transition-colors">
                {t.nav.login}
              </Link>
              <Link 
                href="/register" 
                className="hidden md:flex bg-[#071739] hover:bg-[#020a1a] text-white px-6 py-2.5 rounded-lg text-[14px] font-semibold transition-all shadow-lg shadow-slate-900/10"
              >
                {t.nav.signup}
              </Link>
            </>
          ) : (
            <Link 
              href={user?.role === 'admin' || user?.role === 'super-admin' ? '/dashboard/admin' : 
                    user?.role === 'instructor' ? '/dashboard/instructor' : '/dashboard/student'}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-[14px] font-semibold text-[#071739] hover:bg-slate-50 rounded-xl transition-all"
            >
              {t.nav.dashboard} <ArrowRight size={16} />
            </Link>
          )}

          <Link href="/dashboard/cart" className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 relative group">
            <ShoppingCart size={20} className="group-hover:text-[#071739] transition-colors" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#071739] text-white text-[10px] font-semibold rounded-full flex items-center justify-center border-2 border-white">
              {mounted ? items.filter(i => i && i._id && (i.title || i.name)).length : 0}
            </span>
          </Link>

          {/* Language Icon Only */}
          <button 
            onClick={() => setIsLanguageModalOpen(true)}
            className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
          >
            <Globe size={20} />
          </button>
          
          <LanguageModal isOpen={isLanguageModalOpen} onClose={() => setIsLanguageModalOpen(false)} />
          <SubscribeModal isOpen={isSubscribeOpen} onClose={() => setIsSubscribeOpen(false)} />

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
              <span className="text-xl font-semibold text-slate-800">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2"><X size={28} /></button>
            </div>
            <div className="p-6 space-y-4">
              <Link href="/explore" className="block text-lg font-medium text-slate-800 border-b border-slate-50 pb-2" onClick={() => setIsMobileMenuOpen(false)}>Explore</Link>
              <button
                type="button"
                onClick={() => { setIsSubscribeOpen(true); setIsMobileMenuOpen(false); }}
                className="block w-full text-left text-lg font-medium text-slate-800 border-b border-slate-50 pb-2"
              >
                Subscribe
              </button>
              <Link href="/dashboard/instructor" className="block text-lg font-medium text-slate-800 border-b border-slate-50 pb-2">Teach on EduFlow</Link>
              <div className="pt-8 flex flex-col gap-4">
                {!isAuthenticated ? (
                  <>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center py-4 rounded-xl font-medium border border-slate-200">Login</Link>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full bg-primary text-white text-center py-4 rounded-xl font-semibold shadow-xl">Sign up</Link>
                  </>
                ) : (
                  <>
                    <Link 
                      href={user?.role === 'admin' || user?.role === 'super-admin' ? '/dashboard/admin' : 
                            user?.role === 'instructor' ? '/dashboard/instructor' : '/dashboard/student'}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full bg-[#071739] text-white text-center py-4 rounded-xl font-semibold shadow-xl"
                    >
                      Go to Dashboard
                    </Link>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-rose-500 border border-rose-100 bg-rose-50/30"
                    >
                      <LogOut size={18} />
                      Log out
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
