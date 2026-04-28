'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Play, 
    FileText, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    ChevronRight,
    Monitor,
    BookOpen,
    Star
} from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';

export default function CoursePreviewModal({ course, isOpen, onClose, onApprove, onReject }) {
    const [selectedModule, setSelectedModule] = useState(0);

    if (!course) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="relative w-screen h-screen bg-white overflow-hidden flex flex-col"
                    >
                        {/* Immersive Hero Section */}
                        <div className="bg-[#071739] text-white p-12 md:p-20 relative overflow-hidden shrink-0">
                            <div className="max-w-7xl mx-auto space-y-8 relative z-10">
                                {/* Breadcrumbs */}
                                <div className="flex items-center gap-2 text-white/60 font-black text-[10px] uppercase tracking-[0.2em]">
                                    <span>{course.category?.name ?? course.category}</span>
                                    <ChevronRight size={14} />
                                    <span>{(course.subcategory?.name ?? course.subcategory) || 'Advanced Curriculum'}</span>
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">{course.title}</h2>
                                    <p className="text-xl text-white/80 font-medium max-w-2xl">{course.subtitle || course.tagline}</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-white/20 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider">Premium Content</span>
                                        <div className="flex items-center gap-1.5 text-white">
                                            <span className="font-black text-lg">4.9</span>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold text-white/80 hover:text-white cursor-pointer transition-colors border-b border-white/20 pb-0.5">Created by {course.instructor?.name || 'Expert Academic'}</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-8 text-xs font-bold text-white/60">
                                    <div className="flex items-center gap-2.5">
                                        <AlertCircle size={16} className="text-white/40" />
                                        <span>Last updated {new Date(course.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <Monitor size={16} className="text-white/40" />
                                        <span>{course.language || 'English'} (Instruction)</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <BookOpen size={16} className="text-white/40" />
                                        <span>{course.modules?.length || 0} Professional Modules</span>
                                    </div>
                                </div>

                                {/* Pricing Tag */}
                                <div className="flex items-baseline gap-6 pt-6">
                                    <span className="text-5xl font-black text-white">₹{course.discountPrice || course.price}</span>
                                    {course.discountPrice && (
                                        <span className="text-2xl text-white/30 line-through font-bold">₹{course.price}</span>
                                    )}
                                    <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                        <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                                            {course.discountPrice ? `${Math.round(((course.price - course.discountPrice) / course.price) * 100)}% Savings` : 'Professional Standard'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none"></div>
                            
                            <button onClick={onClose} className="absolute top-12 right-12 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all group active:scale-95 shadow-2xl backdrop-blur-md">
                                <X size={32} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                            {/* Main Content Area */}
                            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 scrollbar-hide">
                                {/* What You'll Learn Section */}
                                {course.whatYouWillLearn?.length > 0 && (
                                    <div className="space-y-8">
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">What you'll learn</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                            {course.whatYouWillLearn.map((point, i) => (
                                                <div key={i} className="flex gap-4 text-base font-medium text-slate-600 leading-relaxed">
                                                    <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0 mt-1" />
                                                    {point}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Course Requirements */}
                                {course.requirements?.length > 0 && (
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-black text-slate-900">Requirements</h3>
                                        <ul className="space-y-3">
                                            {course.requirements.map((req, i) => (
                                                <li key={i} className="flex items-center gap-4 text-sm font-medium text-slate-600">
                                                    <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
                                                    {req}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Detailed Description */}
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-black text-slate-900">Description</h3>
                                    <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed">
                                        {course.description}
                                    </div>
                                </div>
                            </div>

                            {/* Curriculum Sidebar */}
                            <div className="w-full md:w-96 border-l border-slate-100 bg-slate-50/50 flex flex-col overflow-hidden">
                                <div className="p-8 border-b border-slate-100 bg-white">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Course Content</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                        {course.modules?.length || 0} sections • {course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} lectures
                                    </p>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                                    {course.modules?.map((module, mIndex) => (
                                        <div key={module._id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                                            <div 
                                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                                onClick={() => setSelectedModule(selectedModule === mIndex ? -1 : mIndex)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-black text-slate-400">{(mIndex + 1).toString().padStart(2, '0')}</span>
                                                    <span className="font-bold text-sm text-slate-900">{module.title}</span>
                                                </div>
                                                <ChevronRight size={16} className={clsx("text-slate-300 transition-transform duration-300", selectedModule === mIndex && "rotate-90")} />
                                            </div>

                                            <AnimatePresence>
                                                {selectedModule === mIndex && (
                                                    <motion.div 
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="px-4 pb-4 space-y-2 overflow-hidden border-t border-slate-50 pt-2"
                                                    >
                                                        {module.lessons?.map((lesson) => (
                                                            <div key={lesson._id} className="flex items-center gap-3 py-2 text-xs font-medium text-slate-500">
                                                                <Play size={12} className="text-slate-300" />
                                                                <span className="flex-1">{lesson.title}</span>
                                                            </div>
                                                        ))}
                                                        {module.quizzes?.map((quiz) => (
                                                            <div key={quiz._id} className="flex items-center gap-3 py-2 text-xs font-medium text-amber-600">
                                                                <HelpCircle size={12} />
                                                                <span className="flex-1">Quiz: {quiz.title}</span>
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>

                                {(onApprove || onReject) && (
                                    <div className="p-6 bg-white border-t border-slate-100">
                                        <div className="flex gap-3">
                                            {onApprove && (
                                                <button 
                                                    onClick={() => { 
                                                        onApprove(course._id);
                                                        onClose(); 
                                                    }}
                                                    className="flex-1 bg-emerald-600 py-4 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle2 size={16} /> Approve
                                                </button>
                                            )}
                                            {onReject && (
                                                <button 
                                                    onClick={() => { 
                                                        onReject(course);
                                                        onClose(); 
                                                    }}
                                                    className="flex-1 bg-rose-500 py-4 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-100 hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <X size={16} /> Reject
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
