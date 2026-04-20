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
    BookOpen
} from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';

export default function CoursePreviewModal({ course, isOpen, onClose }) {
    const [selectedModule, setSelectedModule] = useState(0);

    if (!course) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 md:p-10">
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
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
                    >
                        {/* Left: Course Info & Media */}
                        <div className="w-full md:w-2/3 overflow-y-auto bg-slate-50/50 p-8 md:p-12 space-y-8 scrollbar-hide">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-blue-200">
                                        {course.category}
                                    </span>
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">{course.title}</h2>
                                    <p className="text-slate-500 font-medium">by <span className="font-bold text-slate-800">{course.instructor?.name}</span></p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors md:hidden">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="aspect-video bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl relative group">
                                <img 
                                    src={course.thumbnail} 
                                    className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105" 
                                    alt="" 
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <button className="w-20 h-20 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center text-white scale-100 hover:scale-110 transition-transform shadow-2xl group/play">
                                        <Play size={32} className="fill-white translate-x-1 group-hover/play:scale-110 transition-transform" />
                                    </button>
                                </div>
                                <div className="absolute bottom-6 left-6 flex gap-4">
                                    <div className="px-4 py-2 bg-black/40 backdrop-blur-md border border-white/20 rounded-xl text-white text-xs font-bold flex items-center gap-2">
                                        <Monitor size={14} /> Course Preview
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <BookOpen size={20} className="text-blue-600" /> Description
                                </h3>
                                <p className="text-slate-600 leading-relaxed font-medium">
                                    {course.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                {[
                                    { label: 'Level', value: course.difficulty, icon: AlertCircle },
                                    { label: 'Modules', value: course.modules?.length || 0, icon: BookOpen },
                                    { label: 'Language', value: 'English', icon: Monitor },
                                    { label: 'Access', value: 'Lifetime', icon: Clock },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <stat.icon size={18} className="text-blue-600 mb-2" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                        <p className="text-sm font-black text-slate-900 capitalize">{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Curriculum Sidebar */}
                        <div className="w-full md:w-1/3 border-l border-slate-100 flex flex-col h-full bg-white">
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Curriculum</h3>
                                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors hidden md:block">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {course.modules?.length === 0 ? (
                                    <div className="text-center py-10 text-slate-400 font-medium italic">No modules added yet.</div>
                                ) : (
                                    course.modules?.map((module, mIndex) => (
                                        <div key={module._id} className="space-y-3">
                                            <div 
                                                className={clsx(
                                                    "p-4 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between",
                                                    selectedModule === mIndex 
                                                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" 
                                                        : "bg-slate-50 border-slate-50 text-slate-900 hover:border-blue-200"
                                                )}
                                                onClick={() => setSelectedModule(mIndex)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={clsx(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-colors",
                                                        selectedModule === mIndex ? "bg-white/20" : "bg-blue-50 text-blue-600"
                                                    )}>
                                                        {mIndex + 1}
                                                    </span>
                                                    <span className="font-bold text-sm tracking-tight">{module.title}</span>
                                                </div>
                                                <ChevronRight size={16} className={clsx("transition-transform", selectedModule === mIndex && "rotate-90")} />
                                            </div>

                                            <AnimatePresence>
                                                {selectedModule === mIndex && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="pl-4 space-y-2 overflow-hidden"
                                                    >
                                                        {module.lessons?.map((lesson, lIndex) => (
                                                            <div key={lesson._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                                                                <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                                    <Play size={12} className="fill-current" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-bold text-slate-800 truncate">{lesson.title}</p>
                                                                    <p className="text-[10px] text-slate-400 font-medium capitalize">{lesson.duration ? `${Math.floor(lesson.duration/60)}m` : 'Video'}</p>
                                                                </div>
                                                                {lesson.attachments?.length > 0 && <FileText size={12} className="text-slate-300" />}
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-8 bg-slate-50/50 border-t border-slate-100 space-y-4">
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => { onClose(); /* Handle Approval */ }}
                                        className="flex-1 bg-blue-600 py-4 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all hover:scale-[1.02]"
                                    >
                                        Approve Content
                                    </button>
                                </div>
                                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">Only approved content is public</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
