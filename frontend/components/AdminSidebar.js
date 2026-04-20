'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
    LayoutDashboard, 
    Users, 
    UserCheck,
    CheckCircle2, 
    MessageSquare,
    Award,
    CreditCard, 
    Star, 
    Settings, 
    HelpCircle,
    LogOut,
    Menu,
    X,
    Ticket,
    Receipt,
    Monitor,
    History,
    LifeBuoy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import api from '@/services/api';

const menuItems = [
    { name: 'Analytics', icon: LayoutDashboard, href: '/dashboard/admin/analytics' },
    { name: 'Instructors', icon: UserCheck, href: '/dashboard/admin/instructors' },
    { name: 'Users', icon: Users, href: '/dashboard/admin/users' },
    { name: 'Course Approvals', icon: CheckCircle2, href: '/dashboard/admin/courses' },
    { name: 'Reviews', icon: MessageSquare, href: '/dashboard/admin/reviews' },
    { name: 'Certificates', icon: Award, href: '/dashboard/admin/certificates' },
    { name: 'Content Monitor', icon: Monitor, href: '/dashboard/admin/content' },
    { name: 'Activity Logs', icon: History, href: '/dashboard/admin/logs' },
    { name: 'Transactions', icon: CreditCard, href: '/dashboard/admin/transactions' },
    { name: 'Coupons', icon: Ticket, href: '/dashboard/admin/coupons' },
    { name: 'Payment Logs', icon: Receipt, href: '/dashboard/admin/payments/logs' },
    { name: 'System Settings', icon: Settings, href: '/dashboard/admin/settings' },
];

export default function AdminSidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) {
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

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to terminate the session?')) {
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            router.push('/login');
        }
    };

    return (
        <motion.div 
            initial={false}
            animate={{ 
                x: isOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? -320 : 0),
                width: isCollapsed ? 80 : 288
            }}
            className={clsx(
                "h-screen bg-white/90 backdrop-blur-2xl border-r border-slate-200/50 flex flex-col transition-all duration-300 fixed top-0 z-[70]",
                isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}
        >
            {/* Logo Section */}
            <div className="p-6 flex items-center justify-between border-b border-slate-50">
                {!isCollapsed && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-100">
                            <span className="text-white font-black text-xl">E</span>
                        </div>
                        <div>
                            <h1 className="font-black text-slate-800 tracking-tight text-lg leading-none">EduFlow</h1>
                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest leading-none mt-1.5">Super Admin</p>
                        </div>
                    </motion.div>
                )}
                {isCollapsed && (
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-xl shadow-blue-100">
                        <span className="text-white font-black text-xl">E</span>
                    </div>
                )}
                <button 
                    onClick={() => {
                        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                            setIsOpen(false);
                        } else {
                            setIsCollapsed(!isCollapsed);
                        }
                    }}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors hidden lg:block"
                >
                    {isCollapsed ? <Menu size={20} /> : <X size={20} />}
                </button>
                <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 lg:hidden"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 mt-6 scrollbar-hide overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
                            <div className={clsx(
                                "flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all relative group overflow-hidden",
                                isActive 
                                    ? "bg-blue-600 text-white shadow-xl shadow-blue-100" 
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}>
                                <item.icon size={22} className={clsx(isActive ? "text-white" : "text-slate-400 group-hover:block transition-all")} />
                                {!isCollapsed && <span className="text-[14px] font-black tracking-tight">{item.name}</span>}
                                {isActive && (
                                    <motion.div 
                                        layoutId="active-pill"
                                        className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full"
                                    />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 space-y-2">
                <Link href="/dashboard/admin/support" onClick={() => setIsOpen(false)}>
                    <div className={clsx(
                        "flex items-center gap-3.5 w-full px-4 py-3.5 rounded-2xl transition-all cursor-pointer group",
                        pathname === '/dashboard/admin/support' ? "bg-blue-600 text-white shadow-xl" : "text-slate-500 hover:bg-blue-50/50 hover:text-blue-600"
                    )}>
                        <LifeBuoy size={22} className={pathname === '/dashboard/admin/support' ? "text-white" : "text-slate-400 group-hover:text-blue-600"} />
                        {!isCollapsed && <span className="text-[14px] font-black tracking-tight">Support Desk</span>}
                    </div>
                </Link>
                <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 px-2 py-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden border border-white shadow-sm flex-shrink-0">
                            <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=0D8ABC&color=fff`} className="w-full h-full object-cover" alt="Profile" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black text-slate-800 truncate uppercase tracking-tight">{user?.name || 'Loading...'}</p>
                                <p className="text-[9px] text-slate-400 truncate font-bold uppercase tracking-widest">{user?.role || 'Admin'}</p>
                            </div>
                        )}
                        {!isCollapsed && (
                            <button onClick={handleLogout} className="p-1 hover:bg-rose-50 rounded-lg transition-all">
                                <LogOut size={18} className="text-slate-300 hover:text-rose-500 cursor-pointer" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
