'use client';
import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Star, 
  Plus, 
  MoreVertical,
  ChevronRight,
  Download,
  Loader2,
  BookOpen,
  Trash2
} from 'lucide-react';
import { Card } from '@/components/UIElements';
import api from '@/services/api';
import Link from 'next/link';

export default function InstructorDashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, coursesRes] = await Promise.all([
          api.get('/analytics/instructor'),
          api.get('/courses') // Need to ensure this filters for instructor
        ]);
        setStats(statsRes.data.data);
        // Filter courses for the instructor if the backend doesn't do it automatically for this route
        const instructorCourses = coursesRes.data.data.filter(c => c.instructor?._id === user?._id || c.instructor === user?._id);
        setCourses(instructorCourses);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await api.delete(`/courses/${id}`);
        setCourses(courses.filter(c => c._id !== id));
      } catch (err) {
        console.error('Failed to delete course:', err);
        alert('Failed to delete course');
      }
    }
  };

  if (loading) {
     return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  }

  const statCards = [
    { label: 'Total Revenue', value: `₹${stats?.totalRevenue.toLocaleString() || '0'}`, icon: TrendingUp, change: '+12%', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Students', value: stats?.totalStudents || '0', icon: Users, change: '+5%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Courses', value: stats?.totalCourses || '0', icon: BookOpen, change: 'Active', color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-slate-900 leading-tight">Instructor Overview</h2>
          <p className="text-slate-500 font-medium mt-1">Welcome back, <span className="text-blue-600 font-bold">{user?.name || 'Instructor'}</span>!</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/instructor/analytics">
             <button className="flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-2xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-all">
               <TrendingUp size={18} />
               View Analytics
             </button>
          </Link>
          <Link href="/dashboard/instructor/create">
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
              <Plus size={18} />
              Create Course
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {statCards.map((stat, i) => (
          <Card key={i} className="p-8 relative group overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
              <div className={`p-4 rounded-[2rem] ${stat.bg} ${stat.color}`}>
                <stat.icon size={26} />
              </div>
              <span className={`text-xs font-black ${stat.color} px-3 py-1 bg-white rounded-full border border-slate-50 shadow-sm`}>
                {stat.change}
              </span>
            </div>
            <div className="mt-8 relative z-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-4xl font-black text-slate-900 mt-2">{stat.value}</p>
            </div>
            <div className={`absolute -right-8 -bottom-8 w-32 h-32 ${stat.bg} rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity`}></div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Insights Shell */}
        <div className="lg:col-span-2">
          <Card className="p-8">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="font-bold text-slate-900 text-xl">Quick Links</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Manage your teaching environment</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               {[
                 { title: 'Manage Students', desc: 'Track progress and grades', icon: Users, link: '/dashboard/instructor/students', color: 'bg-emerald-50 text-emerald-600' },
                 { title: 'Quiz Builder', desc: 'Create new assessments', icon: Star, link: '/dashboard/instructor/quizzes', color: 'bg-orange-50 text-orange-600' },
                 { title: 'Performance', desc: 'View revenue and growth', icon: TrendingUp, link: '/dashboard/instructor/analytics', color: 'bg-blue-50 text-blue-600' },
                 { title: 'New Course', desc: 'Start building content', icon: Plus, link: '/dashboard/instructor/create', color: 'bg-purple-50 text-purple-600' },
               ].map((item, i) => (
                 <Link key={i} href={item.link}>
                    <div className="p-6 rounded-[2rem] border border-slate-50 hover:border-blue-100 hover:bg-slate-50/50 transition-all group">
                       <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <item.icon size={20} />
                       </div>
                       <h4 className="font-black text-slate-900 text-sm">{item.title}</h4>
                       <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{item.desc}</p>
                    </div>
                 </Link>
               ))}
            </div>
          </Card>
        </div>

        {/* Live Classes Shell */}
        <div>
          <Card className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-slate-900 text-xl">Live Classes</h3>
              <button className="text-slate-400 hover:text-slate-900"><ChevronRight size={18} /></button>
            </div>
            <div className="space-y-6">
               <p className="text-xs text-slate-400 font-medium">No classes scheduled for today.</p>
               <button className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                  <Plus size={16} /> Schedule Session
               </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Course List */}
      <div>
        <div className="flex justify-between items-end mb-8">
          <h3 className="text-2xl font-black text-slate-900">My Courses</h3>
          <Link href="/dashboard/instructor/create" className="text-blue-600 font-bold text-sm hover:underline">Create New</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, i) => (
            <Card key={i} className="group overflow-hidden">
              <div className="h-44 overflow-hidden relative">
                <img 
                  src={course.thumbnail === 'no-photo.jpg' ? 'https://images.unsplash.com/photo-1541462608141-ad511a7ee5f2?auto=format&fit=crop&q=80&w=600' : course.thumbnail} 
                  alt="Course" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                <div className={`absolute top-4 left-4 bg-slate-900 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-widest`}>
                  {course.status}
                </div>
              </div>
              <div className="p-6">
                <h5 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors leading-snug">{course.title}</h5>
                <p className="text-slate-400 text-xs font-medium line-clamp-2">{course.description}</p>
                <div className="flex items-center gap-4 mt-6">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    <BookOpen size={12} className="text-slate-400" /> {course.category}
                  </div>
                  <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-2 py-1 rounded ${course.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                    {course.status}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-slate-50">
                   <Link href={`/dashboard/instructor/edit/${course._id}`}>
                      <button className="w-full py-3 px-2 bg-slate-50 text-slate-900 text-[10px] font-black rounded-xl hover:bg-slate-100 transition-all uppercase">Edit</button>
                   </Link>
                   <Link href="/dashboard/instructor/analytics">
                      <button className="w-full py-3 px-2 border border-blue-50 text-blue-600 text-[10px] font-black rounded-xl hover:bg-blue-50 transition-all uppercase text-center">Stats</button>
                   </Link>
                   <button 
                     onClick={() => handleDelete(course._id)}
                     className="w-full py-3 px-2 bg-rose-50 text-rose-600 text-[10px] font-black rounded-xl hover:bg-rose-100 transition-all uppercase flex items-center justify-center gap-1"
                   >
                     <Trash2 size={12} />
                     Del
                   </button>
                </div>
              </div>
            </Card>
          ))}
          {courses.length === 0 && (
            <div className="col-span-full py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100 text-center">
               <p className="text-slate-400 font-bold">You haven't created any courses yet.</p>
               <Link href="/dashboard/instructor/create">
                  <button className="mt-4 text-blue-600 font-black uppercase text-xs">Start building now &rarr;</button>
               </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

