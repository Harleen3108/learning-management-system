'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api from '@/services/api';
import { 
    Users, 
    BookOpen, 
    Star, 
    CheckCircle2, 
    XCircle, 
    Award,
    Mail,
    Filter,
    Search,
    ChevronRight,
    ArrowUpRight,
    ShieldCheck,
    Clock,
    MoreVertical,
    Edit2,
    Trash,
    Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export default function InstructorManagement() {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInstructor, setSelectedInstructor] = useState(null);
    const [editingInstructor, setEditingInstructor] = useState(null);
    const [filter, setFilter] = useState('all');
    const [activeMenu, setActiveMenu] = useState(null);

    const fetchInstructors = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/instructors');
            setInstructors(res.data.data);
        } catch (err) {
            console.error('Failed to fetch instructors:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstructors();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/admin/instructors/${id}/status`, { status });
            fetchInstructors();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this instructor profile? They will be marked as inactive.')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchInstructors();
            setActiveMenu(null);
        } catch (err) {
            alert('Failed to delete instructor');
        }
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        // Strip out read-only and aggregated fields that the backend shouldn't receive
        const { _id, courseCount, studentCount, averageRating, createdAt, ...updateData } = editingInstructor;
        try {
            await api.put(`/admin/users/${_id}`, updateData);
            setEditingInstructor(null);
            fetchInstructors();
        } catch (err) {
            console.error('Update failed:', err);
            alert('Failed to update profile');
        }
    };

    const filteredInstructors = instructors.filter(ins => {
        if (filter === 'all') return true;
        return ins.instructorStatus === filter;
    });

    return (
        <AdminLayout>
            <div className="space-y-8" onClick={() => setActiveMenu(null)}>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Instructor Fleet</h1>
                        <p className="text-slate-400 mt-1 font-medium italic">Manage teaching credentials, course performance, and student impact metrics.</p>
                    </div>
                    <div className="flex gap-4">
                        <select 
                            className="bg-white border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">All Instructors</option>
                            <option value="pending">Pending Approval</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Stat Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
                        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Review</p>
                            <h4 className="text-2xl font-black text-slate-800">{instructors.filter(i => i.instructorStatus === 'pending').length}</h4>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
                        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                            <BookOpen size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Courses</p>
                            <h4 className="text-2xl font-black text-slate-800">{instructors.reduce((sum, i) => sum + (i.courseCount || 0), 0)}</h4>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
                        <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                            <Award size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Platform Rating</p>
                            <h4 className="text-2xl font-black text-slate-800">4.8</h4>
                        </div>
                    </div>
                </div>

                {/* Instructor Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        <div className="col-span-full py-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Syncing Instructor Data...</div>
                    ) : filteredInstructors.length === 0 ? (
                        <div className="col-span-full py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-center">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No instructors match your criteria</p>
                        </div>
                    ) : (
                        filteredInstructors.map((ins) => (
                            <motion.div 
                                layout
                                key={ins._id}
                                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all overflow-hidden group relative"
                            >
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl font-black text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                            {ins.name.charAt(0)}
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <span className={clsx(
                                                "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                                                ins.instructorStatus === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                ins.instructorStatus === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                "bg-rose-50 text-rose-600 border-rose-100"
                                            )}>
                                                {ins.instructorStatus}
                                            </span>
                                            <div className="relative">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenu(activeMenu === ins._id ? null : ins._id);
                                                    }}
                                                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-800 transition-all"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                
                                                <AnimatePresence>
                                                    {activeMenu === ins._id && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-10"
                                                        >
                                                            <button 
                                                                onClick={() => { setSelectedInstructor(ins); setActiveMenu(null); }}
                                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all"
                                                            >
                                                                <Eye size={16} /> View Profile
                                                            </button>
                                                            <button 
                                                                onClick={() => { setEditingInstructor(ins); setActiveMenu(null); }}
                                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all"
                                                            >
                                                                <Edit2 size={16} /> Edit Profile
                                                            </button>
                                                            <div className="h-px bg-slate-50 my-1" />
                                                            <button 
                                                                onClick={() => handleDelete(ins._id)}
                                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all"
                                                            >
                                                                <Trash size={16} /> Delete Profile
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">{ins.name}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{ins.instructorSpecialty || 'Senior Educator'}</p>

                                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-50">
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Courses</p>
                                            <p className="text-sm font-black text-slate-800">{ins.courseCount || 0}</p>
                                        </div>
                                        <div className="text-center border-x border-slate-50">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 flex justify-center">
                                                <Users size={12} />
                                            </p>
                                            <p className="text-sm font-black text-slate-800">{ins.studentCount || 0}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 flex justify-center">
                                                <Star size={12} />
                                            </p>
                                            <p className="text-sm font-black text-slate-800">{ins.averageRating?.toFixed(1) || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex gap-3">
                                        {ins.instructorStatus === 'pending' ? (
                                            <>
                                                <button 
                                                    onClick={() => handleUpdateStatus(ins._id, 'approved')}
                                                    className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => handleUpdateStatus(ins._id, 'rejected')}
                                                    className="px-4 border border-rose-100 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </>
                                        ) : (
                                            <button 
                                                onClick={() => setSelectedInstructor(ins)}
                                                className="w-full bg-slate-50 text-slate-500 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest group-hover:bg-blue-50 group-hover:text-blue-600 transition-all border border-slate-100"
                                            >
                                                View Dashboard
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Profile Detail Modal */}
            <AnimatePresence>
                {selectedInstructor && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedInstructor(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-12">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="flex gap-6 items-center">
                                        <div className="w-24 h-24 rounded-3xl bg-blue-600 text-white flex items-center justify-center text-4xl font-black">
                                            {selectedInstructor.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{selectedInstructor.name}</h2>
                                            <div className="flex items-center gap-2 text-slate-400 mt-1">
                                                <Mail size={16} />
                                                <p className="font-bold text-sm tracking-tight">{selectedInstructor.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedInstructor(null)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-300 hover:text-slate-800 transition-all">
                                        <XCircle size={24} />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">About the Instructor</p>
                                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 italic text-slate-600 font-medium leading-relaxed">
                                            "{selectedInstructor.instructorBio || 'No biography provided yet. This instructor is currently building their profile.'}"
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrolment Impact</p>
                                                <p className="text-xl font-black text-slate-800">{selectedInstructor.studentCount}</p>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-600 w-[65%]" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Review Velocity</p>
                                                <p className="text-xl font-black text-slate-800">{selectedInstructor.averageRating?.toFixed(1) || '0.0'}</p>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-amber-500 w-[85%]" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 flex gap-4">
                                        <button className="flex-1 bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center justify-center gap-3">
                                            Course Catalog <ChevronRight size={18} />
                                        </button>
                                        <button 
                                            onClick={() => { handleDelete(selectedInstructor._id); setSelectedInstructor(null); }}
                                            className="px-10 border border-slate-200 text-slate-500 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                                        >
                                            Suspend
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {editingInstructor && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditingInstructor(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden p-10"
                        >
                            <h2 className="text-2xl font-black text-slate-800 mb-8 tracking-tight">Edit Instructor Profile</h2>
                            <form onSubmit={handleEditSave} className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                        value={editingInstructor.name}
                                        onChange={e => setEditingInstructor({...editingInstructor, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specialty</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                        placeholder="EX: Full Stack Developer"
                                        value={editingInstructor.instructorSpecialty || ''}
                                        onChange={e => setEditingInstructor({...editingInstructor, instructorSpecialty: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bio</label>
                                    <textarea 
                                        rows="4"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                                        value={editingInstructor.instructorBio || ''}
                                        onChange={e => setEditingInstructor({...editingInstructor, instructorBio: e.target.value})}
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setEditingInstructor(null)}
                                        className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}
