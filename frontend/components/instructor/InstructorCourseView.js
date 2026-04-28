'use client';
import { useState, useEffect } from 'react';
import { 
    Infinity as InfinityIcon,
    ArrowRight,
    Play,
    Tag,
    Share2,
    Gift,
    X,
    Star,
    Users,
    Info,
    Globe,
    PlayCircle,
    FileText,
    Smartphone,
    Trophy,
    ChevronDown,
    ChevronUp,
    Check,
    Lock,
    Unlock,
    Heart,
    Baby,
    Clock,
    TrendingUp,
    Edit3,
    CheckCircle2,
    AlertCircle,
    BarChart3,
    LayoutDashboard,
    ArrowLeft,
    Loader2,
    Eye,
    Settings,
    FilePlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import { clsx } from 'clsx';
import Link from 'next/link';

export default function InstructorCourseView({ courseId }) {
    const [course, setCourse] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState({});
    const [scrolled, setScrolled] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [courseRes, analyticsRes, reviewsRes] = await Promise.all([
                    api.get(`/courses/${courseId}`),
                    api.get(`/analytics/course/${courseId}`),
                    api.get(`/reviews/course/${courseId}`)
                ]);
                setCourse(courseRes.data.data);
                setAnalytics(analyticsRes.data.data);
                setReviews(reviewsRes.data.data || []);
                
                // Initialize expanded modules
                if (courseRes.data.data?.modules) {
                    const allExp = {};
                    courseRes.data.data.modules.forEach(m => allExp[m._id] = true);
                    setExpandedModules(allExp);
                }
            } catch (err) {
                console.error('Failed to fetch instructor course data:', err);
            } finally {
                setLoading(false);
            }
        };
        if (courseId) fetchData();

        const handleScroll = () => {
            setScrolled(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [courseId]);

    const toggleModule = (id) => {
        setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-slate-400 font-semibold uppercase text-[10px] tracking-widest animate-pulse">Synchronizing Instructor View...</p>
        </div>
    );

    if (!course) return <div className="p-20 text-center font-semibold text-slate-400">Course not found.</div>;

    const totalLessons = course.modules?.reduce((acc, m) => acc + m.lessons.length, 0) || 0;
    const isRejected = course.status === 'rejected';

    return (
        <div className="min-h-screen bg-white font-sans text-[#071739] relative">
            {/* Sticky Top Bar (appears on scroll) */}
            <AnimatePresence>
                {scrolled && (
                    <motion.div
                        initial={{ y: -80 }}
                        animate={{ y: 0 }}
                        exit={{ y: -80 }}
                        className="fixed top-0 left-0 right-0 z-[100] bg-[#071739] text-white shadow-2xl border-b border-white/10"
                    >
                        <div className="max-w-[1340px] mx-auto px-6 lg:px-8 py-3 flex items-center justify-between">
                            <div className="flex-1 min-w-0 mr-8 flex items-center gap-4">
                                <Link href="/dashboard" className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-[10px] font-semibold uppercase tracking-widest shrink-0">
                                    <ArrowLeft size={14} /> Back
                                </Link>
                                <div className="h-4 w-px bg-white/20"></div>
                                <h3 className="text-white font-semibold text-sm truncate">{course.title}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <div className={clsx(
                                        "px-2 py-0.5 rounded font-semibold text-[8px] uppercase tracking-widest",
                                        course.status === 'published' ? "bg-emerald-500/20 text-emerald-400" :
                                        course.status === 'pending' ? "bg-orange-500/20 text-orange-400" :
                                        course.status === 'rejected' ? "bg-rose-500/20 text-rose-400" : "bg-slate-500/20 text-slate-400"
                                    )}>
                                        {course.status}
                                    </div>
                                    <span className="text-[#f69c08] font-semibold text-xs">{course.averageRating || '4.6'} ★</span>
                                    <span className="text-white/50 text-xs font-medium">({reviews.length || 21} ratings)</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dark Hero Section */}
            <header className="bg-[#071739] text-white py-12 lg:py-20 overflow-hidden relative">
                <div className="max-w-[1340px] mx-auto px-6 lg:px-8">
                    <div className="lg:max-w-[700px] space-y-6">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-sm font-medium text-blue-100">
                            <Link href="/dashboard" className="flex items-center gap-1 hover:text-white transition-colors">
                                <ArrowLeft size={14} /> Dashboard
                            </Link>
                            <span className="text-white/40">›</span>
                            <span className="text-white/70">{course.category?.name ?? course.category}</span>
                            <span className="text-white/40">›</span>
                            <span className="text-white/70">{(course.subcategory?.name ?? course.subcategory) || 'General'}</span>
                        </div>

                        <h1 className="text-white text-3xl lg:text-[2.5rem] font-semibold tracking-tight leading-[1.15] max-w-3xl">
                            {course.title}
                        </h1>
                        
                        <p className="text-lg font-medium text-white/90 max-w-2xl leading-relaxed">
                            {course.subtitle || course.tagline || course.description?.slice(0, 150)}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <div className={clsx(
                                "flex items-center gap-1.5 px-2 py-1 rounded-sm font-semibold text-[10px] uppercase",
                                course.status === 'published' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                                course.status === 'pending' ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" :
                                course.status === 'rejected' ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                            )}>
                                <span className={clsx("w-1.5 h-1.5 rounded-full", 
                                    course.status === 'published' ? "bg-emerald-500" :
                                    course.status === 'pending' ? "bg-orange-500" :
                                    course.status === 'rejected' ? "bg-rose-500" : "bg-slate-500"
                                )} />
                                {course.status}
                            </div>
                            <div className="flex items-center gap-1.5 bg-blue-50 text-[#071739] px-2 py-1 rounded-sm font-semibold text-[10px] uppercase">
                                {course.difficulty || 'All Levels'}
                            </div>
                            <div className="flex items-center gap-1.5 text-[#f69c08] font-semibold">
                                <span>{course.averageRating || '4.6'}</span>
                                <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}</div>
                            </div>
                            <span className="text-blue-100 underline underline-offset-4 font-medium text-xs">
                                ({reviews.length?.toLocaleString() || '19,678'} ratings)
                            </span>
                            <span className="font-medium text-white/70 text-xs">{analytics?.totalEnrolled?.toLocaleString() || '0'} students</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-white/90">
                            <span>Created by <span className="text-blue-100 underline underline-offset-4">{course.instructor?.name || 'You'}</span></span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-white/80">
                            <div className="flex items-center gap-2">
                                <Info size={14} className="text-white/50" /> 
                                Last updated {new Date(course.updatedAt || course.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe size={14} className="text-white/50" /> 
                                {course.language || 'English'}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content & Sticky Sidebar Container */}
            <div className="max-w-[1340px] mx-auto px-6 lg:px-8 relative flex flex-col lg:flex-row-reverse gap-10 mt-8 pb-20">
                
                {/* Sticky Sidebar (Instructor Tools) - Replaces Amount Card */}
                <aside className="lg:block lg:sticky lg:top-24 z-50 w-full lg:w-[340px] h-fit lg:-mt-[320px]">
                    <div className="bg-white shadow-2xl border border-slate-200 rounded-sm overflow-hidden">
                        {/* Preview Image/Video */}
                        <div className="aspect-video relative group cursor-pointer border-b border-slate-200">
                            <img src={course.thumbnail} alt="Course Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-all">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-xl group-hover:scale-110 transition-transform">
                                    <Play size={24} fill="currentColor" />
                                </div>
                            </div>
                            <div className="absolute bottom-4 left-0 right-0 text-center text-white font-semibold text-sm drop-shadow-md">
                                Preview this course
                            </div>
                        </div>



                        {/* Quick Stats Grid inside sidebar */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4">
                            <h4 className="font-semibold text-slate-900 text-sm mb-4">Course Performance</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Active Learners</p>
                                    <p className="text-xl font-semibold text-slate-900">{analytics?.totalEnrolled || 0}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Earnings</p>
                                    <p className="text-xl font-semibold text-emerald-600">₹{analytics?.totalRevenue?.toLocaleString() || 0}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Avg. Progress</p>
                                    <p className="text-xl font-semibold text-purple-600">{analytics?.completion?.avgCompletion || 0}%</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Quiz Pass Rate</p>
                                    <p className="text-xl font-semibold text-orange-500">{analytics?.quizzes?.passRate || 0}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white shadow-xl border border-slate-200 rounded-sm overflow-hidden mt-6">
                        <div className="p-6 space-y-4">
                            <h4 className="font-semibold text-slate-900 text-sm mb-4 flex items-center gap-2">
                                <Clock size={16} className="text-orange-500" /> Recent Activity
                            </h4>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center text-blue-600 shrink-0">
                                        <Users size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-900 tracking-tight leading-tight">New Student Enrolled</p>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">2 hours ago</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 bg-emerald-50 rounded flex items-center justify-center text-emerald-600 shrink-0">
                                        <TrendingUp size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-900 tracking-tight leading-tight">Revenue Update</p>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">5 hours ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="flex-1 space-y-12">
                    
                    {/* Rejection Alert */}
                    {isRejected && (
                        <div className="bg-rose-50 border border-rose-100 p-6 rounded-sm flex items-start gap-4">
                            <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={24} />
                            <div>
                                <h4 className="text-lg font-semibold text-rose-900 tracking-tight mb-1">Revisions Required</h4>
                                <p className="text-rose-700 font-medium text-sm leading-relaxed mb-4">
                                    Admin Feedback: <span className="font-medium">{course.feedback || "Your curriculum requires refinement before it can be published. Please review the standards."}</span>
                                </p>
                                <Link href={`/dashboard/instructor/edit/${course._id}`}>
                                    <button className="bg-rose-500 text-white px-6 py-2.5 rounded-sm font-semibold text-xs uppercase tracking-widest hover:bg-rose-600 transition-all">
                                        Apply Fixes
                                    </button>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* 1. What you'll learn */}
                    <section id="what-you-will-learn" className="border border-slate-200 p-8 lg:p-10 rounded-sm bg-white shadow-sm">
                        <h2 className="text-2xl font-semibold mb-8 tracking-tight">What students will learn</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            {course.whatYouWillLearn?.length > 0 ? course.whatYouWillLearn.map((point, i) => (
                                <div key={i} className="flex gap-4 text-sm font-medium text-slate-600 leading-relaxed">
                                    <Check className="shrink-0 text-slate-400" size={18} />
                                    <span>{point}</span>
                                </div>
                            )) : (
                                <div className="flex gap-4 text-sm font-medium text-slate-600 leading-relaxed">
                                    <Check className="shrink-0 text-slate-400" size={18} />
                                    <span>Master the core concepts of this subject.</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* 2. Course Content (Curriculum) */}
                    <section id="curriculum">
                        <h2 className="text-2xl font-semibold mb-6 tracking-tight">Course structure</h2>
                        <div className="flex justify-between items-center text-sm font-medium text-slate-600 mb-4">
                            <div className="flex items-center gap-2">
                                <span>{course.modules?.length || 0} sections</span>
                                <span className="text-slate-300">•</span>
                                <span>{totalLessons} lectures</span>
                            </div>
                            <button 
                                onClick={() => {
                                    const allExp = {};
                                    course.modules?.forEach(m => allExp[m._id] = true);
                                    setExpandedModules(allExp);
                                }}
                                className="text-blue-600 font-semibold hover:text-blue-700 transition-all"
                            >
                                Expand all sections
                            </button>
                        </div>

                        <div className="border border-slate-200 divide-y divide-slate-200">
                            {course.modules?.map((module) => (
                                <div key={module._id}>
                                    <button 
                                        onClick={() => toggleModule(module._id)}
                                        className="w-full flex items-center justify-between p-4 lg:p-6 bg-[#f7f9fa] hover:bg-slate-100 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            {expandedModules[module._id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            <span className="font-semibold text-left">{module.title}</span>
                                        </div>
                                        <div className="text-sm font-medium text-slate-500 whitespace-nowrap">
                                            {module.lessons.length} lectures
                                        </div>
                                    </button>
                                    <AnimatePresence>
                                        {expandedModules[module._id] && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden bg-white"
                                            >
                                                <div className="divide-y divide-slate-100">
                                                    {module.lessons.map((lesson) => (
                                                        <div key={lesson._id} className="flex items-center justify-between p-4 pl-12 text-sm">
                                                            <div className="flex items-center gap-4 text-slate-600">
                                                                <PlayCircle size={16} className="text-slate-400" />
                                                                <span className={clsx(
                                                                    "font-medium",
                                                                    lesson.isFree ? "text-blue-600 underline cursor-pointer" : ""
                                                                )}>{lesson.title}</span>
                                                            </div>
                                                            <div className="flex items-center gap-6 text-slate-400 font-medium">
                                                                {lesson.isFree ? (
                                                                    <div className="flex items-center gap-4">
                                                                        <span className="text-blue-600 underline cursor-pointer">Free Preview</span>
                                                                        <Unlock size={14} className="text-emerald-500" />
                                                                    </div>
                                                                ) : (
                                                                    <Lock size={14} className="text-slate-300" />
                                                                )}
                                                                <span>{lesson.duration ? `${Math.floor(lesson.duration/60)}m` : 'Video'}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 3. Requirements */}
                    <section id="requirements">
                        <h2 className="text-2xl font-semibold mb-6 tracking-tight">Requirements</h2>
                        <ul className="list-disc pl-5 space-y-2 text-sm font-medium text-slate-600 leading-relaxed">
                            {course.requirements?.length > 0 ? course.requirements.map((req, i) => (
                                <li key={i}>{req}</li>
                            )) : (
                                <li>No specific requirements listed.</li>
                            )}
                        </ul>
                    </section>

                    {/* 4. Description */}
                    <section id="description" className="space-y-6">
                        <h2 className="text-2xl font-semibold tracking-tight">Description</h2>
                        <div className={clsx(
                            "text-sm font-medium text-slate-600 leading-[1.8] space-y-4 relative overflow-hidden transition-all duration-500",
                            !showFullDescription && "max-h-[250px]"
                        )}>
                            <div dangerouslySetInnerHTML={{ __html: course.description?.replace(/\n/g, '<br />') || 'No description provided.' }} />
                            {!showFullDescription && (
                                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
                            )}
                        </div>
                        <button 
                            onClick={() => setShowFullDescription(!showFullDescription)}
                            className="text-blue-600 font-semibold text-xs uppercase tracking-widest flex items-center gap-2 hover:text-blue-700"
                        >
                            {showFullDescription ? 'Show less' : 'Show more'} 
                            {showFullDescription ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    </section>

                    {/* Instructor Actions (Moved from Sidebar) */}
                    <section id="instructor-actions" className="pt-8 border-t border-slate-200">
                        <h2 className="text-2xl font-semibold mb-6 tracking-tight">Instructor Controls</h2>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href={`/dashboard/instructor/edit/${course._id}`} className="flex-1">
                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 font-semibold text-sm transition-all rounded-sm shadow-lg flex items-center justify-center gap-2">
                                    <Edit3 size={18} /> Edit Curriculum
                                </button>
                            </Link>

                            <button className="flex-1 border border-slate-900 text-slate-900 py-4 font-semibold text-sm hover:bg-slate-50 transition-all rounded-sm flex items-center justify-center gap-2">
                                <Users size={18} /> Manage Students
                            </button>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
