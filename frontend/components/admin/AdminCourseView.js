'use client';
import { useState, useEffect } from 'react';
import { 
    Users, 
    TrendingUp, 
    Star, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    ChevronRight,
    ShieldCheck,
    Play,
    FileText,
    MessageSquare,
    BarChart3,
    ArrowLeft,
    Loader2,
    HelpCircle,
    Info,
    Check,
    Globe,
    FileText as FileIcon,
    MoreVertical,
    Layout,
    ShieldAlert,
    BarChart,
    ClipboardCheck,
    ListTodo,
    Activity,
    X,
    Send,
    Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import api from '@/services/api';
import { Card } from '@/components/UIElements';
import Link from 'next/link';

export default function AdminCourseView({ courseId, onStatusUpdate }) {
    const [course, setCourse] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedModule, setSelectedModule] = useState(0);
    const [updating, setUpdating] = useState(false);
    const [globalFeedback, setGlobalFeedback] = useState('');
    const [auditHistory, setAuditHistory] = useState([]);
    
    // Preview & Lesson Feedback States
    const [previewLesson, setPreviewLesson] = useState(null);
    const [lessonVideoUrl, setLessonVideoUrl] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [lessonFeedback, setLessonFeedback] = useState('');
    const [savingFeedback, setSavingFeedback] = useState(false);
    const [checklist, setChecklist] = useState({
        titleQuality: false,
        thumbnailQuality: false,
        descriptionQuality: false,
        curriculumQuality: false,
        mediaQuality: false,
        pricingValidity: false
    });
    const [scores, setScores] = useState({
        completeness: 85,
        quality: 90,
        compliance: 100
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [courseRes, analyticsRes, reviewsRes, auditRes] = await Promise.all([
                    api.get(`/courses/${courseId}`),
                    api.get(`/analytics/course/${courseId}`),
                    api.get(`/reviews/course/${courseId}`),
                    api.get(`/courses/${courseId}/audit-history`)
                ]);
                const cData = courseRes.data.data;
                setCourse(cData);
                setAnalytics(analyticsRes.data.data);
                setReviews(reviewsRes.data.data);
                setAuditHistory(auditRes.data.data);
                
                if (cData.checklist) setChecklist(cData.checklist);
                if (cData.qualityScores) setScores(cData.qualityScores);
                
            } catch (err) {
                console.error('Failed to fetch admin course data:', err);
            } finally {
                setLoading(false);
            }
        };
        if (courseId) fetchData();
    }, [courseId]);

    const handleUpdateStatus = async (status, feedback = null) => {
        setUpdating(true);
        try {
            // Send update and get refreshed course data
            const res = await api.patch(`/courses/${courseId}/status`, { status, feedback });
            setCourse(res.data.data);
            setGlobalFeedback(''); // Clear feedback on success
            alert('Feedback and status updated successfully!');
            
            // Refresh audit history
            const auditRes = await api.get(`/courses/${courseId}/audit-history`);
            setAuditHistory(auditRes.data.data);
            
            if (onStatusUpdate) onStatusUpdate(status);
        } catch (err) {
            console.error('Status update failed:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to update status';
            alert(`Failed to send feedback: ${errorMsg}`);
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            await api.delete(`/reviews/${reviewId}`);
            setReviews(reviews.filter(r => r._id !== reviewId));
        } catch (err) {
            console.error('Failed to delete review:', err);
        }
    };

    const handlePreviewLesson = async (lesson) => {
        setPreviewLesson(lesson);
        setLessonFeedback(lesson.feedback || '');
        setPreviewLoading(true);
        setLessonVideoUrl(null);
        try {
            const res = await api.get(`/courses/${courseId}/lessons/${lesson._id}/video`);
            setLessonVideoUrl(res.data.videoUrl);
        } catch (err) {
            console.error('Failed to fetch lesson video:', err);
            // Fallback: If it's a 400 it might be a missing videoPublicId, 
            // maybe we can show the lesson.videoUrl as a fallback for admins?
            // But let's just show the error in console for now and handle the UI state.
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleSaveLessonFeedback = async () => {
        if (!previewLesson) return;
        setSavingFeedback(true);
        try {
            await api.patch(`/courses/${courseId}/lessons/${previewLesson._id}/feedback`, { feedback: lessonFeedback });
            // Update local state
            setCourse(prev => {
                const newModules = prev.modules.map(mod => ({
                    ...mod,
                    lessons: mod.lessons.map(l => l._id === previewLesson._id ? { ...l, feedback: lessonFeedback } : l)
                }));
                return { ...prev, modules: newModules };
            });
            alert('Lesson feedback saved successfully.');
        } catch (err) {
            console.error('Failed to save lesson feedback:', err);
            alert('Failed to save feedback.');
        } finally {
            setSavingFeedback(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-slate-400 font-semibold uppercase text-[10px] tracking-widest animate-pulse">Aggregating Intelligence...</p>
        </div>
    );

    if (!course) return <div className="p-20 text-center font-semibold text-slate-400">Course Intelligence Unavailable.</div>;
    
    // Dynamic Stats Calculation
    const totalLessons = course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;
    const totalDurationSeconds = course.modules?.reduce((acc, mod) => {
        return acc + (mod.lessons?.reduce((lAcc, lesson) => lAcc + (lesson.duration || 0), 0) || 0);
    }, 0) || 0;

    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    const stats = [
        { label: 'Enrolled Students', value: analytics?.totalEnrolled || 0, icon: Users, color: 'text-primary', bg: 'bg-blue-50' },
        { label: 'Total Revenue', value: `₹${analytics?.totalRevenue?.toLocaleString() || 0}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Completion Rate', value: `${analytics?.completion?.avgCompletion || 0}%`, icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Avg. Rating', value: analytics?.reviews?.averageRating || course.averageRating || 'N/A', icon: Star, color: 'text-orange-500', bg: 'bg-orange-50' },
    ];

    return (
        <div className="space-y-10 pb-20">
            {/* Admin Review Top Bar (Sticky) */}
            <div className="sticky top-0 z-[60] -mx-4 lg:-mx-8 px-4 lg:px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex flex-wrap items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard/admin/courses" className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl transition-all flex items-center gap-2 group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden md:block text-[10px] font-semibold uppercase tracking-widest">Back to Courses</span>
                    </Link>
                    <div className="h-8 w-px bg-slate-100 hidden md:block"></div>
                    <div className={clsx(
                        "px-4 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-[0.2em] border shadow-sm flex items-center gap-2",
                        course.status === 'pending' ? "bg-orange-500 text-white border-orange-400" :
                        course.status === 'published' ? "bg-emerald-500 text-white border-emerald-400" :
                        course.status === 'rejected' ? "bg-rose-500 text-white border-rose-400" : "bg-slate-500 text-white border-slate-400"
                    )}>
                        <Activity size={14} className={course.status === 'pending' ? "animate-pulse" : ""} />
                        {course.status}
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest leading-none">Instructor</p>
                            <p className="text-xs font-semibold text-slate-900 leading-none">{course.instructor?.name}</p>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest leading-none">Submitted</p>
                            <p className="text-xs font-semibold text-slate-900 leading-none">{new Date(course.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest leading-none">Deadline</p>
                            <p className="text-xs font-semibold text-rose-500 leading-none">48 Hours Remaining</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {course.status !== 'published' ? (
                        <button 
                            onClick={() => handleUpdateStatus('published')}
                            disabled={updating}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-200 active:scale-95 disabled:opacity-50"
                        >
                            Approve
                        </button>
                    ) : (
                        <button 
                            onClick={() => handleUpdateStatus('pending')}
                            disabled={updating}
                            className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-semibold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-rose-200 active:scale-95 disabled:opacity-50"
                        >
                            Unapprove
                        </button>
                    )}
                    
                    <button 
                        onClick={() => handleUpdateStatus('needs changes', globalFeedback)}
                        disabled={updating || !globalFeedback}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-orange-200 active:scale-95 disabled:opacity-50"
                    >
                        Needs Changes
                    </button>
                    
                    {course.status !== 'rejected' && (
                        <button 
                            onClick={() => handleUpdateStatus('rejected', globalFeedback)}
                            disabled={updating || !globalFeedback}
                            className="bg-white border-2 border-rose-100 text-rose-500 px-6 py-3 rounded-xl font-semibold text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95 disabled:opacity-50"
                        >
                            Reject
                        </button>
                    )}
                    <button className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl transition-all">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Dark Hero Section for Admin Review */}
            <div className="bg-[#071739] text-white -mx-4 lg:-mx-8 p-8 md:p-12 relative overflow-hidden mb-10 shadow-2xl">
                <div className="max-w-5xl space-y-6 relative z-10">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-blue-100/80">
                        <span>{course.category?.name ?? course.category}</span>
                        <span className="text-white/40">›</span>
                        <span>{(course.subcategory?.name ?? course.subcategory) || 'General'}</span>
                        <span className="text-white/40 ml-4 px-3 py-1 bg-white/10 rounded-lg text-[9px] font-semibold uppercase tracking-widest text-white">Reviewing curriculum</span>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight leading-[1.1]">{course.title}</h1>
                        <p className="text-xl text-slate-300 font-medium max-w-2xl">{course.subtitle || course.tagline}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        <div className="flex items-center gap-1.5 bg-[#bef264] text-[#3d3c0a] px-2 py-1 rounded-sm font-semibold text-[10px] uppercase">Bestseller</div>
                        <div className="flex items-center gap-1.5 bg-blue-50 text-[#071739] px-2 py-1 rounded-sm font-semibold text-[10px] uppercase">Role Play</div>
                        <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                            <span>4.8</span>
                            <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}</div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-white/60">
                        <div className="flex items-center gap-2">
                             <Clock size={14} className="text-white/30" />
                             Created {new Date(course.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                             <Globe size={14} className="text-white/30" />
                             {course.language || 'English'}
                        </div>
                        <div className="flex items-center gap-2">
                             <ShieldCheck size={14} className="text-white/30" />
                             Admin Policy Verification Active
                        </div>
                    </div>
                </div>

                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                    <Card key={i} className="p-8 group hover:shadow-2xl transition-all border-none shadow-sm relative overflow-hidden bg-white">
                        <div className="flex justify-between items-start relative z-10">
                            <div className={`p-4 rounded-2.5xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon size={24} />
                            </div>
                            <div className="flex flex-col items-end">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <h4 className="text-3xl font-semibold text-slate-900 mt-1">{stat.value}</h4>
                            </div>
                        </div>
                        <div className="mt-6 flex items-center gap-2 text-[10px] font-semibold text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full w-fit">
                            <TrendingUp size={14} /> +8.4% this week
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Column - Row 1 */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Detailed Curriculum Metadata */}
                    <Card className="p-10 bg-white border-none shadow-sm rounded-[2.5rem]">
                        <h3 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-3 mb-8">
                            <Info className="text-primary" /> Course Synopsis
                        </h3>
                        
                        <div className="space-y-8">
                            <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Subtitle</p>
                                <p className="text-lg font-semibold text-slate-800 leading-snug">{course.subtitle || 'No subtitle provided.'}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">What you'll learn</p>
                                    <div className="space-y-3">
                                        {course.whatYouWillLearn?.length > 0 ? course.whatYouWillLearn.map((point, i) => (
                                            <div key={i} className="flex gap-3 text-xs font-semibold text-slate-600">
                                                <Check className="shrink-0 text-emerald-500" size={14} />
                                                <span>{point}</span>
                                            </div>
                                        )) : <p className="text-xs text-slate-400 italic">No learning points defined.</p>}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Requirements</p>
                                    <div className="space-y-3">
                                        {course.requirements?.length > 0 ? course.requirements.map((req, i) => (
                                            <div key={i} className="flex gap-3 text-xs font-semibold text-slate-600">
                                                <AlertCircle className="shrink-0 text-orange-400" size={14} />
                                                <span>{req}</span>
                                            </div>
                                        )) : <p className="text-xs text-slate-400 italic">No requirements defined.</p>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Detailed Description</p>
                                <div className="text-xs font-medium text-slate-500 leading-relaxed max-h-40 overflow-y-auto pr-4 custom-scrollbar">
                                    <div dangerouslySetInnerHTML={{ __html: course.description.replace(/\n/g, '<br />') }} />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-10 bg-white border-none shadow-sm rounded-[2.5rem]">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-3">
                                <BarChart3 className="text-primary" /> Curriculum Assessment
                            </h3>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                                {course.modules?.length || 0} Modules Total
                            </span>
                        </div>

                        <div className="space-y-4">
                            {course.modules?.map((module, mIndex) => (
                                <div key={module._id} className="space-y-4">
                                    <div 
                                        onClick={() => setSelectedModule(selectedModule === mIndex ? -1 : mIndex)}
                                        className={clsx(
                                            "p-6 rounded-3xl border transition-all cursor-pointer group flex items-center justify-between",
                                            selectedModule === mIndex 
                                                ? "bg-slate-900 border-slate-900 text-white" 
                                                : "bg-slate-50 border-slate-50 text-slate-900 hover:border-slate-200"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className={clsx(
                                                "w-10 h-10 rounded-2xl flex items-center justify-center font-semibold text-sm",
                                                selectedModule === mIndex ? "bg-white/10 text-white" : "bg-white text-slate-900 shadow-sm"
                                            )}>
                                                {mIndex + 1}
                                            </span>
                                            <h4 className={clsx(
                                                "font-semibold text-lg tracking-tight",
                                                selectedModule === mIndex ? "text-white" : "text-slate-900"
                                            )}>{module.title}</h4>
                                        </div>
                                        <ChevronRight 
                                            size={20} 
                                            className={clsx(
                                                "transition-transform duration-300", 
                                                selectedModule === mIndex ? "rotate-90 text-white" : "text-slate-400"
                                            )} 
                                        />
                                    </div>

                                    <AnimatePresence mode="popLayout">
                                        {selectedModule === mIndex && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="pl-6 space-y-3"
                                            >
                                                {module.lessons?.map((lesson, lIndex) => (
                                                    <div key={lesson._id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                                                        <div 
                                                            onClick={() => handlePreviewLesson(lesson)}
                                                            className="w-10 h-10 bg-white shadow-sm border border-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors cursor-pointer"
                                                        >
                                                            <Play size={16} className="fill-current" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-slate-800 tracking-tight">{lesson.title}</p>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest flex items-center gap-1">
                                                                    <Clock size={12} /> {lesson.duration ? `${Math.floor(lesson.duration/60)}m` : 'Streaming'}
                                                                </span>
                                                                {lesson.feedback && (
                                                                    <span className="text-[9px] text-orange-500 font-semibold uppercase tracking-widest flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded">
                                                                        <MessageSquare size={10} /> Has Feedback
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => handlePreviewLesson(lesson)}
                                                            className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest hover:text-primary"
                                                        >
                                                            Review
                                                        </button>
                                                    </div>
                                                ))}
                                                {module.lessons?.length === 0 && module.quizzes?.length === 0 && <p className="text-xs text-slate-400 italic py-2">No instructional units defined for this module.</p>}
                                                
                                                {/* Quizzes Mapping */}
                                                {module.quizzes?.map((quiz, qIndex) => (
                                                    <div key={quiz._id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-amber-50 transition-all border border-transparent hover:border-amber-100 group">
                                                        <div className="w-10 h-10 bg-white shadow-sm border border-slate-50 rounded-xl flex items-center justify-center text-amber-500 group-hover:text-amber-600 transition-colors">
                                                            <HelpCircle size={16} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-slate-800 tracking-tight">{quiz.title}</p>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest flex items-center gap-1">
                                                                    {quiz.questions?.length || 0} Questions
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest hover:text-amber-600"
                                                        >
                                                            Audit Quiz
                                                        </button>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>                {/* Sidebar Column - Row 1 */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Admin Review Side Panel */}
                    <Card className="p-8 bg-slate-900 text-white rounded-[2.5rem] border-none shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10 space-y-8">
                            <h3 className="text-xl font-semibold flex items-center gap-2">
                                <ShieldAlert className="text-orange-400" /> Review Intelligence
                            </h3>
                            
                            {/* Quality Scores */}
                            <div className="space-y-6">
                                {[
                                    { label: 'Completeness', score: scores.completeness, color: 'bg-emerald-500' },
                                    { label: 'Media Quality', score: scores.quality, color: 'bg-blue-500' },
                                    { label: 'Policy Compliance', score: scores.compliance, color: 'bg-purple-500' }
                                ].map((s, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-semibold uppercase tracking-widest text-white/50">
                                            <span>{s.label}</span>
                                            <span>{s.score}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${s.score}%` }}
                                                className={`h-full ${s.color} rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Key Stats */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                <div>
                                    <p className="text-[9px] font-semibold text-white/40 uppercase tracking-widest">Total Duration</p>
                                    <p className="text-lg font-semibold tracking-tight">{formatDuration(totalDurationSeconds)}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-semibold text-white/40 uppercase tracking-widest">Total Lessons</p>
                                    <p className="text-lg font-semibold tracking-tight">{totalLessons} units</p>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-semibold text-[10px] uppercase tracking-widest transition-all">
                                Generate Full Audit Report
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[100px] opacity-20 -z-0" />
                    </Card>

                    {/* Admin Review Checklist */}
                    <Card className="p-8 bg-white rounded-[2.5rem] border-none shadow-sm space-y-6">
                        <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                            <ClipboardCheck className="text-primary" /> Validation Checklist
                        </h3>
                        <div className="space-y-3">
                            {[
                                { key: 'titleQuality', label: 'Title Clarity & Impact' },
                                { key: 'thumbnailQuality', label: 'Thumbnail Professionalism' },
                                { key: 'descriptionQuality', label: 'Description & SEO Compliance' },
                                { key: 'curriculumQuality', label: 'Curriculum Logical Flow' },
                                { key: 'mediaQuality', label: 'Video & Audio Fidelity' },
                                { key: 'pricingValidity', label: 'Pricing Standard Alignment' }
                            ].map((item) => (
                                <label 
                                    key={item.key}
                                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-all cursor-pointer group"
                                >
                                    <span className="text-[11px] font-semibold text-slate-600">{item.label}</span>
                                    <input 
                                        type="checkbox" 
                                        checked={checklist[item.key]}
                                        onChange={() => setChecklist(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                        className="w-5 h-5 rounded-lg border-2 border-slate-200 text-primary focus:ring-primary transition-all cursor-pointer"
                                    />
                                </label>
                            ))}
                        </div>
                        <div className="pt-4 border-t border-slate-50">
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Checklist Status</span>
                                <span className="text-[10px] font-semibold text-emerald-500 uppercase">
                                    {Object.values(checklist).filter(v => v).length} / 6 Verified
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Pricing & Instructor Info */}
                    <Card className="p-8 bg-white rounded-[2.5rem] border-none shadow-sm space-y-6">
                        <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                            <Tag className="text-emerald-500" size={20} /> Pricing & Instructor
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div>
                                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Base Price</p>
                                    <p className="text-lg font-semibold text-slate-400 line-through decoration-rose-500/30 decoration-2 italic">₹{course.price || '0'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-semibold text-emerald-500 uppercase tracking-widest">Offer Price</p>
                                    <p className="text-2xl font-semibold text-slate-900">₹{course.discountPrice || '0'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-blue-100/50 group">
                                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-semibold text-lg shadow-lg shadow-blue-200 transition-transform group-hover:rotate-6">
                                    {course.instructor?.name?.charAt(0) || 'I'}
                                </div>
                                <div>
                                    <p className="text-[9px] font-semibold text-primary uppercase tracking-widest leading-none mb-1">Lead Instructor</p>
                                    <p className="text-sm font-semibold text-slate-900 leading-none">{course.instructor?.name}</p>
                                    <p className="text-[10px] text-slate-500 font-bold mt-1.5 opacity-60">{course.instructor?.email}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Row 2: Administrative Directives vs Interaction Loop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Column - Row 2 */}
                <div className="lg:col-span-2">
                    <Card className="p-10 bg-white border-none shadow-sm rounded-[2.5rem] flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-3">
                                <ShieldCheck className="text-primary" /> Administrative Directives
                            </h3>
                            <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full">
                                {auditHistory.length} Recorded Actions
                            </span>
                        </div>

                        <div className="space-y-4 overflow-y-auto pr-4 custom-scrollbar max-h-[450px]">
                            {auditHistory.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 font-medium italic border-2 border-dashed border-slate-100 rounded-[2rem]">
                                    No administrative signals detected.
                                </div>
                            ) : (
                                auditHistory.map((item) => (
                                    <div key={item._id} className="p-6 rounded-3xl border border-blue-50 bg-blue-50/10 hover:bg-blue-50/20 transition-all relative group">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] text-primary font-semibold uppercase tracking-widest bg-white px-2 py-1 rounded-lg border border-blue-100 shadow-sm">
                                                {item.action.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                                {new Date(item.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                            {item.details}
                                        </p>
                                        <div className="mt-4 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-semibold text-white">
                                                {item.user?.name?.charAt(0) || 'A'}
                                            </div>
                                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{item.user?.name} · {item.user?.role}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Sidebar Column - Row 2 */}
                <div className="lg:col-span-1 flex flex-col gap-10">
                    <Card className="p-8 bg-white rounded-[2.5rem] border-none shadow-sm flex flex-col">
                        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2 tracking-tight">
                            <MessageSquare className="text-primary" /> Feedback Loop
                        </h3>
                        <div className="space-y-4">
                            <textarea 
                                value={globalFeedback}
                                onChange={(e) => setGlobalFeedback(e.target.value)}
                                placeholder="Enter detailed feedback for the instructor..."
                                className="w-full bg-slate-50 rounded-3xl p-6 min-h-[140px] text-sm text-slate-600 outline-none focus:ring-4 focus:ring-primary/5 transition-all border border-slate-100 placeholder:text-slate-300 font-medium"
                            />
                            <button 
                                onClick={() => handleUpdateStatus('rejected', globalFeedback)}
                                disabled={updating || !globalFeedback.trim()}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-semibold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                {updating ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Send & Request Revision'}
                            </button>
                        </div>

                        {/* Feedback History List */}
                        {course.feedbackHistory?.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Feedback History</h4>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {course.feedbackHistory.slice().reverse().map((f, i) => (
                                        <div key={i} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={clsx(
                                                    "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest",
                                                    f.statusAtTime === 'published' ? "bg-emerald-50 text-emerald-600" :
                                                    f.statusAtTime === 'rejected' ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                                                )}>
                                                    {f.statusAtTime}
                                                </span>
                                                <span className="text-[8px] text-slate-400 font-bold uppercase">{new Date(f.date).toLocaleString()}</span>
                                            </div>
                                            <p className="text-xs text-slate-600 font-medium leading-relaxed italic">"{f.content}"</p>
                                            <div className="mt-2 flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
                                                <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] text-slate-500">
                                                    {f.admin?.name?.charAt(0) || 'A'}
                                                </div>
                                                {f.admin?.name || 'Admin'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>

                    <Card className="p-8 bg-white border-none shadow-sm rounded-[2.5rem] flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-3">
                                <Star className="text-orange-400" /> Student Sentiment
                            </h3>
                            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-full">
                                {reviews.length} RL
                            </span>
                        </div>

                        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
                            {reviews.length === 0 ? (
                                <div className="text-center py-6 text-slate-400 font-medium italic border-2 border-dashed border-slate-100 rounded-[2rem] text-[10px]">
                                    No student validation yet.
                                </div>
                            ) : (
                                reviews.map((review) => (
                                    <div key={review._id} className="p-4 rounded-2xl border border-slate-50 bg-slate-50/30 hover:bg-slate-50/50 transition-all group relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex gap-2">
                                                <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center font-semibold text-slate-400 border border-slate-50 text-[10px]">
                                                    {review.student?.name?.charAt(0) || 'S'}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-900 text-[11px] tracking-tight">{review.student?.name}</h4>
                                                    <div className="flex text-orange-400 mt-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={8} fill={i < review.rating ? "currentColor" : "none"} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={clsx(
                                                "px-2 py-0.5 rounded-md text-[7px] font-semibold uppercase tracking-widest",
                                                review.sentimentLabel === 'Positive' ? "bg-emerald-50 text-emerald-600" :
                                                review.sentimentLabel === 'Constructive' ? "bg-blue-50 text-primary" : "bg-slate-100 text-slate-500"
                                            )}>
                                                {review.sentimentLabel}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">"{review.comment.slice(0, 80)}{review.comment.length > 80 ? '...' : ''}"</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>

            {/* Premium Video Preview Overlay */}
            <AnimatePresence mode="popLayout">
                {previewLesson && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 lg:p-20"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-slate-900 w-full max-w-6xl h-full max-h-[850px] rounded-[3rem] shadow-2xl shadow-blue-500/20 flex flex-col lg:flex-row overflow-hidden relative border border-white/5"
                        >
                            {/* Close Button */}
                            <button 
                                onClick={() => setPreviewLesson(null)}
                                className="absolute top-8 right-8 z-[110] w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white transition-all active:scale-95"
                            >
                                <X size={24} />
                            </button>

                            {/* Left: Video Player */}
                            <div className="flex-[1.5] bg-black relative flex items-center justify-center">
                                {previewLoading ? (
                                    <div className="flex flex-col items-center gap-4 text-white/40">
                                        <Loader2 className="animate-spin" size={32} />
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em]">Acquiring Token...</p>
                                    </div>
                                ) : lessonVideoUrl ? (
                                    <video 
                                        src={lessonVideoUrl} 
                                        controls 
                                        autoPlay
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-4 text-white/40">
                                        <AlertCircle size={48} className="opacity-20" />
                                        <p className="text-[10px] font-semibold uppercase tracking-widest leading-loose text-center px-10">Stream unavailable. Verify instructor credentials and Cloudinary signature logic.</p>
                                    </div>
                                )}
                            </div>

                            {/* Right: Lesson Info & Feedback */}
                            <div className="flex-1 bg-slate-900 p-10 flex flex-col border-l border-white/5 no-scrollbar overflow-y-auto">
                                <div className="mb-10">
                                    <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-[0.3em] mb-3">Auditing Unit</p>
                                    <h3 className="text-3xl font-semibold text-white tracking-tight leading-none mb-4">{previewLesson.title}</h3>
                                    <p className="text-white/40 text-xs font-bold leading-relaxed">{previewLesson.description || 'No descriptive metadata provided for this industrial unit.'}</p>
                                </div>

                                <div className="space-y-6 mt-auto">
                                    <div className="flex items-center gap-2 text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">
                                        <MessageSquare size={14} className="text-orange-400" /> Granular Feedback
                                    </div>
                                    <textarea 
                                        value={lessonFeedback}
                                        onChange={(e) => setLessonFeedback(e.target.value)}
                                        placeholder="Add specific notes for this lesson... (e.g. video quality, audio clarity, content accuracy)"
                                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 min-h-[220px] text-sm text-white/80 outline-none focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-white/20 font-medium resize-none shadow-inner"
                                    />
                                    <button 
                                        onClick={handleSaveLessonFeedback}
                                        disabled={savingFeedback}
                                        className="w-full py-5 bg-primary hover:bg-blue-700 text-white rounded-[1.5rem] font-semibold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:opacity-50 active:scale-95"
                                    >
                                        {savingFeedback ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                        {savingFeedback ? 'Processing Audit...' : 'Commit Feedback'}
                                    </button>
                                </div>

                                <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                                         <CheckCircle2 size={18} />
                                     </div>
                                     <div>
                                         <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Quality Assurance</p>
                                         <p className="text-[10px] text-white/30 font-bold">Standard Bitrate & Audio Verification Active</p>
                                     </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Backdrop Blur */}
                        <div 
                            onClick={() => setPreviewLesson(null)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl -z-10"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

