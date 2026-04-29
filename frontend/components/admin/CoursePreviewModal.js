'use client';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Play,
    Clock,
    CheckCircle2,
    ChevronDown,
    Monitor,
    BookOpen,
    Star,
    HelpCircle,
    Calendar,
    User,
    Tag,
    FileText
} from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';

// Compact, scrollable preview card — fits the EduFlow theme.
// Replaces the previous full-page hero. Anything else still imports the
// component the same way and uses the same props (course, isOpen, onClose,
// onApprove, onReject), so the courses page doesn't need any changes.

// Bail when a "name" is actually a raw 24-char Mongo ObjectId (means category
// wasn't populated by the API). Returns the value if it looks like a real label,
// otherwise the supplied fallback.
const labelOrFallback = (val, fallback) => {
    if (!val) return fallback;
    const s = typeof val === 'string' ? val : (val.name || '');
    if (!s) return fallback;
    if (/^[a-f0-9]{24}$/i.test(s)) return fallback;
    return s;
};

export default function CoursePreviewModal({ course, isOpen, onClose, onApprove, onReject }) {
    const [expandedModule, setExpandedModule] = useState(null);

    if (!course) return null;

    const list = Number(course.price) || 0;
    const disc = Number(course.discountPrice) || 0;
    const payable = disc > 0 && disc < list ? disc : list;
    const totalLessons = (course.modules || []).reduce(
        (acc, m) => acc + (m.lessons?.length || 0),
        0
    );

    const thumbnail = course.thumbnail && course.thumbnail !== 'no-photo.jpg'
        ? course.thumbnail
        : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80';

    const categoryLabel = labelOrFallback(course.category, 'Course');
    const subcategoryLabel = labelOrFallback(course.subcategory, null);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                    />

                    {/* Compact card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Floating close button — pinned over the modal so it's always reachable
                            even when the user has scrolled the image off the top. */}
                        <button
                            onClick={onClose}
                            aria-label="Close preview"
                            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-slate-800 flex items-center justify-center transition-all shadow-md ring-1 ring-slate-200/60"
                        >
                            <X size={16} />
                        </button>

                        {/* Single scrollable region — image, title, facts, content all scroll
                            together. min-h-0 lets flex-1 actually constrain & scroll inside flex-col. */}
                        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar overscroll-contain">
                            {/* Thumbnail header (now scrolls along with the rest) */}
                            <div className="relative aspect-[16/8] bg-slate-100">
                                <img
                                    src={thumbnail}
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                                <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                                    <span className="bg-white/95 backdrop-blur-md text-[#071739] text-[9px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-md">
                                        {categoryLabel}
                                    </span>
                                    {subcategoryLabel && (
                                        <span className="bg-[#A68868]/90 text-white text-[9px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-md">
                                            {subcategoryLabel}
                                        </span>
                                    )}
                                    {payable === 0 && (
                                        <span className="bg-emerald-500 text-white text-[9px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-md">
                                            Free
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Title + rating */}
                            <div className="px-6 pt-5 pb-4 border-b border-slate-100">
                                <h2 className="text-xl font-semibold text-slate-900 tracking-tight leading-snug">
                                    {course.title}
                                </h2>
                                {(course.subtitle || course.tagline) && (
                                    <p className="text-sm text-slate-500 font-medium mt-1.5">
                                        {course.subtitle || course.tagline}
                                    </p>
                                )}

                                <div className="flex items-center gap-2 mt-3">
                                    <div className="flex items-center gap-1 text-amber-500">
                                        {[...Array(5)].map((_, i) => {
                                            const filled = i < Math.round(course.averageRating || 0);
                                            return (
                                                <Star
                                                    key={i}
                                                    size={13}
                                                    fill={filled ? 'currentColor' : 'none'}
                                                    className={filled ? 'text-amber-500' : 'text-slate-200'}
                                                />
                                            );
                                        })}
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700">
                                        {Number(course.averageRating || 0).toFixed(1)}
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                        {(course.totalRatings || 0) > 0
                                            ? `(${course.totalRatings} ${course.totalRatings === 1 ? 'rating' : 'ratings'})`
                                            : '(no ratings yet)'}
                                    </span>
                                </div>
                            </div>

                            {/* Body content */}
                            <div className="px-6 py-5 space-y-6">
                            {/* Quick facts */}
                            <div className="grid grid-cols-2 gap-2">
                                <Fact icon={<User size={13} />} label="Instructor" value={course.instructor?.name || '—'} />
                                <Fact icon={<Monitor size={13} />} label="Language" value={course.language || 'English'} />
                                <Fact icon={<BookOpen size={13} />} label="Modules" value={`${course.modules?.length || 0}`} />
                                <Fact icon={<Play size={13} />} label="Lessons" value={`${totalLessons}`} />
                                <Fact icon={<Calendar size={13} />} label="Updated" value={new Date(course.updatedAt || course.createdAt).toLocaleDateString()} />
                                <Fact icon={<Tag size={13} />} label="Level" value={course.difficulty || 'All levels'} className="capitalize" />
                            </div>

                            {/* Description */}
                            {course.description && (
                                <section className="space-y-2">
                                    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Description</h3>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-line">
                                        {course.description}
                                    </p>
                                </section>
                            )}

                            {/* What you'll learn */}
                            {course.whatYouWillLearn?.filter(Boolean).length > 0 && (
                                <section className="space-y-3">
                                    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">What you'll learn</h3>
                                    <ul className="space-y-2">
                                        {course.whatYouWillLearn.filter(Boolean).map((point, i) => (
                                            <li key={i} className="flex gap-2 text-sm text-slate-600 font-medium leading-relaxed">
                                                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {/* Requirements */}
                            {course.requirements?.filter(Boolean).length > 0 && (
                                <section className="space-y-2">
                                    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Requirements</h3>
                                    <ul className="space-y-1.5">
                                        {course.requirements.filter(Boolean).map((req, i) => (
                                            <li key={i} className="flex items-center gap-2.5 text-sm text-slate-600 font-medium">
                                                <div className="w-1 h-1 rounded-full bg-[#A68868]"></div>
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {/* Course content (collapsible per module) */}
                            {course.modules?.length > 0 && (
                                <section className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                            Course content
                                        </h3>
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            {course.modules.length} {course.modules.length === 1 ? 'section' : 'sections'} · {totalLessons} {totalLessons === 1 ? 'lecture' : 'lectures'}
                                        </span>
                                    </div>
                                    <div className="border border-slate-100 rounded-xl overflow-hidden">
                                        {course.modules.map((m, mIdx) => {
                                            const open = expandedModule === mIdx;
                                            return (
                                                <div key={m._id || mIdx} className="border-b border-slate-100 last:border-b-0">
                                                    <button
                                                        onClick={() => setExpandedModule(open ? null : mIdx)}
                                                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-all text-left"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <span className="text-[10px] font-semibold text-slate-400 tracking-wider w-6">
                                                                {(mIdx + 1).toString().padStart(2, '0')}
                                                            </span>
                                                            <span className="text-[13px] font-semibold text-slate-800 truncate">{m.title}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 shrink-0">
                                                            <span className="text-[10px] text-slate-400 font-medium">
                                                                {m.lessons?.length || 0} lessons
                                                            </span>
                                                            <ChevronDown
                                                                size={14}
                                                                className={clsx(
                                                                    'text-slate-400 transition-transform',
                                                                    open && 'rotate-180'
                                                                )}
                                                            />
                                                        </div>
                                                    </button>

                                                    <AnimatePresence>
                                                        {open && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden bg-slate-50/50"
                                                            >
                                                                <div className="px-4 py-2 space-y-1.5">
                                                                    {m.lessons?.map((l) => (
                                                                        <div
                                                                            key={l._id}
                                                                            className="flex items-center gap-2 text-[12px] text-slate-600 font-medium"
                                                                        >
                                                                            <Play size={11} className="text-slate-400 shrink-0" />
                                                                            <span className="truncate">{l.title}</span>
                                                                        </div>
                                                                    ))}
                                                                    {m.quizzes?.map((q) => (
                                                                        <div
                                                                            key={q._id}
                                                                            className="flex items-center gap-2 text-[12px] text-amber-600 font-medium"
                                                                        >
                                                                            <HelpCircle size={11} className="shrink-0" />
                                                                            <span className="truncate">Quiz: {q.title}</span>
                                                                        </div>
                                                                    ))}
                                                                    {m.attachments?.map((a, ai) => (
                                                                        <div
                                                                            key={`att-${ai}`}
                                                                            className="flex items-center gap-2 text-[12px] text-blue-600 font-medium"
                                                                        >
                                                                            <FileText size={11} className="shrink-0" />
                                                                            <span className="truncate">{a.name || 'Resource'}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}
                            </div>
                        </div>

                        {/* Footer — pricing + actions (stays pinned at the bottom) */}
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/40 shrink-0 flex items-center justify-between gap-4">
                            <div>
                                {payable === 0 ? (
                                    <p className="text-xl font-semibold text-emerald-600">Free</p>
                                ) : (
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-xl font-semibold text-slate-900">₹{payable}</p>
                                        {disc > 0 && disc < list && (
                                            <>
                                                <p className="text-xs text-slate-400 font-medium line-through">₹{list}</p>
                                                <p className="text-[10px] font-semibold text-[#A68868] uppercase tracking-widest">
                                                    {Math.round(((list - disc) / list) * 100)}% off
                                                </p>
                                            </>
                                        )}
                                    </div>
                                )}
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">
                                    Status: {course.status || 'draft'}
                                </p>
                            </div>

                            {(() => {
                                // Decide which action(s) make sense for the course's current status:
                                //   • published → only allow Reject (revoke approval)
                                //   • rejected  → only allow Approve (re-approve)
                                //   • pending / draft / needs changes / archived → both actions
                                const status = (course.status || 'draft').toLowerCase();
                                const showApprove = !!onApprove && status !== 'published';
                                const showReject  = !!onReject  && status !== 'rejected';

                                if (!showApprove && !showReject) {
                                    return (
                                        <button
                                            onClick={onClose}
                                            className="px-5 py-2.5 bg-[#071739] text-white rounded-xl text-xs font-semibold uppercase tracking-widest hover:bg-[#020a1a] transition-all"
                                        >
                                            Close
                                        </button>
                                    );
                                }

                                return (
                                    <div className="flex gap-2">
                                        {showReject && (
                                            <button
                                                onClick={() => { onReject(course); onClose(); }}
                                                className="px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-semibold uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center gap-1.5"
                                            >
                                                <X size={13} /> Reject
                                            </button>
                                        )}
                                        {showApprove && (
                                            <button
                                                onClick={() => { onApprove(course._id); onClose(); }}
                                                className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-semibold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                                            >
                                                <CheckCircle2 size={13} /> Approve
                                            </button>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function Fact({ icon, label, value, className }) {
    return (
        <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-white text-[#071739] flex items-center justify-center shrink-0 border border-slate-100">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
                <p className={clsx('text-xs font-semibold text-slate-800 truncate', className)}>{value}</p>
            </div>
        </div>
    );
}
