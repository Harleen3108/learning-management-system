'use client';
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  Video, 
  Link as LinkIcon, 
  Clock, 
  Trash2, 
  Edit2, 
  ExternalLink,
  Users,
  Search,
  CheckCircle,
  X,
  Play
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/UIElements';
import api from '@/services/api';
import { clsx } from 'clsx';

export default function LiveManagementPage() {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    description: '',
    scheduledAt: '',
    duration: 60,
    meetingUrl: ''
  });

  const fetchSessions = async () => {
    try {
      const res = await api.get('/live-classes/me');
      setSessions(res.data.data);
    } catch (err) {
      console.error('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses/instructor/me');
      setCourses(res.data.data);
    } catch (err) {
      console.error('Failed to fetch courses');
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchCourses();
  }, []);

  const handleGenerateLink = () => {
    const randomStr = Math.random().toString(36).substring(2, 5) + '-' + 
                      Math.random().toString(36).substring(2, 6) + '-' + 
                      Math.random().toString(36).substring(2, 5);
    setFormData(prev => ({ ...prev, meetingUrl: `https://meet.google.com/${randomStr}` }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/live-classes', formData);
      setShowModal(false);
      setFormData({ title: '', course: '', description: '', scheduledAt: '', duration: 60, meetingUrl: '' });
      fetchSessions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule session');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Cancel this live session?')) {
      try {
        await api.delete(`/live-classes/${id}`);
        fetchSessions();
      } catch (err) {
        alert('Failed to cancel session');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Live Sessions</h1>
            <p className="text-slate-500 font-medium mt-1">Schedule and manage your interactive learning classes.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-[2rem] font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
          >
            <Plus size={20} />
            Schedule New Class
          </button>
        </header>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
             [1, 2, 3].map(i => <div key={i} className="bg-slate-50 h-64 rounded-[3rem] animate-pulse"></div>)
          ) : sessions.length > 0 ? (
            sessions.map(session => (
              <Card key={session._id} className="relative group overflow-hidden flex flex-col h-full border-slate-100">
                <div className="h-3 bg-blue-600"></div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl">
                       <Video size={24} />
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                       Upcoming
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">{session.title}</h3>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-6">
                    {session.course?.title || 'Course Unavailable'}
                  </p>

                  <div className="space-y-4 mb-8 flex-1">
                    <div className="flex items-center gap-3 text-slate-600">
                      <Calendar size={18} className="text-slate-300" />
                      <span className="text-sm font-bold">{new Date(session.scheduledAt).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <Clock size={18} className="text-slate-300" />
                      <span className="text-sm font-bold">{new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.duration} mins</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <a 
                      href={session.meetingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/10"
                    >
                      Join Meeting <ExternalLink size={14} />
                    </a>
                    <button 
                      onClick={() => handleDelete(session._id)}
                      className="p-4 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-100">
               <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm text-slate-200">
                  <Video size={40} />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">No live classes scheduled</h3>
               <p className="text-slate-500 font-medium max-w-xs mx-auto">Boost student engagement by scheduling your first live interactive session.</p>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X size={24} />
            </button>

            <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Schedule Live Class</h2>
                <p className="text-slate-500 font-medium mt-1">Fill in the details to create a new session.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Session Title</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g., Weekly Office Hours"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Course</label>
                  <select 
                    required
                    value={formData.course}
                    onChange={(e) => setFormData({...formData, course: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Choose a course</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Scheduled At</label>
                  <input 
                    required
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Meeting URL</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        required
                        type="url"
                        placeholder="Zoom or Google Meet link"
                        value={formData.meetingUrl}
                        onChange={(e) => setFormData({...formData, meetingUrl: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 py-4 pl-12 pr-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={handleGenerateLink}
                      className="px-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-all"
                    >
                      Generate Mock
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                >
                  Schedule Class Now
                </button>
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-10 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
