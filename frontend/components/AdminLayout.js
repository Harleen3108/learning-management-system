import AdminSidebar from './AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/services/api';

export default function AdminLayout({ children }) {
    const [user, setUser] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

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
        <div className="flex bg-slate-50/50 min-h-screen overflow-x-hidden">
            {/* Backdrop for Mobile */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
                    />
                )}
            </AnimatePresence>

            <AdminSidebar 
                isOpen={isMobileMenuOpen} 
                setIsOpen={setIsMobileMenuOpen} 
                isCollapsed={isCollapsed} 
                setIsCollapsed={setIsCollapsed} 
            />
            
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
                {/* Header */}
                <header className="h-16 border-b border-slate-200/50 bg-white/50 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 lg:hidden transition-all"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="hidden md:flex items-center gap-4 bg-slate-100/50 rounded-xl px-4 py-1.5 w-80 border border-slate-200/50 group focus-within:bg-white focus-within:border-blue-200 transition-all">
                            <Search size={16} className="text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search system wide..." 
                                className="bg-transparent border-none outline-none text-xs w-full text-slate-600 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-4">
                        <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block leading-none">
                                <p className="text-[11px] font-black text-slate-800 tracking-tight mb-0.5 uppercase">{user?.name || 'Loading...'}</p>
                                <p className="text-[9px] text-blue-600 font-bold uppercase tracking-widest">{user?.role || 'Admin'}</p>
                            </div>
                            <img 
                                src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=0D8ABC&color=fff`} 
                                alt="Admin" 
                                className="w-8 h-8 rounded-lg border border-slate-200 shadow-sm"
                            />
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-4 lg:p-8 flex-1">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
