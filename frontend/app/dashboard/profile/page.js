'use client';
import { useState, useEffect } from 'react';
import {
    Pencil,
    Link2,
    X,
    Check,
    Plus,
    Trash2,
    Briefcase,
    GraduationCap,
    FolderKanban,
    FileText,
    Linkedin,
    Github,
    Globe,
    User as UserIcon,
    AlertCircle,
    Copy,
    Lock,
    Eye,
    EyeOff,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { clsx } from 'clsx';

// EduFlow palette: navy #071739, tan #A68868. Typography: font-semibold for headings/values, font-medium for body.

export default function ProfilePage() {
    const { user: authUser } = useAuthStore();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Open/close state for each modal
    const [openModal, setOpenModal] = useState(null); // 'share' | 'visibility' | 'workPrefs' | 'additionalInfo' | 'workExp' | 'education'
    const [editingIndex, setEditingIndex] = useState(null); // for editing existing entries
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2400);
    };

    const load = async () => {
        try {
            const res = await api.get('/profile/me');
            setProfile(res.data.data);
        } catch (err) {
            console.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const updateProfile = async (patch) => {
        setSaving(true);
        try {
            const res = await api.put('/profile/me', patch);
            setProfile(res.data.data);
            showToast('Saved');
        } catch (err) {
            showToast(err.response?.data?.message || 'Could not save', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <DashboardLayout>
            <div className="p-20 text-center text-slate-400 font-semibold uppercase tracking-widest text-[10px] animate-pulse">
                Loading profile…
            </div>
        </DashboardLayout>
    );

    if (!profile) return (
        <DashboardLayout>
            <div className="p-20 text-center text-slate-500 font-medium">Profile not found.</div>
        </DashboardLayout>
    );

    const initials = (profile.name || 'U').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
    const p = profile.profile || {};

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ─────────── LEFT SIDEBAR ─────────── */}
                    <aside className="lg:col-span-1 space-y-5">
                        {/* Personal details */}
                        <Card>
                            <SectionHeader title="Personal details" />
                            <div className="flex flex-col items-center text-center pt-2 pb-2">
                                <div className="w-28 h-28 rounded-full bg-[#071739] text-white flex items-center justify-center text-3xl font-semibold shadow-md">
                                    {initials}
                                </div>
                                <h2 className="text-xl font-semibold text-slate-900 mt-4">{profile.name}</h2>
                                <p className="text-xs text-slate-500 font-medium mt-1">{profile.email}</p>

                                <button
                                    onClick={() => setOpenModal('share')}
                                    className="mt-5 w-full flex items-center justify-center gap-2 border-2 border-[#071739] text-[#071739] font-semibold text-xs uppercase tracking-widest py-2.5 rounded-xl hover:bg-[#071739] hover:text-white transition-all"
                                >
                                    <Link2 size={14} /> Share profile link
                                </button>

                                <button
                                    onClick={() => setOpenModal('visibility')}
                                    className="mt-3 text-xs font-semibold text-[#071739] hover:text-[#A68868] transition-colors"
                                >
                                    Update profile visibility
                                </button>
                            </div>
                        </Card>

                        {/* Work preferences */}
                        <Card>
                            <SectionHeader title="Work preferences" />
                            {p.workPreferences?.role || p.workPreferences?.industry ? (
                                <div className="space-y-3 text-sm">
                                    {p.workPreferences.role && (
                                        <Row icon={<Briefcase size={14} />} label="Role" value={p.workPreferences.role} />
                                    )}
                                    {p.workPreferences.industry && (
                                        <Row icon={<FolderKanban size={14} />} label="Industry" value={p.workPreferences.industry} />
                                    )}
                                    <Row label="Open to remote" value={p.workPreferences.openToRemote ? 'Yes' : 'No'} />
                                    <Row label="Willing to relocate" value={p.workPreferences.willingToRelocate ? 'Yes' : 'No'} />
                                    <button
                                        onClick={() => setOpenModal('workPrefs')}
                                        className="mt-3 w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-600 hover:border-[#071739] hover:text-[#071739] font-semibold text-xs uppercase tracking-widest py-2 rounded-xl transition-all"
                                    >
                                        <Pencil size={12} /> Edit preferences
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm text-slate-500 font-medium">
                                        Let recruiters know what role you're looking for to make sure you find opportunities that are right for you.
                                    </p>
                                    <button
                                        onClick={() => setOpenModal('workPrefs')}
                                        className="mt-4 inline-flex items-center gap-2 border-2 border-[#071739] text-[#071739] font-semibold text-xs uppercase tracking-widest px-5 py-2 rounded-xl hover:bg-[#071739] hover:text-white transition-all"
                                    >
                                        <Plus size={13} /> Add work preferences
                                    </button>
                                </>
                            )}
                        </Card>

                        {/* Additional info */}
                        <Card>
                            <SectionHeader title="Additional info" />
                            {(p.about || p.resumeUrl || (p.links && p.links.length > 0)) ? (
                                <div className="space-y-4 text-sm">
                                    {p.about && (
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">About</p>
                                            <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line">{p.about}</p>
                                        </div>
                                    )}
                                    {p.resumeUrl && (
                                        <a href={p.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold text-[#071739] hover:text-[#A68868]">
                                            <FileText size={14} /> View resume
                                        </a>
                                    )}
                                    {p.links?.length > 0 && (
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Links</p>
                                            {p.links.map((l, i) => (
                                                <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-[#071739] hover:underline truncate">
                                                    <LinkIcon label={l.label} /> {l.label}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setOpenModal('additionalInfo')}
                                        className="mt-3 w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-600 hover:border-[#071739] hover:text-[#071739] font-semibold text-xs uppercase tracking-widest py-2 rounded-xl transition-all"
                                    >
                                        <Pencil size={12} /> Edit info
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm text-slate-500 font-medium">
                                        Help recruiters get to know you better by describing what makes you a great candidate and sharing other links.
                                    </p>
                                    <button
                                        onClick={() => setOpenModal('additionalInfo')}
                                        className="mt-4 inline-flex items-center gap-2 border-2 border-[#071739] text-[#071739] font-semibold text-xs uppercase tracking-widest px-5 py-2 rounded-xl hover:bg-[#071739] hover:text-white transition-all"
                                    >
                                        <Plus size={13} /> Add additional info
                                    </button>
                                </>
                            )}
                        </Card>
                    </aside>

                    {/* ─────────── RIGHT MAIN COLUMN ─────────── */}
                    <main className="lg:col-span-2 space-y-8">
                        {/* Experience */}
                        <section>
                            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-4">Experience</h1>

                            {/* Projects */}
                            <Card className="mb-5">
                                <SectionHeader title="Projects" hint="Showcase your skills with course-related projects." />
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-semibold text-slate-900 text-sm">Showcase your skills with job-relevant projects</p>
                                        <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                                            Add projects here to demonstrate your technical expertise and ability to solve real-world problems.
                                        </p>
                                    </div>
                                    <a
                                        href="/dashboard/explore"
                                        className="text-xs font-semibold text-[#071739] hover:underline whitespace-nowrap shrink-0"
                                    >
                                        Browse Projects
                                    </a>
                                </div>
                            </Card>

                            {/* Work history */}
                            <Card>
                                <SectionHeader title="Work history" />
                                {p.workHistory?.length > 0 ? (
                                    <div className="space-y-3">
                                        {p.workHistory.map((w, i) => (
                                            <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-slate-900 text-sm">{w.title}</p>
                                                    <p className="text-xs text-slate-500 font-medium mt-0.5">{w.company}</p>
                                                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                                                        {fmtRange(w.startDate, w.endDate)}
                                                    </p>
                                                    {w.description && (
                                                        <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed whitespace-pre-line">
                                                            {w.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-1 shrink-0">
                                                    <button
                                                        onClick={() => { setEditingIndex(i); setOpenModal('workExp'); }}
                                                        className="p-2 text-slate-400 hover:text-[#071739] hover:bg-white rounded-lg"
                                                    >
                                                        <Pencil size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => updateProfile({ profile: { workHistory: p.workHistory.filter((_, idx) => idx !== i) } })}
                                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-white rounded-lg"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => { setEditingIndex(null); setOpenModal('workExp'); }}
                                            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 text-slate-500 hover:border-[#071739] hover:text-[#071739] font-semibold text-xs uppercase tracking-widest py-3 rounded-xl transition-all"
                                        >
                                            <Plus size={13} /> Add another role
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex items-start justify-between gap-4">
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                            Add your past work experience here. If you're just starting out, you can add internships or volunteer experience instead.
                                        </p>
                                        <button
                                            onClick={() => { setEditingIndex(null); setOpenModal('workExp'); }}
                                            className="inline-flex items-center gap-2 border-2 border-[#071739] text-[#071739] font-semibold text-xs uppercase tracking-widest px-5 py-2 rounded-xl hover:bg-[#071739] hover:text-white transition-all whitespace-nowrap shrink-0"
                                        >
                                            <Plus size={13} /> Add work experience
                                        </button>
                                    </div>
                                )}
                            </Card>
                        </section>

                        {/* Education */}
                        <section>
                            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-4">Education</h1>

                            <Card>
                                <SectionHeader title="Credentials" />
                                {p.education?.length > 0 ? (
                                    <div className="space-y-3">
                                        {p.education.map((e, i) => (
                                            <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-slate-900 text-sm">{e.school}</p>
                                                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                                                        {[e.degree, e.field].filter(Boolean).join(' · ')}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                                                        {[e.startYear, e.endYear || 'Present'].filter(Boolean).join(' — ')}
                                                    </p>
                                                </div>
                                                <div className="flex gap-1 shrink-0">
                                                    <button
                                                        onClick={() => { setEditingIndex(i); setOpenModal('education'); }}
                                                        className="p-2 text-slate-400 hover:text-[#071739] hover:bg-white rounded-lg"
                                                    >
                                                        <Pencil size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => updateProfile({ profile: { education: p.education.filter((_, idx) => idx !== i) } })}
                                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-white rounded-lg"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => { setEditingIndex(null); setOpenModal('education'); }}
                                            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 text-slate-500 hover:border-[#071739] hover:text-[#071739] font-semibold text-xs uppercase tracking-widest py-3 rounded-xl transition-all"
                                        >
                                            <Plus size={13} /> Add another credential
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex items-start justify-between gap-4">
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                            Add your educational background here to let employers know where you studied or are currently studying.
                                        </p>
                                        <button
                                            onClick={() => { setEditingIndex(null); setOpenModal('education'); }}
                                            className="inline-flex items-center gap-2 border-2 border-[#071739] text-[#071739] font-semibold text-xs uppercase tracking-widest px-5 py-2 rounded-xl hover:bg-[#071739] hover:text-white transition-all whitespace-nowrap shrink-0"
                                        >
                                            <Plus size={13} /> Add education
                                        </button>
                                    </div>
                                )}
                            </Card>
                        </section>
                    </main>
                </div>
            </div>

            {/* ─────────── MODALS ─────────── */}
            <ShareModal
                isOpen={openModal === 'share'}
                onClose={() => setOpenModal(null)}
                userId={profile._id}
            />
            <VisibilityModal
                isOpen={openModal === 'visibility'}
                onClose={() => setOpenModal(null)}
                isPublic={p.isPublic !== false}
                onSave={(isPublic) => updateProfile({ profile: { isPublic } }).then(() => setOpenModal(null))}
            />
            <WorkPrefsModal
                isOpen={openModal === 'workPrefs'}
                onClose={() => setOpenModal(null)}
                initial={p.workPreferences || {}}
                onSave={(prefs) => updateProfile({ profile: { workPreferences: prefs } }).then(() => setOpenModal(null))}
                saving={saving}
            />
            <AdditionalInfoModal
                isOpen={openModal === 'additionalInfo'}
                onClose={() => setOpenModal(null)}
                initial={{ about: p.about || '', resumeUrl: p.resumeUrl || '', links: p.links || [] }}
                onSave={(payload) => updateProfile({ profile: payload }).then(() => setOpenModal(null))}
                saving={saving}
            />
            <WorkExpModal
                isOpen={openModal === 'workExp'}
                onClose={() => { setOpenModal(null); setEditingIndex(null); }}
                initial={editingIndex != null ? p.workHistory[editingIndex] : null}
                onSave={(entry) => {
                    const list = [...(p.workHistory || [])];
                    if (editingIndex != null) list[editingIndex] = entry;
                    else list.push(entry);
                    updateProfile({ profile: { workHistory: list } }).then(() => { setOpenModal(null); setEditingIndex(null); });
                }}
                saving={saving}
            />
            <EducationModal
                isOpen={openModal === 'education'}
                onClose={() => { setOpenModal(null); setEditingIndex(null); }}
                initial={editingIndex != null ? p.education[editingIndex] : null}
                onSave={(entry) => {
                    const list = [...(p.education || [])];
                    if (editingIndex != null) list[editingIndex] = entry;
                    else list.push(entry);
                    updateProfile({ profile: { education: list } }).then(() => { setOpenModal(null); setEditingIndex(null); });
                }}
                saving={saving}
            />

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className={clsx(
                            'fixed bottom-6 right-6 z-[300] px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl flex items-center gap-2',
                            toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                        )}
                    >
                        {toast.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function Card({ children, className }) {
    return (
        <div className={clsx('bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4', className)}>
            {children}
        </div>
    );
}

function SectionHeader({ title, hint }) {
    return (
        <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            {hint && <p className="text-[11px] text-slate-400 font-medium mt-0.5">{hint}</p>}
        </div>
    );
}

function Row({ icon, label, value }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-500 font-medium">
                {icon}
                {label}
            </span>
            <span className="text-slate-900 font-semibold">{value}</span>
        </div>
    );
}

function LinkIcon({ label }) {
    const l = (label || '').toLowerCase();
    if (l.includes('linkedin')) return <Linkedin size={14} />;
    if (l.includes('github')) return <Github size={14} />;
    return <Globe size={14} />;
}

function fmtRange(start, end) {
    const fmt = (d) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Present';
    return `${fmt(start)} — ${fmt(end)}`;
}

// ─────────────────────────────────────────────────────────
// Modal shell
// ─────────────────────────────────────────────────────────

function Modal({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-lg' }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={clsx('relative w-full bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden', maxWidth)}
                    >
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
                            {children}
                        </div>
                        {footer && (
                            <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex justify-end gap-2">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

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

const inputCls = "w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-[#071739]/10 focus:border-[#071739]/20 focus:bg-white transition-all";

// ─────────────────────────────────────────────────────────
// Share modal
// ─────────────────────────────────────────────────────────

function ShareModal({ isOpen, onClose, userId }) {
    const [copied, setCopied] = useState(false);
    const url = typeof window !== 'undefined' ? `${window.location.origin}/profile/${userId}` : '';

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {}
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Your profile link" maxWidth="max-w-xl">
            <div className="space-y-4">
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    Sharing your profile is a great way to stand out by showcasing your skills and accomplishments on EduFlow.
                </p>

                <Field label="Profile link" hint="Only someone with the link can view it (won't appear in search engines).">
                    <div className="flex gap-2">
                        <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-xl px-3 bg-slate-50">
                            <Link2 size={14} className="text-slate-400 shrink-0" />
                            <input
                                readOnly
                                value={url}
                                className="flex-1 bg-transparent py-2.5 text-sm font-medium text-slate-700 outline-none truncate"
                            />
                        </div>
                        <button
                            onClick={copy}
                            className={clsx(
                                'px-5 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-widest transition-all flex items-center gap-1.5',
                                copied ? 'bg-emerald-500 text-white' : 'bg-[#071739] text-white hover:bg-[#020a1a]'
                            )}
                        >
                            {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy link</>}
                        </button>
                    </div>
                </Field>

                <div className="bg-blue-50 border border-blue-100 text-blue-700 rounded-xl p-4 text-xs font-medium leading-relaxed flex items-start gap-2">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    By sharing your profile link, you consent to sharing your profile information with anyone who has access to it. You can change visibility anytime.
                </div>
            </div>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────
// Visibility modal
// ─────────────────────────────────────────────────────────

function VisibilityModal({ isOpen, onClose, isPublic: initialPublic, onSave }) {
    const [isPublic, setIsPublic] = useState(initialPublic);
    useEffect(() => { setIsPublic(initialPublic); }, [initialPublic, isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Profile visibility"
            footer={(
                <>
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 font-semibold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl">Cancel</button>
                    <button onClick={() => onSave(isPublic)} className="px-5 py-2 bg-[#071739] text-white rounded-xl font-semibold text-xs uppercase tracking-widest hover:bg-[#020a1a]">Save</button>
                </>
            )}
        >
            <div className="space-y-3">
                {[
                    { id: true, icon: <Eye size={16} />, title: 'Public', desc: 'Anyone with the link can see your profile.' },
                    { id: false, icon: <Lock size={16} />, title: 'Private', desc: 'Only you can see your profile. Sharing is disabled.' }
                ].map(opt => (
                    <button
                        key={String(opt.id)}
                        onClick={() => setIsPublic(opt.id)}
                        className={clsx(
                            'w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3',
                            isPublic === opt.id ? 'border-[#071739] bg-[#071739]/5' : 'border-slate-100 hover:border-slate-200'
                        )}
                    >
                        <div className={clsx(
                            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                            isPublic === opt.id ? 'bg-[#071739] text-white' : 'bg-slate-100 text-slate-500'
                        )}>{opt.icon}</div>
                        <div>
                            <p className="font-semibold text-slate-900 text-sm">{opt.title}</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">{opt.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────
// Work preferences modal
// ─────────────────────────────────────────────────────────

function WorkPrefsModal({ isOpen, onClose, initial, onSave, saving }) {
    const [form, setForm] = useState(initial);
    useEffect(() => { setForm(initial); }, [initial, isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Work preferences"
            footer={(
                <>
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 font-semibold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl">Cancel</button>
                    <button
                        disabled={saving}
                        onClick={() => onSave(form)}
                        className="px-5 py-2 bg-[#071739] text-white rounded-xl font-semibold text-xs uppercase tracking-widest hover:bg-[#020a1a] disabled:opacity-50 flex items-center gap-1.5"
                    >
                        {saving && <Loader2 size={12} className="animate-spin" />} Save
                    </button>
                </>
            )}
        >
            <p className="text-sm text-slate-500 font-medium mb-5">
                Let recruiters know what role you're looking for to make sure you find opportunities that are right for you.
            </p>
            <div className="space-y-5">
                <Field label="What role are you looking for?">
                    <input
                        type="text"
                        value={form.role || ''}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        placeholder="e.g. Frontend Developer"
                        className={inputCls}
                    />
                </Field>

                <Field label="Industry">
                    <input
                        type="text"
                        value={form.industry || ''}
                        onChange={(e) => setForm({ ...form, industry: e.target.value })}
                        placeholder="e.g. Technology"
                        className={inputCls}
                    />
                </Field>

                <Field label="Are you open to working remotely?">
                    <div className="grid grid-cols-2 gap-2">
                        <YesNoButton active={form.openToRemote === true} onClick={() => setForm({ ...form, openToRemote: true })}>Yes</YesNoButton>
                        <YesNoButton active={form.openToRemote === false} onClick={() => setForm({ ...form, openToRemote: false })}>No</YesNoButton>
                    </div>
                </Field>

                <Field label="Are you willing to relocate within your home country?">
                    <div className="grid grid-cols-2 gap-2">
                        <YesNoButton active={form.willingToRelocate === true} onClick={() => setForm({ ...form, willingToRelocate: true })}>Yes</YesNoButton>
                        <YesNoButton active={form.willingToRelocate === false} onClick={() => setForm({ ...form, willingToRelocate: false })}>No</YesNoButton>
                    </div>
                </Field>
            </div>
        </Modal>
    );
}

function YesNoButton({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                'py-2.5 rounded-xl border-2 text-sm font-semibold transition-all flex items-center justify-center gap-2',
                active ? 'border-[#071739] bg-[#071739] text-white' : 'border-slate-200 text-slate-600 hover:border-[#071739]'
            )}
        >
            {active && <Check size={14} />}
            {children}
        </button>
    );
}

// ─────────────────────────────────────────────────────────
// Additional info modal (resume + links + about)
// ─────────────────────────────────────────────────────────

function AdditionalInfoModal({ isOpen, onClose, initial, onSave, saving }) {
    const [about, setAbout] = useState(initial.about);
    const [resumeUrl, setResumeUrl] = useState(initial.resumeUrl);
    const [links, setLinks] = useState(initial.links);

    useEffect(() => {
        setAbout(initial.about);
        setResumeUrl(initial.resumeUrl);
        setLinks(initial.links);
    }, [initial, isOpen]);

    const addLink = () => {
        if (links.length >= 5) return;
        setLinks([...links, { label: 'LinkedIn', url: '' }]);
    };

    const removeLink = (i) => {
        setLinks(links.filter((_, idx) => idx !== i));
    };

    const updateLink = (i, patch) => {
        setLinks(links.map((l, idx) => idx === i ? { ...l, ...patch } : l));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Additional info"
            maxWidth="max-w-xl"
            footer={(
                <>
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 font-semibold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl">Cancel</button>
                    <button
                        disabled={saving}
                        onClick={() => onSave({ about, resumeUrl, links: links.filter(l => l.url) })}
                        className="px-5 py-2 bg-[#071739] text-white rounded-xl font-semibold text-xs uppercase tracking-widest hover:bg-[#020a1a] disabled:opacity-50 flex items-center gap-1.5"
                    >
                        {saving && <Loader2 size={12} className="animate-spin" />} Save
                    </button>
                </>
            )}
        >
            <p className="text-sm text-slate-500 font-medium mb-5">
                Help recruiters get to know you better by adding links and describing what makes you a great candidate.
            </p>

            <div className="space-y-5">
                {/* Resume */}
                <Field label="Resume URL" hint="Paste a link to your hosted resume (Google Drive, Dropbox, personal site, etc.)">
                    <input
                        type="url"
                        value={resumeUrl}
                        onChange={(e) => setResumeUrl(e.target.value)}
                        placeholder="https://"
                        className={inputCls}
                    />
                </Field>

                {/* Links */}
                <Field label="Additional links" hint="LinkedIn, GitHub, portfolio — up to 5 links.">
                    <div className="space-y-2">
                        {links.map((l, i) => (
                            <div key={i} className="flex gap-2">
                                <select
                                    value={l.label}
                                    onChange={(e) => updateLink(i, { label: e.target.value })}
                                    className="bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3 text-sm font-medium text-slate-800 outline-none focus:ring-4 focus:ring-[#071739]/10 w-32"
                                >
                                    {['LinkedIn', 'GitHub', 'Portfolio', 'Twitter', 'Other'].map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                <input
                                    type="url"
                                    value={l.url}
                                    onChange={(e) => updateLink(i, { url: e.target.value })}
                                    placeholder="https://"
                                    className={clsx(inputCls, 'flex-1')}
                                />
                                <button
                                    onClick={() => removeLink(i)}
                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-slate-100 rounded-lg"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        {links.length < 5 && (
                            <button
                                onClick={addLink}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#071739] hover:text-[#A68868]"
                            >
                                <Plus size={12} /> Add link
                            </button>
                        )}
                    </div>
                </Field>

                {/* About */}
                <Field label="About you" hint={`${500 - (about?.length || 0)} characters remaining.`}>
                    <textarea
                        value={about}
                        onChange={(e) => setAbout(e.target.value.slice(0, 500))}
                        rows={5}
                        placeholder="Include a few brief details about yourself. What are you most passionate about? What achievements are you most proud of? What sets you apart from other candidates?"
                        className={clsx(inputCls, 'resize-none')}
                    />
                </Field>
            </div>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────
// Work experience modal
// ─────────────────────────────────────────────────────────

function WorkExpModal({ isOpen, onClose, initial, onSave, saving }) {
    const [form, setForm] = useState({ title: '', company: '', startDate: '', endDate: '', description: '' });
    useEffect(() => {
        if (initial) {
            setForm({
                title: initial.title || '',
                company: initial.company || '',
                startDate: initial.startDate ? initial.startDate.slice(0, 10) : '',
                endDate: initial.endDate ? initial.endDate.slice(0, 10) : '',
                description: initial.description || ''
            });
        } else {
            setForm({ title: '', company: '', startDate: '', endDate: '', description: '' });
        }
    }, [initial, isOpen]);

    const valid = form.title.trim() && form.company.trim();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initial ? 'Edit work experience' : 'Add work experience'}
            footer={(
                <>
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 font-semibold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl">Cancel</button>
                    <button
                        disabled={!valid || saving}
                        onClick={() => onSave({
                            title: form.title.trim(),
                            company: form.company.trim(),
                            startDate: form.startDate || undefined,
                            endDate: form.endDate || undefined,
                            description: form.description.trim()
                        })}
                        className="px-5 py-2 bg-[#071739] text-white rounded-xl font-semibold text-xs uppercase tracking-widest hover:bg-[#020a1a] disabled:opacity-50 flex items-center gap-1.5"
                    >
                        {saving && <Loader2 size={12} className="animate-spin" />} Save
                    </button>
                </>
            )}
        >
            <div className="space-y-5">
                <Field label="Job title" required>
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Software Engineer" className={inputCls} />
                </Field>
                <Field label="Company" required>
                    <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. Acme Inc." className={inputCls} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Start date">
                        <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="End date" hint="Leave blank for present.">
                        <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputCls} />
                    </Field>
                </div>
                <Field label="Description">
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={4}
                        placeholder="What did you do? What did you learn?"
                        className={clsx(inputCls, 'resize-none')}
                    />
                </Field>
            </div>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────
// Education modal
// ─────────────────────────────────────────────────────────

function EducationModal({ isOpen, onClose, initial, onSave, saving }) {
    const [form, setForm] = useState({ school: '', degree: '', field: '', startYear: '', endYear: '' });
    useEffect(() => {
        if (initial) {
            setForm({
                school: initial.school || '',
                degree: initial.degree || '',
                field: initial.field || '',
                startYear: initial.startYear || '',
                endYear: initial.endYear || ''
            });
        } else {
            setForm({ school: '', degree: '', field: '', startYear: '', endYear: '' });
        }
    }, [initial, isOpen]);

    const valid = form.school.trim();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initial ? 'Edit education' : 'Add education'}
            footer={(
                <>
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 font-semibold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl">Cancel</button>
                    <button
                        disabled={!valid || saving}
                        onClick={() => onSave({
                            school: form.school.trim(),
                            degree: form.degree.trim(),
                            field: form.field.trim(),
                            startYear: form.startYear ? Number(form.startYear) : undefined,
                            endYear: form.endYear ? Number(form.endYear) : undefined
                        })}
                        className="px-5 py-2 bg-[#071739] text-white rounded-xl font-semibold text-xs uppercase tracking-widest hover:bg-[#020a1a] disabled:opacity-50 flex items-center gap-1.5"
                    >
                        {saving && <Loader2 size={12} className="animate-spin" />} Save
                    </button>
                </>
            )}
        >
            <div className="space-y-5">
                <Field label="School / University" required>
                    <input value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} placeholder="e.g. Stanford University" className={inputCls} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Degree">
                        <input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} placeholder="e.g. B.Tech" className={inputCls} />
                    </Field>
                    <Field label="Field of study">
                        <input value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })} placeholder="e.g. Computer Science" className={inputCls} />
                    </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Start year">
                        <input type="number" min="1950" max="2100" value={form.startYear} onChange={(e) => setForm({ ...form, startYear: e.target.value })} placeholder="2020" className={inputCls} />
                    </Field>
                    <Field label="End year" hint="Leave blank if ongoing.">
                        <input type="number" min="1950" max="2100" value={form.endYear} onChange={(e) => setForm({ ...form, endYear: e.target.value })} placeholder="2024" className={inputCls} />
                    </Field>
                </div>
            </div>
        </Modal>
    );
}
