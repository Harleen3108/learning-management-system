'use client';
import { useEffect, useState } from 'react';
import { 
    TrendingUp, 
    Users, 
    DollarSign, 
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from 'lucide-react';
import { Card } from '@/components/UIElements';
import api from '@/services/api';
import { motion } from 'framer-motion';

export default function InstructorAnalytics() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/analytics/instructor');
                setStats(res.data.data);
            } catch (err) {
                console.error('Failed to fetch analytics:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    const cards = [
        { label: 'Total Revenue', value: `₹${stats?.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Total Students', value: stats?.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active Courses', value: stats?.totalCourses, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Performance Analytics</h1>
                <p className="text-slate-500 font-medium mt-1">Deep dive into your teaching metrics and growth.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {cards.map((card, i) => (
                    <Card key={i} className="p-8 group hover:scale-[1.02] transition-transform">
                        <div className={`p-4 rounded-[2rem] ${card.bg} ${card.color} w-fit mb-6`}>
                            <card.icon size={26} />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 mt-2">{card.value}</h3>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-8">
                    <h3 className="font-bold text-slate-900 text-xl mb-8">Course Breakdown</h3>
                    <div className="space-y-6">
                        {stats?.courseBreakdown.map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-blue-600 shadow-sm">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 leading-tight">Course ID: {c._id}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{c.enrollments} Students</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-slate-900">₹{c.revenue.toLocaleString()}</p>
                                    <p className="text-[10px] text-emerald-500 font-black uppercase mt-1">Revenue</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-8 bg-slate-900 text-white !rounded-[2.5rem] relative overflow-hidden">
                    <h3 className="font-bold text-xl mb-4 relative z-10">Growth Insights</h3>
                    <p className="text-slate-400 text-sm leading-relaxed relative z-10 mb-8">
                        Your revenue has increased by <span className="text-blue-400 font-bold">12.4%</span> this month. 
                        Top performing courses are driving the majority of student acquisitions.
                    </p>
                    <div className="h-40 flex items-end gap-2 relative z-10">
                        {[40, 60, 45, 90, 75, 55, 100].map((h, i) => (
                            <div key={i} className="flex-1 bg-blue-500/20 rounded-t-lg group relative h-full flex flex-col justify-end">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    className="w-full bg-blue-500 rounded-t-lg"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
                </Card>
            </div>
        </div>
    );
}
