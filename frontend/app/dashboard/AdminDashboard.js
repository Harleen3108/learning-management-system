'use client';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  MoreVertical,
  Plus,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { Card } from '@/components/UIElements';
import { motion } from 'framer-motion';

export default function AdminDashboard({ user }) {
  const stats = [
    { label: 'Total Users', value: '24,592', change: '+840 this week', icon: Users, color: 'text-[#071739]', bg: 'bg-[#071739]/5' },
    { label: 'Approved Courses', value: '1,208', change: '94% completion rate', icon: CheckCircle, color: 'text-[#A68868]', bg: 'bg-[#A68868]/5' },
  ];

  return (
    <div className="space-y-10">
       <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            System Healthy
          </div>
          <div className="text-slate-400 font-bold text-xs">Latency: 24ms</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-900 leading-tight">Admin Control</p>
            <p className="text-[10px] text-slate-500 font-medium">Superuser Access</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Analytics */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200/50 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-12">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Total Revenue</p>
                <h3 className="text-5xl font-bold text-slate-800 tracking-tight leading-none">$142,850.00</h3>
                <div className="flex items-center gap-2 mt-4">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100/50 shadow-sm">
                    <ArrowUpRight size={14} />
                    +12.4% From Last Month
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-3 bg-slate-50 text-slate-400 hover:bg-slate-100 rounded-2xl transition-all">
                   <Filter size={18} />
                </button>
                <button className="p-3 bg-slate-50 text-slate-400 hover:bg-slate-100 rounded-2xl transition-all">
                   <MoreVertical size={18} />
                </button>
              </div>
            </div>
            
            <div className="h-64 flex items-end gap-3 px-4 relative">
              {[30, 45, 35, 60, 55, 75, 40, 50, 65, 45, 80, 55].map((h, i) => (
                <div key={i} className="flex-1 bg-slate-50 group/bar relative h-full flex flex-col justify-end">
                   <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className="w-full bg-[#071739]/5 group-hover/bar:bg-[#A68868] rounded-xl transition-all duration-500 relative cursor-pointer"
                   >
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#071739] text-white text-[10px] font-bold px-4 py-2 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all scale-75 group-hover/bar:scale-100 whitespace-nowrap shadow-2xl z-20 pointer-events-none">
                      ${h*10}k Revenue
                    </div>
                   </motion.div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex justify-between items-end px-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Global Progress</h3>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/50 shadow-sm">
                 <div className="flex items-center justify-between mb-6">
                    <div>
                        <h4 className="text-3xl font-bold text-slate-800 tracking-tight">84%</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Efficiency Rate</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-[6px] border-slate-50 border-t-[#A68868] flex items-center justify-center font-bold text-xs text-[#071739]">
                        84
                    </div>
                 </div>
                 <div className="space-y-4 pt-4 border-t border-slate-50">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">Service Uptime</span>
                        <span className="text-xs font-bold text-emerald-500">99.9%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                        <div className="w-[99.9%] h-full bg-emerald-500"></div>
                    </div>
                 </div>
              </div>
            </div>

            <div className="space-y-6">
               <div className="flex justify-between items-end px-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Operations</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button className="group p-6 bg-white border border-slate-200/50 rounded-[2rem] flex flex-col items-center gap-4 hover:border-[#071739]/50 hover:shadow-xl hover:shadow-[#071739]/10 transition-all shadow-sm">
                  <div className="p-3 bg-[#071739]/5 text-[#071739] rounded-2xl group-hover:scale-110 transition-transform">
                    <Users size={24} />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Users</span>
                </button>
                <button className="group p-6 bg-white border border-slate-200/50 rounded-[2rem] flex flex-col items-center gap-4 hover:border-[#A68868]/50 hover:shadow-xl hover:shadow-[#A68868]/10 transition-all shadow-sm">
                  <div className="p-3 bg-[#A68868]/5 text-[#A68868] rounded-2xl group-hover:scale-110 transition-transform">
                    <Clock size={24} />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Reports</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Stats & Transactions */}
        <div className="space-y-8">
          <div className="space-y-6">
            {stats.map((s, i) => (
              <Card key={i} className="p-8">
                <div className="flex items-center justify-between mb-4">
                   <div className={`p-4 rounded-[2rem] ${s.bg} ${s.color}`}>
                    <s.icon size={26} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">{s.label}</p>
                  <div className="flex items-baseline gap-3 mt-1">
                    <h4 className="text-4xl font-bold text-slate-900">{s.value}</h4>
                  </div>
                  <p className={`text-[10px] font-bold mt-2 ${s.color}`}>{s.change}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Recent Transactions</h3>
              <div className="flex gap-2">
                <button className="p-1.5 text-slate-400 hover:bg-white rounded-lg"><Filter size={16} /></button>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { id: '#TRX-89210', status: 'Completed', date: 'Oct 24', amt: '$199.00' },
                { id: '#TRX-89209', status: 'Completed', date: 'Oct 24', amt: '$49.00' },
                { id: '#TRX-89208', status: 'Processing', date: 'Oct 24', amt: '$1,200.00' },
                { id: '#TRX-89207', status: 'Completed', date: 'Oct 24', amt: '$29.00' },
              ].map((trx, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-50 rounded-2xl hover:shadow-sm transition-shadow">
                  <div>
                    <p className="text-[10px] font-bold text-slate-900">{trx.id}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{trx.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{trx.amt}</p>
                    <p className={`text-[8px] font-bold uppercase mt-1 ${trx.status === 'Completed' ? 'text-emerald-500' : 'text-orange-500'}`}>{trx.status}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-4 text-[#071739] font-bold text-[10px] uppercase tracking-widest hover:bg-white rounded-2xl transition-all border border-slate-100 mt-4">
              View Full Transaction History
            </button>
          </div>
        </div>
      </div>

       <div className="fixed bottom-8 right-8 z-50">
        <button className="p-6 bg-[#071739] text-white rounded-[2rem] shadow-2xl shadow-[#071739]/40 hover:scale-110 active:scale-95 transition-all">
          <Plus size={32} />
        </button>
      </div>
    </div>
  );
}
