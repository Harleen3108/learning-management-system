'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Check, Trash2, ArrowRight, Filter } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/services/api';
import { clsx } from 'clsx';

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

export default function NotificationsPage() {
    const router = useRouter();
    const [items, setItems] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all | unread

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/notifications?limit=100${filter === 'unread' ? '&unread=true' : ''}`);
            setItems(res.data.data || []);
            setUnreadCount(res.data.unreadCount || 0);
        } catch (err) {
            console.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [filter]);

    const markRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setItems(prev => prev.map(i => i._id === id ? { ...i, isRead: true } : i));
            setUnreadCount(c => Math.max(0, c - 1));
        } catch (err) { /* silent */ }
    };

    const markAll = async () => {
        try {
            await api.patch('/notifications/read-all');
            setItems(prev => prev.map(i => ({ ...i, isRead: true })));
            setUnreadCount(0);
        } catch (err) { /* silent */ }
    };

    const remove = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setItems(prev => prev.filter(i => i._id !== id));
        } catch (err) { /* silent */ }
    };

    const handleClick = async (n) => {
        if (!n.isRead) await markRead(n._id);
        if (n.link) router.push(n.link);
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-6 pb-20">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-9 h-9 bg-[#071739] rounded-xl flex items-center justify-center text-white shadow-md shadow-[#071739]/15">
                                <Bell size={18} />
                            </div>
                            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Notifications</h1>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount === 1 ? '' : 's'}` : "You're all caught up."}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Filter */}
                        <div className="flex bg-white border border-slate-200 rounded-xl p-1">
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'unread', label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` }
                            ].map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilter(f.id)}
                                    className={clsx(
                                        'px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-lg transition-all',
                                        filter === f.id ? 'bg-[#071739] text-white' : 'text-slate-500 hover:text-slate-900'
                                    )}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAll}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-[#071739] hover:text-[#071739] text-slate-600 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all"
                            >
                                <Check size={13} /> Mark all read
                            </button>
                        )}
                    </div>
                </header>

                {/* List */}
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
                    {loading ? (
                        <div className="p-16 text-center text-[10px] uppercase tracking-widest text-slate-400 font-semibold animate-pulse">
                            Loading…
                        </div>
                    ) : items.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mb-4">
                                <Bell size={28} />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">
                                {filter === 'unread' ? 'No unread notifications' : 'Nothing to show yet'}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium mt-1">
                                We'll alert you here when something needs your attention.
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-50">
                            {items.map(n => (
                                <li
                                    key={n._id}
                                    onClick={() => handleClick(n)}
                                    className={clsx(
                                        'px-6 py-4 hover:bg-slate-50 transition-all cursor-pointer flex items-start gap-4 group',
                                        !n.isRead && 'bg-[#071739]/[0.025]'
                                    )}
                                >
                                    <div className={clsx(
                                        'w-2.5 h-2.5 rounded-full mt-2 shrink-0',
                                        TYPE_DOT[n.type] || 'bg-slate-400'
                                    )} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className={clsx(
                                                'text-sm leading-snug',
                                                n.isRead ? 'text-slate-700 font-medium' : 'text-slate-900 font-semibold'
                                            )}>
                                                {n.title}
                                            </p>
                                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                                {formatRelative(n.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                                            {n.message}
                                        </p>
                                        <div className="flex items-center justify-between mt-2">
                                            {n.link ? (
                                                <span className="text-[10px] uppercase tracking-widest text-[#071739] font-semibold flex items-center gap-1">
                                                    Open <ArrowRight size={10} />
                                                </span>
                                            ) : <span />}
                                            <div className="flex items-center gap-3">
                                                {!n.isRead && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); markRead(n._id); }}
                                                        className="opacity-0 group-hover:opacity-100 text-[10px] uppercase tracking-widest text-slate-400 hover:text-emerald-600 font-semibold transition-all"
                                                    >
                                                        Mark read
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); remove(n._id); }}
                                                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all"
                                                    aria-label="Delete"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
