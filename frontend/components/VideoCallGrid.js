'use client';
import { motion } from 'framer-motion';

const avatars = [
  'https://i.pravatar.cc/150?u=1',
  'https://i.pravatar.cc/150?u=2',
  'https://i.pravatar.cc/150?u=3',
  'https://i.pravatar.cc/150?u=4',
  'https://i.pravatar.cc/150?u=5',
  'https://i.pravatar.cc/150?u=6',
  'https://i.pravatar.cc/150?u=7',
  'https://i.pravatar.cc/150?u=8',
  'https://i.pravatar.cc/150?u=9',
];

export default function VideoCallGrid() {
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4 p-4 bg-slate-100 rounded-3xl relative">
        {avatars.map((url, i) => (
            <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="aspect-square rounded-xl overflow-hidden relative group"
            >
                <img src={url} alt={`User ${i}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/40 backdrop-blur-sm rounded text-[8px] text-white font-bold">
                    User {i + 1}
                </div>
            </motion.div>
        ))}
        {/* Active Speaker Indicator Overlay */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-3xl -z-10" />
    </div>
  );
}
