'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

const categories = [
    { id: 'quality', label: 'Audio/Video Quality', icon: '🎥' },
    { id: 'content', label: 'Content Accuracy', icon: '📖' },
    { id: 'policy', label: 'Policy Violation', icon: '⚖️' },
    { id: 'other', label: 'Other', icon: '📝' },
];

export default function RejectFeedbackModal({ isOpen, onClose, onSubmit, courseName }) {
    const [feedback, setFeedback] = useState('');
    const [category, setCategory] = useState('quality');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        await onSubmit(feedback, category);
        setSubmitting(false);
        setFeedback('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                    />

                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-10"
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-inner">
                                    <AlertCircle size={26} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Reject Course</h2>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Reviewing: {courseName}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rejection Category</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategory(cat.id)}
                                            className={clsx(
                                                "p-4 rounded-2xl border text-sm font-bold flex flex-col items-center gap-2 transition-all",
                                                category === cat.id 
                                                    ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200" 
                                                    : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                                            )}
                                        >
                                            <span className="text-xl">{cat.icon}</span>
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Feedback</label>
                                <div className="relative group">
                                    <textarea
                                        required
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Explain what needs to be improved..."
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all min-h-[150px] resize-none"
                                    />
                                    <MessageSquare size={16} className="absolute bottom-4 right-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-4 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={clsx(
                                        "flex-[2] py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                                        submitting 
                                            ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                                            : "bg-rose-500 text-white shadow-lg shadow-rose-100 hover:bg-rose-600 hover:scale-[1.02]"
                                    )}
                                >
                                    {submitting ? 'Sending...' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
