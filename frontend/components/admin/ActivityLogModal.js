'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Activity, Search, Shield, Info } from 'lucide-react';
import { clsx } from 'clsx';
import api from '@/services/api';

export default function ActivityLogModal({ isOpen, onClose, user }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && user) {
            const fetchLogs = async () => {
                setLoading(true);
                try {
                    const res = await api.get(`/admin/logs?userId=${user._id}`);
                    setLogs(res.data.data);
                } catch (err) {
                    console.error('Failed to fetch logs:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchLogs();
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white w-full max-w-2xl h-[80vh] rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200/50 flex flex-col"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                                <Activity size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">Activity History</h2>
                                <p className="text-slate-400 text-sm font-medium">Audit trail for {user?.name}</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
                                <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                                <p className="font-bold text-xs uppercase tracking-widest">Retrieving logs...</p>
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-4">
                                <Info size={48} className="text-slate-200" />
                                <p className="font-bold text-sm tracking-tight text-slate-400">No activity logs found for this user.</p>
                            </div>
                        ) : (
                            <div className="relative space-y-8 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                {logs.map((log, index) => (
                                    <div key={log._id} className="relative pl-14 group">
                                        <div className="absolute left-4 top-1 w-4 h-4 rounded-full bg-white border-4 border-blue-100 group-hover:border-blue-500 transition-colors z-10" />
                                        
                                        <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 group-hover:bg-white group-hover:shadow-lg group-hover:shadow-slate-200/50 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="px-2 py-0.5 bg-white text-blue-600 text-[10px] font-black uppercase tracking-wider rounded-md border border-slate-100 shadow-sm">
                                                    {log.action}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-slate-700 font-bold text-sm leading-relaxed">{log.details}</p>
                                            {log.newData && (
                                                <div className="mt-3 p-3 bg-white/50 rounded-xl border border-slate-100">
                                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Impacted Resource</p>
                                                   <p className="text-xs text-slate-500 font-medium">{log.resource} ID: {log.resourceId}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Showing {logs.length} Log Entries
                        </p>
                        <button
                            onClick={onClose}
                            className="py-3 px-8 bg-white border border-slate-200 text-slate-600 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-slate-50"
                        >
                            Close Viewer
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
