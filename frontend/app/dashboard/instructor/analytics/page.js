'use client';
import { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  BookOpen, 
  TrendingUp, 
  Zap, 
  MoreVertical,
  ChevronUp,
  ChevronDown,
  Clock,
  Award,
  BarChart2,
  ArrowUpRight
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/UIElements';
import api from '@/services/api';
import { clsx } from 'clsx';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/instructor');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-20 text-center font-black text-slate-400 animate-pulse">Analyzing Performance...</div>;

  const metrics = [
    { label: 'Total Revenue', value: `$${data.totalRevenue?.toLocaleString()}`, icon: DollarSign, color: 'emerald', trend: '+12%' },
    { label: 'Total Enrollments', value: data.totalStudents, icon: Users, color: 'blue', trend: '+5.4%' },
    { label: 'Quiz Avg. Score', value: `${Math.round(data.averageQuizScore)}%`, icon: Award, color: 'amber', trend: '-2%' },
    { label: 'Completion Rate', value: '42%', icon: Zap, color: 'violet', trend: '+1.2%' } // Completion rate placeholder
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Performance Analytics</h1>
            <p className="text-slate-500 font-medium mt-1">Deep insights into your courses and student engagement.</p>
          </div>
          <div className="flex bg-white border border-slate-100 p-1 rounded-2xl shadow-sm">
             {['7D', '30D', '90D', 'All'].map(t => (
               <button key={t} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${t === '30D' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-400 hover:text-slate-600'}`}>{t}</button>
             ))}
          </div>
        </header>

        {/* Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <Card key={i} className="p-8 border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all">
               <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 bg-${m.color}-50 text-${m.color}-600 rounded-2xl`}>
                     <m.icon size={20} />
                  </div>
                  <div className={clsx(
                    "flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border",
                    m.trend.startsWith('+') ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                  )}>
                    {m.trend.startsWith('+') ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {m.trend}
                  </div>
               </div>
               <p className="text-3xl font-black text-slate-900 mb-1">{m.value}</p>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{m.label}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Revenue Chart Placeholder */}
           <Card className="lg:col-span-2 p-10 border-slate-100 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-12">
                 <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Revenue Overview</h3>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">Monthly earnings trends</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                       <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                       <span className="text-[10px] font-black uppercase text-slate-400">Current Year</span>
                    </div>
                 </div>
              </div>

              {/* Mock Bar Chart */}
              <div className="flex-1 flex items-end justify-between gap-4 min-h-[300px] border-b border-slate-100 pb-2">
                 {(data.monthlyRevenue?.length > 0 ? data.monthlyRevenue : [
                   {_id: 'Jan', revenue: 1200}, {_id: 'Feb', revenue: 1900}, {_id: 'Mar', revenue: 1500}, 
                   {_id: 'Apr', revenue: 2400}, {_id: 'May', revenue: 3200}, {_id: 'Jun', revenue: 2800}
                 ]).map((month, i) => {
                   const maxVal = Math.max(...(data.monthlyRevenue?.length > 0 ? data.monthlyRevenue.map(m => m.revenue) : [4000]));
                   const height = data.monthlyRevenue?.length > 0 ? (month.revenue / maxVal) * 100 : (month.revenue / 4000) * 100;
                   
                   return (
                     <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                        <div className="relative w-full flex flex-col items-center">
                           {/* Tooltip */}
                           <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg whitespace-nowrap z-10 shadow-xl">
                              ${month.revenue?.toLocaleString()}
                           </div>
                           <div 
                              className="w-full bg-slate-50 rounded-t-xl group-hover:bg-blue-600 transition-all duration-700 ease-out relative overflow-hidden" 
                              style={{ height: `${height}%`, minHeight: '10%' }}
                           >
                              <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-all"></div>
                           </div>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{month._id}</span>
                     </div>
                   );
                 })}
              </div>
           </Card>

           {/* Top Courses */}
           <Card className="p-8 border-slate-100 shadow-sm overflow-hidden">
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Course Efficiency</h3>
              <div className="space-y-8">
                 {data.courseBreakdown?.length > 0 ? (
                   data.courseBreakdown.map((course, i) => (
                     <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4 cursor-pointer">
                           <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                              <BookOpen size={20} />
                           </div>
                           <div>
                              <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{course._id}</p>
                              <p className="text-[10px] text-slate-400 font-bold">{course.enrollments} total enrollments</p>
                           </div>
                        </div>
                        <p className="text-sm font-black text-slate-900">${course.revenue?.toLocaleString()}</p>
                     </div>
                   ))
                 ) : (
                   <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-slate-100 border-dashed">
                      <BarChart2 className="mx-auto text-slate-200 mb-4" size={40} />
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest px-6 leading-relaxed">Publish more courses to see detailed breakdown.</p>
                   </div>
                 )}
              </div>
              
              <button className="w-full mt-10 py-4 border border-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                 Detailed Revenue Report <ArrowUpRight size={14} />
              </button>
           </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
