'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api from '@/services/api';
import { 
    CreditCard, 
    Download, 
    ArrowUpRight, 
    ArrowDownRight, 
    Search, 
    Filter,
    Calendar,
    RefreshCcw,
    CheckCircle2,
    XCircle,
    Receipt,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export default function TransactionsManagement() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, transRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/transactions')
            ]);
            setStats(statsRes.data.data);
            setTransactions(transRes.data.data);
        } catch (err) {
            console.error('Failed to fetch transaction data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefund = async (id) => {
        if (!confirm('Are you sure you want to process a refund for this transaction?')) return;
        try {
            await api.post(`/admin/transactions/${id}/refund`);
            fetchData(); // Refresh all data
            alert('Refund processed successfully');
        } catch (err) {
            alert('Failed to process refund: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">Payments & Ledger</h1>
                        <p className="text-slate-400 mt-1 font-medium tracking-tight leading-tight">Comprehensive overview of platform financial transactions and automated audits.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-2xl font-semibold text-slate-600 hover:bg-slate-50 transition-all text-xs uppercase tracking-widest">
                            <Download size={18} />
                            Export Data
                        </button>
                        <button className="flex items-center gap-2 bg-[#071739] hover:bg-[#020a1a] text-white px-6 py-3 rounded-2xl font-semibold shadow-xl shadow-slate-900/10 transition-all text-xs uppercase tracking-widest">
                            <CreditCard size={18} />
                            Manual Credit
                        </button>
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200/50 shadow-sm flex flex-col justify-between group hover:border-[#071739]/20 transition-all">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-4">Total Revenue</p>
                        <div className="flex items-end justify-between">
                            <h4 className="text-3xl font-semibold text-slate-800 tracking-tighter">₹{stats?.totalRevenue?.toLocaleString() || '0'}</h4>
                            <div className="flex items-center text-emerald-500 font-semibold text-[10px] mb-1">
                                <ArrowUpRight size={14} className="mr-1" /> +12.4%
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200/50 shadow-sm flex flex-col justify-between group hover:border-[#071739]/20 transition-all">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-4">Successful Enrolment</p>
                        <div className="flex items-end justify-between">
                            <h4 className="text-3xl font-semibold text-slate-800 tracking-tighter">{transactions.length}</h4>
                            <div className="flex items-center text-emerald-500 font-semibold text-[10px] mb-1">
                                <ArrowUpRight size={14} className="mr-1" /> ACTIVE
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200/50 shadow-sm flex flex-col justify-between group hover:border-[#071739]/20 transition-all">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-4">Payment Success Rate</p>
                        <div className="flex items-end justify-between">
                            <h4 className="text-3xl font-semibold text-slate-800 tracking-tighter">97.2%</h4>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full mb-2 overflow-hidden shadow-inner">
                                <div className="h-full bg-emerald-500 w-[97%]" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200/50 shadow-sm flex flex-col justify-between group hover:border-[#071739]/20 transition-all bg-gradient-to-br from-[#071739] to-[#0a1f4d] text-white border-none shadow-slate-900/10 shadow-xl scale-105">
                        <p className="text-[10px] text-white/60 font-semibold uppercase tracking-widest mb-4">Live Monitoring</p>
                        <div className="flex items-end justify-between">
                            <h4 className="text-3xl font-semibold tracking-tighter uppercase">Live</h4>
                            <div className="flex items-center text-white font-semibold text-[10px] mb-1 animate-pulse">
                                <RefreshCcw size={14} className="mr-1" /> SYNCED
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main transaction table */}
                    <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-200/50 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-slate-50/30">
                            <div className="flex gap-3">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input type="text" placeholder="Search ID or User..." className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-4 focus:ring-[#071739]/10 transition-all w-64" />
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-semibold uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">
                                    <Filter size={16} />
                                    Filter status
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Found <span className="text-slate-800">{transactions.length}</span> Records</p>
                        </div>

                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Ledger ID</th>
                                        <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Enrolled Student</th>
                                        <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Amount</th>
                                        <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Enrolment Date</th>
                                        <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Auth Status</th>
                                        <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-right">Audit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr><td colSpan="6" className="text-center py-20 text-slate-400 font-semibold uppercase text-[10px] tracking-widest">Reconstructing Ledger...</td></tr>
                                    ) : transactions.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center py-20 text-slate-400 font-medium italic">No transactions detected.</td></tr>
                                    ) : transactions.map((tx) => (
                                        <tr key={tx._id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div>
                                                    <p className="text-[11px] font-semibold text-[#071739] tracking-tighter uppercase mb-0.5">TXN_{tx._id.slice(-8)}</p>
                                                    <p className="text-[8px] font-semibold text-slate-300 uppercase tracking-widest">{tx.orderId?.slice(-12)}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-400 border border-white shadow-sm uppercase group-hover:bg-[#071739] group-hover:text-white transition-all">
                                                        {tx.student?.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-semibold text-slate-800 leading-none mb-1">{tx.student?.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[150px]">{tx.student?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <p className="text-[14px] font-semibold text-slate-900 leading-none">₹{tx.amount?.toLocaleString()}</p>
                                                    <span className="text-[8px] font-semibold text-slate-400 uppercase mt-1">NET_PAYABLE</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-[11px] text-slate-700 font-semibold leading-tight">
                                                    {new Date(tx.enrolledAt).toLocaleDateString()}<br/>
                                                    <span className="text-slate-300 font-normal uppercase text-[9px] tracking-widest">{new Date(tx.enrolledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={clsx(
                                                    "px-3 py-1.5 rounded-lg text-[9px] font-semibold uppercase tracking-widest border",
                                                    tx.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    tx.status === 'refunded' ? "bg-slate-100 text-slate-600 border-slate-200" :
                                                    "bg-rose-50 text-rose-600 border-rose-100"
                                                )}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {tx.status !== 'refunded' && tx.amount > 0 && (
                                                        <button 
                                                            onClick={() => handleRefund(tx._id)}
                                                            className="px-4 py-2 bg-white border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-[9px] font-semibold tracking-widest uppercase transition-all shadow-sm"
                                                        >
                                                            Refund
                                                        </button>
                                                    )}
                                                    <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-800 rounded-xl transition-all border border-slate-100">
                                                        <ExternalLink size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-center">
                            <button className="text-[10px] font-semibold text-[#071739] uppercase tracking-widest hover:underline">View Full Historical Audit</button>
                        </div>
                    </div>

                    {/* Razorpay Webhooks Sidebar Mini */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#A68868] opacity-20 blur-3xl -mr-16 -mt-16 group-hover:opacity-40 transition-opacity" />
                            <h3 className="text-xl font-semibold mb-6 tracking-tight relative flex items-center gap-2">
                                Live Ledger
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                            </h3>
                            <div className="space-y-6 relative">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-[#A68868]">
                                        <Receipt size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/50 font-semibold uppercase tracking-widest">Gateway Link</p>
                                        <p className="font-semibold text-sm">Razorpay Standard</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-emerald-400">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/50 font-semibold uppercase tracking-widest">Webhook Status</p>
                                        <p className="font-semibold text-sm">Listening (200 OK)</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-white/10">
                                    <button 
                                        onClick={() => window.location.href='/dashboard/admin/payments/logs'}
                                        className="w-full py-3 bg-white text-slate-900 rounded-2xl font-semibold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        Explore Logs <ArrowUpRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                                    <AlertCircle size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Critical Alert</p>
                                    <h4 className="font-semibold text-slate-800 text-sm italic">Failed Payments</h4>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">There were <span className="text-rose-500 font-semibold">04 payment failures</span> detected in the last 24 hours. Consider review logs.</p>
                            <button className="w-full py-3 bg-rose-50 text-rose-600 rounded-2xl font-semibold text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all">Review Failures</button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
