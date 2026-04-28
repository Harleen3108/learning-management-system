'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import { clsx } from 'clsx';

// Friendly icon hint per notification type — purely decorative.
const TYPE_DOT = {
    instructor_application_submitted: 'bg-blue-500',
    instructor_application_approved: 'bg-emerald-500',
    instructor_application_rejected: 'bg-rose-500',
    course_submitted: 'bg-amber-500',
    course_approved: 'bg-emerald-500',
    course_rejected: 'bg-rose-500',
    course_changes_requested: 'bg-amber-500',
    new_enrollment: 'bg-[#071739]',
    new_review: 'bg-[#A68868]',
    new_live_class: 'bg-emerald-500',
    new_coupon: 'bg-[#A68868]',
    course_updated: 'bg-blue-500',
    system: 'bg-slate-500'
};

const formatRelative = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60_000);
    const h = Math.floor(diff / 3_600_000);
    const d = Math.floor(diff / 86_400_000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (d < 7) return `${d}d ago`;
    return new Date(date).toLocaleDateString();
};

export default function NotificationBell() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const popoverRef = useRef(null);
    const buttonRef = useRef(null);

    const fetchCount = async () => {
        try {
            const res = await api.get('/notifications/unread-count');
            setUnreadCount(res.data.unreadCount || 0);
        } catch (err) { /* silent */ }
    };

    const fetchList = async () => {
        setLoading(true);
        try {
            const res = await api.get('/notifications?limit=10');
            setItems(res.data.data || []);
            setUnreadCount(res.data.unreadCount || 0);
        } catch (err) {
            console.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    // Poll the unread count every 60s
    useEffect(() => {
        fetchCount();
        const id = setInterval(fetchCount, 60_000);
        return () => clearInterval(id);
    }, []);

    // Refresh list whenever the dropdown opens
    useEffect(() => {
        if (open) fetchList();
    }, [open]);

    // Click outside to close
    useEffect(() => {
        const onDoc = (e) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(e.target) &&
                !buttonRef.current?.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, [open]);

    const handleItemClick = async (n) => {
        try {
            if (!n.isRead) {
                await api.patch(`/notifications/${n._id}/read`);
                setUnreadCount(c => Math.max(0, c - 1));
                setItems(prev => prev.map(i => i._id === n._id ? { ...i, isRead: true } : i));
            }
        } catch (err) { /* silent */ }
        setOpen(false);
        if (n.link) router.push(n.link);
    };

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setItems(prev => prev.map(i => ({ ...i, isRead: true })));
            setUnreadCount(0);
        } catch (err) { /* silent */ }
    };

    const removeNotif = async (id, ev) => {
        ev.stopPropagation();
        try {
            await api.delete(`/notifications/${id}`);
            setItems(prev => prev.filter(i => i._id !== id));
            fetchCount();
        } catch (err) { /* silent */ }
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setOpen(v => !v)}
                className="hidden sm:flex p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all relative"
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[9px] font-semibold rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        ref={popoverRef}
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[200]"
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                                    {unreadCount === 0 ? "You're all caught up" : `${unreadCount} unread`}
                                </p>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-[10px] uppercase tracking-widest text-[#071739] font-semibold hover:underline flex items-center gap-1"
                                >
                                    <Check size={11} /> Mark all read
                                </button>
                            )}
                        </div>

                        {/* Body */}
                        <div className="max-h-[420px] overflow-y-auto">
                            {loading ? (
                                <div className="p-10 text-center text-[10px] uppercase tracking-widest text-slate-400 font-semibold animate-pulse">
                                    Loading…
                                </div>
                            ) : items.length === 0 ? (
                                <div className="p-10 text-center">
                                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mb-3">
                                        <Bell size={20} />
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">No notifications yet.</p>
                                    <p className="text-xs text-slate-400 font-medium mt-1">We'll let you know when something happens.</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-slate-50">
                                    {items.map(n => (
                                        <li key={n._id}>
                                            <button
                                                onClick={() => handleItemClick(n)}
                                                className={clsx(
                                                    'w-full text-left px-5 py-3.5 hover:bg-slate-50 transition-all flex gap-3 group',
                                                    !n.isRead && 'bg-[#071739]/[0.025]'
                                                )}
                                            >
                                                <div className={clsx(
                                                    'w-2 h-2 rounded-full mt-1.5 shrink-0',
                                                    TYPE_DOT[n.type] || 'bg-slate-400'
                                                )} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className={clsx(
                                                            'text-sm leading-snug',
                                                            n.isRead ? 'text-slate-700 font-medium' : 'text-slate-900 font-semibold'
                                                        )}>
                                                            {n.title}
                                                        </p>
                                                        {!n.isRead && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-2">
                                                        {n.message}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-1.5">
                                                        <p className="text-[10px] text-slate-400 font-medium">
                                                            {formatRelative(n.createdAt)}
                                                        </p>
                                                        <button
                                                            onClick={(e) => removeNotif(n._id, e)}
                                                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all"
                                                            aria-label="Remove notification"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Footer */}
                        <Link
                            href="/dashboard/notifications"
                            onClick={() => setOpen(false)}
                            className="block px-5 py-3 text-center text-[11px] uppercase tracking-widest text-[#071739] font-semibold hover:bg-slate-50 border-t border-slate-100 transition-all"
                        >
                            View all notifications →
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
