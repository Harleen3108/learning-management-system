'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Megaphone, Plus, Edit2, Trash2, Power, X, Loader2, Zap, Tag, Rocket, PartyPopper, Info, Wrench, Clock, ExternalLink, Eye, EyeOff, Calendar, Sparkles
} from 'lucide-react';
import { clsx } from 'clsx';
import api from '@/services/api';

// EduFlow palette: navy #071739, tan #A68868. font-semibold/font-medium typography only.

const THEME_OPTIONS = [
    { id: 'flash',       label: 'Flash sale',  Icon: Zap,         chipBg: '#A68868', chipText: '#ffffff', accent: '#A68868' },
    { id: 'offer',       label: 'Offer',       Icon: Tag,         chipBg: '#A68868', chipText: '#ffffff', accent: '#A68868' },
    { id: 'launch',      label: 'Launch',      Icon: Rocket,      chipBg: '#ffffff', chipText: '#071739', accent: '#fef3c7' },
    { id: 'holiday',     label: 'Holiday',     Icon: PartyPopper, chipBg: '#f472b6', chipText: '#ffffff', accent: '#fbcfe8' },
    { id: 'info',        label: 'Info',        Icon: Info,        chipBg: '#A68868', chipText: '#ffffff', accent: '#A68868' },
    { id: 'maintenance', label: 'Maintenance', Icon: Wrench,      chipBg: '#f87171', chipText: '#ffffff', accent: '#fecaca' }
];

const themeOf = (id) => THEME_OPTIONS.find(t => t.id === id) || THEME_OPTIONS[0];

// ──────────────────────────────────────────────
// Public-bar preview block — mirrors AnnouncementBar.js
// ──────────────────────────────────────────────
function PreviewBar({ form }) {
    const t = themeOf(form.theme);
    const Icon = t.Icon;
    const [diff, setDiff] = useState(null);

    useEffect(() => {
        if (!form.countdownTo) { setDiff(null); return; }
        const target = new Date(form.countdownTo).getTime();
        const tick = () => {
            const ms = Math.max(0, target - Date.now());
            const totalSec = Math.floor(ms / 1000);
            const days  = Math.floor(totalSec / 86400);
            const hours = Math.floor((totalSec % 86400) / 3600);
            const minutes = Math.floor((totalSec % 3600) / 60);
            const seconds = totalSec % 60;
            setDiff({ days, hours, minutes, seconds });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [form.countdownTo]);

    const message = form.message || 'Your announcement preview will appear here…';

    return (
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-[#071739] text-white">
            <div className="px-6 py-3 flex flex-col md:flex-row items-center justify-center gap-4 text-center relative">
                <div className="flex items-center gap-3">
                    <div className="p-1 rounded-md flex items-center justify-center" style={{ background: t.chipBg, color: t.chipText }}>
                        <Icon size={14} />
                    </div>
                    <p className="text-sm font-semibold tracking-tight">
                        <span style={{ color: t.accent }} className="font-semibold">{message}</span>
                        {form.countdownTo && diff && (
                            <span className="ml-2 font-mono bg-white/10 px-2 py-0.5 rounded text-xs" style={{ color: t.accent }}>
                                {diff.days > 0 && <>{String(diff.days).padStart(2, '0')}d </>}
                                {String(diff.hours).padStart(2, '0')}h {String(diff.minutes).padStart(2, '0')}m {String(diff.seconds).padStart(2, '0')}s
                            </span>
                        )}
                    </p>
                </div>
                {form.ctaText && form.ctaHref && (
                    <span className="text-xs font-semibold uppercase tracking-widest bg-[#A68868] text-white px-4 py-1.5 rounded">{form.ctaText}</span>
                )}
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60">
                    <X size={18} />
                </span>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────
export default function AdminAnnouncementsPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [composer, setComposer] = useState(null); // null | { isNew, data }
    const [confirmDelete, setConfirmDelete] = useState(null);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await api.get('/site-announcements');
            setItems(res.data?.data || []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Could not load announcements.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const openCreate = () => setComposer({
        isNew: true,
        data: { message: '', theme: 'flash', ctaText: '', ctaHref: '', countdownTo: '', expiresAt: '', isActive: true, priority: 0 }
    });

    const openEdit = (a) => setComposer({
        isNew: false,
        data: {
            _id: a._id,
            message: a.message || '',
            theme: a.theme || 'flash',
            ctaText: a.ctaText || '',
            ctaHref: a.ctaHref || '',
            countdownTo: a.countdownTo ? new Date(a.countdownTo).toISOString().slice(0, 16) : '',
            expiresAt: a.expiresAt ? new Date(a.expiresAt).toISOString().slice(0, 16) : '',
            isActive: a.isActive,
            priority: a.priority || 0
        }
    });

    const toggleActive = async (a) => {
        try {
            const res = await api.patch(`/site-announcements/${a._id}/toggle`);
            setItems(prev => prev.map(x => x._id === a._id ? res.data.data : x));
        } catch (err) {
            setError(err.response?.data?.message || 'Could not update');
        }
    };

    const removeOne = async () => {
        if (!confirmDelete) return;
        try {
            await api.delete(`/site-announcements/${confirmDelete._id}`);
            setItems(prev => prev.filter(x => x._id !== confirmDelete._id));
            setConfirmDelete(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not delete');
        }
    };

    // active right now (the one visitors see) — same logic as backend getActive
    const liveOne = items.find(a => a.isActive && (!a.expiresAt || new Date(a.expiresAt) > new Date()));

    return (
        <div className="p-6 lg:p-10 space-y-8">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A68868]">Site-wide bar</p>
                    <h1 className="text-3xl font-semibold text-slate-900 tracking-tight mt-1">Announcements & Offers</h1>
                    <p className="text-sm text-slate-500 font-medium mt-2">
                        Push promos, launches, and timely info to the announcement bar at the top of the public site.
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#071739] hover:bg-[#020a1a] text-white rounded-xl font-semibold text-xs uppercase tracking-widest"
                >
                    <Plus size={14} /> New announcement
                </button>
            </div>

            {/* Live preview tile */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A68868]">Live right now</p>
                        <h2 className="text-base font-semibold text-slate-900 tracking-tight mt-0.5">
                            {liveOne ? 'This is what visitors see' : 'No active announcement'}
                        </h2>
                    </div>
                    {liveOne && (
                        <button
                            onClick={() => openEdit(liveOne)}
                            className="text-xs font-semibold uppercase tracking-widest text-[#071739] hover:underline"
                        >
                            Edit live announcement
                        </button>
                    )}
                </div>
                {liveOne ? (
                    <PreviewBar form={liveOne} />
                ) : (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center gap-2">
                        <Megaphone size={28} className="text-slate-300" />
                        <p className="text-sm font-semibold text-slate-700">Nothing is being shown to visitors</p>
                        <p className="text-xs text-slate-500 font-medium">Create a new announcement or activate one below to make it live.</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-xl px-4 py-3">
                    {error}
                </div>
            )}

            {/* List */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-slate-900 tracking-tight">All announcements</h2>
                    <p className="text-xs text-slate-400 font-medium">{items.length} total</p>
                </div>

                {loading ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-12 flex items-center justify-center gap-3 text-slate-400">
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-xs font-semibold uppercase tracking-widest">Loading announcements…</span>
                    </div>
                ) : items.length === 0 ? (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 flex flex-col items-center text-center gap-2">
                        <Sparkles size={24} className="text-slate-300" />
                        <p className="text-sm font-semibold text-slate-700">No announcements yet</p>
                        <p className="text-xs text-slate-500 font-medium">Click "New announcement" to publish one.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map(a => {
                            const t = themeOf(a.theme);
                            const expired = a.expiresAt && new Date(a.expiresAt) < new Date();
                            const isLive = a._id === liveOne?._id;
                            return (
                                <div
                                    key={a._id}
                                    className={clsx(
                                        'bg-white rounded-2xl border p-5 flex flex-col lg:flex-row gap-4 transition-all',
                                        isLive ? 'border-[#071739] shadow-md shadow-slate-900/5' : 'border-slate-100 hover:border-slate-200'
                                    )}
                                >
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: t.chipBg, color: t.chipText }}>
                                            <t.Icon size={20} />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{t.label}</span>
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                {isLive && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-emerald-100 text-emerald-700">Live</span>
                                                )}
                                                {!a.isActive && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-slate-100 text-slate-600">Off</span>
                                                )}
                                                {expired && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-rose-100 text-rose-600">Expired</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 leading-snug">{a.message}</p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 font-medium">
                                            {a.ctaText && a.ctaHref && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <ExternalLink size={12} className="text-slate-400" />
                                                    <span className="font-semibold text-slate-700">{a.ctaText}</span>
                                                    <span className="text-slate-400 truncate max-w-[200px]">→ {a.ctaHref}</span>
                                                </span>
                                            )}
                                            {a.countdownTo && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Clock size={12} className="text-slate-400" />
                                                    Ends {new Date(a.countdownTo).toLocaleString()}
                                                </span>
                                            )}
                                            {a.expiresAt && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Calendar size={12} className="text-slate-400" />
                                                    Auto-off {new Date(a.expiresAt).toLocaleString()}
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1.5">
                                                Priority <span className="font-semibold text-slate-700">{a.priority || 0}</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => toggleActive(a)}
                                            className={clsx(
                                                'p-2.5 rounded-xl border transition-all',
                                                a.isActive
                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                                            )}
                                            title={a.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            {a.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                        </button>
                                        <button
                                            onClick={() => openEdit(a)}
                                            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => setConfirmDelete(a)}
                                            className="p-2.5 rounded-xl border border-rose-100 bg-rose-50/40 text-rose-500 hover:bg-rose-50"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Composer */}
            <AnimatePresence>
                {composer && (
                    <Composer
                        composer={composer}
                        onClose={() => setComposer(null)}
                        onSaved={(saved) => {
                            setItems(prev => composer.isNew ? [saved, ...prev] : prev.map(x => x._id === saved._id ? saved : x));
                            setComposer(null);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Delete confirm */}
            <AnimatePresence>
                {confirmDelete && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setConfirmDelete(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-rose-500 mb-1">Confirm</p>
                                <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Delete announcement?</h2>
                            </div>
                            <div className="px-6 py-5">
                                <p className="text-sm font-medium text-slate-600 leading-relaxed line-clamp-3">"{confirmDelete.message}"</p>
                                <p className="text-xs text-slate-500 font-medium mt-2">This cannot be undone.</p>
                            </div>
                            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-2">
                                <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-slate-500 font-semibold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl">Cancel</button>
                                <button onClick={removeOne} className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-xs uppercase tracking-widest">
                                    <Trash2 size={13} /> Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ──────────────────────────────────────────────
// Composer modal
// ──────────────────────────────────────────────
function Composer({ composer, onClose, onSaved }) {
    const [form, setForm] = useState(composer.data);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const submit = async () => {
        setError('');
        if (!form.message?.trim()) return setError('Message is required.');
        if (form.ctaText && !form.ctaHref) return setError('Add a link for the CTA button (or remove the button text).');
        if (form.ctaHref && !form.ctaText) return setError('Add button text for the CTA link (or remove the URL).');

        setSaving(true);
        try {
            const payload = {
                message: form.message.trim(),
                theme: form.theme,
                ctaText: form.ctaText?.trim() || null,
                ctaHref: form.ctaHref?.trim() || null,
                countdownTo: form.countdownTo ? new Date(form.countdownTo).toISOString() : null,
                expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
                isActive: !!form.isActive,
                priority: Number(form.priority) || 0
            };
            const res = composer.isNew
                ? await api.post('/site-announcements', payload)
                : await api.put(`/site-announcements/${form._id}`, payload);
            onSaved(res.data?.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not save announcement.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !saving && onClose()}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-slate-100 shrink-0 flex items-start justify-between gap-3">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A68868] mb-1">Announcement bar</p>
                        <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
                            {composer.isNew ? 'Create announcement' : 'Edit announcement'}
                        </h2>
                    </div>
                    <button onClick={() => !saving && onClose()} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-6">
                    <PreviewBar form={form} />

                    <Field label="Message" required>
                        <textarea
                            rows={2}
                            maxLength={240}
                            value={form.message}
                            onChange={e => update('message', e.target.value)}
                            placeholder="e.g. Flash Sale! Courses from ₹399. Ends soon."
                            className={inputCls}
                        />
                        <p className="text-[10px] text-slate-400 font-medium mt-1">{form.message.length}/240</p>
                    </Field>

                    <Field label="Visual theme">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {THEME_OPTIONS.map(opt => {
                                const active = form.theme === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => update('theme', opt.id)}
                                        className={clsx(
                                            'flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all',
                                            active ? 'border-[#071739] bg-[#071739]/5' : 'border-slate-100 hover:border-slate-200'
                                        )}
                                    >
                                        <div className="p-1.5 rounded-md" style={{ background: opt.chipBg, color: opt.chipText }}>
                                            <opt.Icon size={14} />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-700">{opt.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Button text (optional)">
                            <input
                                value={form.ctaText}
                                onChange={e => update('ctaText', e.target.value)}
                                placeholder="Shop Now"
                                maxLength={40}
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Button link">
                            <input
                                value={form.ctaHref}
                                onChange={e => update('ctaHref', e.target.value)}
                                placeholder="/explore"
                                className={inputCls}
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Countdown ends at (optional)">
                            <input
                                type="datetime-local"
                                value={form.countdownTo}
                                onChange={e => update('countdownTo', e.target.value)}
                                className={inputCls}
                            />
                            <p className="text-[10px] text-slate-400 font-medium mt-1">Adds a live timer next to the message.</p>
                        </Field>
                        <Field label="Auto-disable on (optional)">
                            <input
                                type="datetime-local"
                                value={form.expiresAt}
                                onChange={e => update('expiresAt', e.target.value)}
                                className={inputCls}
                            />
                            <p className="text-[10px] text-slate-400 font-medium mt-1">After this time the bar stops appearing.</p>
                        </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Priority">
                            <input
                                type="number"
                                value={form.priority}
                                onChange={e => update('priority', e.target.value)}
                                className={inputCls}
                            />
                            <p className="text-[10px] text-slate-400 font-medium mt-1">Higher value wins when multiple are active.</p>
                        </Field>
                        <Field label="Status">
                            <button
                                type="button"
                                onClick={() => update('isActive', !form.isActive)}
                                className={clsx(
                                    'w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all',
                                    form.isActive ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-100 bg-slate-50/40'
                                )}
                            >
                                <span className="flex items-center gap-2">
                                    <Power size={14} className={form.isActive ? 'text-emerald-500' : 'text-slate-400'} />
                                    <span className="text-xs font-semibold text-slate-700">
                                        {form.isActive ? 'Active — visible to visitors' : 'Inactive — hidden'}
                                    </span>
                                </span>
                                <span className={clsx(
                                    'w-9 h-5 rounded-full p-0.5 transition-all',
                                    form.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                                )}>
                                    <span className={clsx(
                                        'block w-4 h-4 rounded-full bg-white shadow transition-transform',
                                        form.isActive ? 'translate-x-4' : 'translate-x-0'
                                    )} />
                                </span>
                            </button>
                        </Field>
                    </div>

                    {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex items-center justify-between gap-2">
                    <button onClick={() => !saving && onClose()} className="px-4 py-2 text-slate-500 font-semibold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl">
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#071739] hover:bg-[#020a1a] text-white rounded-xl font-semibold text-xs uppercase tracking-widest disabled:opacity-50"
                    >
                        {saving && <Loader2 size={13} className="animate-spin" />}
                        {composer.isNew ? 'Publish' : 'Save changes'}
                    </button>
                </div>
            </motion.div>
        </div>
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
