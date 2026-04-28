'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import api from '@/services/api';
import {
    Star, CheckCircle2, XCircle, ShieldCheck, BookOpen,
    Users, ChevronDown, UserPlus, ExternalLink, Search,
    MoreVertical, Edit2, Trash2, Clock, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => {
    if (!n) return '0';
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
};

const avatarUrl = (ins) => {
    if (ins?.profilePhoto && ins.profilePhoto !== 'no-photo.jpg') {
        return ins.profilePhoto.startsWith('http') ? ins.profilePhoto : `http://localhost:5000/uploads/${ins.profilePhoto}`;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(ins?._id || ins?.name || 'default')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};

const STATUS_CONFIG = {
    approved: { label: 'ACTIVE',   bg: 'bg-primary/5',   text: 'text-primary',   dot: 'bg-emerald-400' },
    pending:  { label: 'PENDING',  bg: 'bg-secondary/10',  text: 'text-secondary',  dot: 'bg-amber-400'   },
    rejected: { label: 'REJECTED', bg: 'bg-orange-50', text: 'text-orange-500', dot: 'bg-rose-400'    },
};

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, iconBg, iconColor, valueColor, onView }) {
    return (
        <motion.div
            whileHover={{ y: -3, boxShadow: '0 16px 40px rgba(0,0,0,0.08)' }}
            className="flex-1 min-w-[170px] bg-white rounded-2xl p-5 cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100 transition-all"
            onClick={onView}
        >
            {/* Top row: icon + eye */}
            <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                    <span className={iconColor}>{icon}</span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-all border border-slate-100">
                    <Eye size={13} className="text-slate-400" />
                </div>
            </div>

            {/* Value */}
            <p className={`text-2xl font-semibold leading-none mb-1 ${valueColor}`}>{value}</p>
            {/* Label */}
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
        </motion.div>
    );
}

// ── Instructor Card ──────────────────────────────────────────────────────────
function InstructorCard({ ins, onView, onApprove, onReject, onDelete, onEdit, delay }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const cfg = STATUS_CONFIG[ins.instructorStatus] || STATUS_CONFIG.pending;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.35 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all overflow-hidden flex flex-col"
        >
            {/* Card body */}
            <div className="p-7 flex-1">
                {/* Top row */}
                <div className="flex items-start justify-between mb-5">
                    <div className="relative">
                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-md">
                            <img
                                src={avatarUrl(ins)}
                                alt={ins.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Online dot */}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${cfg.dot}`} />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-semibold uppercase tracking-widest ${cfg.bg} ${cfg.text}`}>
                            {cfg.label}
                        </span>
                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
                                className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                            >
                                <MoreVertical size={16} />
                            </button>
                            <AnimatePresence>
                                {menuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 6 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 6 }}
                                        onClick={e => e.stopPropagation()}
                                        className="absolute right-0 mt-1.5 w-44 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20"
                                    >
                                        <button onClick={() => { onView(); setMenuOpen(false); }}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-[#071739]/5 hover:text-[#071739] transition-all">
                                            <BookOpen size={13} /> View Dashboard
                                        </button>
                                        <button onClick={() => { onEdit(); setMenuOpen(false); }}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                                            <Edit2 size={13} /> Edit Profile
                                        </button>
                                        {ins.instructorStatus === 'pending' && (<>
                                            <div className="h-px bg-slate-50 mx-3 my-1" />
                                            <button onClick={() => { onApprove(); setMenuOpen(false); }}
                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-all">
                                                <CheckCircle2 size={13} /> Approve
                                            </button>
                                            <button onClick={() => { onReject(); setMenuOpen(false); }}
                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-orange-500 hover:bg-orange-50 transition-all">
                                                <XCircle size={13} /> Reject
                                            </button>
                                        </>)}
                                        <div className="h-px bg-slate-50 mx-3 my-1" />
                                        <button onClick={() => { onDelete(); setMenuOpen(false); }}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 transition-all">
                                            <Trash2 size={13} /> Delete
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Name / email / specialty */}
                <div className="mb-5">
                    <h3 className="text-lg font-semibold text-slate-800 leading-tight mb-0.5">{ins.name}</h3>
                    <p className="text-xs text-slate-400 font-medium mb-2">{ins.email}</p>
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-[#071739]">
                        {ins.instructorSpecialty || 'Senior Educator'}
                    </p>
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-50">
                    <div>
                        <p className="text-[9px] font-semibold text-slate-300 uppercase tracking-widest mb-1">Courses</p>
                        <p className="text-base font-semibold text-slate-700">
                            {String(ins.courseCount || 0).padStart(2, '0')}
                        </p>
                    </div>
                    <div>
                        <p className="text-[9px] font-semibold text-slate-300 uppercase tracking-widest mb-1">Students</p>
                        <p className="text-base font-semibold text-slate-700">{fmt(ins.studentCount)}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-semibold text-slate-300 uppercase tracking-widest mb-1">Rating</p>
                        <p className="text-base font-semibold text-slate-700 flex items-center gap-1">
                            <Star size={11} className="text-[#A68868] fill-[#A68868]" />
                            {ins.averageRating ? ins.averageRating.toFixed(1) : '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* View Dashboard CTA */}
            <button
                onClick={onView}
                className="w-full py-4 text-[#071739] font-semibold text-xs uppercase tracking-widest bg-slate-50 hover:bg-[#071739]/5 border-t border-slate-100 transition-all rounded-b-3xl"
            >
                View Dashboard
            </button>
        </motion.div>
    );
}

// ── Recent Applications Panel ────────────────────────────────────────────────
function RecentApplications({ instructors }) {
    const router = useRouter();
    const recent = instructors
        .filter(i => i.instructorStatus === 'pending')
        .slice(0, 5);

    const timeAgo = (d) => {
        if (!d) return '—';
        const diff = Date.now() - new Date(d).getTime();
        const h = Math.floor(diff / 3600000);
        if (h < 1) return 'Just now';
        if (h < 24) return `${h}H AGO`;
        return `${Math.floor(h / 24)}D AGO`;
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-slate-800">Recent Applications</h3>
                <button 
                    onClick={() => router.push('/dashboard/admin/instructor-applications')}
                    className="text-[10px] font-semibold text-[#071739] uppercase tracking-widest hover:text-[#A68868] transition-all"
                >
                    See All
                </button>
            </div>
            {recent.length === 0 ? (
                <div className="py-8 text-center text-slate-300 text-xs font-semibold">No pending applications</div>
            ) : (
                <div className="space-y-1">
                    {recent.map((ins, i) => (
                        <motion.div
                            key={ins._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                                <img src={avatarUrl(ins)} alt={ins.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-700 truncate">{ins.name}</p>
                                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                                    Applied {timeAgo(ins.createdAt)} · {ins.instructorSpecialty || 'General'}
                                </p>
                            </div>
                            <button
                                onClick={() => router.push(`/dashboard/admin/instructors/${ins._id}`)}
                                className="p-2 text-slate-200 group-hover:text-[#071739] transition-all"
                            >
                                <ExternalLink size={14} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function InstructorManagement() {
    const router = useRouter();
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingInstructor, setEditingInstructor] = useState(null);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [showOnboard, setShowOnboard] = useState(false);
    const [onboardForm, setOnboardForm] = useState({ name: '', email: '', password: '', instructorSpecialty: '', instructorBio: '' });
    const [onboardLoading, setOnboardLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchInstructors = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/instructors');
            setInstructors(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch instructors:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInstructors(); }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/admin/instructors/${id}/status`, { status });
            fetchInstructors();
        } catch { alert('Failed to update status'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Mark this instructor as inactive?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchInstructors();
        } catch { alert('Failed to delete'); }
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        const { _id, courseCount, studentCount, averageRating, createdAt, ...updateData } = editingInstructor;
        try {
            await api.put(`/admin/users/${_id}`, updateData);
            setEditingInstructor(null);
            fetchInstructors();
        } catch { alert('Failed to update'); }
    };

    const handleOnboardSubmit = async (e) => {
        e.preventDefault();
        if (!onboardForm.name.trim() || !onboardForm.email.trim() || !onboardForm.password.trim()) {
            showToast('Name, email and password are required', 'error');
            return;
        }
        setOnboardLoading(true);
        try {
            await api.post('/admin/users', { ...onboardForm, role: 'instructor' });
            showToast(`✓ ${onboardForm.name} onboarded as instructor!`);
            setShowOnboard(false);
            setOnboardForm({ name: '', email: '', password: '', instructorSpecialty: '', instructorBio: '' });
            fetchInstructors();
        } catch (err) {
            showToast(err?.response?.data?.message || 'Failed to create instructor', 'error');
        } finally {
            setOnboardLoading(false);
        }
    };


    const filtered = instructors.filter(ins => {
        const isInstructorCandidate = ins.role === 'instructor' || ins.instructorStatus === 'pending';
        const matchStatus = filter === 'all' || ins.instructorStatus === filter;
        const matchSearch = !search || ins.name.toLowerCase().includes(search.toLowerCase())
            || ins.email?.toLowerCase().includes(search.toLowerCase());
        return isInstructorCandidate && matchStatus && matchSearch;
    });

    // stats
    const pendingCount  = instructors.filter(i => i.instructorStatus === 'pending').length;
    const totalCourses  = instructors.reduce((s, i) => s + (i.courseCount || 0), 0);
    const avgRating     = instructors.filter(i => i.role === 'instructor').length
        ? (instructors.filter(i => i.role === 'instructor').reduce((s, i) => s + (i.averageRating || 0), 0) /
           instructors.filter(i => i.role === 'instructor' && i.averageRating).length || 0).toFixed(2)
        : '—';

    const specialties = ['All Specializations', ...new Set(
        instructors.map(i => i.instructorSpecialty).filter(Boolean)
    )];

    return (
        <AdminLayout>
            <div className="space-y-8" onClick={() => {}}>

                {/* ── Page Header ── */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
                    <div>
                        <h1 className="text-4xl font-semibold text-slate-800 tracking-tight">Instructor Fleet</h1>
                        <p className="text-slate-400 mt-2 font-medium max-w-md leading-relaxed text-sm">
                            Manage teaching credentials, course performance, and student impact metrics across the global educator network.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {/* Specialization filter */}
                        <div className="relative">
                            <select
                                value={filter}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (val === 'All Specializations') { setFilter('all'); return; }
                                    // map to status values
                                    if (val === 'pending' || val === 'approved' || val === 'rejected') setFilter(val);
                                    else setFilter('all');
                                }}
                                className="appearance-none bg-white border border-slate-200 rounded-2xl pl-4 pr-10 py-3 text-sm font-semibold text-slate-600 outline-none focus:ring-4 focus:ring-[#071739]/10 transition-all shadow-sm cursor-pointer"
                            >
                                <option value="all">All Specializations</option>
                                <option value="pending">Pending Approval</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Onboard button */}
                        <button
                            onClick={() => setShowOnboard(true)}
                            className="flex items-center gap-2.5 bg-[#071739] hover:bg-[#020a1a] text-white px-6 py-3 rounded-2xl font-semibold text-sm shadow-lg shadow-slate-900/10 transition-all"
                        >
                            <UserPlus size={16} />
                            Onboard Instructor
                        </button>
                    </div>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={<ShieldCheck size={18} />}
                        label="Pending Review"
                        value={pendingCount}
                        iconBg="bg-secondary/10"
                        iconColor="text-secondary"
                        valueColor="text-secondary"
                        onView={() => setFilter('pending')}
                    />
                    <StatCard
                        icon={<BookOpen size={18} />}
                        label="Active Courses"
                        value={totalCourses.toLocaleString()}
                        iconBg="bg-primary/5"
                        iconColor="text-primary"
                        valueColor="text-primary"
                        onView={() => setFilter('approved')}
                    />
                    <StatCard
                        icon={<Star size={18} />}
                        label="Avg Rating"
                        value={avgRating}
                        iconBg="bg-secondary/5"
                        iconColor="text-secondary"
                        valueColor="text-secondary"
                        onView={() => {}}
                    />
                    <StatCard
                        icon={<Users size={18} />}
                        label="Total Instructors"
                        value={instructors.length}
                        iconBg="bg-primary/5"
                        iconColor="text-primary"
                        valueColor="text-primary"
                        onView={() => setFilter('all')}
                    />
                </div>

                {/* ── Search ── */}
                <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm max-w-sm">
                    <Search size={16} className="text-slate-300" />
                    <input
                        type="text"
                        placeholder="Search instructor records..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1 text-sm bg-transparent outline-none text-slate-600 placeholder:text-slate-300 font-medium"
                    />
                </div>

                {/* ── Main grid: cards + sidebar ── */}
                <div className="flex flex-col xl:flex-row gap-7">
                    {/* Instructor cards */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1,2,3].map(i => (
                                    <div key={i} className="h-72 bg-white rounded-3xl border border-slate-100 animate-pulse" />
                                ))}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="py-24 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                                <Users size={36} className="text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-400 font-semibold text-sm">No instructors match your criteria</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filtered.map((ins, i) => (
                                    <InstructorCard
                                        key={ins._id}
                                        ins={ins}
                                        delay={i * 0.06}
                                        onView={() => router.push(`/dashboard/admin/instructors/${ins._id}`)}
                                        onApprove={() => handleUpdateStatus(ins._id, 'approved')}
                                        onReject={() => handleUpdateStatus(ins._id, 'rejected')}
                                        onDelete={() => handleDelete(ins._id)}
                                        onEdit={() => setEditingInstructor(ins)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right sidebar: Recent Applications */}
                    <div className="xl:w-80 shrink-0">
                        <RecentApplications instructors={instructors} />
                    </div>
                </div>
            </div>

            {/* ── Edit Modal ── */}
            <AnimatePresence>
                {editingInstructor && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditingInstructor(null)}
                            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-9"
                        >
                            <h2 className="text-xl font-semibold text-slate-800 mb-7 tracking-tight">Edit Instructor</h2>
                            <form onSubmit={handleEditSave} className="space-y-5">
                                <div>
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-semibold text-sm outline-none focus:ring-4 focus:ring-[#071739]/10 transition-all"
                                        value={editingInstructor.name}
                                        onChange={e => setEditingInstructor({ ...editingInstructor, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-2">Specialty</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Full Stack Developer"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-semibold text-sm outline-none focus:ring-4 focus:ring-[#071739]/10 transition-all"
                                        value={editingInstructor.instructorSpecialty || ''}
                                        onChange={e => setEditingInstructor({ ...editingInstructor, instructorSpecialty: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-2">Phone Number</label>
                                    <input
                                        type="text"
                                        placeholder="+91 XXXXX XXXXX"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-semibold text-sm outline-none focus:ring-4 focus:ring-[#071739]/10 transition-all"
                                        value={editingInstructor.phone || ''}
                                        onChange={e => setEditingInstructor({ ...editingInstructor, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-2">Change Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-semibold text-sm outline-none focus:ring-4 focus:ring-[#071739]/10 transition-all"
                                        value={editingInstructor.password || ''}
                                        onChange={e => setEditingInstructor({ ...editingInstructor, password: e.target.value })}
                                    />
                                    <p className="text-[9px] text-slate-400 font-medium mt-1 ml-1">Leave blank to keep current password</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-2">Bio</label>
                                    <textarea
                                        rows="2"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-medium text-sm outline-none focus:ring-4 focus:ring-[#071739]/10 transition-all resize-none"
                                        value={editingInstructor.instructorBio || ''}
                                        onChange={e => setEditingInstructor({ ...editingInstructor, instructorBio: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingInstructor(null)}
                                        className="flex-1 py-4 text-slate-400 font-semibold text-sm hover:bg-slate-50 rounded-2xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] bg-[#071739] text-white py-4 rounded-2xl font-semibold text-xs uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-[#020a1a] transition-all"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* ── Onboard Instructor Modal ── */}
            <AnimatePresence>
                {showOnboard && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowOnboard(false)}
                            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            {/* Modal header */}
                            <div className="flex items-center gap-4 px-9 pt-9 pb-6 border-b border-slate-50">
                                <div className="w-11 h-11 rounded-2xl bg-[#071739]/5 text-[#071739] flex items-center justify-center shrink-0">
                                    <UserPlus size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Onboard Instructor</h2>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">Create a new instructor account on the platform</p>
                                </div>
                                <button
                                    onClick={() => setShowOnboard(false)}
                                    className="ml-auto p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleOnboardSubmit} className="px-9 py-7 space-y-5">
                                {/* Row: Name + Email */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                                            Full Name <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Dr. Jane Smith"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-semibold text-sm text-slate-700 outline-none focus:ring-4 focus:ring-[#071739]/10 focus:border-[#071739]/20 transition-all placeholder:text-slate-300"
                                            value={onboardForm.name}
                                            onChange={e => setOnboardForm({ ...onboardForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                                            Email Address <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="jane@example.com"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-semibold text-sm text-slate-700 outline-none focus:ring-4 focus:ring-[#071739]/10 focus:border-[#071739]/20 transition-all placeholder:text-slate-300"
                                            value={onboardForm.email}
                                            onChange={e => setOnboardForm({ ...onboardForm, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                                        Password <span className="text-rose-400">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="Min. 8 characters"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-semibold text-sm text-slate-700 outline-none focus:ring-4 focus:ring-[#071739]/10 focus:border-[#071739]/20 transition-all placeholder:text-slate-300"
                                        value={onboardForm.password}
                                        onChange={e => setOnboardForm({ ...onboardForm, password: e.target.value })}
                                    />
                                </div>

                                {/* Specialty */}
                                <div>
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-2">Specialty / Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Full Stack Developer, Data Scientist"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-semibold text-sm text-slate-700 outline-none focus:ring-4 focus:ring-[#071739]/10 focus:border-[#071739]/20 transition-all placeholder:text-slate-300"
                                        value={onboardForm.instructorSpecialty}
                                        onChange={e => setOnboardForm({ ...onboardForm, instructorSpecialty: e.target.value })}
                                    />
                                </div>

                                {/* Bio */}
                                <div>
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-2">Short Bio</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Brief introduction about the instructor..."
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-medium text-sm text-slate-700 outline-none focus:ring-4 focus:ring-[#071739]/10 focus:border-[#071739]/20 transition-all resize-none placeholder:text-slate-300"
                                        value={onboardForm.instructorBio}
                                        onChange={e => setOnboardForm({ ...onboardForm, instructorBio: e.target.value })}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowOnboard(false)}
                                        className="flex-1 py-3.5 text-slate-400 font-semibold text-sm hover:bg-slate-50 rounded-2xl transition-all border border-slate-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={onboardLoading}
                                        className="flex-[2] bg-[#071739] text-white py-3.5 rounded-2xl font-semibold text-xs uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-[#020a1a] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                    >
                                        {onboardLoading ? (
                                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
                                        ) : (
                                            <><UserPlus size={15} /> Create Instructor</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-6 py-4 rounded-2xl text-white text-sm font-semibold shadow-2xl
                            ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    >
                        {toast.type === 'error' ? <XCircle size={17} /> : <CheckCircle2 size={17} />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>
        </AdminLayout>

    );
}
