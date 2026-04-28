'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Search, 
    ChevronDown, 
    Eye, 
    Mail, 
    Phone, 
    ExternalLink, 
    User,
    Briefcase,
    BookOpen,
    MessageCircle,
    FileText,
    ArrowRight,
    Award,
    Filter
} from 'lucide-react';
import { clsx } from 'clsx';

export default function InstructorApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('pending');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/instructor-applications?status=${filter}`);
            setApplications(res.data.data);
        } catch (err) {
            console.error('Failed to fetch applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [filter]);

    const handleAction = async (id, status, adminNotes = '') => {
        setActionLoading(true);
        try {
            await api.put(`/instructor-applications/${id}`, { status, adminNotes });
            setSelectedApp(null);
            fetchApplications();
        } catch (err) {
            alert('Failed to update application');
        } finally {
            setActionLoading(false);
        }
    };

    const filtered = applications.filter(app => 
        app.fullName.toLowerCase().includes(search.toLowerCase()) || 
        app.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">Instructor Applications</h1>
                        <p className="text-slate-500 mt-2 font-medium">Review and manage applications from prospective instructors.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <select 
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="appearance-none bg-white border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-blue-600/10 transition-all cursor-pointer shadow-sm"
                            >
                                <option value="pending">Pending Review</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Disapproved</option>
                                <option value="changes_requested">Changes Requested</option>
                            </select>
                            <Filter size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>

                        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm min-w-[300px]">
                            <Search size={18} className="text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-transparent outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400 w-full"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="px-8 py-5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Applicant</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Expertise</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Qualification</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Date</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-full" /></td>
                                        </tr>
                                    ))
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold">No applications found</td>
                                    </tr>
                                ) : (
                                    filtered.map((app) => (
                                        <tr key={app._id} className="hover:bg-slate-50/50 transition-all group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-100">
                                                        {app.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{app.fullName}</p>
                                                        <p className="text-xs text-slate-400 font-medium">{app.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-semibold uppercase tracking-wider">
                                                    <Briefcase size={10} /> {app.expertise}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-semibold text-slate-600">{app.qualification.describeSelf}</p>
                                                <p className="text-[10px] text-slate-400 font-medium mt-1">Has taught: {app.qualification.hasTaughtBefore}</p>
                                            </td>
                                            <td className="px-8 py-6 text-xs text-slate-400 font-bold">
                                                {new Date(app.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button 
                                                    onClick={() => setSelectedApp(app)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                >
                                                    <Eye size={20} />
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

            {/* Application Detail Modal */}
            <AnimatePresence>
                {selectedApp && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedApp(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="p-10 border-b border-slate-50 flex items-start justify-between bg-slate-50/50">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-[#071739] text-3xl font-semibold shadow-xl border border-slate-100">
                                        {selectedApp.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">{selectedApp.fullName}</h2>
                                        <p className="text-lg text-slate-500 font-medium mt-1">{selectedApp.professionalHeadline}</p>
                                        <div className="flex gap-4 mt-3">
                                            <span className="flex items-center gap-2 text-xs font-bold text-slate-400"><Mail size={14}/> {selectedApp.email}</span>
                                            {selectedApp.phone && <span className="flex items-center gap-2 text-xs font-bold text-slate-400"><Phone size={14}/> {selectedApp.phone}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => handleAction(selectedApp._id, 'approved')}
                                        className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center gap-2"
                                    >
                                        <CheckCircle2 size={18} /> Approve
                                    </button>
                                    <button 
                                        onClick={() => handleAction(selectedApp._id, 'rejected')}
                                        className="px-6 py-3 bg-rose-50 text-rose-500 border border-rose-100 rounded-2xl font-semibold text-sm hover:bg-rose-100 transition-all flex items-center gap-2"
                                    >
                                        <XCircle size={18} /> Disapprove
                                    </button>
                                    <button onClick={() => setSelectedApp(null)} className="p-3 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all">
                                        <XCircle size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
                                <div className="lg:col-span-7 space-y-10">
                                    {/* Qualification Box */}
                                    <div className="bg-blue-50/50 rounded-[2.5rem] p-8 border border-blue-100 space-y-6">
                                        <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                                            <Award size={22} /> Qualification Answers
                                        </h3>
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest">Self Description</p>
                                                <p className="text-sm font-semibold text-blue-900">{selectedApp.qualification.describeSelf}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Teaching Goals</p>
                                                <p className="text-sm font-bold text-blue-900">{selectedApp.qualification.teachingTopic}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Past Experience</p>
                                                <p className="text-sm font-bold text-blue-900">{selectedApp.qualification.hasTaughtBefore}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                                            <User size={22} className="text-blue-600" /> About & Bio
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                            {selectedApp.bio}
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                                            <BookOpen size={22} className="text-blue-600" /> Sample Course Idea
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                            {selectedApp.sampleCourseIdea || "No sample idea provided."}
                                        </p>
                                    </div>
                                </div>

                                <div className="lg:col-span-5 space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-1">Expertise & Skills</h3>
                                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                            <p className="text-sm font-semibold text-slate-800 mb-4">{selectedApp.expertise}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedApp.skills.map(skill => (
                                                    <span key={skill} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-semibold text-slate-600">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Social & Portfolio</h3>
                                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-3">
                                            {selectedApp.links.linkedin && (
                                                <a href={selectedApp.links.linkedin} target="_blank" className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-2xl hover:border-blue-600 transition-all group">
                                                    <div className="flex items-center gap-3">
                                                        <Linkedin size={18} className="text-blue-600" />
                                                        <span className="text-xs font-bold text-slate-700">LinkedIn Profile</span>
                                                    </div>
                                                    <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-600" />
                                                </a>
                                            )}
                                            {selectedApp.links.website && (
                                                <a href={selectedApp.links.website} target="_blank" className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-2xl hover:border-blue-600 transition-all group">
                                                    <div className="flex items-center gap-3">
                                                        <Globe size={18} className="text-blue-600" />
                                                        <span className="text-xs font-bold text-slate-700">Portfolio Website</span>
                                                    </div>
                                                    <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-600" />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Payout Method</h3>
                                        <div className="bg-[#071739] text-white rounded-3xl p-6 shadow-xl flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preferred Method</p>
                                                <p className="text-lg font-semibold mt-1">{selectedApp.preferredPayoutMethod}</p>
                                            </div>
                                            <Award size={32} className="text-blue-400/50" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}
