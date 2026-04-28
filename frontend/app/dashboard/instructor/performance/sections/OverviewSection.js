'use client';
import { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  Star, 
  Clock, 
  CheckCircle2,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/UIElements';
import api from '@/services/api';
import { clsx } from 'clsx';

export default function OverviewSection({ selectedCourse }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOverview = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/performance/overview?courseId=${selectedCourse}`);
                setStats(res.data.data);
            } catch (err) {
                console.error('Failed to fetch overview stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOverview();
    }, [selectedCourse]);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#071739]" size={32} /></div>;

    const cards = [
        { label: 'Total Courses', value: stats?.totalCourses, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Enrolled Students', value: stats?.totalStudents, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Total Revenue', value: `₹${stats?.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-[#071739]', bg: 'bg-[#071739]/5' },
        { label: 'Average Rating', value: stats?.avgRating.toFixed(1), icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Completion Rate', value: `${stats?.completionRate}%`, icon: CheckCircle2, color: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'Total Watch Time', value: '124h', icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cards.map((card, i) => (
                    <Card key={i} className="p-8 relative group overflow-hidden border-slate-50">
                        <div className="flex justify-between items-start relative z-10">
                            <div className={clsx("p-4 rounded-[2rem]", card.bg, card.color)}>
                                <card.icon size={26} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lifetime</span>
                        </div>
                        <div className="mt-8 relative z-10">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{card.label}</p>
                            <p className="text-4xl font-semibold text-slate-900 mt-2">{card.value}</p>
                        </div>
                        <div className={clsx("absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity", card.bg)}></div>
                    </Card>
                ))}
            </div>

            {/* Visual breakdown shell */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-8 border-slate-50">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">Enrollment Growth</h3>
                    <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Chart Visualization Placeholder</p>
                    </div>
                </Card>
                <Card className="p-8 border-slate-50">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">Revenue Trends</h3>
                    <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Chart Visualization Placeholder</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
