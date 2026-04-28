'use client';
import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  ChevronRight,
  Send,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/UIElements';
import api from '@/services/api';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function QnASection({ selectedCourse }) {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unanswered
    const [replyText, setReplyText] = useState('');
    const [activeQuestion, setActiveQuestion] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, [selectedCourse, filter]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const courseParam = selectedCourse === 'all' ? '' : `courseId=${selectedCourse}`;
            const statusParam = filter === 'unanswered' ? '&status=unanswered' : '';
            const res = await api.get(`/communication/qna?${courseParam}${statusParam}`);
            setQuestions(res.data.data);
        } catch (err) {
            console.error('Failed to fetch Q&A:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (qId) => {
        if (!replyText.trim()) return;
        setSubmitting(true);
        try {
            await api.post(`/communication/qna/${qId}/reply`, { text: replyText });
            setReplyText('');
            fetchQuestions();
        } catch (err) {
            console.error('Failed to reply:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Questions List */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setFilter('all')}
                            className={clsx(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                filter === 'all' ? "bg-[#071739] text-white" : "text-slate-400 hover:text-slate-900"
                            )}
                        >
                            All Questions
                        </button>
                        <button 
                            onClick={() => setFilter('unanswered')}
                            className={clsx(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                filter === 'unanswered' ? "bg-orange-500 text-white" : "text-slate-400 hover:text-slate-900"
                            )}
                        >
                            Unanswered
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#071739]" /></div>
                ) : questions.length === 0 ? (
                    <Card className="p-20 text-center flex flex-col items-center border-slate-50">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-6">
                            <HelpCircle size={40} />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900">No questions yet</h3>
                        <p className="text-slate-400 font-medium mt-2">Questions from your courses will appear here.</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {questions.map((q) => (
                            <Card 
                                key={q._id} 
                                className={clsx(
                                    "p-6 cursor-pointer transition-all border-slate-50 hover:border-[#071739]/10 group",
                                    activeQuestion?._id === q._id ? "ring-2 ring-[#071739]/5 shadow-2xl" : "hover:shadow-xl"
                                )}
                                onClick={() => setActiveQuestion(q)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0">
                                        <img src={q.student.profilePhoto || `https://ui-avatars.com/api/?name=${q.student.name}&background=071739&color=fff`} alt="Student" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-slate-900 text-sm">{q.student.name}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                                    {q.course.title} • {q.lesson?.title || 'Course General'}
                                                </p>
                                            </div>
                                            {q.isAnswered ? (
                                                <span className="flex items-center gap-1 text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                                    <CheckCircle2 size={10} /> Answered
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[8px] font-black uppercase text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                                                    <Clock size={10} /> Needs Reply
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-4 text-slate-700 text-sm font-medium leading-relaxed italic">"{q.question}"</p>
                                        <div className="mt-6 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(q.createdAt).toLocaleDateString()}</span>
                                                <span className="text-[10px] text-slate-400 font-bold">•</span>
                                                <span className="text-[10px] text-[#071739] font-bold uppercase tracking-widest">{q.replies.length} Replies</span>
                                            </div>
                                            <button className="text-[#071739] hover:translate-x-1 transition-transform">
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Thread Details / Reply Section */}
            <div className="space-y-6">
                <AnimatePresence mode="wait">
                    {activeQuestion ? (
                        <motion.div
                            key={activeQuestion._id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <Card className="p-8 border-[#071739]/10 shadow-2xl sticky top-24">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-[#071739] text-white flex items-center justify-center font-bold text-xs">
                                        Q
                                    </div>
                                    <h3 className="font-semibold text-slate-900 text-lg">Question Thread</h3>
                                </div>

                                <div className="space-y-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {/* The original question */}
                                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                        <p className="text-sm font-semibold text-slate-800 leading-relaxed italic">"{activeQuestion.question}"</p>
                                        <div className="mt-4 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-slate-200 overflow-hidden">
                                                <img src={activeQuestion.student.profilePhoto} alt="" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeQuestion.student.name}</span>
                                        </div>
                                    </div>

                                    {/* Replies */}
                                    {activeQuestion.replies.map((reply, i) => (
                                        <div key={i} className={clsx(
                                            "flex flex-col gap-2",
                                            reply.user === activeQuestion.instructor ? "items-end" : "items-start"
                                        )}>
                                            <div className={clsx(
                                                "max-w-[90%] p-4 rounded-2xl text-xs font-medium",
                                                reply.user === activeQuestion.instructor 
                                                    ? "bg-[#071739] text-white rounded-br-none" 
                                                    : "bg-white border border-slate-100 text-slate-800 rounded-bl-none shadow-sm"
                                            )}>
                                                {reply.text}
                                            </div>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                                {reply.user === activeQuestion.instructor ? 'You' : 'Student'} • {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Reply Input */}
                                <div className="mt-8 pt-8 border-t border-slate-100">
                                    <textarea 
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#071739]/5 transition-all resize-none"
                                        placeholder="Write your reply..."
                                        rows={3}
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                    />
                                    <button 
                                        onClick={() => handleReply(activeQuestion._id)}
                                        disabled={submitting || !replyText.trim()}
                                        className="w-full mt-4 bg-[#071739] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-slate-900/10"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                                        Post Reply
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    ) : (
                        <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed border-slate-200 bg-slate-50/50 h-[600px]">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-100 mb-6 shadow-sm">
                                <MessageSquare size={40} />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-400">Select a question to view <br/> the full discussion</h3>
                        </Card>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
