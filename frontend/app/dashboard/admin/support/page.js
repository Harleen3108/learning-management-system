'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api from '@/services/api';
import Link from 'next/link';
import { 
    LifeBuoy, 
    Search, 
    Filter, 
    RefreshCcw, 
    Clock, 
    AlertCircle, 
    CheckCircle2, 
    MoreVertical,
    MessageSquare,
    ChevronRight,
    ArrowUpRight,
    User,
    ShieldAlert,
    History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export default function SupportDesk() {
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: '', priority: '', category: '', search: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ticketsRes, statsRes] = await Promise.all([
                api.get('/support/tickets', { params: filters }),
                api.get('/support/stats')
            ]);
            setTickets(ticketsRes.data.data);
            setStats(statsRes.data.data);
        } catch (err) {
            console.error('Failed to fetch support data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters.status, filters.priority, filters.category]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Open': return 'text-rose-600 bg-rose-50 border-rose-100';
            case 'In Progress': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'Resolved': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            default: return 'text-slate-500 bg-slate-50 border-slate-100';
        }
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'Urgent': return 'text-rose-600 font-black ring-1 ring-rose-200';
            case 'High': return 'text-amber-600 font-bold';
            case 'Medium': return 'text-blue-600 font-bold';
            default: return 'text-slate-500 font-medium';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">Support Command</h1>
                        <p className="text-slate-400 font-medium italic">High-priority resolution center for all user transmissions.</p>
                    </div>
                    <button 
                        onClick={fetchData}
                        className="flex items-center gap-2 px-6 py-3 border border-slate-100 rounded-2xl font-bold text-slate-500 hover:bg-white transition-all shadow-sm"
                    >
                        <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                        Sync Tickets
                    </button>
                </div>

                {/* Support Stats Analytics */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Total Volume', value: stats.total, icon: LifeBuoy, color: 'blue' },
                            { label: 'Active Alerts', value: stats.open, icon: AlertCircle, color: 'rose' },
                            { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'emerald' },
                            { label: 'Urgent Queue', value: stats.urgent, icon: ShieldAlert, color: 'indigo' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:-translate-y-1">
                                <div className={clsx(
                                    "w-10 h-10 rounded-xl flex items-center justify-center mb-4 border",
                                    `text-${stat.color}-600 bg-${stat.color}-50 border-${stat.color}-100`
                                )}>
                                    <stat.icon size={20} />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                                <h4 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h4>
                            </div>
                        ))}
                    </div>
                )}

                {/* Ticket Ledger */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search Ticket ID or subject..." 
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <select 
                                className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none"
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            >
                                <option value="">All Statuses</option>
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                            </select>
                            <select 
                                className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none"
                                value={filters.priority}
                                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                            >
                                <option value="">All Priorities</option>
                                <option value="Urgent">Urgent</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">User Context</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Transmission Node</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Priority</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right font-mono">ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-black uppercase tracking-widest text-[10px] animate-pulse">Establishing uplink with support mainframe...</td></tr>
                                ) : tickets.length === 0 ? (
                                    <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold italic tracking-tight text-sm">Clear frequency. No support requests detected.</td></tr>
                                ) : (
                                    tickets.map((ticket) => (
                                        <tr key={ticket._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm overflow-hidden">
                                                        <img src={`https://ui-avatars.com/api/?name=${ticket.user?.name}&background=random`} alt="" />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-black text-slate-800 tracking-tight leading-none block mb-1">{ticket.user?.name}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{ticket.user?.role}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <Link href={`/dashboard/admin/support/${ticket._id}`}>
                                                    <div className="flex flex-col max-w-xs group-hover:translate-x-1 transition-all">
                                                        <span className="text-[13px] font-bold text-slate-800 tracking-tight leading-tight mb-1 group-hover:underline">{ticket.subject}</span>
                                                        <span className="text-[11px] font-bold text-blue-500 uppercase flex items-center gap-1 leading-none tracking-tight">
                                                            <MessageSquare size={10} /> {ticket.category}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={clsx("text-xs tracking-tight", getPriorityStyle(ticket.priority))}>
                                                    {ticket.priority}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={clsx(
                                                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border inline-block",
                                                    getStatusStyle(ticket.status)
                                                )}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className="text-[10px] font-mono text-slate-300 font-black">#{ticket._id.slice(-6)}</span>
                                                    <Link href={`/dashboard/admin/support/${ticket._id}`}>
                                                        <button className="text-blue-500 p-2 hover:bg-blue-50 rounded-lg transition-all" title="Enter Channel">
                                                            <ArrowUpRight size={18} />
                                                        </button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
