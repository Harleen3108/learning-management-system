'use client';
import { useState, useEffect } from 'react';
import { X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function AnnouncementBar({ isVisible, setIsVisible }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 18, minutes: 42, seconds: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-[#2d2f31] text-white overflow-hidden relative z-[110]"
        >
          <div className="max-w-[1600px] mx-auto px-6 py-3 flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            <div className="flex items-center gap-3">
              <div className="bg-[#bef264] p-1 rounded-md text-slate-900">
                <Zap size={14} fill="currentColor" />
              </div>
              <p className="text-sm font-bold tracking-tight">
                <span className="text-[#bef264]">Flash Sale!</span> Courses from ₹399. Ends in: 
                <span className="ml-2 font-mono bg-white/10 px-2 py-0.5 rounded text-[#bef264]">
                  {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </p>
            </div>
            
            <Link 
              href="/courses" 
              className="text-xs font-bold uppercase tracking-widest bg-white text-slate-900 px-4 py-1.5 rounded hover:bg-[#bef264] transition-colors"
            >
              Shop Now
            </Link>

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
