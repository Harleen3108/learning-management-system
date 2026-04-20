'use client';
import { twMerge } from 'tailwind-merge';

export function Card({ children, className }) {
  return (
    <div className={twMerge("bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden", className)}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, colorClass }) {
  return (
    <Card className="p-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={twMerge("p-3 rounded-xl", colorClass)}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
        </div>
      </div>
    </Card>
  );
}
