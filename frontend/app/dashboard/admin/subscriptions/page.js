'use client';
import { useState, useEffect, useMemo } from 'react';
import {
    Mail, Send, Users, Trash2, Search, Filter, Plus, X, Check,
    Sparkles, Loader2, Eye, MousePointerClick, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '@/components/AdminLayout';
import api from '@/services/api';
import { clsx } from 'clsx';

const PREFERENCES = [
    { id: 'newsletter',      label: 'Newsletter' },
    { id: 'new_courses',     label: 'New course alerts' },
    { id: 'offers',          label: 'Discounts & offers' },
    { id: 'learning_tips',   label: 'Learning tips' },
    { id: 'product_updates', label: 'Product updates' }
];

const INTERESTS = ['AI', 'Design', 'Development', 'Marketing', 'Business', 'Data'];

const CAMPAIGN_TYPES = [
    { id: 'newsletter',     label: 'Newsletter' },
    { id: 'offer',          label: 'Promotional offer' },
    { id: 'course_alert',   label: 'New course alert' },
    { id: 'product_update', label: 'Platform update' },
    { id: 'reengagement',   label: 'Re-engagement' }
];

export default function AdminSubscriptionsPage() {
    const [tab, setTab] = useState('subscribers');
    const [subscribers, setSubscribers] = useState([]);
    const [stats, setStats] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: '', preference: '', interest: '', search: '' });
    const [composerOpen, setComposerOpen] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2400);
    };

    const loadAll = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
            const [subsRes, statsRes, campRes] = await Promise.all([
                api.get(`/admin/subscribers?${params.toString()}`),
                api.get('/admin/subscribers/stats'),
                api.get('/admin/campaigns')
            ]);
            setSubscribers(subsRes.data.data || []);
            setStats(statsRes.data.data || null);
            setCampaigns(campRes.data.data || []);
        } catch (err) {
            console.error('Failed to load subscriptions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, [filters]);

    const removeSubscriber = async (id) => {
        if (!confirm('Remove this subscriber permanently?')) return;
        try {
            await api.delete(`/admin/subscribers/${id}`);
            setSubscribers(s => s.filter(x => x._id !== id));
            showToast('Subscriber removed');
        } catch { showToast('Could not remove', 'error'); }
    };

    const sendCampaign = async (id) => {
        if (!confirm('Send this campaign to its target audience?')) return;
        try {
            const res = await api.post(`/admin/campaigns/${id}/send`);
            showToast(`Sent to ${res.data.data.sent} of ${res.data.data.recipients} subscribers`);
            loadAll();
        } catch (err) {
            showToast(err.response?.data?.message || 'Send failed', 'error');
        }
    };

    const deleteCampaign = async (id) => {
        if (!confirm('Delete this campaign?')) return;
        try {
            await api.delete(`/admin/campaigns/${id}`);
            setCampaigns(c => c.filter(x => x._id !== id));
            showToast('Campaign deleted');
        } catch { showToast('Could not delete', 'error'); }
    };

    return (
        <AdminLayout>
            <div className="space-y-8 pb-20">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Subscriptions</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            Grow your audience and reach the right people with targeted campaigns.
                        </p>
                    </div>
                    {tab === 'campaigns' && (
                        <button
                            onClick={() => setComposerOpen(true)}
                            className="inline-flex items-center gap-2 bg-[#071739] hover:bg-[#020a1a] text-white px-5 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-widest transition-all shadow-md shadow-[#071739]/15"
                        >
                            <Plus size={14} /> New campaign
                        </button>
                    )}
                </header>

                {/* Stat tiles */}
                {stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatTile icon={<Users size={16} />} label="Total subscribers" value={stats.total} />
                        <StatTile icon={<Mail size={16} />} label="Active" value={stats.active} tone="emerald" />
                        <StatTile icon={<Eye size={16} />} label="Email opens" value={stats.totalOpens} tone="navy" />
                        <StatTile icon={<MousePointerClick size={16} />} label="Email clicks" value={stats.totalClicks} tone="tan" />
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 border-b border-slate-100">
                    {[
                        { id: 'subscribers', label: `Subscribers${subscribers.length ? ` (${subscribers.length})` : ''}` },
                        { id: 'campaigns', label: `Campaigns${campaigns.length ? ` (${campaigns.length})` : ''}` }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={clsx(
                                'pb-3 px-4 text-xs uppercase tracking-widest font-semibold transition-all relative whitespace-nowrap',
                                tab === t.id ? 'text-[#071739]' : 'text-slate-400 hover:text-slate-600'
                            )}
                        >
                            {t.label}
                            {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#071739] rounded-full" />}
                        </button>
                    ))}
                </div>

                {/* ───── SUBSCRIBERS TAB ───── */}
                {tab === 'subscribers' && (
                    <div className="space-y-5">
                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div className="relative md:col-span-2">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    placeholder="Search by email or name..."
                                    className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pl-11 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-[#071739]/10 focus:border-[#071739]/20 transition-all"
                                />
                            </div>
                            <select
                                value={filters.preference}
                                onChange={(e) => setFilters({ ...filters, preference: e.target.value })}
                                className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-[#071739]/10"
                            >
                                <option value="">All preferences</option>
                                {PREFERENCES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                            </select>
                            <select
                                value={filters.interest}
                                onChange={(e) => setFilters({ ...filters, interest: e.target.value })}
                                className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-[#071739]/10"
                            >
                                <option value="">All interests</option>
                                {INTERESTS.map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </div>

                        {/* List */}
                        {loading ? (
                            <SkeletonRows />
                        ) : subscribers.length === 0 ? (
                            <EmptyState
                                title="No subscribers yet"
                                desc="Once visitors subscribe, they'll appear here. Share the website to grow your list."
                            />
                        ) : (
                            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100">
                                                <Th>Email</Th>
                                                <Th>Type</Th>
                                                <Th>Preferences</Th>
                                                <Th>Interests</Th>
                                                <Th>Engagement</Th>
                                                <Th>Joined</Th>
                                                <Th>Status</Th>
                                                <Th className="text-right">Actions</Th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {subscribers.map(s => (
                                                <tr key={s._id} className="hover:bg-slate-50/50">
                                                    <td className="px-5 py-4">
                                                        <p className="text-sm font-semibold text-slate-900 truncate max-w-[220px]">{s.email}</p>
                                                        {s.name && <p className="text-[11px] text-slate-400 font-medium truncate max-w-[220px]">{s.name}</p>}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="text-[10px] font-semibold uppercase tracking-widest bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                                                            {s.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <ChipList items={s.preferences} mapper={id => PREFERENCES.find(p => p.id === id)?.label || id} />
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <ChipList items={s.categoryInterests} tone="tan" />
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                                                            <span className="flex items-center gap-1"><Eye size={11} /> {s.engagement?.opens || 0}</span>
                                                            <span className="flex items-center gap-1"><MousePointerClick size={11} /> {s.engagement?.clicks || 0}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                                                        {new Date(s.subscribedAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className={clsx(
                                                            'inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-widest border',
                                                            s.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                                                        )}>
                                                            {s.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <button
                                                            onClick={() => removeSubscriber(s._id)}
                                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ───── CAMPAIGNS TAB ───── */}
                {tab === 'campaigns' && (
                    <div className="space-y-4">
                        {loading ? (
                            <SkeletonRows />
                        ) : campaigns.length === 0 ? (
                            <EmptyState
                                title="No campaigns yet"
                                desc="Compose your first newsletter, offer, or product update to engage your subscribers."
                                cta={{ label: 'Create campaign', onClick: () => setComposerOpen(true) }}
                            />
                        ) : (
                            <div className="space-y-3">
                                {campaigns.map(c => (
                                    <CampaignRow
                                        key={c._id}
                                        campaign={c}
                                        onSend={() => sendCampaign(c._id)}
                                        onDelete={() => deleteCampaign(c._id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <CampaignComposer
                isOpen={composerOpen}
                onClose={() => setComposerOpen(false)}
                onCreated={() => { setComposerOpen(false); loadAll(); showToast('Campaign saved as draft'); }}
                stats={stats}
            />

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                        className={clsx(
                            'fixed bottom-6 right-6 z-[300] px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl flex items-center gap-2',
                            toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                        )}
                    >
                        {toast.type === 'error' ? <X size={16} /> : <Check size={16} />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function StatTile({ icon, label, value, tone }) {
    const map = {
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        navy: 'bg-[#071739]/5 text-[#071739] border-[#071739]/10',
        tan: 'bg-[#A68868]/10 text-[#A68868] border-[#A68868]/20'
    };
    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center border', map[tone] || map.navy)}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-semibold text-slate-900 leading-none">{value ?? 0}</p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-1">{label}</p>
            </div>
        </div>
    );
}

function Th({ children, className }) {
    return <th className={clsx('px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest', className)}>{children}</th>;
}

function ChipList({ items = [], mapper, tone }) {
    if (!items.length) return <span className="text-[11px] text-slate-300 font-medium">—</span>;
    const cls = tone === 'tan'
        ? 'bg-[#A68868]/10 text-[#A68868] border-[#A68868]/20'
        : 'bg-[#071739]/5 text-[#071739] border-[#071739]/10';
    return (
        <div className="flex flex-wrap gap-1">
            {items.slice(0, 3).map(it => (
                <span key={it} className={clsx('text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded border', cls)}>
                    {mapper ? mapper(it) : it}
                </span>
            ))}
            {items.length > 3 && (
                <span className="text-[9px] font-semibold text-slate-400">+{items.length - 3}</span>
            )}
        </div>
    );
}

function SkeletonRows() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-100 rounded-2xl h-20 animate-pulse" />
            ))}
        </div>
    );
}

function EmptyState({ title, desc, cta }) {
    return (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mb-3">
                <Mail size={28} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500 font-medium mt-1 max-w-md mx-auto">{desc}</p>
            {cta && (
                <button
                    onClick={cta.onClick}
                    className="inline-flex mt-5 items-center gap-2 bg-[#071739] hover:bg-[#020a1a] text-white px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all"
                >
                    <Plus size={13} /> {cta.label}
                </button>
            )}
        </div>
    );
}

function CampaignRow({ campaign, onSend, onDelete }) {
    const statusCls = {
        draft:   'bg-slate-100 text-slate-600 border-slate-200',
        sending: 'bg-amber-50 text-amber-700 border-amber-100',
        sent:    'bg-emerald-50 text-emerald-700 border-emerald-100',
        failed:  'bg-rose-50 text-rose-700 border-rose-100'
    }[campaign.status] || 'bg-slate-100 text-slate-600 border-slate-200';

    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className={clsx('text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border', statusCls)}>
                        {campaign.status}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{campaign.type?.replace('_', ' ')}</span>
                </div>
                <p className="text-sm font-semibold text-slate-900 truncate">{campaign.title}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">{campaign.subject}</p>
                {campaign.status === 'sent' && (
                    <div className="flex items-center gap-4 mt-2 text-[11px] font-medium text-slate-500">
                        <span>{campaign.stats.sent}/{campaign.stats.recipients} delivered</span>
                        <span className="flex items-center gap-1"><Eye size={11} /> {campaign.stats.opens}</span>
                        <span className="flex items-center gap-1"><MousePointerClick size={11} /> {campaign.stats.clicks}</span>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {campaign.status !== 'sent' && (
                    <button
                        onClick={onSend}
                        className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all shadow-md shadow-emerald-500/20"
                    >
                        <Send size={12} /> Send
                    </button>
                )}
                <button
                    onClick={onDelete}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────
// Composer modal
// ─────────────────────────────────────────────────────────

function CampaignComposer({ isOpen, onClose, onCreated, stats }) {
    const [form, setForm] = useState({
        title: '', subject: '', body: '', type: 'newsletter',
        audience: { allActive: true, preferences: [], categoryInterests: [] }
    });
    const [audCount, setAudCount] = useState(null);
    const [loadingCount, setLoadingCount] = useState(false);
    const [creating, setCreating] = useState(false);
    const [err, setErr] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setForm({ title: '', subject: '', body: '', type: 'newsletter',
                audience: { allActive: true, preferences: [], categoryInterests: [] } });
            setAudCount(null);
            setErr('');
        }
    }, [isOpen]);

    const previewAudience = async () => {
        setLoadingCount(true);
        try {
            const res = await api.post('/admin/campaigns/preview-audience', { audience: form.audience });
            setAudCount(res.data.count);
        } catch (e) {
            setAudCount(null);
        } finally { setLoadingCount(false); }
    };

    useEffect(() => {
        if (!isOpen) return;
        const t = setTimeout(previewAudience, 300);
        return () => clearTimeout(t);
        // eslint-disable-next-line
    }, [isOpen, form.audience]);

    const togglePref = (id) => {
        setForm(f => ({
            ...f,
            audience: {
                ...f.audience,
                allActive: false,
                preferences: f.audience.preferences.includes(id)
                    ? f.audience.preferences.filter(p => p !== id)
                    : [...f.audience.preferences, id]
            }
        }));
    };
    const toggleInterest = (i) => {
        setForm(f => ({
            ...f,
            audience: {
                ...f.audience,
                allActive: false,
                categoryInterests: f.audience.categoryInterests.includes(i)
                    ? f.audience.categoryInterests.filter(x => x !== i)
                    : [...f.audience.categoryInterests, i]
            }
        }));
    };

    const submit = async () => {
        setErr('');
        if (!form.title.trim() || !form.subject.trim() || !form.body.trim()) {
            return setErr('Title, subject and body are required.');
        }
        setCreating(true);
        try {
            await api.post('/admin/campaigns', form);
            onCreated();
        } catch (e) {
            setErr(e.response?.data?.message || 'Could not create campaign.');
        } finally { setCreating(false); }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <h2 className="text-lg font-semibold text-slate-900">New campaign</h2>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={16} /></button>
                        </div>
                        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Internal title" required>
                                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. April newsletter" className={inputCls} />
                                </Field>
                                <Field label="Type">
                                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
                                        {CAMPAIGN_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                    </select>
                                </Field>
                            </div>
                            <Field label="Email subject" required>
                                <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="What appears in inboxes" className={inputCls} />
                            </Field>
                            <Field label="Email body" required hint="Plain text or basic HTML supported.">
                                <textarea
                                    value={form.body}
                                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                                    rows={8}
                                    placeholder="Write your message…"
                                    className={clsx(inputCls, 'resize-y font-mono text-[13px]')}
                                />
                            </Field>

                            <div className="border-t border-slate-100 pt-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-900">Audience</h3>
                                    <span className="text-[11px] font-semibold text-slate-500">
                                        {loadingCount ? '…' : audCount != null ? `${audCount} subscriber${audCount === 1 ? '' : 's'} match` : ''}
                                    </span>
                                </div>

                                <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.audience.allActive}
                                        onChange={(e) => setForm({ ...form, audience: { ...form.audience, allActive: e.target.checked, preferences: [], categoryInterests: [] } })}
                                        className="mt-0.5 w-4 h-4 accent-[#071739]"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">All active subscribers</p>
                                        <p className="text-xs text-slate-500 font-medium">Send to everyone who hasn't unsubscribed.</p>
                                    </div>
                                </label>

                                {!form.audience.allActive && (
                                    <>
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Match preference</p>
                                            <div className="flex flex-wrap gap-2">
                                                {PREFERENCES.map(p => {
                                                    const active = form.audience.preferences.includes(p.id);
                                                    return (
                                                        <button key={p.id} onClick={() => togglePref(p.id)} className={clsx(
                                                            'px-3 py-1 rounded-full text-[11px] font-semibold border transition-all',
                                                            active ? 'bg-[#071739] text-white border-[#071739]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#071739]'
                                                        )}>{p.label}</button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Match interest</p>
                                            <div className="flex flex-wrap gap-2">
                                                {INTERESTS.map(i => {
                                                    const active = form.audience.categoryInterests.includes(i);
                                                    return (
                                                        <button key={i} onClick={() => toggleInterest(i)} className={clsx(
                                                            'px-3 py-1 rounded-full text-[11px] font-semibold border transition-all',
                                                            active ? 'bg-[#A68868] text-white border-[#A68868]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#A68868]'
                                                        )}>{i}</button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {err && <p className="text-xs font-semibold text-rose-500">{err}</p>}
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex justify-end gap-2">
                            <button onClick={onClose} className="px-4 py-2 text-slate-500 font-semibold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl">Cancel</button>
                            <button
                                onClick={submit}
                                disabled={creating}
                                className="px-5 py-2 bg-[#071739] hover:bg-[#020a1a] text-white rounded-xl font-semibold text-xs uppercase tracking-widest disabled:opacity-50 flex items-center gap-1.5"
                            >
                                {creating && <Loader2 size={12} className="animate-spin" />}
                                Save as draft
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

const inputCls = "w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-[#071739]/10 focus:border-[#071739]/20 focus:bg-white transition-all";

function Field({ label, required, children, hint }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            {children}
            {hint && <p className="text-[11px] text-slate-400 font-medium">{hint}</p>}
        </div>
    );
}
