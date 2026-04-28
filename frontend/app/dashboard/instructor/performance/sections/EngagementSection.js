'use client';
import { useState, useEffect } from 'react';
import { 
  Target, 
  Activity, 
  BookOpen, 
  HelpCircle, 
  Trophy, 
  Loader2,
  TrendingUp,
  Clock,
  ArrowUpRight,
  BarChart2
} from 'lucide-react';
import { Card } from '@/components/UIElements';
import api from '@/services/api';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function EngagementSection({ selectedCourse }) {
    const [subSection, setSubSection] = useState('course'); // course, quiz
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEngagement = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/performance/engagement?courseId=${selectedCourse}`);
                setData(res.data.data);
            } catch (err) {
                console.error('Failed to fetch engagement stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEngagement();
    }, [selectedCourse]);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#071739]" size={32} /></div>;

    return (
        <div className="space-y-10">
            {/* Sub-tabs */}
            <div className="flex items-center gap-4 bg-slate-100/50 p-2 rounded-3xl w-fit">
                <button 
                    onClick={() => setSubSection('course')}
                    className={clsx(
                        "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                        subSection === 'course' ? "bg-white text-[#071739] shadow-sm" : "text-slate-400 hover:text-slate-900"
                    )}
                >
                    <BookOpen size={16} /> Course Engagement
                </button>
                <button 
                    onClick={() => setSubSection('quiz')}
                    className={clsx(
                        "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                        subSection === 'quiz' ? "bg-white text-[#071739] shadow-sm" : "text-slate-400 hover:text-slate-900"
                    )}
                >
                    <Trophy size={16} /> Practice Test Insights
                </button>
            </div>

            <AnimatePresence mode="wait">
                {subSection === 'course' ? (
                    <motion.div 
                        key="course"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-8"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <Card className="p-8 border-slate-50">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Avg Watch Time</h4>
                                <div className="text-4xl font-semibold text-[#071739]">42m</div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Per student session</p>
                            </Card>
                            <Card className="p-8 border-slate-50">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Lesson Completion</h4>
                                <div className="text-4xl font-semibold text-emerald-600">76%</div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Across all modules</p>
                            </Card>
                            <Card className="p-8 border-slate-50">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Bookmarks</h4>
                                <div className="text-4xl font-semibold text-orange-600">284</div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Lifetime saved lessons</p>
                            </Card>
                        </div>

                        <Card className="p-8 border-slate-50">
                            <h3 className="text-xl font-semibold text-slate-900 mb-8">Most Engaging Lessons</h3>
                            <div className="space-y-4">
                                {data?.lessonEngagement.map((lesson, i) => (
                                    <div key={i} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                        <div className="w-10 h-10 rounded-xl bg-[#071739]/5 text-[#071739] flex items-center justify-center font-black text-xs">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="text-sm font-semibold text-slate-800">{lesson.title}</h5>
                                            <div className="flex items-center gap-4 mt-1">
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                                                    <Clock size={12} /> 12:45m avg
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold">
                                                    <Activity size={12} /> {lesson.completionCount} completions
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-[#071739] bg-[#071739]/5 px-3 py-1.5 rounded-lg uppercase">Trending</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="quiz"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-8"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Attempts', value: data?.quizPerformance.reduce((acc, q) => acc + q.attempts, 0), icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Avg Quiz Score', value: `${(data?.quizPerformance.reduce((acc, q) => acc + q.avgScore, 0) / (data?.quizPerformance.length || 1)).toFixed(1)}%`, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50' },
                                { label: 'Pass Rate', value: '82%', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { label: 'Weak Topics', value: '3', icon: HelpCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
                            ].map((item, i) => (
                                <Card key={i} className="p-6 border-slate-50">
                                    <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center mb-4", item.bg, item.color)}>
                                        <item.icon size={20} />
                                    </div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</h4>
                                    <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
                                </Card>
                            ))}
                        </div>

                        <Card className="p-8 border-slate-50 overflow-hidden">
                            <h3 className="text-xl font-semibold text-slate-900 mb-8">Practice Test Breakdown</h3>
                            <div className="space-y-8">
                                {data?.quizPerformance.map((quiz, i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <h5 className="text-sm font-semibold text-slate-800">{quiz.title}</h5>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{quiz.attempts} total attempts</p>
                                            </div>
                                            <span className="text-xs font-black text-[#071739]">{quiz.avgScore.toFixed(1)}% Avg</span>
                                        </div>
                                        <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${quiz.avgScore}%` }}
                                                className="h-full bg-[#071739] rounded-full"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
