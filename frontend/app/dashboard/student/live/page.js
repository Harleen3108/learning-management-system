'use client';
import { useState, useEffect } from 'react';
import { 
  Video, 
  Calendar, 
  Clock, 
  ExternalLink, 
  Users,
  AlertCircle,
  VideoOff
} from 'lucide-react';
import { Card } from '@/components/UIElements';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/services/api';

export default function StudentLivePage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const res = await api.get('/student/dashboard'); // Use dashboard endpoint which already aggregates live sessions
        setSessions(res.data.data.upcomingLive || []);
      } catch (err) {
        console.error('Failed to fetch sessions');
      } finally {
        setLoading(false);
      }
    };
    fetchLive();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-10 pb-20">
        <header>
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
                    <Video size={16} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Live Learning Sessions</h1>
            </div>
            <p className="text-slate-500 font-medium">Join real-time interactive lectures with your instructors.</p>
        </header>

        <section className="space-y-6">
            {loading ? (
                [1, 2].map(i => (
                    <div key={i} className="bg-slate-50 rounded-[2rem] h-40 animate-pulse"></div>
                ))
            ) : sessions.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {sessions.map((session) => (
                        <Card key={session._id} className="p-8 group hover:border-emerald-200 transition-all border-slate-100 flex flex-col md:flex-row items-center gap-8">
                            <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-600 flex-shrink-0 animate-pulse">
                                <Video size={32} />
                            </div>
                            
                            <div className="flex-1 space-y-4 text-center md:text-left">
                                <h3 className="text-2xl font-black text-slate-900 leading-tight">
                                    {session.title}
                                </h3>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <Calendar size={14} className="text-emerald-500" /> 
                                        {new Date(session.scheduledAt).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <Clock size={14} className="text-emerald-500" /> 
                                        {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({session.duration} mins)
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <Users size={14} className="text-emerald-500" /> Enrolled Students Only
                                    </div>
                                </div>
                            </div>

                            {new Date(session.scheduledAt) < new Date() ? (
                                <button 
                                    disabled
                                    className="w-full md:w-auto px-10 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    Outdated Session
                                </button>
                            ) : (
                                <a 
                                    href={session.meetingUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-full md:w-auto px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2"
                                >
                                    Join Session <ExternalLink size={16} />
                                </a>
                            )}
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center space-y-6">
                    <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto">
                        <VideoOff size={40} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">No live classes scheduled</h3>
                        <p className="text-slate-500 font-medium">Keep an eye on this space for upcoming real-time learning opportunities.</p>
                    </div>
                </div>
            )}
        </section>

        <div className="mt-8 flex items-center gap-3 bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
            <AlertCircle size={20} className="text-blue-600 flex-shrink-0" />
            <p className="text-xs font-bold text-blue-700 leading-relaxed uppercase tracking-tight">
                Note: Access to live sessions is restricted to students enrolled in the respective courses. Please ensure you are logged in 5 minutes before the start time.
            </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
