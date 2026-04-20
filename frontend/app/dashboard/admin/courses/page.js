'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api from '@/services/api';
import { 
    CheckCircle2, 
    XCircle, 
    Eye, 
    MessageSquare, 
    Clock, 
    ChevronDown, 
    AlertCircle,
    Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import CoursePreviewModal from '@/components/admin/CoursePreviewModal';
import RejectFeedbackModal from '@/components/admin/RejectFeedbackModal';

const statusTabs = ['All Statuses', 'Pending', 'Published', 'Rejected', 'Draft'];

export default function CourseApprovals() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Pending');

    // Modal states
    const [previewCourse, setPreviewCourse] = useState(null);
    const [rejectCourse, setRejectCourse] = useState(null);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            let statusParam = '';
            if (activeTab !== 'All Statuses') {
                statusParam = `?status=${activeTab.toLowerCase()}`;
            }
            const res = await api.get(`/admin/courses${statusParam}`);
            setCourses(res.data.data);
        } catch (err) {
            console.error('Failed to fetch courses:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [activeTab]);

    const handleUpdateStatus = async (courseId, newStatus, feedback = null) => {
        try {
            await api.patch(`/courses/${courseId}/status`, { 
                status: newStatus,
                feedback 
            });
            fetchCourses();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleReject = async (feedback, category) => {
        if (!rejectCourse) return;
        const fullFeedback = `[${category.toUpperCase()}] ${feedback}`;
        await handleUpdateStatus(rejectCourse._id, 'rejected', fullFeedback);
        setRejectCourse(null);
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Course Approvals</h1>
                    <p className="text-slate-400 mt-1">Review and manage the educational curriculum quality. Ensure all courses meet standards.</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200/50 shadow-sm flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm">
                            84%
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Efficiency Report</p>
                            <h4 className="font-bold text-slate-800">Approval turnaround time improved by 12% this month.</h4>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200/50 shadow-sm">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Pending Review</p>
                        <div className="flex items-end gap-3">
                            <h4 className="text-4xl font-black text-slate-800">24</h4>
                            <span className="text-xs text-emerald-500 font-bold mb-1">Decrease in queue depth</span>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200/50 shadow-sm">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Needs Revision</p>
                        <div className="flex items-end gap-3">
                            <h4 className="text-4xl font-black text-slate-800 text-rose-500">09</h4>
                            <span className="text-xs text-slate-400 font-medium mb-1">Avg. response: 18h</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 border-b border-slate-200">
                    {statusTabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "pb-6 px-2 text-[10px] font-black uppercase tracking-widest transition-all relative",
                                activeTab === tab ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Course List */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="text-center py-20 text-slate-400 font-medium tracking-tight uppercase text-[10px] font-black">Refining Curriculum...</div>
                    ) : courses.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-200/50 shadow-sm">
                            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-lg font-black text-slate-800 tracking-tight">All caught up!</h3>
                            <p className="text-sm text-slate-400 font-medium tracking-tight">No courses pending for "{activeTab}"</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {courses.map((course) => (
                                <motion.div 
                                    key={course._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white p-6 rounded-[2rem] border border-slate-200/50 shadow-sm group hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col md:flex-row gap-8 items-center"
                                >
                                    <div className="w-full md:w-64 h-40 bg-slate-100 rounded-2xl overflow-hidden relative group shrink-0">
                                        <img src={course.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Play className="text-white fill-white" size={32} />
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-4 py-2">
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-lg">
                                                {course.category}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-tight">Submitted {new Date(course.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{course.title}</h3>
                                            <div className="flex items-center gap-3 mt-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm shrink-0">
                                                    <img src={`https://ui-avatars.com/api/?name=${course.instructor?.name}&background=random`} alt="" />
                                                </div>
                                                <p className="text-xs font-black text-slate-700 tracking-tight">{course.instructor?.name}</p>
                                                <span className="text-slate-200">•</span>
                                                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-black uppercase tracking-widest">
                                                    <Clock size={16} />
                                                    14.5h Content
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 min-w-[220px]">
                                        <div className={clsx(
                                            "flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                                            course.status === 'pending' ? "bg-orange-50 text-orange-600 border-orange-100" :
                                            course.status === 'published' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                            course.status === 'rejected' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-50 text-slate-600 border-slate-100"
                                        )}>
                                            <span className={clsx(
                                                "w-1.5 h-1.5 rounded-full animate-pulse",
                                                course.status === 'pending' ? "bg-orange-500" :
                                                course.status === 'published' ? "bg-emerald-500" :
                                                course.status === 'rejected' ? "bg-rose-500" : "bg-slate-500"
                                            )} />
                                            {course.status} Status
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleUpdateStatus(course._id, 'published')}
                                                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-slate-200 active:scale-95"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => setRejectCourse(course)}
                                                className="px-4 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all border border-rose-100 flex items-center justify-center"
                                            >
                                                <XCircle size={20} />
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => setPreviewCourse(course)}
                                            className="flex items-center justify-center gap-2 text-slate-400 hover:text-blue-600 text-[10px] font-black uppercase tracking-widest pt-2 transition-all hover:translate-x-1"
                                        >
                                            Preview Curriculum <ChevronDown size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* Modals */}
            <CoursePreviewModal 
                isOpen={!!previewCourse} 
                course={previewCourse} 
                onClose={() => setPreviewCourse(null)} 
            />
            
            <RejectFeedbackModal 
                isOpen={!!rejectCourse} 
                courseName={rejectCourse?.title}
                onClose={() => setRejectCourse(null)}
                onSubmit={handleReject}
            />
        </AdminLayout>
    );
}

// Minimal Circle helper
const Circle = ({ size, className }) => <div className={clsx(className, "rounded-full")} style={{ width: size, height: size }} />;
