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
    UserCheck, UserX, RefreshCw, ChevronRight, Video, Phone
} from 'lucide-react';
import CoursePreviewModal from '@/components/admin/CoursePreviewModal';
import RejectFeedbackModal from '@/components/admin/RejectFeedbackModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : (n || 0).toString();
const money = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
const date = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const statusColors = {
    published: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    pending:   'bg-amber-50 text-amber-600 border-amber-100',
    draft:     'bg-slate-50 text-slate-400 border-slate-100',
    rejected:  'bg-rose-50 text-rose-500 border-rose-100',
};

// ─── Sub-Components ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'blue', delay = 0 }) {
    const palette = {
        blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   ring: 'ring-blue-100'   },
        emerald:{ bg: 'bg-emerald-50', text: 'text-emerald-600',ring: 'ring-emerald-100'},
        amber:  { bg: 'bg-amber-50',  text: 'text-amber-600',  ring: 'ring-amber-100'  },
        violet: { bg: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-100' },
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

function Badge({ status }) {
    return (
        <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${statusColors[status] || statusColors.draft}`}>
            {status}
        </span>
    );
}

function Stars({ rating }) {
    return (
        <span className="flex items-center gap-1 text-amber-400 font-black text-xs">
            <Star size={12} fill="currentColor" /> {rating ? rating.toFixed(1) : '—'}
        </span>
    );
}

// ─── Revenue Bar Chart (pure CSS) ─────────────────────────────────────────────
function RevenueChart({ trend }) {
    if (!trend || trend.length === 0) {
        return (
            <div className="h-40 flex items-center justify-center text-slate-300 text-xs font-bold">
                No revenue data yet
            </div>
        );
    }
    const max = Math.max(...trend.map(t => t.revenue), 1);
    return (
        <div className="flex items-end gap-2 h-40 pt-4">
            {trend.map((t, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                        className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10 pointer-events-none"
                    >
                        {money(t.revenue)}
                    </div>
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(t.revenue / max) * 100}%` }}
                        transition={{ delay: i * 0.04 }}
                        className="w-full bg-blue-100 group-hover:bg-blue-500 rounded-xl transition-colors duration-300 min-h-[4px]"
                    />
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-wider">{t.month.split(' ')[0]}</p>
                </div>
            ))}
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function InstructorProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [toast, setToast] = useState(null);
    const [previewCourse, setPreviewCourse] = useState(null);
    const [rejectCourse, setRejectCourse] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/instructors/${id}`);
            setData(res.data.data);
        } catch (err) {
            console.error(err);
            showToast('Failed to load instructor profile', 'error');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchProfile(); }, [fetchProfile]);

    const handleStatus = async (status) => {
        setActionLoading(true);
        try {
            await api.put(`/admin/instructors/${id}/status`, { status });
            showToast(`Instructor ${status} successfully`);
            fetchProfile();
        } catch {
            showToast('Action failed', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleBlock = async () => {
        if (!confirm('Block this instructor? They will no longer be able to access the platform.')) return;
        setActionLoading(true);
        try {
            await api.put(`/admin/users/${id}`, { isActive: !data.profile.isActive });
            showToast(data.profile.isActive ? 'Instructor blocked' : 'Instructor unblocked');
            fetchProfile();
        } catch {
            showToast('Action failed', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Permanently delete this instructor? This action cannot be undone.')) return;
        setActionLoading(true);
        try {
            await api.delete(`/admin/users/${id}`);
            showToast('Instructor deleted');
            router.push('/dashboard/admin/instructors');
        } catch {
            showToast('Delete failed', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCourseAction = async (courseId, action) => {
        try {
            if (action === 'approve') await api.put(`/courses/${courseId}/status`, { status: 'published' });
            if (action === 'reject') await api.put(`/courses/${courseId}/status`, { status: 'rejected' });
            showToast(`Course ${action}d`);
            fetchProfile();
        } catch {
            showToast(`Failed to ${action} course`, 'error');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!confirm('Delete this review?')) return;
        try {
            await api.delete(`/reviews/${reviewId}`);
            showToast('Review deleted');
            fetchProfile();
        } catch {
            showToast('Failed to delete review', 'error');
        }
    };

    const tabs = [
        { key: 'overview',    label: 'Overview',      icon: BarChart2  },
        { key: 'courses',     label: 'Courses',       icon: BookOpen   },
        { key: 'engagement',  label: 'Engagement',    icon: Users      },
        { key: 'revenue',     label: 'Revenue',       icon: DollarSign },
        { key: 'reviews',     label: 'Reviews',       icon: Star       },
        { key: 'live',        label: 'Live Classes',  icon: Video      },
        { key: 'quizzes',     label: 'Quizzes',       icon: Award      },
        { key: 'logs',        label: 'Activity',      icon: Activity   },
        { key: 'flags',       label: 'Flags',         icon: Flag       },
    ];

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest animate-pulse">Loading Instructor Profile...</p>
                </div>
            </AdminLayout>
        );
    }

    if (!data) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <XCircle size={48} className="text-rose-300" />
                    <p className="text-slate-500 font-bold">Instructor not found</p>
                    <button onClick={() => router.back()} className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">← Go Back</button>
                </div>
            </AdminLayout>
        );
    }

    const { profile, overview, courses, studentEngagement, revenue, reviews, liveClasses, quizStats, activityLogs, flaggedContent } = data;

    return (
        <AdminLayout>
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-20 right-6 z-[999] px-6 py-3 rounded-2xl text-white text-sm font-bold shadow-2xl
                            ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    >
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-8 max-w-7xl mx-auto">
                {/* ── Back button ─── */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard/admin/instructors')}
                        className="p-2.5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-700 hover:border-slate-200 transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructor Management</p>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                            {profile.name}'s Dashboard
                        </h1>
                    </div>
                </div>

                {/* ── Profile Hero — clean white card, NO banner ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7"
                >
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-md bg-slate-50">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile._id || profile.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
                                    alt={profile.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* Online dot */}
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white
                                ${profile.isActive ? 'bg-emerald-400' : 'bg-slate-300'}`}
                            />
                        </div>

                        {/* Name + specialty + badges */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-black text-slate-800 tracking-tight leading-tight">{profile.name}</h2>
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-0.5">
                                        {profile.instructorSpecialty || 'Senior Educator'}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border
                                        ${profile.instructorStatus === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                          profile.instructorStatus === 'pending'  ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                          'bg-rose-50 text-rose-500 border-rose-100'}`}>
                                        <Shield size={10} /> {profile.instructorStatus}
                                    </span>
                                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border
                                        ${profile.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${profile.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'}`} />
                                        {profile.isActive ? 'Active' : 'Blocked'}
                                    </span>
                                </div>
                            </div>

                            {/* Meta info */}
                            <div className="mt-4 pt-4 border-t border-slate-50 flex flex-wrap gap-5 text-sm text-slate-400 font-medium">
                                <span className="flex items-center gap-2 text-xs">
                                    <Mail size={13} className="text-slate-300" />{profile.email}
                                </span>
                                {profile.phone && (
                                    <span className="flex items-center gap-2 text-xs">
                                        <Phone size={13} className="text-slate-300" />{profile.phone}
                                    </span>
                                )}
                                <span className="flex items-center gap-2 text-xs">
                                    <Calendar size={13} className="text-slate-300" />Joined {date(profile.createdAt)}
                                </span>
                                {profile.instructorBio && (
                                    <p className="w-full text-slate-400 text-xs italic leading-relaxed mt-1">{profile.instructorBio}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── KPI Overview Cards ─── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={BookOpen}  label="Total Courses"  value={overview.totalCourses}              color="blue"    delay={0.05} />
                    <StatCard icon={Users}     label="Total Students" value={fmt(overview.totalStudents)}        color="emerald" delay={0.10} />
                    <StatCard icon={DollarSign}label="Total Revenue"  value={money(overview.totalRevenue)}       color="violet"  delay={0.15} />
                    <StatCard icon={Star}      label="Avg Rating"     value={`${overview.avgRating || '—'} ★`}  color="amber"   delay={0.20} />
                </div>

                {/* ── Admin Action Bar ─── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex flex-wrap items-center gap-3"
                >
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-2">
                        <Shield size={14} /> Admin Actions
                    </p>

                    {profile.instructorStatus !== 'approved' && (
                        <button
                            disabled={actionLoading}
                            onClick={() => handleStatus('approved')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
                        >
                            <UserCheck size={14} /> Approve
                        </button>
                    )}
                    {profile.instructorStatus !== 'rejected' && (
                        <button
                            disabled={actionLoading}
                            onClick={() => handleStatus('rejected')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-100 transition-all disabled:opacity-50"
                        >
                            <XCircle size={14} /> Reject
                        </button>
                    )}
                    <button
                        disabled={actionLoading}
                        onClick={handleBlock}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border disabled:opacity-50
                            ${profile.isActive ? 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100' : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'}`}
                    >
                        {profile.isActive ? <><UserX size={14} /> Block</> : <><UserCheck size={14} /> Unblock</>}
                    </button>
                    <button
                        disabled={actionLoading}
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-500 border border-rose-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-100 transition-all ml-auto disabled:opacity-50"
                    >
                        <Trash2 size={14} /> Delete Account
                    </button>
                    <button
                        onClick={fetchProfile}
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    >
                        <RefreshCw size={16} />
                    </button>
                </motion.div>

                {/* ── Tab Navigation ─── */}
                <div className="flex gap-2 flex-wrap">
                    {tabs.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border
                                ${activeTab === t.key
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                                    : 'bg-white text-slate-500 border-slate-100 hover:border-blue-200 hover:text-blue-600'
                                }`}
                        >
                            <t.icon size={13} /> {t.label}
                            {t.key === 'flags' && flaggedContent?.length > 0 && (
                                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center">
                                    {flaggedContent.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Tab Panels ─── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                    >

                        {/* ── OVERVIEW ─── */}
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Student Engagement mini */}
                                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 space-y-5">
                                    <SectionTitle icon={Users} title="Student Engagement" />
                                    {[
                                        { label: 'Total Enrolled', val: studentEngagement.totalStudents, color: 'bg-blue-500', pct: 100 },
                                        { label: 'Active Students', val: studentEngagement.activeStudents, color: 'bg-emerald-500', pct: studentEngagement.totalStudents ? Math.round((studentEngagement.activeStudents/studentEngagement.totalStudents)*100) : 0 },
                                        { label: 'Completion Rate', val: `${studentEngagement.completionRate}%`, color: 'bg-violet-500', pct: studentEngagement.completionRate },
                                    ].map(m => (
                                        <div key={m.label}>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
                                                <span className="text-xs font-black text-slate-700">{m.val}</span>
                                            </div>
                                            <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${m.pct}%` }}
                                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                                    className={`h-full ${m.color} rounded-full`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Revenue trend preview */}
                                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
                                    <SectionTitle icon={TrendingUp} title="Revenue Trend (12M)" />
                                    <RevenueChart trend={revenue.trend} />
                                </div>

                                {/* Quiz snapshot */}
                                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 space-y-4">
                                    <SectionTitle icon={Award} title="Quiz Performance" />
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Quizzes',   val: quizStats.totalQuizzes,  color: 'text-blue-600' },
                                            { label: 'Attempts',  val: quizStats.totalAttempts,  color: 'text-violet-600' },
                                            { label: 'Avg Score', val: `${quizStats.avgScore}%`, color: 'text-amber-500' },
                                            { label: 'Pass Rate', val: `${quizStats.passRate}%`, color: 'text-emerald-500' },
                                        ].map(q => (
                                            <div key={q.label} className="bg-slate-50 rounded-2xl p-4 text-center">
                                                <p className={`text-xl font-black ${q.color}`}>{q.val}</p>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{q.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent courses mini */}
                                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
                                    <SectionTitle icon={BookOpen} title="Recent Courses" />
                                    <div className="space-y-3">
                                        {courses.slice(0, 4).map(c => (
                                            <div key={c._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                                <div className="flex-1 min-w-0 mr-3">
                                                    <p className="text-sm font-black text-slate-700 truncate">{c.title}</p>
                                                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{c.enrollmentCount} students • {money(c.revenue)}</p>
                                                </div>
                                                <Badge status={c.status} />
                                            </div>
                                        ))}
                                        {courses.length === 0 && <p className="text-slate-400 text-xs text-center py-4">No courses yet</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── COURSES ─── */}
                        {activeTab === 'courses' && (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="p-7 border-b border-slate-50">
                                    <SectionTitle icon={BookOpen} title={`All Courses (${courses.length})`} />
                                </div>
                                {courses.length === 0 ? (
                                    <div className="py-16 text-center text-slate-300 text-sm font-bold">No courses found</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-slate-50/80">
                                                    {['Course Title','Category','Status','Students','Rating','Revenue','Actions'].map(h => (
                                                        <th key={h} className="px-5 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {courses.map((c, i) => (
                                                    <motion.tr
                                                        key={c._id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.04 }}
                                                        className="hover:bg-slate-50/50 transition-colors"
                                                    >
                                                        <td className="px-5 py-4">
                                                            <p className="text-sm font-black text-slate-700 max-w-[200px] truncate">{c.title}</p>
                                                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5 capitalize">{c.difficulty}</p>
                                                        </td>
                                                        <td className="px-5 py-4 text-xs font-semibold text-slate-500">{c.category}</td>
                                                        <td className="px-5 py-4"><Badge status={c.status} /></td>
                                                        <td className="px-5 py-4">
                                                            <span className="flex items-center gap-1 text-sm font-black text-slate-700">
                                                                <Users size={12} className="text-slate-300" /> {c.enrollmentCount}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-4"><Stars rating={c.avgRating} /></td>
                                                        <td className="px-5 py-4 text-sm font-black text-slate-700">{money(c.revenue)}</td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-2">
                                                                {c.status === 'pending' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleCourseAction(c._id, 'approve')}
                                                                            className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all"
                                                                            title="Approve"
                                                                        >
                                                                            <CheckCircle2 size={15} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleCourseAction(c._id, 'reject')}
                                                                            className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all"
                                                                            title="Reject"
                                                                        >
                                                                            <XCircle size={15} />
                                                                        </button>
                                                                    </>
                                                                )}
                                                                <button
                                                                    onClick={() => window.open(`/dashboard/courses/${c._id}`, '_blank')}
                                                                    className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                                                                    title="Open Course"
                                                                >
                                                                    <Eye size={15} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── ENGAGEMENT ─── */}
                        {activeTab === 'engagement' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { label: 'Total Enrolled',  val: studentEngagement.totalStudents, icon: Users,      color: 'blue',   desc: 'All students across courses' },
                                    { label: 'Active Students', val: studentEngagement.activeStudents, icon: Zap,        color: 'emerald',desc: 'Students with progress activity' },
                                    { label: 'Completion Rate', val: `${studentEngagement.completionRate}%`, icon: Award, color: 'violet',desc: 'Courses marked completed' },
                                ].map(m => (
                                    <StatCard key={m.label} icon={m.icon} label={m.label} value={m.val} sub={m.desc} color={m.color} />
                                ))}
                                <div className="md:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
                                    <SectionTitle icon={BarChart2} title="Enrollment per Course" />
                                    <div className="space-y-4 mt-2">
                                        {revenue.perCourse.map((c, i) => {
                                            const maxE = Math.max(...revenue.perCourse.map(x => x.enrollments), 1);
                                            return (
                                                <div key={i}>
                                                    <div className="flex justify-between mb-1.5">
                                                        <span className="text-xs font-black text-slate-600 truncate max-w-[60%]">{c.title}</span>
                                                        <span className="text-xs font-black text-blue-600">{c.enrollments} students</span>
                                                    </div>
                                                    <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(c.enrollments / maxE) * 100}%` }}
                                                            transition={{ duration: 0.8, delay: i * 0.05 }}
                                                            className="h-full bg-blue-400 rounded-full"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {revenue.perCourse.length === 0 && <p className="text-slate-300 text-xs text-center py-6">No enrollment data</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── REVENUE ─── */}
                        {activeTab === 'revenue' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Earnings</p>
                                            <h2 className="text-4xl font-black text-slate-800">{money(revenue.total)}</h2>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                            <TrendingUp size={12} /> All Time
                                        </div>
                                    </div>
                                    <SectionTitle icon={BarChart2} title="Monthly Revenue Trend" />
                                    <RevenueChart trend={revenue.trend} />
                                </div>

                                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
                                    <SectionTitle icon={DollarSign} title="Revenue per Course" />
                                    <div className="space-y-4">
                                        {revenue.perCourse.map((c, i) => {
                                            const maxR = Math.max(...revenue.perCourse.map(x => x.revenue), 1);
                                            return (
                                                <div key={i}>
                                                    <div className="flex justify-between mb-1.5">
                                                        <span className="text-xs font-black text-slate-600 truncate max-w-[55%]">{c.title}</span>
                                                        <span className="text-xs font-black text-violet-600">{money(c.revenue)}</span>
                                                    </div>
                                                    <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(c.revenue / maxR) * 100}%` }}
                                                            transition={{ duration: 0.8, delay: i * 0.05 }}
                                                            className="h-full bg-violet-400 rounded-full"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {revenue.perCourse.length === 0 && <p className="text-slate-300 text-xs text-center py-6">No revenue data</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── REVIEWS ─── */}
                        {activeTab === 'reviews' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-6 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                                    <div className="text-center">
                                        <p className="text-5xl font-black text-slate-800">{overview.avgRating || '—'}</p>
                                        <div className="flex justify-center gap-1 mt-2">
                                            {[1,2,3,4,5].map(s => (
                                                <Star key={s} size={16} className={s <= Math.round(overview.avgRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                                            ))}
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{reviews.length} Reviews</p>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        {[5,4,3,2,1].map(s => {
                                            const cnt = reviews.filter(r => Math.round(r.rating) === s).length;
                                            return (
                                                <div key={s} className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-slate-400 w-2">{s}</span>
                                                    <Star size={10} className="text-amber-400 fill-amber-400" />
                                                    <div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                                        <div className="h-full bg-amber-400 rounded-full" style={{ width: reviews.length ? `${(cnt/reviews.length)*100}%` : '0%' }} />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400 w-5 text-right">{cnt}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {reviews.length === 0 ? (
                                    <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-300 text-sm font-bold">No reviews yet</div>
                                ) : (
                                    reviews.map((r, i) => (
                                        <motion.div
                                            key={r._id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            className={`bg-white rounded-3xl border shadow-sm p-6 ${r.status === 'flagged' ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100'}`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-black text-slate-600">
                                                        {r.student?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-700">{r.student?.name || 'Unknown'}</p>
                                                        <p className="text-[9px] text-slate-400 font-semibold">{r.course?.title}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Stars rating={r.rating} />
                                                    {r.status === 'flagged' && (
                                                        <span className="px-2 py-1 bg-rose-100 text-rose-500 text-[9px] font-black rounded-lg uppercase tracking-widest">Flagged</span>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteReview(r._id)}
                                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                        title="Delete review"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>
                                            <p className="text-[9px] text-slate-300 font-bold mt-3">{date(r.createdAt)}</p>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* ── LIVE CLASSES ─── */}
                        {activeTab === 'live' && (
                            <div className="space-y-4">
                                {liveClasses.length === 0 ? (
                                    <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center text-slate-300 text-sm font-bold">
                                        No live classes scheduled
                                    </div>
                                ) : (
                                    liveClasses.map((lc, i) => (
                                        <motion.div
                                            key={lc._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center gap-5"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                <Video size={22} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-slate-700 truncate">{lc.title}</p>
                                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{lc.course?.title}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-xs font-black text-slate-600">{date(lc.scheduledAt)}</p>
                                                <p className="text-[9px] text-slate-400 font-bold mt-0.5">{lc.duration} min</p>
                                            </div>
                                            <a
                                                href={lc.meetingUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"
                                            >
                                                <Play size={15} />
                                            </a>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* ── QUIZZES ─── */}
                        {activeTab === 'quizzes' && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                {[
                                    { label: 'Total Quizzes',  val: quizStats.totalQuizzes,  icon: BookOpen, color: 'blue'   },
                                    { label: 'Total Attempts', val: quizStats.totalAttempts,  icon: Users,    color: 'violet' },
                                    { label: 'Average Score',  val: `${quizStats.avgScore}%`, icon: BarChart2,color: 'amber'  },
                                    { label: 'Pass Rate',      val: `${quizStats.passRate}%`, icon: Award,    color: 'emerald'},
                                ].map(q => (
                                    <StatCard key={q.label} icon={q.icon} label={q.label} value={q.val} color={q.color} />
                                ))}
                                <div className="col-span-2 md:col-span-4 bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
                                    <SectionTitle icon={Award} title="Quiz Performance Summary" />
                                    <div className="space-y-5">
                                        {[
                                            { label: 'Pass Rate',    pct: quizStats.passRate,   color: 'bg-emerald-400' },
                                            { label: 'Average Score',pct: quizStats.avgScore,   color: 'bg-amber-400'   },
                                        ].map(m => (
                                            <div key={m.label}>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{m.label}</span>
                                                    <span className="text-xs font-black text-slate-700">{m.pct}%</span>
                                                </div>
                                                <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${m.pct}%` }}
                                                        transition={{ duration: 1 }}
                                                        className={`h-full ${m.color} rounded-full`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── ACTIVITY LOGS ─── */}
                        {activeTab === 'logs' && (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="p-7 border-b border-slate-50">
                                    <SectionTitle icon={Activity} title={`Activity Log (${activityLogs.length})`} />
                                </div>
                                {activityLogs.length === 0 ? (
                                    <div className="py-16 text-center text-slate-300 text-sm font-bold">No activity recorded</div>
                                ) : (
                                    <div className="divide-y divide-slate-50">
                                        {activityLogs.map((log, i) => (
                                            <motion.div
                                                key={log._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: i * 0.03 }}
                                                className="flex items-start gap-4 px-7 py-4 hover:bg-slate-50/50 transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Activity size={14} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-black text-slate-700">{log.action?.replace(/_/g, ' ')}</p>
                                                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">{log.details || log.resource}</p>
                                                    {log.user?.name && (
                                                        <p className="text-[9px] text-slate-300 font-bold mt-0.5">by {log.user.name} ({log.user.role})</p>
                                                    )}
                                                </div>
                                                <p className="text-[9px] font-bold text-slate-300 shrink-0 ml-2 mt-1">{date(log.timestamp)}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── CONTENT FLAGS ─── */}
                        {activeTab === 'flags' && (
                            <div className="space-y-4">
                                {flaggedContent.length === 0 ? (
                                    <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center">
                                        <CheckCircle2 size={40} className="text-emerald-300 mx-auto mb-3" />
                                        <p className="text-slate-400 font-bold text-sm">No flagged content</p>
                                        <p className="text-slate-300 text-xs mt-1">This instructor has a clean record</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-3xl">
                                            <AlertTriangle size={18} className="text-rose-500" />
                                            <p className="text-sm font-black text-rose-600">{flaggedContent.length} flagged item{flaggedContent.length > 1 ? 's' : ''} require review</p>
                                        </div>
                                        {flaggedContent.map((r, i) => (
                                            <motion.div
                                                key={r._id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="bg-white border border-rose-100 rounded-3xl shadow-sm p-6"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <Flag size={16} className="text-rose-500" />
                                                        <div>
                                                            <p className="text-sm font-black text-slate-700">{r.student?.name || 'Unknown Student'}</p>
                                                            <p className="text-[10px] text-slate-400 font-semibold">{r.course?.title}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Stars rating={r.rating} />
                                                        <button
                                                            onClick={() => handleDeleteReview(r._id)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all"
                                                        >
                                                            <Trash2 size={11} /> Remove
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>
                                                <div className="mt-3 flex items-center gap-3">
                                                    <span className="text-[9px] font-black text-rose-500 bg-rose-50 border border-rose-100 px-2 py-1 rounded-lg uppercase">{r.sentimentLabel}</span>
                                                    <span className="text-[9px] text-slate-300 font-bold">{date(r.createdAt)}</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>

            <CoursePreviewModal 
                isOpen={!!previewCourse} 
                course={previewCourse} 
                onClose={() => setPreviewCourse(null)} 
                onApprove={(id) => handleCourseAction(id, 'approve')}
                onReject={(course) => setRejectCourse(course)}
            />
            
            <RejectFeedbackModal 
                isOpen={!!rejectCourse} 
                courseName={rejectCourse?.title}
                onClose={() => setRejectCourse(null)}
                onSubmit={async (feedback, category) => {
                    const fullFeedback = `[${category.toUpperCase()}] ${feedback}`;
                    await api.patch(`/courses/${rejectCourse._id}/status`, { status: 'rejected', feedback: fullFeedback });
                    showToast('Course rejected');
                    setRejectCourse(null);
                    fetchProfile();
                }}
            />
        </AdminLayout>
    );
}
