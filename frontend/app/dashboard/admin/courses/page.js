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
    Play,
    BarChart3
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import CoursePreviewModal from '@/components/admin/CoursePreviewModal';
import RejectFeedbackModal from '@/components/admin/RejectFeedbackModal';

const statusTabs = ['All Statuses', 'Pending', 'Published', 'Rejected', 'Draft'];

export default function CourseApprovals() {
    const router = useRouter();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All Statuses');

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
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Course Approvals</h1>
                    <p className="text-slate-400 mt-1">Review and manage the educational curriculum quality. Ensure all courses meet standards.</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200/50 shadow-sm flex items-center gap-6">
                        <div className="w-16 h-16 bg-[#071739]/5 text-[#071739] rounded-2xl flex items-center justify-center font-bold text-2xl shadow-sm">
                            84%
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Efficiency Report</p>
                            <h4 className="font-bold text-slate-800">Approval turnaround time improved by 12% this month.</h4>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200/50 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Pending Review</p>
                        <div className="flex items-end gap-3">
                            <h4 className="text-4xl font-bold text-slate-800">24</h4>
                            <span className="text-xs text-emerald-500 font-bold mb-1">Decrease in queue depth</span>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200/50 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Needs Revision</p>
                        <div className="flex items-end gap-3">
                            <h4 className="text-4xl font-bold text-slate-800 text-rose-500">09</h4>
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
                                "pb-6 px-2 text-[10px] font-bold uppercase tracking-widest transition-all relative",
                                activeTab === tab ? "text-[#071739]" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-[#071739] rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {loading ? (
                        <div className="col-span-full text-center py-20 text-slate-400 font-bold tracking-tight uppercase text-[10px]">Refining Curriculum...</div>
                    ) : courses.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white rounded-[2rem] border border-slate-200/50 shadow-sm">
                            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">All caught up!</h3>
                            <p className="text-sm text-slate-400 font-bold tracking-tight">No courses pending for "{activeTab}"</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {courses.map((course) => (
                                <motion.div 
                                    key={course._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex flex-col bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden group h-full"
                                >
                                    {/* Thumbnail Section */}
                                    <div className="aspect-[16/9] bg-slate-100 relative overflow-hidden shrink-0">
                                        <img src={course.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                            <button 
                                                onClick={() => setPreviewCourse(course)}
                                                className="w-full py-3 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white hover:text-[#071739] transition-all"
                                            >
                                                Quick Preview
                                            </button>
                                        </div>
                                        
                                        {/* Status Badge */}
                                        <div className="absolute top-4 left-4">
                                            <span className={clsx(
                                                "px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest border backdrop-blur-md shadow-sm",
                                                course.status === 'pending' ? "bg-orange-500/90 text-white border-orange-400" :
                                                course.status === 'published' ? "bg-emerald-500/90 text-white border-emerald-400" :
                                                course.status === 'rejected' ? "bg-rose-500/90 text-white border-rose-400" : "bg-slate-500/90 text-white border-slate-400"
                                            )}>
                                                {course.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-6 flex flex-col flex-1 space-y-4">
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-tight line-clamp-2 h-10 group-hover:text-[#071739] transition-colors">
                                                {course.title}
                                            </h3>
                                            <p className="text-[10px] text-slate-400 font-bold tracking-tight line-clamp-1">
                                                {course.instructor?.name || 'Academic Expert'}
                                            </p>
                                        </div>

                                        {/* Rating Display */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-[#A68868]">4.7</span>
                                            <div className="flex items-center gap-0.5 text-[#A68868]">
                                                <Play size={10} fill="currentColor" className="rotate-90" />
                                                <Play size={10} fill="currentColor" className="rotate-90" />
                                                <Play size={10} fill="currentColor" className="rotate-90" />
                                                <Play size={10} fill="currentColor" className="rotate-90" />
                                                <Play size={10} className="rotate-90" />
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold">(1.2k)</span>
                                        </div>

                                        {/* Pricing Section */}
                                        <div className="flex items-center gap-2 pt-1">
                                            <span className="text-sm font-bold text-slate-900">₹{course.discountPrice || course.price || 'Free'}</span>
                                            {course.discountPrice && (
                                                <span className="text-[10px] text-slate-400 line-through font-bold">₹{course.price}</span>
                                            )}
                                        </div>

                                        {/* Badges Section */}
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <span className="px-2 py-0.5 bg-[#071739]/5 text-[#071739] text-[8px] font-bold uppercase tracking-widest rounded">Premium</span>
                                            <span className="px-2 py-0.5 bg-[#A68868]/10 text-[#A68868] text-[8px] font-bold uppercase tracking-widest rounded">Bestseller</span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-4 border-t border-slate-50">
                                            {course.status === 'published' ? (
                                                <button 
                                                    onClick={() => setRejectCourse(course)}
                                                    className="flex-1 py-3 bg-rose-50 text-rose-600 rounded-xl font-bold text-[9px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                                                >
                                                    Disapprove
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleUpdateStatus(course._id, 'published')}
                                                    className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-[9px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => router.push(`/dashboard/courses/${course._id}`)}
                                                className="p-3 bg-slate-50 text-slate-400 hover:bg-[#071739] hover:text-white rounded-xl transition-all"
                                            >
                                                <BarChart3 size={16} />
                                            </button>
                                        </div>
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
                onApprove={(id) => handleUpdateStatus(id, 'published')}
                onReject={(course) => setRejectCourse(course)}
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
