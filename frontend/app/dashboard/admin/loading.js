'use client';
import { motion } from 'framer-motion';

export default function AdminLoading() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="relative">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full shadow-sm"
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center text-blue-600 font-black text-xl"
                >
                    E
                </motion.div>
            </div>
            <div className="flex flex-col items-center gap-2">
                <h4 className="text-sm font-black text-slate-800 tracking-tight uppercase tracking-widest leading-none">Initializing Node</h4>
                <p className="text-[10px] text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em]">Syncing with platform core...</p>
            </div>
        </div>
    );
}
