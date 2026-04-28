'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Award,
    Clock,
    BarChart3,
    Globe,
    Check,
    ShoppingCart,
    PlayCircle,
    BookOpen,
    Star,
    Heart
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { clsx } from 'clsx';

/**
 * CoursePreviewPopup
 * Udemy-style hover preview that floats next to the wrapped card.
 *
 * Usage:
 *   <CourseHoverPreview course={course} enrolled={isEnrolled}>
 *      <YourCardJSX />
 *   </CourseHoverPreview>
 *
 * Behavior:
 *   • Mouse-over the wrapped card → after 350ms a panel appears beside it
 *   • The panel itself is hover-able (mouse can move into it without dismissing)
 *   • Auto-flips to the other side of the card if there isn't room on the right
 *   • Hidden on touch devices (no hover) — your normal card click still works
 */
export default function CourseHoverPreview({ course, enrolled = false, children }) {
    const triggerRef = useRef(null);
    const popupRef = useRef(null);
    const enterTimer = useRef(null);
    const leaveTimer = useRef(null);
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, side: 'right' });
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    // Compute popup placement next to the trigger card.
    const computePosition = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const POPUP_W = 360;
        const GAP = 12;
        // prefer right; flip to left if it would overflow viewport
        const fitsRight = rect.right + GAP + POPUP_W < window.innerWidth - 12;
        const side = fitsRight ? 'right' : 'left';
        const left = side === 'right'
            ? rect.right + GAP
            : Math.max(12, rect.left - GAP - POPUP_W);

        // vertically centered around the trigger, clamped to viewport
        const guessHeight = 480;
        let top = rect.top + rect.height / 2 - guessHeight / 2;
        top = Math.max(12, Math.min(top, window.innerHeight - guessHeight - 12));

        setCoords({ top, left, side });
    };

    const handleEnter = () => {
        clearTimeout(leaveTimer.current);
        // Skip on coarse pointers (touch) — they have no hover.
        if (typeof window !== 'undefined' && window.matchMedia?.('(hover: none)').matches) return;
        enterTimer.current = setTimeout(() => {
            computePosition();
            setOpen(true);
        }, 350);
    };

    const handleLeave = () => {
        clearTimeout(enterTimer.current);
        leaveTimer.current = setTimeout(() => setOpen(false), 120);
    };

    // Close on scroll/resize so it doesn't stay floating in the wrong spot.
    useEffect(() => {
        if (!open) return;
        const close = () => setOpen(false);
        window.addEventListener('scroll', close, { passive: true, capture: true });
        window.addEventListener('resize', close);
        return () => {
            window.removeEventListener('scroll', close, true);
            window.removeEventListener('resize', close);
        };
    }, [open]);

    return (
        <>
            <div
                ref={triggerRef}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
                className="relative"
            >
                {children}
            </div>

            {mounted && createPortal(
                <AnimatePresence>
                    {open && (
                        <motion.div
                            ref={popupRef}
                            onMouseEnter={() => clearTimeout(leaveTimer.current)}
                            onMouseLeave={handleLeave}
                            initial={{ opacity: 0, x: coords.side === 'right' ? -8 : 8, scale: 0.98 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: coords.side === 'right' ? -8 : 8, scale: 0.98 }}
                            transition={{ duration: 0.18 }}
                            style={{ position: 'fixed', top: coords.top, left: coords.left, width: 360, zIndex: 9999 }}
                            className="bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10 overflow-hidden hidden lg:block"
                        >
                            <PopupBody course={course} enrolled={enrolled} />
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}

// ────────────────────────────────────────────────────────────────────
// Popup body
// ────────────────────────────────────────────────────────────────────

function PopupBody({ course, enrolled }) {
    const { items, addToCart, removeFromCart } = useCartStore();
    const list = Number(course.price) || 0;
    const disc = Number(course.discountPrice) || 0;
    const payable = disc > 0 && disc < list ? disc : list;
    const inCart = items.some(i => i._id === course._id);
    const totalLessons = (course.modules || []).reduce((acc, m) => acc + (m.lessons?.length || 0), 0)
        || course.totalLessons
        || course.progress?.total
        || 0;

    const learnHref = enrolled
        ? `/dashboard/courses/${course._id}?view=learn`
        : `/dashboard/courses/${course._id}`;

    // Pull up to 4 quick highlights — prefer "What you'll learn" bullets, fall back to topics.
    const highlights = (course.whatYouWillLearn || []).filter(Boolean).slice(0, 4);
    const fallbackHighlights = (course.topics || []).filter(Boolean).slice(0, 4);
    const bullets = highlights.length ? highlights : fallbackHighlights;

    const updatedAt = course.updatedAt || course.createdAt;

    return (
        <div className="p-5 space-y-4">
            {/* Title + badges */}
            <div className="space-y-2.5">
                <h3 className="text-base font-semibold text-slate-900 leading-snug line-clamp-2">
                    {course.title}
                </h3>
                <div className="flex items-center gap-1.5 flex-wrap">
                    {course.status === 'published' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#071739] text-white text-[9px] font-semibold uppercase tracking-widest rounded">
                            <Award size={9} /> Premium
                        </span>
                    )}
                    {(course.averageRating ?? 0) >= 4.5 && (
                        <span className="inline-flex items-center px-2 py-0.5 bg-[#A68868]/15 text-[#A68868] text-[9px] font-semibold uppercase tracking-widest rounded">
                            Bestseller
                        </span>
                    )}
                    {payable === 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-semibold uppercase tracking-widest rounded">
                            Free
                        </span>
                    )}
                </div>
            </div>

            {/* Updated date */}
            {updatedAt && (
                <p className="text-xs text-slate-500 font-medium">
                    Updated{' '}
                    <span className="text-emerald-600 font-semibold">
                        {new Date(updatedAt).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                </p>
            )}

            {/* Stat row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-slate-500 font-medium">
                {totalLessons > 0 && (
                    <span className="flex items-center gap-1.5">
                        <BookOpen size={12} className="text-[#A68868]" /> {totalLessons} lessons
                    </span>
                )}
                {course.duration && (
                    <span className="flex items-center gap-1.5">
                        <Clock size={12} className="text-[#A68868]" /> {course.duration}
                    </span>
                )}
                {course.difficulty && (
                    <span className="flex items-center gap-1.5 capitalize">
                        <BarChart3 size={12} className="text-[#A68868]" /> {course.difficulty}
                    </span>
                )}
                {course.language && (
                    <span className="flex items-center gap-1.5">
                        <Globe size={12} className="text-[#A68868]" /> {course.language}
                    </span>
                )}
            </div>

            {/* Rating */}
            {(course.averageRating || course.totalRatings) && (
                <div className="flex items-center gap-1.5 text-xs">
                    <Star size={12} className="text-[#A68868] fill-[#A68868]" />
                    <span className="text-slate-700 font-semibold">
                        {course.averageRating ? course.averageRating.toFixed(1) : '4.5'}
                    </span>
                    <span className="text-slate-400 font-medium">
                        ({course.totalRatings || course.reviewsCount || 0})
                    </span>
                </div>
            )}

            {/* Short description */}
            {course.description && (
                <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-3">
                    {course.description}
                </p>
            )}

            {/* Highlights / What you'll learn */}
            {bullets.length > 0 && (
                <ul className="space-y-2">
                    {bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600 font-medium leading-relaxed">
                            <Check size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                            <span className="line-clamp-2">{b}</span>
                        </li>
                    ))}
                </ul>
            )}

            {/* Action row */}
            <div className="pt-1 flex items-center gap-2">
                {enrolled ? (
                    <Link
                        href={learnHref}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-[#071739] hover:bg-[#020a1a] text-white py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all shadow-md shadow-[#071739]/15"
                    >
                        <PlayCircle size={14} /> Continue learning
                    </Link>
                ) : payable === 0 ? (
                    <Link
                        href={`/dashboard/courses/${course._id}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-[#071739] hover:bg-[#020a1a] text-white py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all shadow-md shadow-[#071739]/15"
                    >
                        <PlayCircle size={14} /> Start free
                    </Link>
                ) : inCart ? (
                    <button
                        onClick={() => removeFromCart(course._id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest hover:bg-emerald-100 transition-all"
                    >
                        <Check size={13} /> In cart
                    </button>
                ) : (
                    <button
                        onClick={() => addToCart({ ...course, payable })}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-[#071739] hover:bg-[#020a1a] text-white py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all shadow-md shadow-[#071739]/15"
                    >
                        <ShoppingCart size={13} /> Add to cart
                    </button>
                )}
                <button
                    type="button"
                    aria-label="Wishlist"
                    className="w-10 h-10 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all flex items-center justify-center shrink-0"
                >
                    <Heart size={14} />
                </button>
            </div>

            {/* Pricing breakdown for non-enrolled, non-free */}
            {!enrolled && payable > 0 && (
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <span className="text-base font-semibold text-slate-900">₹{payable}</span>
                    {disc > 0 && disc < list && (
                        <>
                            <span className="text-xs text-slate-400 font-medium line-through">₹{list}</span>
                            <span className="ml-auto text-[10px] font-semibold text-[#A68868] uppercase tracking-widest">
                                {Math.round(((list - disc) / list) * 100)}% off
                            </span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
