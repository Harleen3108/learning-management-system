'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api from '@/services/api';
import { 
    History, 
    Search, 
    Filter, 
    RefreshCcw, 
    User, 
    Clock, 
    Activity, 
    Database, 
    Shield, 
    ChevronRight,
    ArrowUpRight,
    Info,
    Calendar,
    Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/logs');
            setLogs(res.data.data);
        } catch (err) {
            console.error('Failed to fetch logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => 
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getActionColor = (action) => {
        if (action.includes('DELETE') || action.includes('REVOKE')) return 'text-rose-600 bg-rose-50 border-rose-100';
        if (action.includes('CREATE') || action.includes('ENROLL')) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (action.includes('UPDATE')) return 'text-blue-600 bg-blue-50 border-blue-100';
        return 'text-slate-600 bg-slate-50 border-slate-100';
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">System Activity Logs</h1>
                        <p className="text-slate-400 mt-1 font-medium italic">Immutable record of all administrative and system events for compliance and security.</p>
                    </div>
                    <button 
                        onClick={fetchLogs}
                        className="flex items-center gap-2 px-6 py-3 border border-slate-100 rounded-2xl font-bold text-slate-500 hover:bg-white transition-all shadow-sm"
                    >
                        <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                        Refresh Feed
                    </button>
                </div>

                {/* Log Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-3">Today's Events</p>
                        <div className="flex items-end justify-between">
                            <h4 className="text-2xl font-bold text-slate-800 tracking-tight">
                                {logs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length}
                            </h4>
                            <Activity size={20} className="text-[#071739]" />
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-3">Security Actions</p>
                        <div className="flex items-end justify-between">
                            <h4 className="text-2xl font-bold text-slate-800 tracking-tight">
                                {logs.filter(l => l.action.includes('UPDATE') || l.action.includes('REVOKE')).length}
                            </h4>
                            <Shield size={20} className="text-[#A68868]" />
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm md:col-span-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-3">Latest Transmission</p>
                        <div className="flex items-center gap-3">
                            <Terminal size={18} className="text-slate-400" />
                            <span className="text-xs font-mono text-slate-600 truncate">{logs[0]?.details || 'Standby...'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search by activity, user, or details..." 
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-[#071739]/10 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="divide-y divide-slate-50">
                        {loading ? (
                            <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Syncing with system core...</div>
                        ) : filteredLogs.length === 0 ? (
                            <div className="p-20 text-center text-slate-400 font-bold italic tracking-tight">No activity matches your current filters.</div>
                        ) : (
                            filteredLogs.map((log) => (
                                <div key={log._id} className="p-6 hover:bg-slate-50/50 transition-all group flex items-start gap-6">
                                    <div className="mt-1">
                                        <div className={clsx(
                                            "w-10 h-10 rounded-xl flex items-center justify-center border transition-all shadow-sm",
                                            getActionColor(log.action)
                                        )}>
                                            <Activity size={18} />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={clsx(
                                                "text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border",
                                                getActionColor(log.action)
                                            )}>
                                                {log.action}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                                <Calendar size={12} /> {new Date(log.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                                <Clock size={12} /> {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800 tracking-tight mb-2">{log.details}</p>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden">
                                                    <img src={`https://ui-avatars.com/api/?name=${log.user?.name}&background=random`} alt="" />
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-500 tracking-tight">{log.user?.name} </span>
                                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 text-[9px] font-bold rounded uppercase">{log.user?.role}</span>
                                            </div>
                                            {log.resource && (
                                                <div className="flex items-center gap-1 text-[11px] font-bold text-[#A68868] uppercase tracking-tighter">
                                                    <Database size={10} /> {log.resource}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-all flex flex-col items-end gap-1">
                                        <span className="text-[9px] font-mono text-slate-300">ID: {log._id.slice(-6)}</span>
                                        <button className="text-[#071739] p-2 hover:bg-[#071739]/5 rounded-lg transition-all" title="View Stack Trace">
                                            <ArrowUpRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
