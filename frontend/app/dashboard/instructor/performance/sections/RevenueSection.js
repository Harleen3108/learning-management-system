'use client';
import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  BarChart2, 
  ArrowUpRight,
  Loader2,
  PieChart,
  CreditCard
} from 'lucide-react';
import { Card } from '@/components/UIElements';
import api from '@/services/api';
import { clsx } from 'clsx';

export default function RevenueSection({ selectedCourse }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRevenue = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/performance/revenue?courseId=${selectedCourse}`);
                setData(res.data.data);
            } catch (err) {
                console.error('Failed to fetch revenue stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRevenue();
    }, [selectedCourse]);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#071739]" size={32} /></div>;

    return (
        <div className="space-y-10">
            {/* Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="p-8 bg-[#071739] text-white rounded-[2.5rem]">
                    <div className="flex justify-between items-start mb-10">
                        <div className="p-4 bg-white/10 rounded-2xl">
                            <DollarSign size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Net Earnings</span>
                    </div>
                    <p className="text-4xl font-semibold">₹{(data?.revenuePerCourse.reduce((acc, curr) => acc + curr.totalRevenue, 0) || 0).toLocaleString()}</p>
                    <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold">
                        <ArrowUpRight size={16} />
                        <span>+14.2% from last month</span>
                    </div>
                </Card>

                <Card className="p-8 border-slate-50">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Enrollments</h4>
                    <p className="text-4xl font-semibold text-slate-900">
                        {data?.revenuePerCourse.reduce((acc, curr) => acc + curr.enrollments, 0) || 0}
                    </p>
                    <p className="text-xs text-slate-400 font-medium mt-2">Across all courses</p>
                </Card>

                <Card className="p-8 border-slate-50">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Conversion Rate</h4>
                    <p className="text-4xl font-semibold text-slate-900">4.8%</p>
                    <p className="text-xs text-slate-400 font-medium mt-2">Visits to Paid Enrollments</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Course Breakdown */}
                <Card className="p-8 border-slate-50">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-lg font-semibold text-slate-900">Revenue per Course</h3>
                        <PieChart size={20} className="text-slate-400" />
                    </div>
                    <div className="space-y-6">
                        {data?.revenuePerCourse.map((course, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-xs group-hover:bg-[#071739] group-hover:text-white transition-all">
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <h5 className="text-sm font-semibold text-slate-800 truncate max-w-[200px]">{course.title}</h5>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{course.enrollments} Sales</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-[#071739]">₹{course.totalRevenue.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Monthly Trends */}
                <Card className="p-8 border-slate-50">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-lg font-semibold text-slate-900">Monthly Earnings</h3>
                        <TrendingUp size={20} className="text-slate-400" />
                    </div>
                    <div className="space-y-4">
                        {data?.monthlyRevenue.map((item, i) => (
                            <div key={i} className="flex items-end gap-3 h-10">
                                <div className="w-full bg-slate-50 rounded-t-lg relative h-full">
                                    <motion.div 
                                        initial={{ height: 0 }} 
                                        animate={{ height: `${(item.revenue / (Math.max(...data.monthlyRevenue.map(m => m.revenue)) || 1)) * 100}%` }}
                                        className="absolute bottom-0 left-0 w-full bg-[#071739] rounded-t-lg transition-all"
                                    />
                                </div>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{item._id}</span>
                            </div>
                        ))}
                        {data?.monthlyRevenue.length === 0 && <p className="text-center py-20 text-slate-400 font-medium">No trend data available.</p>}
                    </div>
                </Card>
            </div>
        </div>
    );
}
