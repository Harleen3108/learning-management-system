'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Check, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import api from '@/services/api';

// EduFlow palette: navy #071739, tan #A68868. font-semibold/font-medium typography.

const PREFERENCES = [
    { id: 'newsletter',      label: 'Weekly newsletter',  hint: 'Curated picks every week' },
    { id: 'new_courses',     label: 'New course alerts',  hint: 'Hear about fresh launches' },
    { id: 'offers',          label: 'Discounts & offers', hint: 'Member-only deals' },
    { id: 'learning_tips',   label: 'Learning tips',      hint: 'Productivity & study advice' },
    { id: 'product_updates', label: 'Product updates',    hint: "What's new on EduFlow" }
];

const INTERESTS = ['AI', 'Design', 'Development', 'Marketing', 'Business', 'Data'];

export default function SubscribeModal({ isOpen, onClose }) {
    const [step, setStep] = useState(1); // 1: email+name, 2: prefs+interests, 3: success
    const [form, setForm] = useState({
        name: '',
        email: '',
        preferences: ['newsletter', 'new_courses'], // sensible defaults
        categoryInterests: []
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const reset = () => {
        setStep(1);
        setForm({ name: '', email: '', preferences: ['newsletter', 'new_courses'], categoryInterests: [] });
        setError('');
        setResult(null);
    };

    const close = () => { onClose(); setTimeout(reset, 300); };

    const togglePref = (id) =>
        setForm(f => ({ ...f, preferences: f.preferences.includes(id) ? f.preferences.filter(p => p !== id) : [...f.preferences, id] }));

    const toggleInterest = (name) =>
        setForm(f => ({ ...f, categoryInterests: f.categoryInterests.includes(name) ? f.categoryInterests.filter(c => c !== name) : [...f.categoryInterests, name] }));

    const submit = async () => {
        setError('');
        if (!form.email.includes('@')) return setError('Please enter a valid email.');
        if (form.preferences.length === 0) return setError('Pick at least one preference.');

        setSubmitting(true);
        try {
            const res = await api.post('/subscribers/subscribe', {
                email: form.email,
                name: form.name,
                preferences: form.preferences,
                categoryInterests: form.categoryInterests,
                source: 'website'
            });
            setResult(res.data);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Subscription failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={close}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="px-6 pt-6 pb-4 border-b border-slate-100 shrink-0 flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A68868] mb-1">
                                    {step === 3 ? 'You\'re in!' : 'Stay updated'}
                                </p>
                                <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
                                    {step === 1 && 'Subscribe to EduFlow'}
                                    {step === 2 && 'Tailor your updates'}
                                    {step === 3 && 'Welcome aboard'}
                                </h2>
                            </div>
                            <button onClick={close} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
                            {step === 1 && (
                                <div className="space-y-5">
                                    <p className="text-sm text-slate-500 font-medium">
                                        Get fresh courses, learning tips, and member-only offers. Unsubscribe anytime.
                                    </p>
                                    <Field label="Full name (optional)">
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder="Your name"
                                            className={inputCls}
                                        />
                                    </Field>
                                    <Field label="Email address" required>
                                        <div className="relative">
                                            <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="email"
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                placeholder="you@example.com"
                                                className={clsx(inputCls, 'pl-11')}
                                            />
                                        </div>
                                    </Field>
                                    {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">What do you want to receive?</p>
                                        <div className="space-y-2">
                                            {PREFERENCES.map(p => {
                                                const active = form.preferences.includes(p.id);
                                                return (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => togglePref(p.id)}
                                                        className={clsx(
                                                            'w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all',
                                                            active ? 'border-[#071739] bg-[#071739]/5' : 'border-slate-100 hover:border-slate-200'
                                                        )}
                                                    >
                                                        <div className={clsx(
                                                            'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
                                                            active ? 'border-[#071739] bg-[#071739]' : 'border-slate-300'
                                                        )}>
                                                            {active && <Check size={11} className="text-white" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-slate-900">{p.label}</p>
                                                            <p className="text-xs text-slate-500 font-medium mt-0.5">{p.hint}</p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Topics you care about (optional)</p>
                                        <div className="flex flex-wrap gap-2">
                                            {INTERESTS.map(i => {
                                                const active = form.categoryInterests.includes(i);
                                                return (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => toggleInterest(i)}
                                                        className={clsx(
                                                            'px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border',
                                                            active
                                                                ? 'bg-[#A68868] text-white border-[#A68868]'
                                                                : 'bg-white text-slate-600 border-slate-200 hover:border-[#A68868]/40'
                                                        )}
                                                    >
                                                        {i}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}
                                </div>
                            )}

                            {step === 3 && result && (
                                <div className="text-center py-6 space-y-5">
                                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                        <Sparkles size={28} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-700 font-medium leading-relaxed">
                                            {result.message}
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium mt-3">
                                            We've sent a quick welcome to <span className="font-semibold text-slate-900">{result.data?.email}</span>.
                                        </p>
                                    </div>
                                    {result.data?.manageUrl && (
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-left">
                                            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Manage anytime</p>
                                            <a
                                                href={result.data.manageUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs font-medium text-[#071739] break-all hover:underline"
                                            >
                                                {result.data.manageUrl}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex items-center justify-between gap-2">
                            {step === 1 && (
                                <>
                                    <button onClick={close} className="px-4 py-2 text-slate-500 font-semibold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl">Maybe later</button>
                                    <button
                                        onClick={() => {
                                            if (!form.email.includes('@')) return setError('Please enter a valid email.');
                                            setError('');
                                            setStep(2);
                                        }}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-[#071739] hover:bg-[#020a1a] text-white rounded-xl font-semibold text-xs uppercase tracking-widest transition-all"
                                    >
                                        Continue <ArrowRight size={13} />
                                    </button>
                                </>
                            )}
                            {step === 2 && (
                                <>
                                    <button onClick={() => setStep(1)} className="px-4 py-2 text-slate-500 font-semibold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl">Back</button>
                                    <button
                                        onClick={submit}
                                        disabled={submitting}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-[#071739] hover:bg-[#020a1a] text-white rounded-xl font-semibold text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                                    >
                                        {submitting && <Loader2 size={13} className="animate-spin" />}
                                        Subscribe
                                    </button>
                                </>
                            )}
                            {step === 3 && (
                                <button
                                    onClick={close}
                                    className="ml-auto px-5 py-2.5 bg-[#071739] hover:bg-[#020a1a] text-white rounded-xl font-semibold text-xs uppercase tracking-widest transition-all"
                                >
                                    Done
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

const inputCls = "w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-[#071739]/10 focus:border-[#071739]/20 focus:bg-white transition-all";

function Field({ label, required, children }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            {children}
        </div>
    );
}
