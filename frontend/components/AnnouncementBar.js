'use client';
import { useState, useEffect } from 'react';
import { X, Zap, Tag, Rocket, PartyPopper, Info, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import api from '@/services/api';

// Theme palette → icon chip + accent text on the navy EduFlow bar.
// Bar background is the brand navy #071739; tan #A68868 is the primary accent.
const THEMES = {
    flash:       { Icon: Zap,         chipBg: '#A68868', chipText: '#ffffff', accent: '#A68868' },
    offer:       { Icon: Tag,         chipBg: '#A68868', chipText: '#ffffff', accent: '#A68868' },
    launch:      { Icon: Rocket,      chipBg: '#ffffff', chipText: '#071739', accent: '#fef3c7' },
    holiday:     { Icon: PartyPopper, chipBg: '#f472b6', chipText: '#ffffff', accent: '#fbcfe8' },
    info:        { Icon: Info,        chipBg: '#A68868', chipText: '#ffffff', accent: '#A68868' },
    maintenance: { Icon: Wrench,      chipBg: '#f87171', chipText: '#ffffff', accent: '#fecaca' }
};

function useCountdown(targetDate) {
    const [diff, setDiff] = useState(null);

    useEffect(() => {
        if (!targetDate) { setDiff(null); return; }
        const target = new Date(targetDate).getTime();
        const tick = () => {
            const now = Date.now();
            const ms = Math.max(0, target - now);
            const totalSec = Math.floor(ms / 1000);
            const days  = Math.floor(totalSec / 86400);
            const hours = Math.floor((totalSec % 86400) / 3600);
            const minutes = Math.floor((totalSec % 3600) / 60);
            const seconds = totalSec % 60;
            setDiff({ ms, days, hours, minutes, seconds });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [targetDate]);

    return diff;
}

export default function AnnouncementBar({ isVisible, setIsVisible }) {
    const [ann, setAnn] = useState(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await api.get('/site-announcements/active');
                if (!cancelled) setAnn(res.data?.data || null);
            } catch (err) {
                if (!cancelled) setAnn(null);
            } finally {
                if (!cancelled) setLoaded(true);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const countdown = useCountdown(ann?.countdownTo);

    // Hide bar entirely if: explicitly closed, no announcement to show, or countdown already finished
    if (!isVisible) return null;
    if (!loaded) return null;
    if (!ann) return null;
    if (ann.countdownTo && countdown && countdown.ms === 0) return null;

    const theme = THEMES[ann.theme] || THEMES.flash;
    const ThemeIcon = theme.Icon;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-[#071739] text-white overflow-hidden relative z-[110]"
                >
                    <div className="max-w-[1600px] mx-auto px-6 py-3 flex flex-col md:flex-row items-center justify-center gap-4 text-center">
                        <div className="flex items-center gap-3">
                            <div
                                className="p-1 rounded-md flex items-center justify-center"
                                style={{ background: theme.chipBg, color: theme.chipText }}
                            >
                                <ThemeIcon size={14} />
                            </div>
                            <p className="text-sm font-semibold tracking-tight">
                                <span style={{ color: theme.accent }} className="font-semibold">
                                    {ann.message}
                                </span>
                                {ann.countdownTo && countdown && (
                                    <span
                                        className="ml-2 font-mono bg-white/10 px-2 py-0.5 rounded text-xs"
                                        style={{ color: theme.accent }}
                                    >
                                        {countdown.days > 0 && <>{String(countdown.days).padStart(2, '0')}d </>}
                                        {String(countdown.hours).padStart(2, '0')}h{' '}
                                        {String(countdown.minutes).padStart(2, '0')}m{' '}
                                        {String(countdown.seconds).padStart(2, '0')}s
                                    </span>
                                )}
                            </p>
                        </div>

                        {ann.ctaText && ann.ctaHref && (
                            <Link
                                href={ann.ctaHref}
                                className="text-xs font-semibold uppercase tracking-widest bg-[#A68868] text-white px-4 py-1.5 rounded hover:bg-[#8c7155] transition-colors"
                            >
                                {ann.ctaText}
                            </Link>
                        )}

                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                            aria-label="Close announcement"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
