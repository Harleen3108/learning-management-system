'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api from '@/services/api';
import { 
    Monitor, 
    Search, 
    Filter, 
    RefreshCcw, 
    Eye, 
    EyeOff, 
    BookOpen, 
    Folder, 
    PlayCircle, 
    MoreVertical,
    CheckCircle2,
    XCircle,
    ChevronRight,
    ArrowUpRight,
    Clock,
    User,
    ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export default function ContentMonitoring() {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchContent = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/content/monitoring');
            setLessons(res.data.data);
        } catch (err) {
            console.error('Failed to fetch content:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
    }, []);

    const filteredContent = lessons.filter(lesson => 
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        lesson.module?.course?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">Content Monitor</h1>
                        <p className="text-slate-400 font-medium italic">Holistic oversight of all curriculum nodes across the platform.</p>
                    </div>
                    <button 
                        onClick={fetchContent}
                        className="flex items-center gap-2 px-6 py-3 border border-slate-100 rounded-2xl font-bold text-slate-500 hover:bg-white transition-all shadow-sm"
                    >
                        <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                        Refresh Nodes
                    </button>
                </div>

                {/* System Ledger Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
                        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                            <PlayCircle size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Total Lessons</p>
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight">{lessons.length}</h4>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
                        <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                            <Folder size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Unique Modules</p>
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight">
                                {[...new Set(lessons.map(l => l.module?._id))].length}
                            </h4>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
                        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                            <BookOpen size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Parent Courses</p>
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight">
                                {[...new Set(lessons.map(l => l.module?.course?._id))].length}
                            </h4>
                        </div>
                    </div>
                </div>

                {/* Content Ledger */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search by lesson title or course..." 
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Lesson Node</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Parent Course / Module</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Duration</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-black uppercase tracking-widest text-[10px] animate-pulse">Scanning production servers for curriculum nodes...</td></tr>
                                ) : filteredContent.length === 0 ? (
                                    <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold italic tracking-tight">No content matches found.</td></tr>
                                ) : (
                                    filteredContent.map((item) => (
                                        <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                                        <PlayCircle size={20} />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-black text-slate-800 tracking-tight leading-none block mb-1">{item.title}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{item.type || 'video'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-slate-800 tracking-tight leading-none mb-1">{item.module?.course?.title}</span>
                                                    <span className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1">
                                                        <Folder size={10} /> {item.module?.title}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <Clock size={14} />
                                                    <span className="text-xs font-bold font-mono tracking-tighter">{item.duration || '0:00'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={clsx(
                                                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border inline-block",
                                                    item.status !== 'flagged' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                                )}>
                                                    {item.status || 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button className="p-3 bg-slate-100 text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-sm rounded-xl transition-all" title="Preview Content">
                                                        <ArrowUpRight size={18} />
                                                    </button>
                                                    <button className="p-3 bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all" title="Flag as Inappropriate">
                                                        <ShieldAlert size={18} />
                                                    </button>
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
