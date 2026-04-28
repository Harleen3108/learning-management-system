'use client';
import { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Plus, 
  Calendar, 
  Pin, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  CheckCircle2, 
  Clock,
  Loader2,
  X,
  MoreVertical,
  Bell
} from 'lucide-react';
import { Card } from '@/components/UIElements';
import api from '@/services/api';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnnouncementsSection({ selectedCourse }) {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        isPinned: false,
        scheduledFor: new Date().toISOString().slice(0, 16)
    });

    useEffect(() => {
        fetchAnnouncements();
    }, [selectedCourse]);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const courseParam = selectedCourse === 'all' ? '' : `?courseId=${selectedCourse}`;
            const res = await api.get(`/communication/announcements${courseParam}`);
            setAnnouncements(res.data.data);
        } catch (err) {
            console.error('Failed to fetch announcements:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (selectedCourse === 'all') {
            alert('Please select a specific course to post an announcement.');
            return;
        }
        try {
            await api.post('/communication/announcements', {
                ...formData,
                courseId: selectedCourse
            });
            setShowModal(false);
            setFormData({ title: '', content: '', isPinned: false, scheduledFor: new Date().toISOString().slice(0, 16) });
            fetchAnnouncements();
        } catch (err) {
            console.error('Failed to create announcement:', err);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center">
                        <Megaphone size={30} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold text-slate-900">Course Announcements</h3>
                        <p className="text-sm text-slate-400 font-medium mt-1">Broadcast updates and important news to all enrolled students.</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-[#071739] text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-slate-900/10"
                >
                    <Plus size={18} /> New Broadcast
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#071739]" size={32} /></div>
            ) : announcements.length === 0 ? (
                <Card className="p-20 text-center flex flex-col items-center border-slate-50">
                    <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-6">
                        <Bell size={40} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900">No announcements yet</h3>
                    <p className="text-slate-400 font-medium mt-2">Reach out to your students by posting your first update.</p>
                </Card>
            ) : (
                <div className="space-y-6">
                    {announcements.map((ann) => (
                        <Card key={ann._id} className={clsx(
                            "p-8 border-slate-100 hover:border-[#071739]/10 transition-all group relative overflow-hidden",
                            ann.isPinned && "ring-2 ring-[#071739]/10"
                        )}>
                            {ann.isPinned && (
                                <div className="absolute top-4 right-8 flex items-center gap-2 text-[10px] font-black text-[#071739] uppercase tracking-widest">
                                    <Pin size={12} fill="currentColor" /> Pinned
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-semibold text-slate-900">{ann.title}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                            {ann.course.title} • {new Date(ann.scheduledFor).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><Edit3 size={18} /></button>
                                    <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                                </div>
                            </div>

                            <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-50">
                                <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                                    "{ann.content}"
                                </p>
                            </div>

                            <div className="mt-8 flex justify-between items-center">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                                        <CheckCircle2 size={14} /> Published
                                    </div>
                                    <div className="text-slate-300 text-xs">•</div>
                                    <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                        Visible to all students
                                    </div>
                                </div>
                                <button className="text-[#071739] font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-2">
                                    View Engagement <ChevronRight size={14} />
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Announcement Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-[#071739]/50 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-center mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
                                            <Megaphone size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-semibold text-slate-900">New Announcement</h3>
                                            <p className="text-xs text-slate-400 font-medium">Broadcast a message to your students.</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-all"><X size={20} /></button>
                                </div>

                                <form onSubmit={handleCreate} className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Announcement Title</label>
                                        <input 
                                            required
                                            type="text" 
                                            className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-[#071739]/5 transition-all"
                                            placeholder="e.g. Exam Schedule Updated"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Schedule For</label>
                                            <input 
                                                required
                                                type="datetime-local" 
                                                className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-[#071739]/5 transition-all"
                                                value={formData.scheduledFor}
                                                onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex items-end pb-3">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative">
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only"
                                                        checked={formData.isPinned}
                                                        onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                                                    />
                                                    <div className={clsx(
                                                        "w-10 h-6 rounded-full transition-all",
                                                        formData.isPinned ? "bg-[#071739]" : "bg-slate-200"
                                                    )}></div>
                                                    <div className={clsx(
                                                        "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all",
                                                        formData.isPinned && "translate-x-4"
                                                    )}></div>
                                                </div>
                                                <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Pin to top</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Announcement Content</label>
                                        <textarea 
                                            required
                                            className="w-full bg-slate-50 border-none rounded-[2rem] p-6 text-sm font-medium text-slate-800 outline-none focus:ring-4 focus:ring-[#071739]/5 transition-all min-h-[150px]"
                                            placeholder="Write your broadcast message here..."
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        className="w-full bg-[#071739] text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]"
                                    >
                                        Broadcast Update
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
