'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api from '@/services/api';
import { 
    Receipt, 
    RefreshCcw, 
    CheckCircle2, 
    XCircle, 
    ExternalLink,
    Search,
    Filter,
    Terminal,
    Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export default function PaymentLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/payments/logs');
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

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Razorpay Webhook Logs</h1>
                        <p className="text-slate-400 mt-1 font-medium tracking-tight">Real-time monitoring of payment events, captures, and transaction failures.</p>
                    </div>
                    <button 
                        onClick={fetchLogs}
                        className="flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-white transition-all"
                    >
                        <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                        Refresh Feed
                    </button>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-200/50 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex gap-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search by ID..." 
                                    className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:ring-4 focus:ring-[#071739]/10 outline-none transition-all w-64"
                                />
                            </div>
                            <button className="flex items-center gap-2 px-6 py-3 border border-slate-100 rounded-xl font-bold text-slate-500 text-sm hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]">
                                <Filter size={16} /> All Events
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Listening for events...</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status / Event</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction IDs</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Raw Data</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-20 text-slate-400 font-medium">Indexing events...</td></tr>
                                ) : logs.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-20 text-slate-400 font-medium italic">No payment signals detected yet.</td></tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    {log.status === 'success' ? (
                                                        <CheckCircle2 className="text-[#A68868] shadow-lg shadow-emerald-100" size={20} />
                                                    ) : log.status === 'failed' ? (
                                                        <XCircle className="text-rose-500 shadow-lg shadow-rose-100" size={20} />
                                                    ) : (
                                                        <Receipt className="text-[#071739]" size={20} />
                                                    )}
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-800 font-mono tracking-tighter uppercase leading-none mb-1">{log.event}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{log.status}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="space-y-1">
                                                    {log.razorpayPaymentId && (
                                                        <p className="text-[10px] text-[#071739] font-bold tracking-tighter uppercase">PAY_{log.razorpayPaymentId.slice(-8)}</p>
                                                    )}
                                                    {log.razorpayOrderId && (
                                                        <p className="text-[10px] text-slate-400 font-bold tracking-tighter uppercase">ORD_{log.razorpayOrderId.slice(-8)}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-[13px] font-bold text-slate-800">₹{log.amount || '-'}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-[11px] font-medium text-slate-500 leading-tight">
                                                    {new Date(log.createdAt).toLocaleDateString()}<br/>
                                                    <span className="text-slate-300">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                                </p>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button 
                                                    onClick={() => setSelectedLog(log)}
                                                    className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-800 transition-all"
                                                >
                                                    <Terminal size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Raw JSON Modal */}
            <AnimatePresence>
                {selectedLog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedLog(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-4xl bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10"
                        >
                            <div className="p-8 bg-white/5 border-b border-white/10 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Eye className="text-[#A68868]" size={24} />
                                    <h2 className="text-xl font-bold text-white tracking-tight uppercase tracking-widest text-sm">Payload Inspector</h2>
                                </div>
                                <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white transition-colors p-2">
                                    <XCircle size={24} />
                                </button>
                            </div>
                            <div className="p-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
                                <pre className="text-[#A68868] font-mono text-sm leading-relaxed overflow-x-auto p-6 bg-black/40 rounded-2xl border border-white/5">
                                    {JSON.stringify(selectedLog.payload, null, 2)}
                                </pre>
                            </div>
                            <div className="p-8 bg-white/5 border-t border-white/10 flex justify-end gap-4">
                                <button 
                                    onClick={() => setSelectedLog(null)}
                                    className="px-8 py-3 bg-white/10 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-white/20 transition-all"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}
