'use client';
import {
    Users,
    BookOpen,
    Star,
    Globe,
    Linkedin,
    Twitter,
    Youtube,
    CheckCircle2,
    Calendar,
    ArrowRight,
    Award,
    GraduationCap,
    Sparkles,
    Mail,
    MapPin,
    X,
    Send,
    Loader2,
    LogIn,
    Check
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import CourseCard from '@/components/CourseCard';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';

// EduFlow palette: navy #071739, tan #A68868. font-semibold/font-medium typography only.
//
// Public instructor profile. The previous version had a dark navy hero where the
// name was rendered in dark navy too — invisible. This rewrite uses the EduFlow
// theme: navy hero with white name + tan tagline, tan accents in the highlights
// card, and cleaner card-based body content.

export default function InstructorProfile({ data }) {
    const { profile, stats, courses } = data;
    const [composeOpen, setComposeOpen] = useState(false);

    const socialIcons = {
        website: Globe,
        linkedin: Linkedin,
        twitter: Twitter,
        youtube: Youtube
    };

    const joinedLabel = profile.createdAt
        ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : '—';

    return (
        <div className="space-y-10 pb-12">
            {/* ─────────── Hero (light) ─────────── */}
            <section className="bg-white border border-slate-100 rounded-3xl p-6 lg:p-10 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-center lg:items-start">
                    {/* Avatar */}
                    <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-3xl overflow-hidden shrink-0 bg-slate-100 border border-slate-100">
                        <img
                            src={profile.profilePhoto === 'no-photo.jpg'
                                ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`
                                : profile.profilePhoto}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Headline */}
                    <div className="flex-1 text-center lg:text-left space-y-4">
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A68868]">Verified Instructor</p>
                            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
                                {profile.name}
                            </h1>
                            <p className="text-sm lg:text-base font-medium text-slate-500">
                                {profile.instructorSpecialty || 'Expert Instructor'}
                            </p>
                        </div>

                        {profile.instructorBio && (
                            <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 line-clamp-3">
                                {profile.instructorBio}
                            </p>
                        )}

                        {/* Social links */}
                        <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                            {Object.entries(profile.socialLinks || {}).map(([platform, url]) => {
                                if (!url) return null;
                                const Icon = socialIcons[platform] || Globe;
                                return (
                                    <a
                                        key={platform}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-9 h-9 bg-slate-50 hover:bg-[#A68868] hover:text-white transition-all rounded-xl flex items-center justify-center text-slate-500 border border-slate-100"
                                    >
                                        <Icon size={15} />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Stats strip */}
                <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <Stat value={stats.totalStudents.toLocaleString()} suffix="+" label="Students taught" tone="tan" />
                    <Stat value={stats.totalCourses} label="Courses published" />
                    <Stat value={stats.averageRating || '—'} label="Average rating" icon={<Star size={14} className="text-amber-400 fill-amber-400" />} />
                    <Stat value={stats.totalReviews.toLocaleString()} label="Total reviews" />
                </div>
            </section>

            {/* ─────────── Body ─────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main column */}
                <div className="lg:col-span-2 space-y-12">
                    {/* About */}
                    <section>
                        <SectionHeader Icon={Users} title="About instructor" />
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 lg:p-8 mt-5">
                            {profile.instructorBio ? (
                                <p className="text-[15px] font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {profile.instructorBio}
                                </p>
                            ) : (
                                <p className="text-sm font-medium text-slate-400 italic">
                                    This instructor hasn't added a bio yet.
                                </p>
                            )}

                            {/* Optional meta strip */}
                            {(profile.location || profile.email) && (
                                <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-2">
                                    {profile.location && (
                                        <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                                            <MapPin size={12} className="text-[#A68868]" />
                                            {profile.location}
                                        </span>
                                    )}
                                    {profile.email && (
                                        <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                                            <Mail size={12} className="text-[#A68868]" />
                                            {profile.email}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Courses */}
                    <section>
                        <div className="flex items-end justify-between gap-4">
                            <SectionHeader Icon={BookOpen} title="Published courses" subtitle={`${courses.length} live`} />
                            {courses.length > 0 && (
                                <Link
                                    href="/explore"
                                    className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#071739] hover:text-[#A68868] transition-colors"
                                >
                                    Browse more <ArrowRight size={12} />
                                </Link>
                            )}
                        </div>

                        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {courses.length > 0 ? (
                                courses.map((course) => (
                                    <CourseCard key={course._id} course={course} />
                                ))
                            ) : (
                                <div className="col-span-full bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center text-center gap-2">
                                    <BookOpen size={28} className="text-slate-300" />
                                    <p className="text-sm font-semibold text-slate-700">No courses published yet</p>
                                    <p className="text-xs font-medium text-slate-500">Check back soon — this instructor is just getting started.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <aside className="space-y-6">
                    {/* Highlights card */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A68868] mb-1">Highlights</p>
                            <h3 className="text-base font-semibold text-slate-900 tracking-tight">Why students choose them</h3>
                        </div>

                        <div className="space-y-4">
                            <Highlight
                                Icon={CheckCircle2}
                                accent="emerald"
                                title="Verified instructor"
                                hint="Identity and credentials verified by EduFlow."
                            />
                            <Highlight
                                Icon={Calendar}
                                accent="navy"
                                title="Joined EduFlow"
                                hint={joinedLabel}
                            />
                            {stats.averageRating > 0 && (
                                <Highlight
                                    Icon={Star}
                                    accent="amber"
                                    title={`${stats.averageRating} rating`}
                                    hint={`From ${stats.totalReviews.toLocaleString()} student review${stats.totalReviews === 1 ? '' : 's'}.`}
                                />
                            )}
                            {stats.totalCourses > 0 && (
                                <Highlight
                                    Icon={GraduationCap}
                                    accent="tan"
                                    title={`${stats.totalCourses} course${stats.totalCourses === 1 ? '' : 's'}`}
                                    hint="Active on the platform."
                                />
                            )}
                        </div>

                        <button
                            onClick={() => setComposeOpen(true)}
                            className="w-full py-3 bg-[#071739] hover:bg-[#020a1a] text-white rounded-xl font-semibold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            Message instructor <ArrowRight size={13} />
                        </button>
                    </div>

                    {/* Trust card */}
                    <div className="bg-[#A68868]/5 border border-[#A68868]/20 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Award size={16} className="text-[#A68868]" />
                            <h4 className="text-sm font-semibold text-slate-900">EduFlow Trust</h4>
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                            Courses from this instructor are backed by the EduFlow Quality Guarantee.
                            If you're not satisfied, we offer a 30-day money-back guarantee.
                        </p>
                    </div>

                    {/* Featured course teaser — only when at least one course exists */}
                    {courses.length > 0 && (
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles size={14} className="text-[#A68868]" />
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A68868]">Featured</p>
                            </div>
                            <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 mb-2">
                                {courses[0].title}
                            </p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3 mb-4">
                                {courses[0].subtitle || courses[0].description || 'Dive into a hand-crafted curriculum.'}
                            </p>
                            <Link
                                href={`/courses/${courses[0]._id}`}
                                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#071739] hover:text-[#A68868] transition-colors"
                            >
                                View course <ArrowRight size={12} />
                            </Link>
                        </div>
                    )}
                </aside>
            </div>

            {/* Compose modal — only mounts when opened */}
            <AnimatePresence>
                {composeOpen && (
                    <MessageInstructorModal
                        instructor={profile}
                        onClose={() => setComposeOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ──────────────────────────────────────────────
// Compose modal — student → instructor
// ──────────────────────────────────────────────
function MessageInstructorModal({ instructor, onClose }) {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [sentOk, setSentOk] = useState(false);

    const send = async () => {
        setError('');
        if (!text.trim()) return setError('Type a message before sending.');
        setSending(true);
        try {
            await api.post('/student/messages', {
                recipientId: instructor._id,
                text: text.trim()
            });
            setSentOk(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not send your message.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !sending && onClose()}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-3">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A68868] mb-1">Direct message</p>
                        <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
                            {sentOk ? 'Message sent' : `Message ${instructor.name}`}
                        </h2>
                    </div>
                    <button
                        onClick={() => !sending && onClose()}
                        className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                    {!isAuthenticated ? (
                        // Not logged in → ask the user to sign in first
                        <div className="text-center space-y-3">
                            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#071739]/5 text-[#071739] flex items-center justify-center">
                                <LogIn size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Sign in to send a message</p>
                                <p className="text-xs font-medium text-slate-500 mt-1">
                                    You need to be logged in so {instructor.name} can reply to you.
                                </p>
                            </div>
                            <button
                                onClick={() => router.push(`/login?next=/instructors/${instructor._id || ''}`)}
                                className="w-full py-2.5 bg-[#071739] hover:bg-[#020a1a] text-white rounded-xl font-semibold text-xs uppercase tracking-widest"
                            >
                                Sign in
                            </button>
                        </div>
                    ) : sentOk ? (
                        // Success state
                        <div className="text-center space-y-3 py-2">
                            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <Check size={22} />
                            </div>
                            <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                Your message was delivered to <span className="font-semibold text-slate-900">{instructor.name}</span>.
                                You'll see their reply in your notifications.
                            </p>
                        </div>
                    ) : (
                        // Compose form
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                <div className="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                                    <img
                                        src={instructor.profilePhoto === 'no-photo.jpg'
                                            ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${instructor.name}`
                                            : instructor.profilePhoto}
                                        alt="" className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 truncate">{instructor.name}</p>
                                    <p className="text-[11px] font-medium text-slate-500 truncate">
                                        {instructor.instructorSpecialty || 'Instructor'}
                                    </p>
                                </div>
                            </div>
                            <textarea
                                rows={5}
                                autoFocus
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder={`Hi ${instructor.name?.split(' ')[0] || 'there'} — I had a question about your course…`}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-[#071739]/10 focus:border-[#071739]/20 focus:bg-white transition-all resize-none"
                            />
                            {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}
                            <p className="text-[11px] text-slate-400 font-medium">
                                Sent as <span className="font-semibold text-slate-600">{user?.name}</span>. The instructor will see this in their inbox.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    {sentOk ? (
                        <button
                            onClick={onClose}
                            className="ml-auto px-5 py-2.5 bg-[#071739] hover:bg-[#020a1a] text-white rounded-xl font-semibold text-xs uppercase tracking-widest"
                        >
                            Done
                        </button>
                    ) : isAuthenticated ? (
                        <>
                            <button
                                onClick={() => !sending && onClose()}
                                className="px-4 py-2 text-slate-500 font-semibold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={send}
                                disabled={sending}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#071739] hover:bg-[#020a1a] text-white rounded-xl font-semibold text-xs uppercase tracking-widest disabled:opacity-50"
                            >
                                {sending && <Loader2 size={13} className="animate-spin" />}
                                <Send size={13} /> Send
                            </button>
                        </>
                    ) : null}
                </div>
            </motion.div>
        </div>
    );
}

// ──────────────────────────────────────────────
// Building blocks
// ──────────────────────────────────────────────

function Stat({ value, suffix = '', label, tone = 'navy', icon }) {
    const valueCls = tone === 'tan' ? 'text-[#A68868]' : 'text-[#071739]';
    return (
        <div className="space-y-1">
            <p className={`text-2xl lg:text-3xl font-semibold tracking-tight flex items-center gap-2 justify-center lg:justify-start ${valueCls}`}>
                {icon}
                {value}{suffix}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
        </div>
    );
}

function SectionHeader({ Icon, title, subtitle }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#A68868]/10 rounded-xl flex items-center justify-center text-[#A68868]">
                <Icon size={18} />
            </div>
            <div>
                <h2 className="text-xl lg:text-2xl font-semibold text-slate-900 tracking-tight">{title}</h2>
                {subtitle && <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{subtitle}</p>}
            </div>
        </div>
    );
}

function Highlight({ Icon, title, hint, accent = 'navy' }) {
    const accentMap = {
        navy:    'bg-[#071739]/5 text-[#071739]',
        tan:     'bg-[#A68868]/10 text-[#A68868]',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber:   'bg-amber-50 text-amber-600'
    };
    const cls = accentMap[accent] || accentMap.navy;
    return (
        <div className="flex gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cls}`}>
                <Icon size={16} />
            </div>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">{hint}</p>
            </div>
        </div>
    );
}
