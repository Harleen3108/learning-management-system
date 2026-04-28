'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import api from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Mail, Calendar, BookOpen, Users, Star, DollarSign,
    CheckCircle2, XCircle, Clock, Shield, AlertTriangle,
    Activity, BarChart2, Flag, Trash2, Eye, Edit2,
    Play, Award, TrendingUp, Zap, ThumbsUp, ThumbsDown,
    UserCheck, UserX, RefreshCw, ChevronRight, Video,
    Ticket, CreditCard, History, UserPlus, Fingerprint, Lock
} from 'lucide-react';
import { clsx } from 'clsx';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : (n || 0).toString();
const money = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
const date = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const time = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';

const statusColors = {
    completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'in progress': 'bg-blue-50 text-blue-600 border-blue-100',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    refunded: 'bg-rose-50 text-rose-500 border-rose-100',
    pending: 'bg-amber-50 text-amber-600 border-amber-100',
};

// ─── Sub-Components ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'blue', delay = 0 }) {
    const palette = {
        blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    ring: 'ring-blue-100'    },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
        amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   ring: 'ring-amber-100'   },
        violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  ring: 'ring-violet-100'  },
        rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    ring: 'ring-rose-100'    },
    }[color];
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center gap-5"
        >
            <div className={`w-14 h-14 rounded-2xl ${palette.bg} ${palette.text} flex items-center justify-center shrink-0`}>
                <Icon size={26} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-2xl font-black text-slate-800 leading-none">{value}</p>
                {sub && <p className={`text-[10px] font-bold mt-1 ${palette.text}`}>{sub}</p>}
            </div>
        </motion.div>
    );
}

function SectionTitle({ icon: Icon, title, accent = 'text-blue-600' }) {
    return (
        <div className="flex items-center gap-3 mb-5">
            <div className={`${accent}`}><Icon size={18} /></div>
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">{title}</h2>
        </div>
    );
}

function Badge({ status, label }) {
    const s = (status || '').toLowerCase();
    return (
        <span className={clsx(
            "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border",
            statusColors[s] || 'bg-slate-50 text-slate-400 border-slate-100'
        )}>
            {label || status}
        </span>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function UserProfileDashboard() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/users/${id}/analytics`);
            setData(res.data.data);
        } catch (err) {
            console.error(err);
            showToast('Failed to load user analytics', 'error');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchProfile(); }, [fetchProfile]);

    const handleToggleStatus = async () => {
        setActionLoading(true);
        try {
            await api.put(`/admin/users/${id}`, { isActive: !data.profile.isActive });
            showToast(data.profile.isActive ? 'User blocked' : 'User unblocked');
            fetchProfile();
        } catch {
            showToast('Action failed', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Permanently deactivate this user? They will no longer be able to log in.')) return;
        setActionLoading(true);
        try {
            await api.delete(`/admin/users/${id}`);
            showToast('User deactivated');
            fetchProfile();
        } catch {
            showToast('Deactivation failed', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        const newPassword = prompt('Enter new password (or leave blank for default "Welcome123!")');
        if (newPassword === null) return;
        
        setActionLoading(true);
        try {
            await api.put(`/admin/users/${id}`, { password: newPassword || 'Welcome123!' });
            showToast('Password reset successful');
        } catch {
            showToast('Password reset failed', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const tabs = [
        { key: 'overview',    label: 'Overview',      icon: BarChart2 },
        { key: 'learning',    label: 'Learning',      icon: Play      },
        { key: 'performance', label: 'Performance',   icon: Award     },
        { key: 'payments',    label: 'Payments',      icon: DollarSign },
        { key: 'support',     label: 'Support',       icon: Ticket    },
        { key: 'activity',    label: 'Activity Logs', icon: History   },
        { key: 'linked',      label: 'Linked',        icon: Users     },
        { key: 'admin',       label: 'Admin Control', icon: Shield    },
    ];

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest animate-pulse">Analyzing User Data...</p>
                </div>
            </AdminLayout>
        );
    }

    if (!data) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <XCircle size={48} className="text-rose-300" />
                    <p className="text-slate-500 font-bold">User profile not found</p>
                    <button onClick={() => router.back()} className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">← Go Back</button>
                </div>
            </AdminLayout>
        );
    }

    const { profile, overview, enrollments, quizPerformance, payments, certificates, tickets, activityLogs, linkedAccounts } = data;

    return (
        <AdminLayout>
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '50%' }}
                        animate={{ opacity: 1, y: 20, x: '50%' }}
                        exit={{ opacity: 0, y: -20, x: '50%' }}
                        className={`fixed top-0 right-1/2 z-[999] px-6 py-3 rounded-2xl text-white text-sm font-bold shadow-2xl translate-x-1/2
                            ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    >
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-8 max-w-7xl mx-auto pb-20">
                {/* ── Header ─── */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard/admin/users')}
                        className="p-2.5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-700 hover:border-slate-200 transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User Management / Profile</p>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                            {profile.role === 'parent' ? 'Parent' : 'Student'} Dashboard
                        </h1>
                    </div>
                </div>

                {/* ── Hero Card ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8"
                >
                    <div className="flex flex-col md:flex-row md:items-center gap-8">
                        <div className="relative shrink-0">
                            <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-100">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile._id)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
                                    alt={profile.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white
                                ${profile.isActive ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-slate-300'}`}
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">{profile.name}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge status={profile.role} />
                                        <span className="text-xs font-bold text-slate-400">• Joined {date(profile.createdAt)}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleToggleStatus}
                                        disabled={actionLoading}
                                        className={clsx(
                                            "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                            profile.isActive 
                                                ? "bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600" 
                                                : "bg-emerald-500 text-white shadow-lg shadow-emerald-100"
                                        )}
                                    >
                                        {profile.isActive ? 'Suspend Access' : 'Restore Access'}
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-50 flex flex-wrap gap-8 text-sm text-slate-400 font-medium">
                                <span className="flex items-center gap-2 text-xs font-bold">
                                    <Mail size={14} className="text-blue-500" />{profile.email}
                                </span>
                                <span className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                                    <Clock size={14} /> Last active: {date(overview.lastActive)} at {time(overview.lastActive)}
                                </span>
                                {profile.studentCode && (
                                    <span className="flex items-center gap-2 text-xs font-bold text-violet-600">
                                        <Fingerprint size={14} /> S-ID: {profile.studentCode}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── KPI Cards ─── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={BookOpen}   label="Courses Enrolled" value={overview.totalEnrolled} sub={`${overview.totalCompleted} Completed`} color="blue" delay={0.1} />
                    <StatCard icon={TrendingUp} label="Learning Progress" value={overview.totalEnrolled > 0 ? `${Math.round((overview.totalCompleted/overview.totalEnrolled)*100)}%` : '0%'} sub="Avg Completion" color="emerald" delay={0.2} />
                    <StatCard icon={DollarSign} label="Total Spending"   value={money(overview.totalSpent)} sub="Successful Payments" color="violet" delay={0.3} />
                    <StatCard icon={Award}      label="Quiz Avg"        value={`${quizPerformance.stats.avgScore}%`} sub={`${quizPerformance.stats.passRate}% Pass Rate`} color="amber" delay={0.4} />
                </div>

                {/* ── Tabs ─── */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {tabs.map((t, i) => (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            className={clsx(
                                "flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border",
                                activeTab === t.key 
                                    ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100" 
                                    : "bg-white text-slate-500 border-slate-100 hover:border-blue-200"
                            )}
                        >
                            <t.icon size={14} /> {t.label}
                        </button>
                    ))}
                </div>

                {/* ── Tab Content ─── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {/* OVERVIEW PANEL */}
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                        <SectionTitle icon={BookOpen} title="Current Learning PATH" />
                                        <div className="space-y-4">
                                            {enrollments.slice(0, 3).map((e, i) => (
                                                <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 hover:border-blue-200 transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-white p-1 overflow-hidden">
                                                            <img src={e.course?.thumbnail || 'https://placehold.co/600x400/png'} className="w-full h-full object-cover rounded-lg" alt="" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-700">{e.course?.title}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">by {e.course?.instructor?.name}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge status={e.status} />
                                                        <p className="text-[10px] font-black text-slate-400 mt-2">{date(e.enrolledAt)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {enrollments.length === 0 && <p className="text-center py-10 text-slate-400 font-bold">No active enrollments</p>}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                        <SectionTitle icon={History} title="Recent Activity" />
                                        <div className="space-y-4">
                                            {activityLogs.slice(0, 5).map((log, i) => (
                                                <div key={i} className="flex gap-4 items-start relative pb-6 last:pb-0">
                                                    {i !== activityLogs.length - 1 && <div className="absolute left-4 top-10 bottom-0 w-[2px] bg-slate-50" />}
                                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 relative z-10">
                                                        <Activity size={14} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-700 uppercase tracking-widest">{log.action}</p>
                                                        <p className="text-sm text-slate-500 mt-1">{log.details}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-1">{date(log.timestamp)} at {time(log.timestamp)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                        <SectionTitle icon={Award} title="Certificates Earned" />
                                        <div className="space-y-3">
                                            {certificates.map((cert, i) => (
                                                <div key={i} className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                                    <Award size={20} className="text-emerald-500" />
                                                    <div>
                                                        <p className="text-[11px] font-black text-emerald-800">{cert.course?.title}</p>
                                                        <p className="text-[9px] font-bold text-emerald-600 mt-0.5">{date(cert.issueDate)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {certificates.length === 0 && <p className="text-center py-6 text-slate-300 text-xs font-bold">No certificates issued</p>}
                                        </div>
                                    </div>

                                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                        <SectionTitle icon={Ticket} title="Open Tickets" />
                                        <div className="space-y-3">
                                            {tickets.filter(t => t.status !== 'Resolved').map((t, i) => (
                                                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.category}</span>
                                                        <span className="text-[9px] font-black text-blue-600 uppercase">{t.status}</span>
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-700 line-clamp-1">{t.subject}</p>
                                                </div>
                                            ))}
                                            {tickets.filter(t => t.status !== 'Resolved').length === 0 && <p className="text-center py-6 text-slate-300 text-xs font-bold">No active tickets</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* LEARNING PANEL */}
                        {activeTab === 'learning' && (
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                                <div className="p-8 border-b border-slate-50">
                                    <SectionTitle icon={Play} title="Enrolled Courses" />
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50/80">
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructor</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrolled At</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {enrollments.map((e, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50 transition-all">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-3 font-bold text-slate-700 text-sm">
                                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100">
                                                                <img src={e.course?.thumbnail} className="w-full h-full object-cover" alt="" />
                                                            </div>
                                                            {e.course?.title}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-sm font-bold text-slate-500">{e.course?.instructor?.name}</td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-blue-500" style={{ width: e.status === 'completed' ? '100%' : '35%' }} />
                                                            </div>
                                                            <span className="text-[10px] font-black text-slate-400">{e.status === 'completed' ? '100%' : '35%'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-sm font-bold text-slate-500">{date(e.enrolledAt)}</td>
                                                    <td className="px-8 py-6"><Badge status={e.status} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* PERFORMANCE PANEL */}
                        {activeTab === 'performance' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <StatCard icon={Award} label="Total Quiz Attempts" value={quizPerformance.stats.totalAttempts} color="blue" />
                                    <StatCard icon={BarChart2} label="Average Score" value={`${quizPerformance.stats.avgScore}%`} color="amber" />
                                    <StatCard icon={CheckCircle2} label="Pass Rate" value={`${quizPerformance.stats.passRate}%`} color="emerald" />
                                </div>
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                    <SectionTitle icon={Award} title="Quiz Attempt History" />
                                    <div className="space-y-4">
                                        {quizPerformance.results.map((r, i) => (
                                            <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                                <div>
                                                    <p className="text-sm font-black text-slate-700">{r.quiz?.title}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{r.quiz?.module?.title}</p>
                                                </div>
                                                <div className="flex items-center gap-8">
                                                    <div className="text-center">
                                                        <p className={clsx("text-lg font-black", r.passed ? 'text-emerald-500' : 'text-rose-500')}>{r.score}%</p>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Score</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge status={r.passed ? 'success' : 'refunded'} label={r.passed ? 'PASSED' : 'FAILED'} />
                                                        <p className="text-[10px] font-bold text-slate-400 mt-2">{date(r.attemptedAt)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {quizPerformance.results.length === 0 && <p className="text-center py-20 text-slate-300 font-bold uppercase tracking-widest text-xs">No quiz data available</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PAYMENTS PANEL */}
                        {activeTab === 'payments' && (
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                                <div className="p-8 border-b border-slate-50">
                                    <SectionTitle icon={CreditCard} title="Transactional Ledger" />
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50/80">
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course / Item</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Txn ID</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {payments.map((p, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50 transition-all font-bold text-sm">
                                                    <td className="px-8 py-6 text-slate-700">{p.course}</td>
                                                    <td className="px-8 py-6 text-blue-500 font-mono text-[10px]">{p.transactionId}</td>
                                                    <td className="px-8 py-6 text-slate-700 uppercase tracking-tighter">{money(p.amount)}</td>
                                                    <td className="px-8 py-6"><Badge status={p.status} /></td>
                                                    <td className="px-8 py-6 text-slate-500">{date(p.date)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ACTIVITY LOGS PANEL */}
                        {activeTab === 'activity' && (
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                <SectionTitle icon={History} title="Global Audit Trail" />
                                <div className="space-y-0 relative">
                                    <div className="absolute left-6 top-0 bottom-0 w-1 bg-slate-50 rounded-full" />
                                    {activityLogs.map((log, i) => (
                                        <div key={i} className="group relative flex gap-8 pl-6 pb-10 last:pb-0">
                                            <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-white border-4 border-slate-100 group-hover:border-blue-500 group-hover:scale-125 transition-all z-10" />
                                            <div className="flex-1 bg-slate-50 p-6 rounded-3xl border border-slate-100 group-hover:bg-white group-hover:border-blue-100 group-hover:shadow-lg group-hover:shadow-blue-50 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="px-3 py-1 bg-white text-[10px] font-black text-blue-600 rounded-xl border border-blue-50 uppercase tracking-widest shadow-sm">
                                                        {log.action}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400">{date(log.timestamp)} at {time(log.timestamp)}</span>
                                                </div>
                                                <p className="text-sm font-bold text-slate-700">{log.details}</p>
                                                {log.ipAddress && <p className="text-[9px] font-mono text-slate-300 mt-2">IP: {log.ipAddress}</p>}
                                            </div>
                                        </div>
                                    ))}
                                    {activityLogs.length === 0 && <p className="text-center py-20 text-slate-300 text-sm font-black uppercase tracking-widest">No audit trails found</p>}
                                </div>
                            </div>
                        )}

                        {/* LINKED ACCOUNTS PANEL */}
                        {activeTab === 'linked' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                    <SectionTitle icon={Users} title="Associated Parents" />
                                    <div className="space-y-4">
                                        {linkedAccounts.parents.map((p, i) => (
                                            <div key={i} className="flex items-center justify-between p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm">
                                                        <Users size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-700">{p.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400">{p.email}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => router.push(`/dashboard/admin/users/${p._id}`)} className="p-2 text-blue-400 hover:text-blue-600 transition-all">
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        {linkedAccounts.parents.length === 0 && <p className="text-center py-20 text-slate-300 text-xs font-black uppercase tracking-widest">No parents linked</p>}
                                    </div>
                                </div>
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                    <SectionTitle icon={Users} title="Linked Students (Children)" />
                                    <div className="space-y-4">
                                        {linkedAccounts.students.map((s, i) => (
                                            <div key={i} className="flex items-center justify-between p-5 bg-violet-50/50 rounded-2xl border border-violet-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-violet-500 shadow-sm">
                                                        <Award size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-700">{s.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400">{s.email}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => router.push(`/dashboard/admin/users/${s._id}`)} className="p-2 text-violet-400 hover:text-violet-600 transition-all">
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        {linkedAccounts.students.length === 0 && <p className="text-center py-20 text-slate-300 text-xs font-black uppercase tracking-widest">No children linked</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ADMIN CONTROL PANEL */}
                        {activeTab === 'admin' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                                    <SectionTitle icon={Shield} title="Critical Security Actions" />
                                    <div className="space-y-6 mt-8">
                                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                                            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm mb-4">
                                                <Lock size={28} />
                                            </div>
                                            <h4 className="text-lg font-black text-slate-800">Forced Password Reset</h4>
                                            <p className="text-xs text-slate-400 font-bold max-w-[240px] mt-2 mb-6">Manually override user password for recovery or security breach protocol.</p>
                                            <button 
                                                onClick={handlePasswordReset}
                                                disabled={actionLoading}
                                                className="w-full py-4 bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
                                            >
                                                Execute Password Reset
                                            </button>
                                        </div>

                                        <div className="p-6 bg-rose-50/50 rounded-3xl border border-rose-100 flex flex-col items-center text-center">
                                            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-rose-500 shadow-sm mb-4">
                                                <Trash2 size={28} />
                                            </div>
                                            <h4 className="text-lg font-black text-rose-600">Account Deactivation</h4>
                                            <p className="text-xs text-slate-400 font-bold max-w-[240px] mt-2 mb-6">Soft delete user account. All data remains but access is permanently revoked.</p>
                                            <button 
                                                onClick={handleDelete}
                                                disabled={actionLoading}
                                                className="w-full py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-100"
                                            >
                                                Deactivate Account
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                                    <SectionTitle icon={Activity} title="System Configuration" />
                                    <div className="space-y-4 pt-4">
                                        {[
                                            { label: 'Platform Status', val: profile.isActive ? 'OPERATIONAL' : 'RESTRICTED', color: profile.isActive ? 'text-emerald-500' : 'text-rose-500' },
                                            { label: 'Role Authority', val: profile.role.toUpperCase(), color: 'text-violet-500' },
                                            { label: 'Internal ID', val: profile._id, color: 'text-slate-400' },
                                            { label: 'Linked Accounts', val: linkedAccounts.students.length + linkedAccounts.parents.length, color: 'text-blue-500' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between items-center p-5 bg-slate-50/50 rounded-2xl">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                                <span className={clsx("text-[11px] font-black tracking-widest", item.color)}>{item.val}</span>
                                            </div>
                                        ))}
                                        <div className="mt-10 p-8 bg-blue-600 rounded-[2.5rem] text-white overflow-hidden relative group">
                                            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700" />
                                            <h5 className="text-lg font-black relative z-10 leading-tight">Identity Verification</h5>
                                            <p className="text-[10px] font-bold text-white/70 mt-2 relative z-10 leading-relaxed">System-wide unique identifier and biometric trace status for platform security.</p>
                                            <div className="mt-6 flex items-center gap-2 relative z-10">
                                                <Badge status="success" label="VERIFIED" />
                                                <Badge status="pending" label="KYC PENDING" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </AdminLayout>
    );
}
