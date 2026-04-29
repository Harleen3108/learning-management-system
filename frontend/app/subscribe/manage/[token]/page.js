'use client';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, Loader2, AlertCircle, Sparkles, ArrowRight, X, ShieldCheck, Frown } from 'lucide-react';
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

export default function ManageSubscriptionPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = params?.token;
    const action = searchParams?.get('action');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [subscriber, setSubscriber] = useState(null);
    const [form, setForm] = useState({ preferences: [], categoryInterests: [] });
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState(null);
    const [unsubscribing, setUnsubscribing] = useState(false);
    const [confirmUnsub, setConfirmUnsub] = useState(false);

    // Load subscriber by token
    useEffect(() => {
        if (!token) return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError('');
            try {
                const res = await api.get(`/subscribers/manage/${token}`);
                if (cancelled) return;
                const sub = res.data?.data;
                setSubscriber(sub);
                setForm({
                    preferences: sub?.preferences || [],
                    categoryInterests: sub?.categoryInterests || []
                });
                // If ?action=unsubscribe and still active, prompt confirm
                if (action === 'unsubscribe' && sub?.status === 'active') {
                    setConfirmUnsub(true);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.response?.data?.message || 'This link is invalid or has expired.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [token, action]);

    const togglePref = (id) =>
        setForm(f => ({ ...f, preferences: f.preferences.includes(id) ? f.preferences.filter(p => p !== id) : [...f.preferences, id] }));

    const toggleInterest = (name) =>
        setForm(f => ({ ...f, categoryInterests: f.categoryInterests.includes(name) ? f.categoryInterests.filter(c => c !== name) : [...f.categoryInterests, name] }));

    const savePreferences = async () => {
        if (!token) return;
        setSaving(true);
        setError('');
        try {
            const res = await api.put(`/subscribers/manage/${token}`, {
                preferences: form.preferences,
                categoryInterests: form.categoryInterests
            });
            setSubscriber(res.data?.data || subscriber);
            setSavedAt(new Date());
        } catch (err) {
            setError(err.response?.data?.message || 'Could not save your preferences.');
        } finally {
            setSaving(false);
        }
    };

    const doUnsubscribe = async () => {
        if (!token) return;
        setUnsubscribing(true);
        setError('');
        try {
            const res = await api.post(`/subscribers/manage/${token}/unsubscribe`);
            setSubscriber(res.data?.data || { ...subscriber, status: 'unsubscribed' });
            setConfirmUnsub(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not unsubscribe right now.');
        } finally {
            setUnsubscribing(false);
        }
    };

    const resubscribe = async () => {
        if (!token) return;
        setSaving(true);
        try {
            const res = await api.put(`/subscribers/manage/${token}`, {
                preferences: form.preferences.length ? form.preferences : ['newsletter'],
                categoryInterests: form.categoryInterests,
                status: 'active'
            });
            setSubscriber(res.data?.data || subscriber);
            setSavedAt(new Date());
        } catch (err) {
            setError(err.response?.data?.message || 'Could not reactivate your subscription.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12 px-4">
            {/* Header */}
            <div className="max-w-3xl mx-auto mb-8">
                <Link href="/" className="inline-flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-full bg-[#071739] flex items-center justify-center shadow-lg">
                        <Mail size={18} className="text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A68868] leading-none">EduFlow</p>
                        <p className="text-base font-semibold text-slate-900 tracking-tight leading-tight mt-0.5">Manage subscription</p>
                    </div>
                </Link>
            </div>

            <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                {loading && (
                    <div className="p-12 flex flex-col items-center justify-center text-center gap-3">
                        <Loader2 size={32} className="text-[#071739] animate-spin" />
                        <p className="text-sm font-medium text-slate-500">Loading your preferences…</p>
                    </div>
                )}

                {!loading && error && !subscriber && (
                    <div className="p-12 flex flex-col items-center justify-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center">
                            <AlertCircle size={28} />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-slate-900">Something went wrong</p>
                            <p className="text-sm text-slate-500 font-medium mt-1">{error}</p>
                        </div>
                        <Link
                            href="/"
                            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-[#071739] hover:bg-[#020a1a] text-white rounded-xl font-semibold text-xs uppercase tracking-widest"
                        >
                            Back to EduFlow <ArrowRight size={13} />
                        </Link>
                    </div>
                )}

                {!loading && subscriber && (
                    <div>
                        {/* Status banner */}
                        <div className={clsx(
                            'px-8 py-5 border-b flex items-center gap-3',
                            subscriber.status === 'active'
                                ? 'bg-emerald-50/60 border-emerald-100'
                                : 'bg-rose-50/60 border-rose-100'
                        )}>
                            <div className={clsx(
                                'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
                                subscriber.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'
                            )}>
                                {subscriber.status === 'active' ? <ShieldCheck size={16} /> : <Frown size={16} />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Subscribed as</p>
                                <p className="text-sm font-semibold text-slate-900 truncate">{subscriber.email}</p>
                            </div>
                            <span className={clsx(
                                'shrink-0 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest',
                                subscriber.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-rose-100 text-rose-600'
                            )}>
                                {subscriber.status === 'active' ? 'Active' : 'Unsubscribed'}
                            </span>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-8">
                            {subscriber.status === 'unsubscribed' && (
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-start gap-3">
                                    <Sparkles size={18} className="text-[#A68868] shrink-0 mt-0.5" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-slate-900">You're not receiving emails right now.</p>
                                        <p className="text-xs text-slate-500 font-medium mt-1">
                                            Changed your mind? Reactivate your subscription and we'll start sending the things you care about again.
                                        </p>
                                        <button
                                            onClick={resubscribe}
                                            disabled={saving}
                                            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#071739] hover:bg-[#020a1a] text-white rounded-xl font-semibold text-xs uppercase tracking-widest disabled:opacity-50"
                                        >
                                            {saving && <Loader2 size={13} className="animate-spin" />}
                                            Resubscribe
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Preferences */}
                            <section>
                                <div className="flex items-baseline justify-between mb-4">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A68868]">What you receive</p>
                                        <h2 className="text-lg font-semibold text-slate-900 tracking-tight mt-0.5">Email preferences</h2>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {PREFERENCES.map(p => {
                                        const active = form.preferences.includes(p.id);
                                        return (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => togglePref(p.id)}
                                                disabled={subscriber.status !== 'active'}
                                                className={clsx(
                                                    'w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all',
                                                    active ? 'border-[#071739] bg-[#071739]/5' : 'border-slate-100 hover:border-slate-200',
                                                    subscriber.status !== 'active' && 'opacity-60 cursor-not-allowed'
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
                            </section>

                            {/* Interests */}
                            <section>
                                <div className="mb-4">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A68868]">Topics</p>
                                    <h2 className="text-lg font-semibold text-slate-900 tracking-tight mt-0.5">What you care about</h2>
                                    <p className="text-xs text-slate-500 font-medium mt-1">Pick a few topics so we can tailor what we send you.</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {INTERESTS.map(i => {
                                        const active = form.categoryInterests.includes(i);
                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => toggleInterest(i)}
                                                disabled={subscriber.status !== 'active'}
                                                className={clsx(
                                                    'px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all border',
                                                    active
                                                        ? 'bg-[#A68868] text-white border-[#A68868]'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#A68868]/40',
                                                    subscriber.status !== 'active' && 'opacity-60 cursor-not-allowed'
                                                )}
                                            >
                                                {i}
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                            {error && (
                                <p className="text-xs font-semibold text-rose-500">{error}</p>
                            )}

                            {savedAt && !error && (
                                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                                    <Check size={14} />
                                    Preferences saved at {savedAt.toLocaleTimeString()}
                                </div>
                            )}
                        </div>

                        {/* Footer actions */}
                        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            {subscriber.status === 'active' ? (
                                <>
                                    <button
                                        onClick={() => setConfirmUnsub(true)}
                                        className="text-xs font-semibold uppercase tracking-widest text-rose-500 hover:text-rose-600"
                                    >
                                        Unsubscribe from all emails
                                    </button>
                                    <button
                                        onClick={savePreferences}
                                        disabled={saving}
                                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#071739] hover:bg-[#020a1a] text-white rounded-xl font-semibold text-xs uppercase tracking-widest disabled:opacity-50"
                                    >
                                        {saving && <Loader2 size={13} className="animate-spin" />}
                                        Save preferences
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/"
                                    className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs uppercase tracking-widest"
                                >
                                    Back to EduFlow
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <p className="max-w-3xl mx-auto mt-6 text-center text-xs text-slate-400 font-medium">
                Need help? Reach us at <a href="mailto:support@eduflow.com" className="text-[#071739] font-semibold hover:underline">support@eduflow.com</a>
            </p>

            {/* Unsubscribe confirm modal */}
            <AnimatePresence>
                {confirmUnsub && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => !unsubscribing && setConfirmUnsub(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-rose-500 mb-1">Confirm</p>
                                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Unsubscribe from EduFlow?</h2>
                                </div>
                                <button
                                    onClick={() => !unsubscribing && setConfirmUnsub(false)}
                                    className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="px-6 py-5 space-y-3">
                                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                    You'll stop receiving newsletters, course alerts, and offers at{' '}
                                    <span className="font-semibold text-slate-900">{subscriber?.email}</span>.
                                </p>
                                <p className="text-xs text-slate-500 font-medium">You can resubscribe any time using this same link.</p>
                            </div>
                            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-2">
                                <button
                                    onClick={() => !unsubscribing && setConfirmUnsub(false)}
                                    className="px-4 py-2 text-slate-500 font-semibold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl"
                                >
                                    Keep me subscribed
                                </button>
                                <button
                                    onClick={doUnsubscribe}
                                    disabled={unsubscribing}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-xs uppercase tracking-widest disabled:opacity-50"
                                >
                                    {unsubscribing && <Loader2 size={13} className="animate-spin" />}
                                    Unsubscribe
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
