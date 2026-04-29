'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  Bookmark,
  Users,
  UserCheck,
  CheckCircle2,
  Award,
  CreditCard,
  Monitor,
  History,
  Ticket,
  Receipt,
  User as UserIcon,
  Video,
  Wrench,
  X,
  ChevronDown as ChevronDownIcon,
  HelpCircle,
  FileText,
  Megaphone,
  Mail
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function Sidebar({ isOpen = false, onClose = () => {} } = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuthStore();
  const [openSubmenu, setOpenSubmenu] = useState(null);

  // Removed redundant fetchMe effect as user is fetched globally

    const role = user?.role?.toLowerCase() || 'student';
    const isAdmin = role === 'admin' || role === 'super-admin';

    const menuItems = [
        ...(role === 'student' ? [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/student' },
            { icon: BookOpen, label: 'My Learning', href: '/dashboard/student/my-courses' },
            { icon: Search, label: 'Explore', href: '/dashboard/explore' },
            { icon: Calendar, label: 'Live Classes', href: '/dashboard/student/live' },
            { icon: Trophy, label: 'Leaderboard', href: '/dashboard/student/leaderboard' },
            { icon: Target, label: 'My Results', href: '/dashboard/student/results' },
            { icon: Bookmark, label: 'Bookmarks', href: '/dashboard/student/bookmarks' },
        ] : (isAdmin ? [
            { icon: LayoutDashboard, label: 'Analytics', href: '/dashboard/admin/analytics' },
            { icon: UserCheck, label: 'Instructors', href: '/dashboard/admin/instructors' },
            { icon: Users, label: 'Users', href: '/dashboard/admin/users' },
            { icon: CheckCircle2, label: 'Course Approvals', href: '/dashboard/admin/courses' },
            { icon: MessageSquare, label: 'Reviews', href: '/dashboard/admin/reviews' },
            { icon: Award, label: 'Certificates', href: '/dashboard/admin/certificates' },
            { icon: Monitor, label: 'Content Monitor', href: '/dashboard/admin/content' },
            { icon: History, label: 'Activity Logs', href: '/dashboard/admin/logs' },
            { icon: CreditCard, label: 'Transactions', href: '/dashboard/admin/transactions' },
            { icon: Ticket, label: 'Coupons', href: '/dashboard/admin/coupons' },
            { icon: Receipt, label: 'Payment Logs', href: '/dashboard/admin/payments/logs' },
            { icon: Mail, label: 'Subscriptions', href: '/dashboard/admin/subscriptions' },
            { icon: Megaphone, label: 'Announcements', href: '/dashboard/admin/announcements' },
        ] : [
            // Instructor Role
            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/instructor' },
            { icon: BookOpen, label: 'Courses', href: '/dashboard/instructor/courses' },
            { 
              icon: MessageSquare, 
              label: 'Communication', 
              href: '/dashboard/instructor/communication',
              subItems: [
                { label: 'Q&A', href: '/dashboard/instructor/communication?section=qna', icon: HelpCircle },
                { label: 'Messages', href: '/dashboard/instructor/communication?section=messages', icon: MessageSquare },
                { label: 'Assignments', href: '/dashboard/instructor/communication?section=assignments', icon: FileText },
                { label: 'Announcements', href: '/dashboard/instructor/communication?section=announcements', icon: Megaphone },
              ]
            },
            { 
              icon: BarChart2, 
              label: 'Performance', 
              href: '/dashboard/instructor/performance',
              subItems: [
                { label: 'Overview', href: '/dashboard/instructor/performance?section=overview', icon: LayoutDashboard },
                { label: 'Revenue', href: '/dashboard/instructor/performance?section=revenue', icon: CreditCard },
                { label: 'Students', href: '/dashboard/instructor/performance?section=students', icon: Users },
                { label: 'Reviews', href: '/dashboard/instructor/performance?section=reviews', icon: MessageSquare },
                { label: 'Engagement', href: '/dashboard/instructor/performance?section=engagement', icon: Target },
              ]
            },
            { icon: Video, label: 'Live Sessions', href: '/dashboard/instructor/live' },
        ]))
    ];

    const footerItems = [
        ...(isAdmin ? [
            { icon: Settings, label: 'System Settings', href: '/dashboard/admin/settings' },
            { icon: LifeBuoy, label: 'Support Desk', href: '/dashboard/admin/support' },
        ] : (role === 'instructor' ? [
            { icon: Settings, label: 'Settings', href: '/dashboard/instructor/settings' },
        ] : [
            { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
            { icon: LifeBuoy, label: 'Support', href: '/dashboard/support' },
        ]))
    ];

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to sign out?')) {
            logout(router);
        }
    };

    return (
        <div className={twMerge(
            "h-screen bg-white border-r border-slate-100 flex flex-col fixed left-0 top-0 overflow-y-auto custom-scrollbar transition-transform duration-300 ease-in-out",
            // z-[110] on mobile so sidebar floats above the z-[100] sticky topbar; z-50 on desktop where topbar is offset.
            "z-[110] lg:z-50",
            isAdmin ? "w-72 bg-white/90 backdrop-blur-2xl border-slate-200/50" : "w-64",
            // Mobile: slide in/out based on isOpen. Desktop (lg+): always visible.
            isOpen ? "translate-x-0" : "-translate-x-full",
            "lg:translate-x-0"
        )}>
            <div className="p-6 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-2">
                    <div>
                        <h1 className="text-xl font-semibold text-[#071739] tracking-tighter leading-none">EduFlow</h1>
                        <p className={clsx(
                            "text-[10px] font-semibold uppercase tracking-widest leading-none mt-1.5",
                            isAdmin ? "text-[#A68868]" : "text-slate-400"
                        )}>
                            {isAdmin ? 'Administrator' : 'Premium Learning'}
                        </p>
                    </div>
                </div>
                {/* Close button — visible on mobile only */}
                <button
                    onClick={onClose}
                    className="lg:hidden p-2 text-slate-400 hover:text-[#071739] hover:bg-slate-100 rounded-xl transition-all"
                    aria-label="Close sidebar"
                >
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-1 px-4 mt-6">
                {!isAdmin && <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Menu</p>}
                <div className="space-y-1">
            {menuItems.map((item) => {
                const isActive = pathname === item.href || 
                                (item.label === 'My Courses' && pathname.startsWith('/dashboard/courses')) ||
                                (item.label === 'Course Approvals' && pathname.startsWith('/dashboard/courses')) ||
                                (item.label === 'My Courses' && pathname.startsWith('/dashboard/admin/courses')) ||
                                (item.label === 'My Courses' && pathname.startsWith('/dashboard/instructor/courses'));

                return (
                    <div key={item.label}>
                        <div
                            onClick={() => {
                                if (item.subItems) {
                                    setOpenSubmenu(openSubmenu === item.label ? null : item.label);
                                } else {
                                    router.push(item.href);
                                }
                            }}
                            className={twMerge(
                                "flex items-center justify-between px-6 py-3.5 rounded-2xl text-sm font-semibold transition-all group relative overflow-hidden cursor-pointer",
                                isActive && !item.subItems
                                    ? "bg-[#071739] text-white shadow-xl shadow-slate-900/10" 
                                    : "text-slate-500 hover:bg-slate-50 hover:text-[#071739]"
                            )}
                        >
                            <div className="flex items-center gap-3.5">
                                <item.icon size={20} className={clsx(isActive && !item.subItems ? "text-white" : "text-slate-400 group-hover:text-[#071739]", "transition-all")} />
                                <span className="tracking-tight text-[14px]">
                                    {item.label}
                                </span>
                            </div>
                            {item.subItems && (
                                <ChevronDownIcon 
                                    size={16} 
                                    className={clsx(
                                        "transition-transform duration-200",
                                        openSubmenu === item.label ? "rotate-180" : ""
                                    )} 
                                />
                            )}
                            {isActive && isAdmin && !item.subItems && (
                                <motion.div 
                                    layoutId="active-pill"
                                    className="absolute left-0 w-1 h-5 bg-[#A68868] rounded-r-full"
                                />
                            )}
                        </div>

                        {/* Sub Items */}
                        {item.subItems && (
                            <AnimatePresence>
                                {(openSubmenu === item.label || (isActive && !openSubmenu)) && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden ml-4 mt-1 space-y-1 border-l-2 border-slate-50 ml-10"
                                    >
                                        {item.subItems.map((sub) => {
                                            const section = searchParams.get('section') || 'qna';
                                            const isSubActive = pathname === sub.href || (pathname === '/dashboard/instructor/communication' && section === sub.label.toLowerCase().replace('q&a', 'qna'));
                                            return (
                                                <Link
                                                    key={sub.label}
                                                    href={sub.href}
                                                    className={twMerge(
                                                        "flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-bold transition-all",
                                                        isSubActive 
                                                            ? "text-[#071739] bg-slate-50" 
                                                            : "text-slate-400 hover:text-[#071739] hover:bg-slate-50/50"
                                                    )}
                                                >
                                                    <sub.icon size={14} />
                                                    {sub.label}
                                                </Link>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                );
            })}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-100">
                <div className="space-y-1 mb-6">
          {footerItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={twMerge(
                "flex items-center gap-3.5 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all group",
                "text-slate-500 hover:bg-slate-50 hover:text-[#071739]"
              )}
            >
              <item.icon size={20} className="text-slate-400 group-hover:text-[#071739]" />
              <span className="tracking-tight text-[14px]">
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* User Profile Section at the bottom */}
        <div className="flex items-center gap-3 px-4 py-4 bg-slate-50/50 rounded-2xl border border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
            <img 
              src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=071739&color=fff`} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-slate-900 truncate uppercase tracking-tight">
              {user?.name || 'Loading...'}
            </p>
            <p className="text-[9px] text-[#A68868] font-semibold uppercase tracking-widest truncate">
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
