'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api from '@/services/api';
import { Users, BookOpen, Banknote, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, change, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
        <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
            <Icon size={80} />
        </div>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-black text-slate-800">{value}</h3>
                <div className="mt-2 flex items-center gap-2">
                    <span className={clsx(
                        "flex items-center text-[10px] font-black px-2 py-0.5 rounded-full",
                        trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                        {trend === 'up' ? <TrendingUp size={10} className="mr-1" /> : <TrendingDown size={10} className="mr-1" />}
                        {change}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">vs last month</span>
                </div>
            </div>
            <div className={`p-3 rounded-2xl bg-${color}-50 text-${color}-600 shadow-sm shadow-${color}-100`}>
                <Icon size={24} />
            </div>
        </div>
    </div>
);

// Helper for dynamic coloring in tailwind
const clsx = (...args) => args.filter(Boolean).join(' ');

export default function AdminAnalytics() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data.data);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <AdminLayout>
            <div className="animate-pulse space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1,2,3,4].map(i => <div key={i} className="h-40 bg-white rounded-3xl" />)}
                </div>
                <div className="h-96 bg-white rounded-3xl" />
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Platform Insights</h1>
                    <p className="text-slate-400 mt-1">Real-time overview of EduFlow ecosystem performance.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Total Users" 
                        value={stats?.totalUsers?.toLocaleString() || '0'} 
                        change="+4.2%" 
                        trend="up"
                        icon={Users} 
                        color="blue" 
                    />
                    <StatCard 
                        title="Total Revenue" 
                        value={`₹${stats?.totalRevenue?.toLocaleString() || '0'}`} 
                        change="+12.4%" 
                        trend="up"
                        icon={Banknote} 
                        color="emerald" 
                    />
                    <StatCard 
                        title="Active Courses" 
                        value={stats?.totalCourses || '0'} 
                        change="-2.1%" 
                        trend="down"
                        icon={BookOpen} 
                        color="orange" 
                    />
                    <StatCard 
                        title="System Health" 
                        value={stats?.systemHealth || '99.9%'} 
                        change="Stable" 
                        trend="up"
                        icon={Activity} 
                        color="indigo" 
                    />
                </div>

                {/* Charts and Main Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200/50 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Enrollment Trends</h3>
                                <p className="text-xs text-slate-400">Monthly student registration growth</p>
                            </div>
                            <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-600 outline-none">
                                <option>Last 12 Months</option>
                                <option>Last 6 Months</option>
                                <option>This Year</option>
                            </select>
                        </div>
                        {/* Placeholder for actual Chart component */}
                        <div className="h-64 flex items-end gap-3 px-4">
                            {[40, 60, 45, 90, 75, 55, 100, 85, 30, 50, 70, 95].map((h, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    className="flex-1 bg-blue-500 rounded-t-lg relative group transition-all duration-300 hover:bg-blue-600"
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {h*12}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 px-2">
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                                <span key={m} className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{m}</span>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-200 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-2">Pending Approvals</h3>
                            <p className="text-blue-100/70 text-sm mb-8">Courses waiting for your review</p>
                            
                            <div className="text-6xl font-black mb-12">{stats?.pendingApprovals || '0'}</div>
                            
                            <button className="w-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white hover:text-blue-600 transition-all py-4 rounded-2xl font-bold">
                                Review Queue
                            </button>
                        </div>

                        {/* Abstract background elements */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute top-10 right-10 w-20 h-20 bg-blue-400/20 rounded-full blur-2xl"></div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
