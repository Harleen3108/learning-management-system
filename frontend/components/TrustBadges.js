'use client';
import { Star } from 'lucide-react';

export default function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center gap-12 mt-12">
      {/* Trustpilot */}
      <div className="flex items-center gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Review On</p>
          <div className="flex items-center gap-1">
            <div className="bg-emerald-500 p-0.5 rounded-sm">
                <Star size={12} fill="white" className="text-white" />
            </div>
            <div className="bg-emerald-500 p-0.5 rounded-sm">
                <Star size={12} fill="white" className="text-white" />
            </div>
            <div className="bg-emerald-500 p-0.5 rounded-sm">
                <Star size={12} fill="white" className="text-white" />
            </div>
            <div className="bg-emerald-500 p-0.5 rounded-sm">
                <Star size={12} fill="white" className="text-white" />
            </div>
            <div className="bg-emerald-500 p-0.5 rounded-sm opacity-50">
                <Star size={12} fill="white" className="text-white" />
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm font-black text-slate-800">Trustpilot</p>
          <p className="text-[10px] font-bold text-slate-400">544+ Reviews</p>
        </div>
      </div>

      {/* Google */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-lg flex items-center justify-center">
            <img src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" alt="Google" className="w-6 h-6" />
        </div>
        <div>
            <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill="#F59E0B" className="text-amber-500" />
                ))}
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">Review 4.9/5.0</p>
        </div>
      </div>
    </div>
  );
}
